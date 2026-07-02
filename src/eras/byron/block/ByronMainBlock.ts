import { CanBeCborString, Cbor, CborArray, CborObj, CborString, forceCborString } from "@harmoniclabs/cbor";
import { ByronBlockHeaderBody } from "../header/ByronBlockHeaderBody";
import { ByronBlockBody } from "./ByronBlockBody";

export interface IByronMainBlock {
    header: ByronBlockHeaderBody;
    body: ByronBlockBody;
    /** the block's `extra = [attributes]`, preserved as raw CBOR */
    extra: CborObj;
}

/**
 * Byron `mainblock = [ header: blockhead, body: blockbody, extra: [attributes] ]`.
 */
export class ByronMainBlock implements IByronMainBlock
{
    readonly header: ByronBlockHeaderBody;
    readonly body: ByronBlockBody;
    readonly extra: CborObj;

    constructor( block: IByronMainBlock )
    {
        this.header = block.header;
        this.body = block.body;
        this.extra = block.extra;
    }

    clone(): ByronMainBlock
    {
        return new ByronMainBlock({ header: this.header, body: this.body.clone(), extra: this.extra.clone() });
    }

    toCborObj(): CborArray
    {
        return new CborArray([ this.header.toCborObj(), this.body.toCborObj(), this.extra ]);
    }
    toCbor(): CborString { return Cbor.encode( this.toCborObj() ) as any as CborString; }
    toCborBytes(): Uint8Array { return Cbor.encode( this.toCborObj() ); }

    static fromCborObj( cObj: CborObj ): ByronMainBlock
    {
        if(!(
            cObj instanceof CborArray && cObj.array.length === 3
        )) throw new Error("invalid CBOR for Byron mainblock");
        return new ByronMainBlock({
            header: ByronBlockHeaderBody.fromCborObj( cObj.array[0] ),
            body: ByronBlockBody.fromCborObj( cObj.array[1] ),
            extra: cObj.array[2]
        });
    }
    static fromCbor( cStr: CanBeCborString ): ByronMainBlock
    {
        return ByronMainBlock.fromCborObj( Cbor.parse( forceCborString( cStr ) ) );
    }

    toJSON() { return this.toJson(); }
    toJson()
    {
        return { header: this.header.toJson(), body: this.body.toJson() };
    }
}
