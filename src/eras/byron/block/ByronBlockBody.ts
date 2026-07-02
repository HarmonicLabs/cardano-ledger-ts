import { CanBeCborString, Cbor, CborArray, CborObj, CborString, forceCborString } from "@harmoniclabs/cbor";
import { ByronTxAux } from "../tx/ByronTxAux";
import { ByronSsc } from "../ssc/ByronSsc";
import { ByronDelegationCert } from "../delegation/ByronDelegation";
import { ByronUpdate } from "../update/ByronUpdate";

export interface IByronBlockBody {
    txPayload: ByronTxAux[];
    ssc: ByronSsc;
    dlgPayload: ByronDelegationCert[];
    update: ByronUpdate;
}

/**
 * Byron `blockbody = [ txPayload, sscPayload, dlgPayload, updPayload ]` where
 * `txPayload = [* [tx, [* twit]]]` and `dlgPayload = [* dlg]`.
 *
 * The `txPayload` and `dlgPayload` lists are encoded as indefinite-length arrays.
 */
export class ByronBlockBody implements IByronBlockBody
{
    readonly txPayload: ByronTxAux[];
    readonly ssc: ByronSsc;
    readonly dlgPayload: ByronDelegationCert[];
    readonly update: ByronUpdate;

    constructor( body: IByronBlockBody )
    {
        this.txPayload = ( body.txPayload ?? [] ).slice();
        this.ssc = body.ssc;
        this.dlgPayload = ( body.dlgPayload ?? [] ).slice();
        this.update = body.update;
    }

    clone(): ByronBlockBody
    {
        return new ByronBlockBody({
            txPayload: this.txPayload.map( t => t.clone() ),
            ssc: this.ssc.clone(),
            dlgPayload: this.dlgPayload.map( d => d.clone() ),
            update: this.update.clone()
        });
    }

    toCborObj(): CborArray
    {
        return new CborArray([
            new CborArray( this.txPayload.map( t => t.toCborObj() ), { indefinite: true } ),
            this.ssc.toCborObj(),
            new CborArray( this.dlgPayload.map( d => d.toCborObj() ), { indefinite: true } ),
            this.update.toCborObj()
        ]);
    }
    toCbor(): CborString { return Cbor.encode( this.toCborObj() ) as any as CborString; }
    toCborBytes(): Uint8Array { return Cbor.encode( this.toCborObj() ); }

    static fromCborObj( cObj: CborObj ): ByronBlockBody
    {
        if(!(
            cObj instanceof CborArray && cObj.array.length === 4 &&
            cObj.array[0] instanceof CborArray &&
            cObj.array[2] instanceof CborArray
        )) throw new Error("invalid CBOR for Byron blockbody");
        return new ByronBlockBody({
            txPayload: cObj.array[0].array.map( ByronTxAux.fromCborObj ),
            ssc: ByronSsc.fromCborObj( cObj.array[1] ),
            dlgPayload: cObj.array[2].array.map( ByronDelegationCert.fromCborObj ),
            update: ByronUpdate.fromCborObj( cObj.array[3] )
        });
    }
    static fromCbor( cStr: CanBeCborString ): ByronBlockBody
    {
        return ByronBlockBody.fromCborObj( Cbor.parse( forceCborString( cStr ) ) );
    }

    toJSON() { return this.toJson(); }
    toJson()
    {
        return {
            txPayload: this.txPayload.map( t => t.toJson() ),
            ssc: this.ssc.toJson(),
            dlgPayload: this.dlgPayload.map( d => d.toJson() ),
            update: this.update.toJson()
        };
    }
}
