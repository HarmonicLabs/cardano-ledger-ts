import { CanBeCborString, Cbor, CborArray, CborObj, CborString, CborUInt, forceCborString } from "@harmoniclabs/cbor";

export enum ByronSscType {
    Commitments = 0, // [0, ssccomms, ssccerts]
    Openings    = 1, // [1, sscopens, ssccerts]
    Shares      = 2, // [2, sscshares, ssccerts]
    Certificates = 3, // [3, ssccerts]
}

/**
 * Byron `ssc` — the Shared Seed Computation (MPC/VSS) payload of a block body:
 * ```cddl
 * ssc = [0, ssccomms, ssccerts] / [1, sscopens, ssccerts]
 *     / [2, sscshares, ssccerts] / [3, ssccerts]
 * ```
 *
 * The member payloads (`ssccomms`/`sscopens`/`sscshares`/`ssccerts`) are PVSS
 * cryptographic blobs (Scrape commitments, VSS shares, tag-258 sets). They are
 * preserved as raw CBOR — byte-exact round-trip — since nothing in a decoding
 * library needs to interpret the Scrape internals. {@link members} exposes them.
 */
export class ByronSsc
{
    readonly type: ByronSscType;
    /** the raw member payloads following the variant tag (2 members for tags 0/1/2, 1 for tag 3) */
    readonly members: CborObj[];

    constructor( type: ByronSscType, members: CborObj[] )
    {
        this.type = type;
        this.members = members;
    }

    clone(): ByronSsc { return new ByronSsc( this.type, this.members.map( m => m.clone() ) ); }

    toCborObj(): CborArray
    {
        return new CborArray([ new CborUInt( this.type ), ...this.members ]);
    }
    toCbor(): CborString { return Cbor.encode( this.toCborObj() ) as any as CborString; }
    toCborBytes(): Uint8Array { return Cbor.encode( this.toCborObj() ); }

    static fromCborObj( cObj: CborObj ): ByronSsc
    {
        if(!(
            cObj instanceof CborArray && cObj.array.length >= 2 &&
            cObj.array[0] instanceof CborUInt
        )) throw new Error("invalid CBOR for Byron ssc");
        const type = Number( cObj.array[0].num );
        if( type < 0 || type > 3 ) throw new Error("invalid Byron ssc tag: " + type);
        return new ByronSsc( type, cObj.array.slice(1) );
    }
    static fromCbor( cStr: CanBeCborString ): ByronSsc
    {
        return ByronSsc.fromCborObj( Cbor.parse( forceCborString( cStr ) ) );
    }

    toJSON() { return this.toJson(); }
    toJson() { return { type: this.type, members: this.members.map( m => m.toRawObj() ) }; }
}
