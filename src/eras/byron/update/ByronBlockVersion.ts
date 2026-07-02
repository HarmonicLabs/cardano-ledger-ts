import { CanBeCborString, Cbor, CborArray, CborObj, CborString, CborUInt, forceCborString } from "@harmoniclabs/cbor";

export interface IByronBlockVersion {
    major: number;
    minor: number;
    alt: number;
}

/**
 * Byron `bver = [ u16, u16, u8 ]` — the (major, minor, alt) block/protocol version.
 */
export class ByronBlockVersion implements IByronBlockVersion
{
    readonly major: number;
    readonly minor: number;
    readonly alt: number;

    constructor( v: IByronBlockVersion )
    {
        this.major = Number( v.major );
        this.minor = Number( v.minor );
        this.alt = Number( v.alt );
    }

    clone(): ByronBlockVersion { return new ByronBlockVersion( this ); }

    toCborObj(): CborArray
    {
        return new CborArray([ new CborUInt( this.major ), new CborUInt( this.minor ), new CborUInt( this.alt ) ]);
    }
    toCbor(): CborString { return Cbor.encode( this.toCborObj() ) as any as CborString; }
    toCborBytes(): Uint8Array { return Cbor.encode( this.toCborObj() ); }

    static fromCborObj( cObj: CborObj ): ByronBlockVersion
    {
        if(!(
            cObj instanceof CborArray && cObj.array.length === 3 &&
            cObj.array[0] instanceof CborUInt &&
            cObj.array[1] instanceof CborUInt &&
            cObj.array[2] instanceof CborUInt
        )) throw new Error("invalid CBOR for Byron bver");
        return new ByronBlockVersion({ major: Number(cObj.array[0].num), minor: Number(cObj.array[1].num), alt: Number(cObj.array[2].num) });
    }
    static fromCbor( cStr: CanBeCborString ): ByronBlockVersion
    {
        return ByronBlockVersion.fromCborObj( Cbor.parse( forceCborString( cStr ) ) );
    }

    toJSON() { return this.toJson(); }
    toJson() { return [ this.major, this.minor, this.alt ]; }
}

/**
 * Byron `bvermod` — a 14-field block-version-modifier (the Byron protocol-parameter
 * update bundle: slotDuration, maxBlockSize, fee policy, thresholds, soft-fork rule, …).
 *
 * Each field is a `[? x]` (present or empty). Because it mixes scalar, triple and
 * fee-policy shapes and is pure protocol-param minutiae, the raw 14-element array is
 * preserved verbatim (byte-exact round-trip); {@link fields} exposes the parsed entries.
 */
export class ByronBlockVersionMod
{
    /** the raw 14-element bvermod array, preserved for fidelity */
    readonly raw: CborArray;

    constructor( raw: CborArray )
    {
        if(!( raw instanceof CborArray ))
        throw new Error("invalid Byron bvermod; expected a CBOR array");
        this.raw = raw;
    }

    /** the 14 fields, each either the present value's raw CBOR or `undefined` when the `[? x]` slot is empty */
    get fields(): ( CborObj | undefined )[]
    {
        return this.raw.array.map( f => ( f instanceof CborArray && f.array.length > 0 ) ? f.array[0] : undefined );
    }

    clone(): ByronBlockVersionMod { return new ByronBlockVersionMod( this.raw.clone() ); }

    toCborObj(): CborArray { return this.raw; }
    toCbor(): CborString { return Cbor.encode( this.toCborObj() ) as any as CborString; }
    toCborBytes(): Uint8Array { return Cbor.encode( this.toCborObj() ); }

    static fromCborObj( cObj: CborObj ): ByronBlockVersionMod
    {
        if(!( cObj instanceof CborArray ))
        throw new Error("invalid CBOR for Byron bvermod");
        return new ByronBlockVersionMod( cObj );
    }
    static fromCbor( cStr: CanBeCborString ): ByronBlockVersionMod
    {
        return ByronBlockVersionMod.fromCborObj( Cbor.parse( forceCborString( cStr ) ) );
    }

    toJSON() { return this.toJson(); }
    toJson() { return this.raw.toRawObj(); }
}
