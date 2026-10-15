import { decodeAtVersion } from "../../../utils/strictCbor";
import { canBeUInteger, CanBeUInteger } from "@harmoniclabs/cbor/dist/utils/ints";
import { CanBeCborString, Cbor, CborArray, CborBytes, CborObj, CborSimple, CborString, CborUInt, forceCborString, SubCborRef, ToCbor } from "@harmoniclabs/cbor";
import { sha2_256_sync } from "@harmoniclabs/crypto";
import { isObject } from "@harmoniclabs/obj-utils";
import { canBeHash32, CanBeHash32, hash32bytes } from "../../../hashes";
import { isIVrfCert, IVrfCert, VrfCert } from "../../common/ledger/Vrf";
import { IProtocolVersion, isIProtocolVersion, ProtocolVersion } from "../../common/ledger/protocol";
import { IPoolOperationalCert, isIPoolOperationalCert, PoolOperationalCert } from "../../common/ledger/certs/PoolOperationalCert";
import { U8Arr, U8Arr32 } from "../../../utils/U8Arr";
import { forceBigUInt, u32 } from "../../../utils/ints";
import { getSubCborRef } from "../../../utils/getSubCborRef";
import { IPraosHeaderBody } from "../../common/interfaces//IPraosHeader";
import { InvalidCborFormatError } from "../../../utils/InvalidCborFormatError";

/*
    CDDL (cardano-ledger eras/dijkstra/impl/cddl/data/dijkstra.cddl,
    identical at tag cardano-ledger-dijkstra-0.4.0.0 and master 2026-10-08):

    header_body =
      [ block_number                   : block_number
      , slot                           : slot
      , prev_hash                      : hash32/ nil
      , issuer_vkey                    : vkey
      , vrf_vkey                       : vrf_vkey
      , vrf_result                     : vrf_cert
      , block_body_size                : uint .size 4
      , block_body_hash                : hash32
      , operational_cert
      , header_version_info
      , block_body_contains_leios_cert : bool
      , eb_references_announcement     : eb_references_announcement/ nil
      ]

    header_version_info =
      [ highest_supported_major_version : uint .size 4
      , self_reported_software_tag      : uint .size 4
      ]

    eb_references_announcement = [ eb_hash : hash32, eb_size : uint .size 4 ]

    `header_version_info` has the same wire shape as the Babbage/Conway
    `protocol_version`; it is exposed both as `versionInfo` and (for code that
    reads every Praos header the same way) as `protocolVersion`.
*/

export const DIJKSTRA_HEADER_BODY_FIELDS = 12;

export interface IEbAnnouncement {
    /** hash of the announced endorser block references */
    hash: CanBeHash32;
    /** size in bytes of the EB references (uint32) */
    size: CanBeUInteger;
}

export interface IDijkstraHeaderBody
{
    blockNumber: CanBeUInteger;
    slot: CanBeUInteger;
    prevHash: CanBeHash32 | undefined;
    issuerPubKey: CanBeHash32;
    vrfPubKey: CanBeHash32;
    vrfResult: IVrfCert
    /** u32 **/
    blockBodySize: CanBeUInteger;
    blockBodyHash: CanBeHash32;
    opCert: IPoolOperationalCert;
    /** `header_version_info`: major = highest supported major version, minor = self reported software tag */
    protocolVersion: IProtocolVersion;
    /** `block_body_contains_leios_cert` (defaults to false) */
    leiosCertified?: boolean;
    /** `eb_references_announcement` or nil */
    ebAnnouncement?: IEbAnnouncement | null;
}

export function isIDijkstraHeaderBody( thing: any ): thing is IDijkstraHeaderBody
{
    return isObject( thing ) && (
        thing instanceof DijkstraHeaderBody // already validated at construction, shortcut
        || (
            canBeUInteger( thing.blockNumber )
            && canBeUInteger( thing.slot )
            && (thing.prevHash === undefined || canBeHash32( thing.prevHash ))
            && canBeHash32( thing.issuerPubKey )
            && canBeHash32( thing.vrfPubKey )
            && isIVrfCert( thing.vrfResult )
            && canBeUInteger( thing.blockBodySize )
            && canBeHash32( thing.blockBodyHash )
            && isIPoolOperationalCert( thing.opCert )
            && isIProtocolVersion( thing.protocolVersion )
            && ( thing.leiosCertified === undefined || typeof thing.leiosCertified === "boolean" )
            && (
                thing.ebAnnouncement === undefined || thing.ebAnnouncement === null ||
                ( isObject( thing.ebAnnouncement ) && canBeHash32( thing.ebAnnouncement.hash ) && canBeUInteger( thing.ebAnnouncement.size ) )
            )
        )
    );
}

export class DijkstraHeaderBody
    implements IDijkstraHeaderBody, ToCbor, IPraosHeaderBody
{
    readonly blockNumber: bigint;
    readonly slot: bigint;
    readonly prevHash: U8Arr<32> | undefined;
    readonly issuerPubKey: U8Arr<32>;
    readonly vrfPubKey: U8Arr<32>;
    readonly vrfResult: VrfCert;
    readonly blockBodySize: number;
    readonly blockBodyHash: U8Arr<32>;
    readonly opCert: PoolOperationalCert;
    readonly protocolVersion: ProtocolVersion;
    readonly leiosCertified: boolean;
    readonly ebAnnouncement: { hash: U8Arr<32>, size: number } | null;

    constructor(
        hdrBody: IDijkstraHeaderBody,
        readonly cborRef: SubCborRef | undefined = undefined
    )
    {
        if(!isIDijkstraHeaderBody(hdrBody)) throw new Error("Invalid DijkstraHeaderBody");
        this.blockNumber = forceBigUInt( hdrBody.blockNumber );
        this.slot = forceBigUInt( hdrBody.slot );
        this.prevHash = typeof hdrBody.prevHash !== "undefined" ? hash32bytes( hdrBody.prevHash ) : undefined;
        this.issuerPubKey = hash32bytes( hdrBody.issuerPubKey );
        this.vrfPubKey = hash32bytes( hdrBody.vrfPubKey );
        this.vrfResult = new VrfCert( hdrBody.vrfResult );
        this.blockBodySize = u32( hdrBody.blockBodySize );
        this.blockBodyHash = hash32bytes( hdrBody.blockBodyHash );
        this.opCert = new PoolOperationalCert( hdrBody.opCert );
        this.protocolVersion = new ProtocolVersion( hdrBody.protocolVersion );
        this.leiosCertified = hdrBody.leiosCertified === true;
        this.ebAnnouncement = (
            hdrBody.ebAnnouncement === undefined || hdrBody.ebAnnouncement === null ? null :
            { hash: hash32bytes( hdrBody.ebAnnouncement.hash ), size: u32( hdrBody.ebAnnouncement.size ) }
        );
    }

    /** `header_version_info` under its Dijkstra names */
    get versionInfo(): { highestSupportedMajorVersion: number, selfReportedSoftwareTag: number }
    {
        return {
            highestSupportedMajorVersion: this.protocolVersion.major,
            selfReportedSoftwareTag: this.protocolVersion.minor
        };
    }

    getLeaderVrfOutput(): U8Arr<32>
    {
        return sha2_256_sync(
            this.vrfResult.proofHash
        ) as U8Arr<32>;
    }
    // Not used after
    getNonceVrfOutput: () => U8Arr32;

    clone(): DijkstraHeaderBody
    {
        return new DijkstraHeaderBody({
            blockNumber: this.blockNumber,
            slot: this.slot,
            prevHash: this.prevHash?.slice(),
            issuerPubKey: this.issuerPubKey.slice(),
            vrfPubKey: this.vrfPubKey.slice(),
            vrfResult: this.vrfResult.clone(),
            blockBodySize: this.blockBodySize,
            blockBodyHash: this.blockBodyHash.slice(),
            opCert: this.opCert.clone(),
            protocolVersion: this.protocolVersion.clone(),
            leiosCertified: this.leiosCertified,
            ebAnnouncement: this.ebAnnouncement === null ? null : { hash: this.ebAnnouncement.hash.slice(), size: this.ebAnnouncement.size }
        }, this.cborRef?.clone());
    }

    toCborBytes(): Uint8Array
    {
        if( this.cborRef instanceof SubCborRef ) return this.cborRef.toBuffer();
        return this.toCbor();
    }
    toCbor(): CborString
    {
        if( this.cborRef instanceof SubCborRef ) return this.cborRef.toBuffer();
        return Cbor.encode( this.toCborObj() );
    }
    toCborObj(): CborArray
    {
        if( this.cborRef instanceof SubCborRef ) return Cbor.parse( this.cborRef.toBuffer() ) as CborArray;

        return new CborArray([
            new CborUInt( this.blockNumber ),
            new CborUInt( this.slot ),
            this.prevHash ? new CborBytes( this.prevHash ) : new CborSimple( null ),
            new CborBytes( this.issuerPubKey ),
            new CborBytes( this.vrfPubKey ),
            this.vrfResult.toCborObj(),
            new CborUInt( this.blockBodySize ),
            new CborBytes( this.blockBodyHash ),
            this.opCert.toCborObj(),
            this.protocolVersion.toCborObj(),
            new CborSimple( this.leiosCertified ),
            this.ebAnnouncement === null ? new CborSimple( null ) : new CborArray([
                new CborBytes( this.ebAnnouncement.hash ),
                new CborUInt( this.ebAnnouncement.size )
            ])
        ]);
    }

    static fromCbor( cbor: CanBeCborString ): DijkstraHeaderBody
    {
        const bytes = cbor instanceof Uint8Array ? cbor : forceCborString( cbor );
        return DijkstraHeaderBody.fromCborObj(
            Cbor.parse( bytes, { keepRef: true } ),
            bytes
        );
    }

    /**
     * Strict decoder: exactly 12 fields, `bool` leios flag, `nil` or
     * `[hash32, uint32]` announcement (the arity table of Dingo's
     * ouroboros/dijkstra_header_arity_test.go).
     */
    static fromCborObj( cHdrBody: CborObj, _originalBytes?: Uint8Array ): DijkstraHeaderBody
    {
        if(!(
            cHdrBody instanceof CborArray &&
            cHdrBody.array.length === DIJKSTRA_HEADER_BODY_FIELDS
        )) throw new InvalidCborFormatError(
            "DijkstraHeaderBody: expected " + DIJKSTRA_HEADER_BODY_FIELDS + " fields, got " +
            ( cHdrBody instanceof CborArray ? cHdrBody.array.length : "a non-array" )
        );

        const [
            _cBlockNo,          // block_number
            _cSlotNo,           // slot
            _cPrevHash,         // prev_hash
            _cIssuerVkey,       // issuer_vkey
            _cVrfVkey,          // vrf_vkey
            _cVrfCert,          // vrf_result
            _cBlockBodySize,    // block_body_size
            _cBlockBodyHash,    // block_body_hash
            _cOpCert,           // operational_cert
            _cVersionInfo,      // header_version_info
            _cLeiosCertified,   // block_body_contains_leios_cert
            _cEbAnnouncement    // eb_references_announcement / nil
        ] = cHdrBody.array;

        const isNil = ( c: CborObj | undefined ) => c instanceof CborSimple && c.simple === null;

        if (!(
            _cBlockNo instanceof CborUInt &&
            _cSlotNo instanceof CborUInt &&
            ( ( _cPrevHash instanceof CborBytes && _cPrevHash.bytes.length === 32 ) || isNil( _cPrevHash ) ) &&
            _cIssuerVkey instanceof CborBytes && _cIssuerVkey.bytes.length === 32 &&
            _cVrfVkey instanceof CborBytes && _cVrfVkey.bytes.length === 32 &&
            _cBlockBodySize instanceof CborUInt && _cBlockBodySize.num <= BigInt( 0xffffffff ) &&
            _cBlockBodyHash instanceof CborBytes && _cBlockBodyHash.bytes.length === 32
        )) throw new InvalidCborFormatError("DijkstraHeaderBody: invalid Praos field");

        if(!(
            _cVersionInfo instanceof CborArray &&
            _cVersionInfo.array.length === 2 &&
            _cVersionInfo.array.every( x => x instanceof CborUInt && x.num <= BigInt( 0xffffffff ) )
        )) throw new InvalidCborFormatError("DijkstraHeaderBody: header_version_info must be [uint32, uint32]");

        if(!(
            _cLeiosCertified instanceof CborSimple &&
            typeof _cLeiosCertified.simple === "boolean"
        )) throw new InvalidCborFormatError("DijkstraHeaderBody: block_body_contains_leios_cert must be a bool");

        let ebAnnouncement: { hash: U8Arr32, size: number } | null = null;
        if( !isNil( _cEbAnnouncement ) )
        {
            if(!(
                _cEbAnnouncement instanceof CborArray &&
                _cEbAnnouncement.array.length === 2 &&
                _cEbAnnouncement.array[0] instanceof CborBytes &&
                _cEbAnnouncement.array[0].bytes.length === 32 &&
                _cEbAnnouncement.array[1] instanceof CborUInt &&
                _cEbAnnouncement.array[1].num <= BigInt( 0xffffffff )
            )) throw new InvalidCborFormatError("DijkstraHeaderBody: eb_references_announcement must be [hash32, uint32] or nil");
            ebAnnouncement = {
                hash: _cEbAnnouncement.array[0].bytes as U8Arr32,
                size: Number( _cEbAnnouncement.array[1].num )
            };
        }

        return new DijkstraHeaderBody({
            blockNumber: _cBlockNo.num,
            slot: _cSlotNo.num,
            prevHash: _cPrevHash instanceof CborBytes ? _cPrevHash.bytes as U8Arr32 : undefined,
            issuerPubKey: _cIssuerVkey.bytes as U8Arr32,
            vrfPubKey: _cVrfVkey.bytes as U8Arr32,
            vrfResult: VrfCert.fromCborObj( _cVrfCert ),
            blockBodySize: _cBlockBodySize.num,
            blockBodyHash: _cBlockBodyHash.bytes as U8Arr32,
            opCert: PoolOperationalCert.fromCborObj( _cOpCert ),
            protocolVersion: ProtocolVersion.fromCborObj( _cVersionInfo ),
            leiosCertified: _cLeiosCertified.simple as boolean,
            ebAnnouncement
        }, getSubCborRef( cHdrBody, _originalBytes ));
    }

    toJSON() { return this.toJson(); }
    toJson()
    {
        const hex = ( b: Uint8Array ) => Buffer.from( b ).toString("hex");
        return {
            blockNumber: this.blockNumber.toString(),
            slot: this.slot.toString(),
            prevHash: this.prevHash === undefined ? null : hex( this.prevHash ),
            issuerPubKey: hex( this.issuerPubKey ),
            vrfPubKey: hex( this.vrfPubKey ),
            blockBodySize: this.blockBodySize,
            blockBodyHash: hex( this.blockBodyHash ),
            versionInfo: this.versionInfo,
            leiosCertified: this.leiosCertified,
            ebAnnouncement: this.ebAnnouncement === null ? null : { hash: hex( this.ebAnnouncement.hash ), size: this.ebAnnouncement.size }
        };
    }
}

// cardano-ledger decodes the Dijkstra era at protocol version 12
decodeAtVersion( 12, DijkstraHeaderBody );
