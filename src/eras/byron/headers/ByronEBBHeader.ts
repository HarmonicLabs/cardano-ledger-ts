import { CanBeCborString, Cbor, CborArray, CborBytes, CborMap, CborObj, CborString, CborUInt, forceCborString } from "@harmoniclabs/cbor";
import { isAttributes, isBlockId, isDifficulty, isEpochId, isProtocolMagic, isSlotNo } from "../utils/isThatType";
import { Attributes, BlockId, Difficulty, EpochId, ProtocolMagic, SlotNo } from "../utils/types";
import { isBoolean, isHash32 } from "../../../utils/isThatType";
import { attributesMapToCborObj } from "../utils/objToCbor";
import { cborMapToAttributes } from "../utils/cbortoObj";
import { IHeader } from "../../../interfaces/IHeader";
import { blake2b_256 } from "../../../utils/crypto";
import { isObject } from "@harmoniclabs/obj-utils";
import { logger } from "../../../utils/logger";
import { U8Arr32 } from "../../../utils/types";

// ebbcons

export interface IByronConsensusData {
    epochid: EpochId,
    difficulty: Difficulty
}

export function isIByronConsensusData( stuff: any ) : stuff is IByronConsensusData
{
    return(
        isObject( stuff ) &&
        isEpochId( stuff.epochId ) &&
        isDifficulty( stuff.difficulty )
    );
} 

export function consensusDataToCborObj( consensusData: IByronConsensusData ): CborArray
{
    return new CborArray([
        new CborUInt( consensusData.epochid ),
        new CborArray([
            new CborUInt( consensusData.difficulty ),
        ])
    ]);
}

export function consensusDataFromCborObj( cbor: CborObj ): IByronConsensusData
{
    if(!(
        cbor instanceof CborArray &&
        cbor.array.length === 2 &&
        cbor.array[0] instanceof CborUInt &&
        cbor.array[1] instanceof CborArray &&
        cbor.array[1].array.length === 1 &&
        cbor.array[1].array[0] instanceof CborUInt
    ))
    {
        logger.debug(
            "IByronConsensusData from cborObj",
            Cbor.encode( cbor ).toString()
        );
        throw new Error("invalid cbor for `IByronConsensusData`");
    }

    return {
        epochid: cbor.array[0].num as EpochId,
        difficulty: cbor.array[1].array[0].num as Difficulty,
    };
}

export interface IByronEBBHeader extends IHeader 
{
    readonly protocolMagic: ProtocolMagic,
    readonly prevBlock: BlockId,
    readonly bodyProof: U8Arr32,
    readonly consensusData: IByronConsensusData,
    readonly extraData: Attributes
}

export function isIByronEBBHeader( stuff: any ): stuff is IByronEBBHeader 
{
    return (
        isHash32( stuff.hash ) &&
        isSlotNo( stuff.slotNo ) &&
        ( isBoolean( stuff.isEBB ) && stuff.isEBB ) &&
        isProtocolMagic( stuff.protocolMagic ) &&
        isBlockId( stuff.prevBlock ) &&
        isHash32( stuff.bodyProof ) &&
        isIByronConsensusData( stuff.consensusData ) &&
        isAttributes( stuff.extraData )
    );
}

export class ByronEBBHeader
    implements IByronEBBHeader
{
    readonly hash: U8Arr32;
    readonly slotNo: SlotNo;
    readonly isEBB: boolean;

    readonly protocolMagic: ProtocolMagic;
    readonly prevBlock: BlockId;
    readonly bodyProof: U8Arr32;
    readonly consensusData: IByronConsensusData;
    readonly extraData: Attributes;

    readonly cborBytes?: U8Arr32;
    
    constructor( stuff: any )
    {
        if(!( isIByronEBBHeader( stuff ) )) throw new Error( "invalid new `IByronEBBHeader` data provided" );

        this.hash = stuff.hash;
        this.slotNo = stuff.slotNo;
        this.isEBB = true;
        this.protocolMagic = stuff.protocolMagic;
        this.prevBlock = stuff.prevBlock;
        this.bodyProof = stuff.bodyProof;
        this.consensusData = stuff.consensusData;
        this.extraData = stuff.extraData;
    }

    toCbor(): CborString
    {
        return new CborString( this.toCborBytes() );
    }
    toCborObj(): CborArray
    {
        return new CborArray([
            new CborUInt( this.protocolMagic ),
            new CborBytes( this.prevBlock ),
            new CborBytes( this.bodyProof ),
            consensusDataToCborObj( this.consensusData ),
            new CborArray([ attributesMapToCborObj( this.extraData ) ])
        ]);
    }
    toCborBytes(): Uint8Array
    {
        if(!( this.cborBytes instanceof Uint8Array ))
        {
            // @ts-ignore Cannot assign to 'cborBytes' because it is a read-only property.
            this.cborBytes = Cbor.encode( this.toCborObj() ).toBuffer();
        }

        return Uint8Array.prototype.slice.call( this.cborBytes );
    }

    static fromCbor( cbor: CanBeCborString ): ByronEBBHeader
    {
        const bytes = cbor instanceof Uint8Array ? cbor : forceCborString( cbor ).toBuffer();
        return ByronEBBHeader.fromCborObj( Cbor.parse( bytes ), bytes );
    }
    static fromCborObj( cbor: CborObj, _originalBytes?: Uint8Array | undefined ): ByronEBBHeader
    {
        if(!(
            cbor instanceof CborArray &&
            cbor.array.length >= 5
        )) throw new Error("invalid cbor for `ByronEBBHeader`");

        const [
            cborMagic,
            cborprevBlock,
            cborBodyProof,
            cborConsData,
            cborExtraData
        ] = cbor.array;

        if(!(
            cborMagic instanceof CborUInt &&
            cborprevBlock instanceof CborBytes &&
            cborBodyProof instanceof CborBytes &&
            cborConsData instanceof CborArray &&
            cborExtraData instanceof CborArray &&
            cborExtraData.array[0] instanceof CborMap
        )) throw new Error("invalid cbor for `ByronEBBHeader`");

        const consensusData = consensusDataFromCborObj( cborConsData );

        const originalWerePresent = _originalBytes instanceof Uint8Array; 
        _originalBytes = _originalBytes instanceof Uint8Array ? _originalBytes : Cbor.encode( cbor ).toBuffer();

        const hdr = new ByronEBBHeader({
            // byron is a pain
            // the hash is calculated wrapping the header in the second slot of an array
            // the first slot is uint(0) for EBB and uint(1) for normal byron blocks
            hash: blake2b_256( new Uint8Array([ 0x82, 0x00, ..._originalBytes ]) ) as U8Arr32,
            slotNo: consensusData.epochid * BigInt( 21600 ) as SlotNo,
            isEBB: true,
            protocolMagic: Number( cborMagic.num ) as ProtocolMagic,
            prevBlock: cborprevBlock.bytes as U8Arr32,
            bodyProof: cborBodyProof.bytes as U8Arr32,
            consensusData: consensusData as IByronConsensusData,
            extraData: cborMapToAttributes( cborExtraData.array[0] ) as Attributes
        });

        if( originalWerePresent )
        {
            // @ts-ignore Cannot assign to 'cborBytes' because it is a read-only property.
            hdr.cborBytes = _originalBytes;
        }

        return hdr;
    }

}
