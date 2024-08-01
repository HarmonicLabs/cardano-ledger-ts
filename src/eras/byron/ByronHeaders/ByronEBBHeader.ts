import { CanBeCborString, Cbor, CborArray, CborBytes, CborObj, CborString, CborUInt, forceCborString } from "@harmoniclabs/cbor";
import { IHeader } from "../../IHeader";
import { EpochId, U8Arr32 } from "../../../utils/types";
import { getCborBytesDescriptor } from "../../../utils/getCborBytesDescriptor";
import { roDescr } from "../../../utils/roDescr";
import { blake2b_256 } from "../../../utils/crypto";
import { logger } from "../../../utils/logger";
import { isAValidHash } from "../../../utils/crypto";
import { isWord32 } from "../../../utils/isWord32";
import { isWord64 } from "../../../utils/isWord64";

export interface IByronEbbConsData {
    epochid: EpochId,
    difficulty: bigint
}

export function isIByronEbbConsData( consensusData: any ) : consensusData is IByronEbbConsData
{
    return(
        isWord64( consensusData.epochId ) &&
        isWord64( consensusData.difficulty )
    );
} 

export function byronEbbConsDataToCborObj({ epochid, difficulty }: IByronEbbConsData ): CborArray
{
    return new CborArray([
        new CborUInt( epochid ),
        new CborArray([
            new CborUInt( difficulty ),
        ])
    ]);
}

export function byronEbbConsDataFromCborObj( cbor: CborObj ): IByronEbbConsData
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
        throw new Error("invalid cbor for IByronEbbConsData");
    }

    return {
        epochid: cbor.array[0].num,
        difficulty: cbor.array[1].array[0].num,
    };
}

export interface IByronEBBHeader extends IHeader {
    readonly protocolMagic: number,
    readonly prevBlock: U8Arr32,                             //previous block hash
    readonly bodyProof: U8Arr32,
    readonly consensusData: IByronEbbConsData,
    readonly extraData: CborArray
}

export function isIByronEBBHeader( header: any ): header is IByronEBBHeader 
{
    return ( 
        header.isEBB &&
        isWord32( header.protocolMagic ) &&
        isAValidHash( header.prevBlock ) &&
        isAValidHash( header.bodyProof ) &&
        isIByronEbbConsData( header.consensusData ) &&
        header.extraData instanceof CborArray
    );
}

export class ByronEBBHeader
    implements IByronEBBHeader
{
    readonly hash: U8Arr32;
    readonly slotNo: bigint;
    readonly isEBB: boolean;

    readonly protocolMagic: number;
    readonly prevBlock: U8Arr32;                    //previous block hash
    readonly bodyProof: U8Arr32;
    readonly consensusData: IByronEbbConsData;
    readonly extraData: CborArray;

    readonly cborBytes?: Uint8Array;
    
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
            byronEbbConsDataToCborObj( this.consensusData ),
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

        const consensusData = byronEbbConsDataFromCborObj( cborConsData );

        const originalWerePresent = _originalBytes instanceof Uint8Array; 
        _originalBytes = _originalBytes instanceof Uint8Array ? _originalBytes : Cbor.encode( cbor ).toBuffer();

        const hdr = new ByronEBBHeader({
            // byron is a pain
            // the hash is calculated wrapping the header in the second slot of an array
            // the first slot is uint(0) for EBB and uint(1) for normal byron blocks
            hash: blake2b_256( new Uint8Array([ 0x82, 0x00, ..._originalBytes ]) ) as U8Arr32,
            prevBlock: cborPrevHash.buffer as U8Arr32,
            slotNo: consensusData.epochid * BigInt( 21600 ),
            isEBB: false,
            protocolMagic: Number( cborMagic.num ),
            bodyProof: cborBodyProof.buffer as U8Arr32,
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