import { CanBeCborString, Cbor, CborArray, CborObj, CborString, forceCborString } from "@harmoniclabs/cbor";
import { ByronTx } from "./ByronTx";
import { ByronTxWitness } from "./ByronTxWitness";

export interface IByronTxAux {
    tx: ByronTx;
    witnesses: ByronTxWitness[];
}

/**
 * A Byron block-body transaction entry: `[ tx, [* twit] ]`.
 *
 * This is the `txPayload` element shape (`blockbody[0] = [* [tx, [* twit]]]`).
 * The pair and the witness list are both definite-length arrays.
 */
export class ByronTxAux implements IByronTxAux
{
    readonly tx: ByronTx;
    readonly witnesses: ByronTxWitness[];

    constructor( aux: IByronTxAux )
    {
        if(!( aux?.tx instanceof ByronTx ))
        throw new Error("invalid Byron txaux tx");
        this.tx = aux.tx;
        this.witnesses = ( aux.witnesses ?? [] ).slice();
    }

    clone(): ByronTxAux
    {
        return new ByronTxAux({ tx: this.tx.clone(), witnesses: this.witnesses.map( w => w.clone() ) });
    }

    toCborObj(): CborArray
    {
        return new CborArray([
            this.tx.toCborObj(),
            new CborArray( this.witnesses.map( w => w.toCborObj() ) )
        ]);
    }
    toCbor(): CborString { return Cbor.encode( this.toCborObj() ) as any as CborString; }
    toCborBytes(): Uint8Array { return Cbor.encode( this.toCborObj() ); }

    static fromCborObj( cObj: CborObj ): ByronTxAux
    {
        if(!(
            cObj instanceof CborArray &&
            cObj.array.length === 2 &&
            cObj.array[1] instanceof CborArray
        )) throw new Error("invalid CBOR for Byron txaux");
        return new ByronTxAux({
            tx: ByronTx.fromCborObj( cObj.array[0] ),
            witnesses: cObj.array[1].array.map( ByronTxWitness.fromCborObj )
        });
    }
    static fromCbor( cStr: CanBeCborString ): ByronTxAux
    {
        return ByronTxAux.fromCborObj( Cbor.parse( forceCborString( cStr ) ) );
    }

    toJSON() { return this.toJson(); }
    toJson()
    {
        return { tx: this.tx.toJson(), witnesses: this.witnesses.map( w => w.toJson() ) };
    }
}
