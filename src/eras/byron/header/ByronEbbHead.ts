import { CanBeCborString, Cbor, CborArray, CborObj, CborString, CborUInt, forceCborString } from "@harmoniclabs/cbor";
import { Hash32 } from "../../../hashes";

export interface IByronEbbHead {
    protocolMagic: number;
    prevBlock: Hash32;
    bodyProof: Hash32;                                  // a bare hash, unlike a main block's blockproof
    consensusData: { epoch: bigint; difficulty: bigint }; // ebbcons = [epochid, [u64]]
    /** `extraData = [attributes]`, preserved as raw CBOR */
    extra: CborObj;
}

/**
 * Byron epoch-boundary-block header:
 * ```cddl
 * ebbhead = [ protocolMagic: u32, prevBlock: blockid, bodyProof: hash,
 *             consensusData: ebbcons, extraData: [attributes] ]
 * ebbcons = [ epochid, difficulty ]   ; difficulty = [u64]
 * ```
 *
 * Differs from a main-block header: `bodyProof` is a bare hash (not a `blockproof`),
 * and `consensusData` is `[epoch, [difficulty]]` (no slotid/pubkey/blocksig).
 */
export class ByronEbbHead implements IByronEbbHead
{
    readonly protocolMagic: number;
    readonly prevBlock: Hash32;
    readonly bodyProof: Hash32;
    readonly consensusData: { epoch: bigint; difficulty: bigint };
    readonly extra: CborObj;

    constructor( h: IByronEbbHead )
    {
        this.protocolMagic = Number( h.protocolMagic );
        this.prevBlock = h.prevBlock;
        this.bodyProof = h.bodyProof;
        this.consensusData = { epoch: BigInt( h.consensusData.epoch ), difficulty: BigInt( h.consensusData.difficulty ) };
        this.extra = h.extra;
    }

    clone(): ByronEbbHead
    {
        return new ByronEbbHead({
            protocolMagic: this.protocolMagic,
            prevBlock: this.prevBlock.clone(),
            bodyProof: this.bodyProof.clone(),
            consensusData: { ...this.consensusData },
            extra: this.extra.clone()
        });
    }

    toCborObj(): CborArray
    {
        return new CborArray([
            new CborUInt( this.protocolMagic ),
            this.prevBlock.toCborObj(),
            this.bodyProof.toCborObj(),
            new CborArray([
                new CborUInt( this.consensusData.epoch ),
                new CborArray([ new CborUInt( this.consensusData.difficulty ) ])
            ]),
            this.extra
        ]);
    }
    toCbor(): CborString { return Cbor.encode( this.toCborObj() ) as any as CborString; }
    toCborBytes(): Uint8Array { return Cbor.encode( this.toCborObj() ); }

    static fromCborObj( cObj: CborObj ): ByronEbbHead
    {
        if(!(
            cObj instanceof CborArray && cObj.array.length === 5 &&
            cObj.array[0] instanceof CborUInt &&
            cObj.array[3] instanceof CborArray && cObj.array[3].array.length === 2 &&
            cObj.array[3].array[0] instanceof CborUInt &&
            cObj.array[3].array[1] instanceof CborArray &&
            cObj.array[3].array[1].array[0] instanceof CborUInt
        )) throw new Error("invalid CBOR for Byron ebbhead");
        return new ByronEbbHead({
            protocolMagic: Number( cObj.array[0].num ),
            prevBlock: Hash32.fromCborObj( cObj.array[1] ),
            bodyProof: Hash32.fromCborObj( cObj.array[2] ),
            consensusData: {
                epoch: cObj.array[3].array[0].num,
                difficulty: cObj.array[3].array[1].array[0].num
            },
            extra: cObj.array[4]
        });
    }
    static fromCbor( cStr: CanBeCborString ): ByronEbbHead
    {
        return ByronEbbHead.fromCborObj( Cbor.parse( forceCborString( cStr ) ) );
    }

    toJSON() { return this.toJson(); }
    toJson()
    {
        return {
            protocolMagic: this.protocolMagic,
            prevBlock: this.prevBlock.toString(),
            bodyProof: this.bodyProof.toString(),
            consensusData: { epoch: this.consensusData.epoch.toString(), difficulty: this.consensusData.difficulty.toString() }
        };
    }
}
