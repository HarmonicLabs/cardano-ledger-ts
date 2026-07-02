import { CanBeCborString, Cbor, CborArray, CborObj, CborString, CborUInt, forceCborString } from "@harmoniclabs/cbor";
import { ByronMainBlock } from "./ByronMainBlock";
import { ByronEbBlock } from "./ByronEbBlock";

/**
 * Byron top-level block:
 * ```cddl
 * block = [0, ebblock]   ; epoch boundary block
 *       / [1, mainblock] ; main block
 * ```
 *
 * This is the shape carried inside the block-fetch payload (after any hard-fork
 * combinator tag-24 wrapper has been peeled off).
 */
export class ByronBlock
{
    readonly isEbb: boolean;
    readonly block: ByronMainBlock | ByronEbBlock;

    constructor( block: ByronMainBlock | ByronEbBlock )
    {
        this.isEbb = block instanceof ByronEbBlock;
        this.block = block;
    }

    /** the main block, or `undefined` when this is an epoch boundary block */
    get mainBlock(): ByronMainBlock | undefined { return this.isEbb ? undefined : this.block as ByronMainBlock; }
    /** the epoch boundary block, or `undefined` when this is a main block */
    get ebBlock(): ByronEbBlock | undefined { return this.isEbb ? this.block as ByronEbBlock : undefined; }

    clone(): ByronBlock { return new ByronBlock( this.block.clone() ); }

    toCborObj(): CborArray
    {
        return new CborArray([ new CborUInt( this.isEbb ? 0 : 1 ), this.block.toCborObj() ]);
    }
    toCbor(): CborString { return Cbor.encode( this.toCborObj() ) as any as CborString; }
    toCborBytes(): Uint8Array { return Cbor.encode( this.toCborObj() ); }

    static fromCborObj( cObj: CborObj ): ByronBlock
    {
        if(!(
            cObj instanceof CborArray && cObj.array.length === 2 &&
            cObj.array[0] instanceof CborUInt
        )) throw new Error("invalid CBOR for Byron block");
        const tag = Number( cObj.array[0].num );
        if( tag === 1 ) return new ByronBlock( ByronMainBlock.fromCborObj( cObj.array[1] ) );
        if( tag === 0 ) return new ByronBlock( ByronEbBlock.fromCborObj( cObj.array[1] ) );
        throw new Error("invalid Byron block tag: " + tag);
    }
    static fromCbor( cStr: CanBeCborString ): ByronBlock
    {
        return ByronBlock.fromCborObj( Cbor.parse( forceCborString( cStr ) ) );
    }

    toJSON() { return this.toJson(); }
    toJson()
    {
        return { type: this.isEbb ? "ebb" : "main", block: this.block.toJson() };
    }
}
