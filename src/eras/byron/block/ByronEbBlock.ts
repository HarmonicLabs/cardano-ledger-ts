import { CanBeCborString, Cbor, CborArray, CborObj, CborString, forceCborString } from "@harmoniclabs/cbor";
import { Hash28 } from "../../../hashes";
import { ByronEbbHead } from "../header/ByronEbbHead";

export interface IByronEbBlock {
    header: ByronEbbHead;
    stakeholders: Hash28[];      // body = [+ stakeholderid], stakeholderid = blake2b_224
    /** `extra = [attributes]`, preserved as raw CBOR */
    extra: CborObj;
}

/**
 * Byron `ebblock = [ header: ebbhead, body: [+ stakeholderid], extra: [attributes] ]`.
 *
 * Epoch boundary blocks are computed locally by each node and were never gossiped,
 * so no on-chain fixture exists; this is validated by construct/encode/decode round-trip.
 * The stakeholder list is encoded as an indefinite-length array (Byron list convention).
 */
export class ByronEbBlock implements IByronEbBlock
{
    readonly header: ByronEbbHead;
    readonly stakeholders: Hash28[];
    readonly extra: CborObj;

    constructor( block: IByronEbBlock )
    {
        this.header = block.header;
        this.stakeholders = ( block.stakeholders ?? [] ).slice();
        this.extra = block.extra;
    }

    clone(): ByronEbBlock
    {
        return new ByronEbBlock({ header: this.header.clone(), stakeholders: this.stakeholders.map( s => s.clone() ), extra: this.extra.clone() });
    }

    toCborObj(): CborArray
    {
        return new CborArray([
            this.header.toCborObj(),
            new CborArray( this.stakeholders.map( s => s.toCborObj() ), { indefinite: true } ),
            this.extra
        ]);
    }
    toCbor(): CborString { return Cbor.encode( this.toCborObj() ) as any as CborString; }
    toCborBytes(): Uint8Array { return Cbor.encode( this.toCborObj() ); }

    static fromCborObj( cObj: CborObj ): ByronEbBlock
    {
        if(!(
            cObj instanceof CborArray && cObj.array.length === 3 &&
            cObj.array[1] instanceof CborArray
        )) throw new Error("invalid CBOR for Byron ebblock");
        return new ByronEbBlock({
            header: ByronEbbHead.fromCborObj( cObj.array[0] ),
            stakeholders: cObj.array[1].array.map( s => Hash28.fromCborObj( s ) ),
            extra: cObj.array[2]
        });
    }
    static fromCbor( cStr: CanBeCborString ): ByronEbBlock
    {
        return ByronEbBlock.fromCborObj( Cbor.parse( forceCborString( cStr ) ) );
    }

    toJSON() { return this.toJson(); }
    toJson()
    {
        return { header: this.header.toJson(), stakeholders: this.stakeholders.map( s => s.toString() ) };
    }
}
