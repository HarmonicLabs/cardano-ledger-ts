import { CanBeCborString, Cbor, CborArray, CborObj, CborString, CborUInt, forceCborString } from "@harmoniclabs/cbor";
import { Hash32 } from "../../../hashes";
import { wrapTag24, unwrapTag24 } from "../common/byronCborUtils";

export interface IByronTxIn {
    txId: Hash32;
    index: number;
}

/**
 * Byron `txin = [ 0, #6.24(bytes .cbor [txid, u32]) ] / [ u8 .ne 0, encoded-cbor ]`.
 *
 * The standard input (type `0`) references a previous output by `[txid, index]`,
 * tag-24 wrapped. Non-zero types (never used on mainnet) are preserved verbatim.
 */
export class ByronTxIn implements IByronTxIn
{
    readonly type: number;
    readonly txId!: Hash32;
    readonly index!: number;
    /** for non-standard (type != 0) inputs, the raw `encoded-cbor` payload, preserved verbatim */
    private readonly _rawPayload?: CborObj;

    constructor( txIn: IByronTxIn & { type?: number }, rawPayload?: CborObj )
    {
        this.type = txIn.type ?? 0;
        if( this.type === 0 )
        {
            if(!( txIn.txId instanceof Hash32 ))
            throw new Error("invalid Byron txin txId");
            this.txId = txIn.txId;
            this.index = Number( txIn.index );
        }
        else
        {
            this._rawPayload = rawPayload;
        }
    }

    clone(): ByronTxIn
    {
        return this.type === 0 ?
            new ByronTxIn({ type: 0, txId: this.txId.clone(), index: this.index }) :
            new ByronTxIn({ type: this.type } as any, this._rawPayload );
    }

    toCborObj(): CborArray
    {
        if( this.type !== 0 )
            return new CborArray([ new CborUInt( this.type ), this._rawPayload! ]);
        return new CborArray([
            new CborUInt( 0 ),
            wrapTag24( new CborArray([ this.txId.toCborObj(), new CborUInt( this.index ) ]) )
        ]);
    }
    toCbor(): CborString { return Cbor.encode( this.toCborObj() ) as any as CborString; }
    toCborBytes(): Uint8Array { return Cbor.encode( this.toCborObj() ); }

    static fromCborObj( cObj: CborObj ): ByronTxIn
    {
        if(!(
            cObj instanceof CborArray &&
            cObj.array.length === 2 &&
            cObj.array[0] instanceof CborUInt
        )) throw new Error("invalid CBOR for Byron txin");

        const type = Number( cObj.array[0].num );
        if( type !== 0 )
            return new ByronTxIn({ type } as any, cObj.array[1] );

        const inner = unwrapTag24( cObj.array[1] );
        if(!(
            inner instanceof CborArray &&
            inner.array.length === 2 &&
            inner.array[1] instanceof CborUInt
        )) throw new Error("invalid Byron txin inner [txid, index]");

        return new ByronTxIn({
            type: 0,
            txId: Hash32.fromCborObj( inner.array[0] ),
            index: Number( inner.array[1].num )
        });
    }
    static fromCbor( cStr: CanBeCborString ): ByronTxIn
    {
        return ByronTxIn.fromCborObj( Cbor.parse( forceCborString( cStr ) ) );
    }

    toJSON() { return this.toJson(); }
    toJson()
    {
        return this.type === 0 ?
            { txId: this.txId.toString(), index: this.index } :
            { type: this.type, raw: this._rawPayload?.toRawObj() };
    }
}
