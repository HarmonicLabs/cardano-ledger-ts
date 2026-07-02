import { CanBeCborString, Cbor, CborArray, CborBytes, CborObj, CborString, CborUInt, forceCborString } from "@harmoniclabs/cbor";
import { toHex } from "@harmoniclabs/uint8array-utils";
import { wrapTag24, unwrapTag24 } from "../common/byronCborUtils";

export enum ByronTxWitnessType {
    PkWitness     = 0, // [ pubkey (64: ed25519 || chaincode), signature (64) ]
    ScriptWitness = 1, // [ [u16, bytes], [u16, bytes] ]
    RedeemWitness = 2, // [ pubkey (32), signature (64) ]
}

/**
 * Byron `twit` (transaction witness), a `[ tag, #6.24(inner) ]` pair:
 * ```cddl
 * twit = [0, #6.24([pubkey, signature])]                 ; PkWitness
 *      / [1, #6.24([[u16, bytes], [u16, bytes]])]         ; ScriptWitness
 *      / [2, #6.24([pubkey, signature])]                 ; RedeemWitness
 *      / [u8 .gt 2, encoded-cbor]
 * ```
 *
 * The inner item is preserved as a parsed `CborObj` so every variant round-trips
 * byte-exactly; PkWitness/RedeemWitness additionally expose `pubkey`/`signature`.
 */
export class ByronTxWitness
{
    readonly type: number;
    /** the tag-24 inner item (for type <= 2), or the raw `encoded-cbor` payload otherwise */
    readonly inner: CborObj;

    constructor( type: number, inner: CborObj )
    {
        this.type = type;
        this.inner = inner;
    }

    /** ed25519(+chaincode) public key bytes, for PkWitness/RedeemWitness */
    get pubkey(): Uint8Array | undefined
    {
        if( this.type !== 0 && this.type !== 2 ) return undefined;
        const a = this.inner;
        return a instanceof CborArray && a.array[0] instanceof CborBytes ? a.array[0].bytes : undefined;
    }
    /** signature bytes, for PkWitness/RedeemWitness */
    get signature(): Uint8Array | undefined
    {
        if( this.type !== 0 && this.type !== 2 ) return undefined;
        const a = this.inner;
        return a instanceof CborArray && a.array[1] instanceof CborBytes ? a.array[1].bytes : undefined;
    }

    clone(): ByronTxWitness { return new ByronTxWitness( this.type, this.inner.clone() ); }

    toCborObj(): CborArray
    {
        // types 0/1/2 wrap the inner in tag-24; unknown types carry raw encoded-cbor
        const payload = this.type <= 2 ? wrapTag24( this.inner ) : this.inner;
        return new CborArray([ new CborUInt( this.type ), payload ]);
    }
    toCbor(): CborString { return Cbor.encode( this.toCborObj() ) as any as CborString; }
    toCborBytes(): Uint8Array { return Cbor.encode( this.toCborObj() ); }

    static fromCborObj( cObj: CborObj ): ByronTxWitness
    {
        if(!(
            cObj instanceof CborArray &&
            cObj.array.length === 2 &&
            cObj.array[0] instanceof CborUInt
        )) throw new Error("invalid CBOR for Byron twit");

        const type = Number( cObj.array[0].num );
        const inner = type <= 2 ? unwrapTag24( cObj.array[1] ) : cObj.array[1];
        return new ByronTxWitness( type, inner );
    }
    static fromCbor( cStr: CanBeCborString ): ByronTxWitness
    {
        return ByronTxWitness.fromCborObj( Cbor.parse( forceCborString( cStr ) ) );
    }

    toJSON() { return this.toJson(); }
    toJson()
    {
        const pk = this.pubkey, sig = this.signature;
        return pk && sig ?
            { type: this.type, pubkey: toHex( pk ), signature: toHex( sig ) } :
            { type: this.type, inner: this.inner.toRawObj() };
    }
}
