import { CanBeCborString, Cbor, CborArray, CborObj, CborString, forceCborString } from "@harmoniclabs/cbor";
import { blake2b_256 } from "@harmoniclabs/crypto";
import { Hash32 } from "../../../hashes";
import { ByronAttributes } from "../common/ByronAttributes";
import { ByronTxIn } from "./ByronTxIn";
import { ByronTxOut } from "./ByronTxOut";

export interface IByronTx {
    inputs: ByronTxIn[];
    outputs: ByronTxOut[];
    attributes?: ByronAttributes;
}

/**
 * Byron `tx = [ [+ txin], [+ txout], attributes ]`.
 *
 * The input and output lists are encoded as indefinite-length CBOR arrays
 * (`9f … ff`), which this class reproduces for byte-exact round-trips.
 */
export class ByronTx implements IByronTx
{
    readonly inputs: ByronTxIn[];
    readonly outputs: ByronTxOut[];
    readonly attributes: ByronAttributes;

    constructor( tx: IByronTx )
    {
        if(!( Array.isArray( tx?.inputs ) && tx.inputs.length >= 1 ))
        throw new Error("Byron tx requires at least one input");
        if(!( Array.isArray( tx.outputs ) && tx.outputs.length >= 1 ))
        throw new Error("Byron tx requires at least one output");
        this.inputs = tx.inputs.slice();
        this.outputs = tx.outputs.slice();
        this.attributes = tx.attributes ?? new ByronAttributes();
    }

    /** the Byron transaction id: `blake2b_256( cbor(tx) )` */
    hash(): Hash32 { return new Hash32( blake2b_256( this.toCborBytes() ) ); }

    clone(): ByronTx
    {
        return new ByronTx({
            inputs: this.inputs.map( i => i.clone() ),
            outputs: this.outputs.map( o => o.clone() ),
            attributes: this.attributes.clone()
        });
    }

    toCborObj(): CborArray
    {
        return new CborArray([
            new CborArray( this.inputs.map( i => i.toCborObj() ), { indefinite: true } ),
            new CborArray( this.outputs.map( o => o.toCborObj() ), { indefinite: true } ),
            this.attributes.toCborObj()
        ]);
    }
    toCbor(): CborString { return Cbor.encode( this.toCborObj() ) as any as CborString; }
    toCborBytes(): Uint8Array { return Cbor.encode( this.toCborObj() ); }

    static fromCborObj( cObj: CborObj ): ByronTx
    {
        if(!(
            cObj instanceof CborArray &&
            cObj.array.length === 3 &&
            cObj.array[0] instanceof CborArray &&
            cObj.array[1] instanceof CborArray
        )) throw new Error("invalid CBOR for Byron tx");

        return new ByronTx({
            inputs: cObj.array[0].array.map( ByronTxIn.fromCborObj ),
            outputs: cObj.array[1].array.map( ByronTxOut.fromCborObj ),
            attributes: ByronAttributes.fromCborObj( cObj.array[2] )
        });
    }
    static fromCbor( cStr: CanBeCborString ): ByronTx
    {
        return ByronTx.fromCborObj( Cbor.parse( forceCborString( cStr ) ) );
    }

    toJSON() { return this.toJson(); }
    toJson()
    {
        return {
            txId: this.hash().toString(),
            inputs: this.inputs.map( i => i.toJson() ),
            outputs: this.outputs.map( o => o.toJson() ),
            attributes: this.attributes.toJson()
        };
    }
}
