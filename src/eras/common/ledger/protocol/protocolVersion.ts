import { CanBeCborString, Cbor, CborArray, CborObj, CborString, CborUInt, forceCborString, SubCborRef, ToCbor } from "@harmoniclabs/cbor";
import { cborArray, cborUInt, MAX_PROTOCOL_VERSION, MAX_WORD32 } from "../../../../utils/strictCbor";
import { isObject } from "@harmoniclabs/obj-utils";
import { subCborRefOrUndef, getSubCborRef } from "../../../../utils/getSubCborRef";
import { CanBeUInteger, canBeUInteger, u32 } from "../../../../utils/ints";

export interface IProtocolVersion {
    major: CanBeUInteger,
    minor: CanBeUInteger
}

export function isIProtocolVersion( thing: any ): thing is IProtocolVersion
{
    return isObject( thing ) && (
        thing instanceof ProtocolVersion // already validated at construction, shortcut
        || (
            canBeUInteger( thing.major ) &&
            canBeUInteger( thing.minor )
        )
    );
}

export class ProtocolVersion
    implements IProtocolVersion, ToCbor
{
    readonly major: number;
    readonly minor: number;

    constructor(
        v: IProtocolVersion,
        readonly cborRef: SubCborRef | undefined = undefined
    )
    {
        if(!isIProtocolVersion(v)) throw new Error("Invalid ProtocolVersion");
        this.major = u32( v.major );
        this.minor = u32( v.minor );
        this.cborRef = cborRef ?? subCborRefOrUndef( v );
    }

    clone(): ProtocolVersion
    {
        return new ProtocolVersion({
            major: this.major,
            minor: this.minor
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
            new CborUInt( this.major ),
            new CborUInt( this.minor )
        ]);
    }


    static fromCbor( cbor: CanBeCborString ): ProtocolVersion
    {
        const bytes = cbor instanceof Uint8Array ? cbor : forceCborString( cbor );
        return ProtocolVersion.fromCborObj(
            Cbor.parse( bytes, { keepRef: true } ),
            bytes
        );
    }
    /**
     * cardano-ledger `DecCBOR ProtVer` (`CBORGroup`, `decodeRecordNamed`): an array
     * (definite or indefinite) of exactly two Word32s, the major being a supported
     * `Version` (`mkVersion32`: at most `MaxVersion`, 13).
     */
    static fromCborObj( cbor: CborObj, _originalBytes?: Uint8Array ): ProtocolVersion
    {
        const [ major, minor ] = cborArray( cbor, "ProtocolVersion", { len: 2 } );
        const maj = cborUInt( major, "ProtocolVersion major", MAX_WORD32 );
        if( maj > BigInt( MAX_PROTOCOL_VERSION ) ) throw new Error("Invalid ProtocolVersion: unsupported major version " + maj );

        return new ProtocolVersion({
            major: maj,
            minor: cborUInt( minor, "ProtocolVersion minor", MAX_WORD32 )
        }, getSubCborRef( cbor, _originalBytes ));
    }
}