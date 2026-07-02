import { CanBeCborString, Cbor, CborArray, CborObj, CborString, CborUInt, forceCborString } from "@harmoniclabs/cbor";
import { Hash32 } from "../../../hashes";

/**
 * Byron `sscproof` — the block-header proof over the SSC payload:
 * ```cddl
 * sscproof = [0, hash, hash]   ; commitments
 *          / [1, hash, hash]   ; openings
 *          / [2, hash, hash]   ; shares
 *          / [3, hash]         ; certificates only
 * ```
 */
export class ByronSscProof
{
    readonly type: number;
    readonly hashes: Hash32[];

    constructor( type: number, hashes: Hash32[] )
    {
        this.type = type;
        this.hashes = hashes;
    }

    clone(): ByronSscProof { return new ByronSscProof( this.type, this.hashes.map( h => h.clone() ) ); }

    toCborObj(): CborArray
    {
        return new CborArray([ new CborUInt( this.type ), ...this.hashes.map( h => h.toCborObj() ) ]);
    }
    toCbor(): CborString { return Cbor.encode( this.toCborObj() ) as any as CborString; }
    toCborBytes(): Uint8Array { return Cbor.encode( this.toCborObj() ); }

    static fromCborObj( cObj: CborObj ): ByronSscProof
    {
        if(!(
            cObj instanceof CborArray && cObj.array.length >= 2 &&
            cObj.array[0] instanceof CborUInt
        )) throw new Error("invalid CBOR for Byron sscproof");
        return new ByronSscProof(
            Number( cObj.array[0].num ),
            cObj.array.slice(1).map( h => Hash32.fromCborObj( h ) )
        );
    }
    static fromCbor( cStr: CanBeCborString ): ByronSscProof
    {
        return ByronSscProof.fromCborObj( Cbor.parse( forceCborString( cStr ) ) );
    }

    toJSON() { return this.toJson(); }
    toJson() { return { type: this.type, hashes: this.hashes.map( h => h.toString() ) }; }
}
