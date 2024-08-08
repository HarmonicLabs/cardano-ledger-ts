import { CanBeCborString, Cbor, CborArray, CborBytes, CborObj, CborString, CborUInt, forceCborString } from "@harmoniclabs/cbor";
import { isBlockId, isDifficulty, isEpochId, isProtocolMagic, isSlotNo } from "../utils/isThatType";
import { BlockId, Difficulty, EpochId, ProtocolMagic, SlotNo } from "../utils/types";
import { getCborBytesDescriptor } from "../../../utils/getCborBytesDescriptor";
import { isBoolean, isHash32 } from "../../../utils/isThatType";
import { IHeader } from "../../../interfaces/IHeader";
import { blake2b_256 } from "../../../utils/crypto";
import { roDescr } from "../../../utils/roDescr";
import { logger } from "../../../utils/logger";
import { U8Arr32 } from "../../../utils/types";

export interface IByronEBBConsData {
    epochid: EpochId,
    difficulty: Difficulty
}

export function isIByronEBBConsData( consensusData: any ) : consensusData is IByronEBBConsData
{
    return(
        isEpochId( consensusData.epochId ) &&
        isDifficulty( consensusData.difficulty )
    );
} 

export function byronEBBConsDataToCborObj({ epochid, difficulty }: IByronEBBConsData ): CborArray
{
    return new CborArray([
        new CborUInt( epochid ),
        new CborArray([
            new CborUInt( difficulty ),
        ])
    ]);
}

export function byronEBBConsDataFromCborObj( cbor: CborObj ): IByronEBBConsData
{
    if(!(
        cbor instanceof CborArray &&
        cbor.array.length >= 2 &&
        cbor.array[0] instanceof CborUInt &&
        cbor.array[1] instanceof CborArray &&
        cbor.array[1].array.length >= 1 &&
        cbor.array[1].array[0] instanceof CborUInt
    ))
    {
        logger.debug(
            "byron ebb consData form cborObj",
            Cbor.encode( cbor ).toString()
        );
        throw new Error("invalid cbor for IByronEBBConsData");
    }

    return {
        epochid: cbor.array[0].num,
        difficulty: cbor.array[1].array[0].num,
    };
}

export interface IByronEBBHeader extends IHeader 
{
    readonly protocolMagic: ProtocolMagic,
    readonly prevBlock: BlockId,
    readonly bodyProof: U8Arr32,
    readonly consensusData: IByronEBBConsData,
    readonly extraData: CborArray
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
        isIByronEBBConsData( stuff.consensusData ) &&
        stuff.extraData instanceof CborArray
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
    readonly consensusData: IByronEBBConsData;
    readonly extraData: CborArray;

    readonly cborBytes?: U8Arr32;
    
    constructor( header: IByronEBBHeader )
    {
        if(!( isIByronEBBHeader( header ) ))
            throw new Error( "invalid new `IByronEBBHeader` data provided" );

        const hash = Uint8Array.prototype.slice.call( header.hash, 0, 32 );
        Object.defineProperties(
            this, {
                hash: {
                    get: () => Uint8Array.prototype.slice.call( hash ),
                    set: (arg) => arg,
                    enumerable: true,
                    configurable: false  
                },
                prevBlock: { value: header.prevBlock, ...roDescr },
                slotNo: { value: header.slotNo, ...roDescr },
                isEBB: { value: header.isEBB, ...roDescr },
                protocolMagic: { value: header.protocolMagic, ...roDescr },
                bodyProof: { value: header.bodyProof, ...roDescr },
                consensusData: { value: header.consensusData, ...roDescr },
                extraData: { value: header.extraData, ...roDescr },
                cborBytes: getCborBytesDescriptor(),
            }
        );
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
            byronEBBConsDataToCborObj( this.consensusData ),
            this.extraData
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
        )) throw new Error("invalid cbor for ByronEBBHeader");

        const [
            cborMagic,
            cborPrevHash,
            cborBodyProof,
            cborConsData,
            extraData
        ] = cbor.array;

        if(!(
            cborMagic instanceof CborUInt &&
            cborPrevHash instanceof CborBytes &&
            cborBodyProof instanceof CborBytes &&
            extraData instanceof CborArray
        )) throw new Error("invalid cbor for ByronEBBHeader");

        const consensusData = byronEBBConsDataFromCborObj( cborConsData );

        const originalWerePresent = _originalBytes instanceof Uint8Array; 
        _originalBytes = _originalBytes instanceof Uint8Array ? _originalBytes : Cbor.encode( cbor ).toBuffer();

        const hdr = new ByronEBBHeader({
            // byron is a pain
            // the hash is calculated wrapping the header in the second slot of an array
            // the first slot is uint(0) for EBB and uint(1) for normal byron blocks
            hash: blake2b_256( new Uint8Array([ 0x82, 0x00, ..._originalBytes ]) ) as U8Arr32,
            prevBlock: cborPrevHash.bytes as U8Arr32,
            slotNo: consensusData.epochid * BigInt( 21600 ),
            isEBB: false,
            protocolMagic: Number( cborMagic.num ),
            bodyProof: cborBodyProof.bytes as U8Arr32,
            consensusData,
            extraData
        });

        if( originalWerePresent )
        {
            // @ts-ignore Cannot assign to 'cborBytes' because it is a read-only property.
            hdr.cborBytes = _originalBytes;
        }

        return hdr;
    }
}