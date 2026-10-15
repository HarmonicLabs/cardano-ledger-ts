import { CborObj, CborArray, CborUInt, CborSimple, CborBytes, CborText } from "@harmoniclabs/cbor";
import { boundedText, cborUInt16, expectSize, fixedBytes, nullOr, recordSum, urlMaxBytes } from "../../../utils/strictCbor";
import { hasOwn, isObject } from "@harmoniclabs/obj-utils";
import { isUint8Array, readUInt16BE, readUInt8 } from "@harmoniclabs/uint8array-utils";
import { CanBeUInteger, forceBigUInt, canBeUInteger } from "../../../utils/ints";

export type IpPoolRelay = ({
    ipv4: Uint8Array
} | {
    ipv6: Uint8Array
} | {
    ipv4: Uint8Array
    ipv6: Uint8Array
}) & {
    type: "ip",
    port?: CanBeUInteger
}

export interface DnsPoolRelay {
    type: "dns",
    port?: CanBeUInteger,
    dnsName: string
}

export interface MultiHostPoolRelay {
    type: "multi-host"
    dnsName: string
}

export type PoolRelay = IpPoolRelay | DnsPoolRelay | MultiHostPoolRelay;

export function poolRelayToJson( relay: PoolRelay )
{
    const type = relay.type;

    switch( type )
    {
        case "ip":
            const ipv4: Uint8Array | undefined = (relay as any).ipv4 === undefined ? undefined : (relay as any).ipv4;
            const ipv6: Uint8Array | undefined = (relay as any).ipv6 === undefined ? undefined : (relay as any).ipv6;
            return {
                type: "ip",
                port: relay.port === undefined ? undefined : Number( forceBigUInt( relay.port ) ),
                ipv4: ipv4 === undefined ? undefined : `${readUInt8( ipv4, 0 )}.${readUInt8( ipv4, 1 )}.${readUInt8( ipv4, 2 )}.${readUInt8( ipv4, 3 )}`,
                ipv6: ipv6 === undefined ? undefined :
                    [
                        readUInt16BE( ipv6, 0   ).toString(16),
                        readUInt16BE( ipv6, 2   ).toString(16),
                        readUInt16BE( ipv6, 4   ).toString(16),
                        readUInt16BE( ipv6, 6   ).toString(16),
                        readUInt16BE( ipv6, 8   ).toString(16),
                        readUInt16BE( ipv6, 10  ).toString(16)
                    ].join(':')
            }
        case "dns":
            return {
                type: "dns",
                port: relay.port === undefined ? undefined : Number( forceBigUInt( relay.port ) ),
                dnsName: relay.dnsName
            }
        case "multi-host":
            return {
                type: "multi-host",
                dnsName: relay.dnsName
            }
        default: 
            throw new Error("unknown pool realy type")    
    }
}

function minimumPoolRelayCheck( something: any ): boolean
{
    return (
        isObject( something ) &&
        hasOwn( something, "type" )
    );
}

function portCheck( something: any ): boolean
{
    return (
        something.port === undefined ||
        canBeUInteger( something.port )
    );
}

export function isIpPoolRelay( something: any ): something is IpPoolRelay
{
    const {
        ipv4,
        ipv6
    } = something as any;

    return (
        minimumPoolRelayCheck( something ) &&
        (something as any).type === "ip" &&
        // single_host_addr = (0, port / nil, ipv4 / nil, ipv6 / nil): every field may be nil
        // (preview slot 98785139 registers a relay with a port and no address).
        ( ipv4 === undefined || (isUint8Array( ipv4 ) && ipv4.length === 4) ) &&
        ( ipv6 === undefined || (isUint8Array( ipv6 ) && ipv6.length === 16) ) &&
        portCheck( something )
    );
}

export function isDnsPoolRelay( something: any ): something is  DnsPoolRelay
{
    return (
        minimumPoolRelayCheck( something ) &&
        (something as any).type === "dns" &&
        hasOwn( something, "dnsName" ) &&
        typeof something.dnsName === "string" && something.dnsName.length <= 64 &&
        portCheck( something ) 
    );
}

export function isMultiHostPoolRelay( something: any ): something is MultiHostPoolRelay
{
    return (
        minimumPoolRelayCheck( something ) &&
        (something as any).type === "multi-host" &&
        hasOwn( something, "dnsName" ) &&
        typeof something.dnsName === "string" && something.dnsName.length <= 64
    );
}

export function isPoolRelay( something: any ): something is PoolRelay
{
    return (
        isIpPoolRelay( something )        ||
        isDnsPoolRelay( something )       ||
        isMultiHostPoolRelay( something )
    );
}

export function poolRelayToCborObj( poolRelay: PoolRelay ): CborObj
{
    /* TO DO: make IpPoolRelay, DnsPoolRelay, and MultiHostPoolRelay classes */
    if(!(
        isPoolRelay( poolRelay )
    ))throw new Error("can't convert ot CborObj using 'poolRelayToCborObj' if the input is not a 'PoolRelay'")
    
    const type = poolRelay.type;

    if( type === "ip" )
    {
        const {
            ipv4,
            ipv6
        } = poolRelay as any;

        return new CborArray([
            new CborUInt(0),
            poolRelay.port === undefined ?
                new CborSimple( null ) :
                new CborUInt( forceBigUInt( poolRelay.port ) ),
            ipv4 === undefined ?
                new CborSimple( null ) :
                new CborBytes( ipv4 ),
            ipv6 === undefined ?
                new CborSimple( null ) :
                new CborBytes( ipv6 ),
        ]);
    }

    if( type === "dns" )
    {
        return new CborArray([
            new CborUInt(1),
            poolRelay.port === undefined ?
                new CborSimple( null ) :
                new CborUInt( forceBigUInt( poolRelay.port ) ),
            new CborText( poolRelay.dnsName )
        ]);
    }

    if( type === "multi-host" )
    {
        return new CborArray([
            new CborUInt(2),
            new CborText( poolRelay.dnsName )
        ]);
    }

    throw new Error(
        "can't match 'PoolRelay' type"
    )
}


/**
 * cardano-ledger `DecCBOR StakePoolRelay` (`decodeRecordSum`):
 *   [0, port / null, ipv4 / null, ipv6 / null]
 *   [1, port / null, dns_name]
 *   [2, dns_name]
 * port is a Word16, ipv4 exactly 4 bytes, ipv6 exactly 16, dns_name a text of at
 * most 128 bytes (64 below protocol version 9); strings are definite; only `null`
 * stands for an absent field.
 */
export function poolRelayFromCborObj( cObj: CborObj ): PoolRelay
{
    const what = "PoolRelay";
    const { tag, fields, size } = recordSum( cObj, what );
    const port = ( c: CborObj | undefined ) => nullOr( c, p => cborUInt16( p, "PoolRelay port" ) );

    if( tag === 0 )
    {
        expectSize( size, 4, what );
        const [ _1, _2, _3 ] = fields;
        return {
            type: "ip",
            port: port( _1 ),
            ipv4: nullOr( _2, c => fixedBytes( c, 4, "PoolRelay ipv4" ) ) as any,
            ipv6: nullOr( _3, c => fixedBytes( c, 16, "PoolRelay ipv6" ) ) as any,
        };
    }
    if( tag === 1 )
    {
        expectSize( size, 3, what );
        const [ _1, _2 ] = fields;
        return {
            type: "dns",
            port: port( _1 ),
            dnsName: boundedText( _2, urlMaxBytes(), "PoolRelay dns name" ),
        };
    }
    if( tag === 2 )
    {
        expectSize( size, 2, what );
        return {
            type: "multi-host",
            dnsName: boundedText( fields[0], urlMaxBytes(), "PoolRelay dns name" ),
        };
    }

    throw new Error(
        "can't match 'PoolRelay' type"
    )
}
