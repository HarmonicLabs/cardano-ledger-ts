import { isBlockId, isDelegate, isDifficulty, isDlgProof, isEpochId, isExtraProof, isIssuer, isProtocolMagic, isPubKey, isSignature, isSlotNo, isUpdProof } from "../utils/isThatType";
import { Attributes, BlockId, Delegate, Difficulty, DlgProof, EpochId, ExtraProof, Issuer, ProtocolMagic, PubKey, Signature, SlotNo, UpdProof } from "../utils/types";
import { CanBeCborString, Cbor, CborArray, CborBytes, CborMap, CborObj, CborString, CborText, CborUInt, forceCborString, isCborObj } from "@harmoniclabs/cbor";
import { isBoolean, isByte, isHash32, isWord16, isWord32 } from "../../../utils/isThatType";
import { getCborBytesDescriptor } from "../../../utils/getCborBytesDescriptor";
import { Byte, U8Arr32, Word16, Word32 } from "../../../utils/types";
import { attributesMapToCborObj } from "../utils/objToCbor";
import { cborMapToAttributes } from "../utils/cbortoObj";
import { IHeader } from "../../../interfaces/IHeader";
import { blake2b_256 } from "../../../utils/crypto";
import { isObject } from "@harmoniclabs/obj-utils";
import { roDescr } from "../../../utils/roDescr";

// txproof

export type IByronTxProof = {
    word32: Word32,
    firstHash: U8Arr32,
    secondHash: U8Arr32
};

export function isIByronTxProof( stuff: any ): stuff is IByronTxProof
{
    return(
        isObject( stuff ) &&
        isWord32( stuff.word32 ) &&
        isHash32( stuff.firstHash ) &&
        isHash32( stuff.secondHash )
    );
}

export function txProofToCborObj( stuff: IByronTxProof ): CborArray
{
    return new CborArray([
        new CborUInt( stuff.word32 ),
        new CborBytes( stuff.firstHash ),
        new CborBytes( stuff.secondHash ),
    ]);
}

export function txProofFromCborObj( cbor: CborObj ): IByronTxProof
{
    if(!(
        cbor instanceof CborArray &&
        cbor.array.length === 3
    )) throw new Error("invalid cbor for `IByronTxProof`");

    const [
        cborWord32,
        cborFirstHash,
        cborSecondHash
    ] = cbor.array;

    if(!(
        cborWord32 instanceof CborUInt &&
        cborFirstHash instanceof CborBytes &&
        cborSecondHash instanceof CborBytes
    )) throw new Error("invalid cbor for `IByronTxProof`");
    
    return {
        word32: Number( cborWord32.num ) as Word32,
        firstHash: cborFirstHash.bytes as U8Arr32,
        secondHash: cborSecondHash.bytes as U8Arr32
    };
}

// sscproof

export type IByronSscProof = 
| { type: 0, firstHash: U8Arr32, secondHash: U8Arr32 }
| { type: 1, firstHash: U8Arr32, secondHash: U8Arr32 }
| { type: 2, firstHash: U8Arr32, secondHash: U8Arr32 }
| { type: 3, firstHash: U8Arr32 };

export function isIByronSscProof( stuff: any ): stuff is IByronSscProof
{
    return(
        isObject( stuff ) &&
        [0, 1, 2, 3].includes( stuff.type ) &&
        isHash32( stuff.firstHash ) &&
        ( stuff.type === 3 || isHash32(stuff.secondHash) )
    );
}

export function sscProofToCborObj( stuff: IByronSscProof ): CborArray
{
    if( stuff.type === 3 )
    {
        return new CborArray([
            new CborUInt( 3 ),
            new CborBytes( stuff.firstHash )
        ]);
    }
    else
    {
        return new CborArray([
            new CborUInt( stuff.type ),
            new CborBytes( stuff.firstHash ),
            new CborBytes( stuff.secondHash )
        ]);
    }
}

export function sscProofFromCborObj( cbor: CborObj ): IByronSscProof
{
    if(!(
        cbor instanceof CborArray &&
        [2, 3].includes( cbor.array.length )
    )) throw new Error("invalid cbor for `IByronSscProof`");

    if(!( 
        cbor.array[0] instanceof CborUInt &&
        cbor.array[1] instanceof CborBytes
    )) throw new Error("invalid cbor for `IByronSscProof`");
    
    const type = Number( cbor.array[0].num ) as Byte;
    const cborFirstHash = cbor.array[1];

    if(!( type === 3 ))
    {
        const cborSecondHash = cbor.array[2];
        if(!( cborSecondHash instanceof CborBytes )) throw new Error("invalid cbor for `IByronSscProof`");

        return { 
            type: type as 0 | 1 | 2, 
            firstHash: cborFirstHash.bytes as U8Arr32,
            secondHash: cborSecondHash.bytes as U8Arr32
        };
    }
    else
    {
        return { 
            type: 3, 
            firstHash: cborFirstHash.bytes as U8Arr32
        };
    }
}

// blockproof

export interface IByronBodyProof {
    txProof: IByronTxProof,
    sscProof: IByronSscProof,
    dlgProof: DlgProof,
    updProof: UpdProof,
}

export function isIByronBodyProof( stuff: any ): stuff is IByronBodyProof
{
    return(
        isIByronTxProof( stuff.txProof ) &&
        isIByronSscProof( stuff.sscProof ) &&
        isDlgProof( stuff.dlgProof ) &&
        isUpdProof( stuff.updProof )
    );
}

export function bodyProofToCborObj( stuff: IByronBodyProof ): CborArray
{
    return new CborArray([
        txProofToCborObj( stuff.txProof ),
        sscProofToCborObj( stuff.sscProof ),
        new CborBytes( stuff.dlgProof ),
        new CborBytes( stuff.updProof ),
    ]);
}

export function bodyProofFromCborObj( cbor: CborObj ): IByronBodyProof
{
    if(!(
        cbor instanceof CborArray &&
        cbor.array.length === 4
    )) throw new Error("invalid cbor for `IByronBodyProof`");

    const [
        cborTxProof,
        cborSscProof,
        cborDlgProof,
        cborUpdProof
    ] = cbor.array;

    if(!(
        cborTxProof instanceof CborArray &&
        cborSscProof instanceof CborArray &&
        cborDlgProof instanceof CborBytes &&
        cborUpdProof instanceof CborBytes
    )) throw new Error("invalid cbor for `IByronBodyProof`");

    return {
        txProof : txProofFromCborObj( cborTxProof ) as IByronTxProof,
        sscProof: sscProofFromCborObj( cborSscProof ) as IByronSscProof,
        dlgProof: cborDlgProof.bytes as DlgProof,
        updProof: cborUpdProof.bytes as UpdProof
    }
}

// slotid

export interface IByronSlotId {
    epoch: EpochId,
    slot: SlotNo
}

export function isIByronSlotId( stuff: any ): stuff is IByronSlotId
{
    return(
        isObject( stuff ) &&
        isEpochId( stuff.epochId ) &&
        isSlotNo( stuff.slot )
    );
}

export function slotIdToCborObj( stuff: IByronSlotId ): CborArray
{
    return new CborArray([
        new CborUInt( stuff.epoch ),
        new CborUInt( stuff.slot ),
    ]);
}

export function slotIdFromCborObj( cbor: CborObj ): IByronSlotId
{
    if(!(
        cbor instanceof CborArray &&
        cbor.array.length === 2
    )) throw new Error("invalid cbor for `IByronSlotId`");

    const [ 
        cborEpoch, 
        cborSlot
    ] = cbor.array;

    if(!(
        cborEpoch instanceof CborUInt &&
        cborSlot instanceof CborUInt
    )) throw new Error("invalid cbor for `IByronSlotId`");

    return {
        epoch: cborEpoch.num as EpochId,
        slot: cborSlot.num as SlotNo
    };
}

// lwdlg

// wtf is this name? <- idk bro ç-ç
export interface IByronLwdlg {
    epochRange: [EpochId, EpochId],
    issuer: Issuer,
    delegate: Delegate,
    certificate: Signature
}

export function isIByronLwdlg( stuff: any ): stuff is IByronLwdlg
{
    return(
        isObject( stuff ) &&
        Array.isArray( stuff.epochRange ) && 
        stuff.epochRange.length === 2 &&
        stuff.epochRange.every( isEpochId ) &&
        isIssuer( stuff.issuer ) &&
        isDelegate( stuff.delegate ) &&
        isSignature( stuff.certificate )
    );
}

export function lwdlgToCborObj( stuff: IByronLwdlg ): CborArray
{
    return new CborArray([
        new CborArray( stuff.epochRange.map(( element ) => ( new CborUInt( element ) ))),
        new CborBytes( stuff.issuer ),
        new CborBytes( stuff.delegate ),
        new CborBytes( stuff.certificate ),
    ]);
}

export function lwdlgFromCborObj( cbor: CborObj ): IByronLwdlg
{
    if(!(
        cbor instanceof CborArray &&
        cbor.array.length === 4
    )) throw new Error("invalid cbor for `Lwdlg`");

    const [
        cborEpochRange,
        cborIssuer,
        cborDelegate,
        cborCert
    ] = cbor.array;

    if(!(
        cborEpochRange instanceof CborArray &&
        cborEpochRange.array.length === 2 &&
        cborEpochRange.array[0] instanceof CborUInt &&
        cborEpochRange.array[1] instanceof CborUInt &&
        cborIssuer instanceof CborBytes &&
        cborDelegate instanceof CborBytes &&
        cborCert instanceof CborBytes
    )) throw new Error("invalid cbor for `Lwdlg`");

    return {
        epochRange: [ 
            cborEpochRange.array[0].num as EpochId, 
            cborEpochRange.array[1].num as EpochId
        ],
        issuer: cborIssuer.bytes as Issuer,
        delegate: cborDelegate.bytes as Delegate,
        certificate: cborCert.bytes as Signature,
    };
}

// dlg

// wtf is this name? <- idk bro ç-ç
export interface IByronDlg {
    epoch: EpochId,
    issuer: Issuer,
    delegate: Delegate,
    certificate: Signature,
}

export function isIByronDlg( stuff: any ): stuff is IByronDlg
{
    return(
        isObject( stuff ) &&
        isEpochId( stuff.epoch ) &&
        isIssuer( stuff.issuer ) &&
        isDelegate( stuff.delegate ) &&
        isSignature( stuff.certificate )
    );
}

export function dlgToCborObj( stuff: IByronDlg ): CborArray
{
    return new CborArray([
        new CborUInt( stuff.epoch ),
        new CborBytes( stuff.issuer ),
        new CborBytes( stuff.delegate ),
        new CborBytes( stuff.certificate )
    ]);
}

export function dlgFromCborObj( cbor: CborObj ): IByronDlg
{
    if(!(
        cbor instanceof CborArray &&
        cbor.array.length === 4
    )) throw new Error("invalid cbor for `IByronDlg`");

    const [
        cborEpoch,
        cborIssuer,
        cborDelegate,
        cborCert
    ] = cbor.array;

    if(!(
        cborEpoch instanceof CborUInt &&
        cborIssuer instanceof CborBytes &&
        cborDelegate instanceof CborBytes &&
        cborCert instanceof CborBytes
    )) throw new Error("invalid cbor for `IByronDlg`");

    return {
        epoch: cborEpoch.num as EpochId,
        issuer: cborIssuer.bytes as Issuer,
        delegate: cborDelegate.bytes as Delegate,
        certificate: cborCert.bytes as Signature,
    };
}

// lwdlgsig

export type IByronLwdlgSig = { lwdlg: IByronLwdlg, signature: Signature }

export function isIByronLwdlgSig( stuff: any ): stuff is IByronLwdlgSig
{
    return(
        isObject( stuff ) &&
        isIByronLwdlg( stuff.lwdlg ) &&
        isSignature( stuff.signature )
    );
}

export function lwdlgSigToCborObj( stuff: IByronLwdlgSig ): CborArray
{
    return new CborArray([
        lwdlgToCborObj( stuff.lwdlg ),
        new CborBytes( stuff.signature )
    ]);
}

export function lwdlgSigFromCborObj( cbor: CborObj ): IByronLwdlgSig
{
    if(!(
        cbor instanceof CborArray &&
        cbor.array.length === 2
    )) throw new Error("invalid cbor for `ILwdlgSig`");

    const [
        cborLwdlg,
        cborSignature
    ] = cbor.array;

    if(!(
        cborLwdlg instanceof CborArray &&
        cborSignature instanceof CborBytes
    )) throw new Error("invalid cbor for `ILwdlgSig`");
    
    return {
        lwdlg: lwdlgFromCborObj( cborLwdlg ) as IByronLwdlg,
        signature: cborSignature.bytes as Signature
    };
}

// dlgsig

export type IByronDlgSig = { dlg: IByronDlg, signature: Signature };

export function isIByronDlgSig( stuff: any ): stuff is IByronDlgSig
{
    return(
        isObject( stuff ) &&
        isIByronDlg( stuff.dlg ) &&
        isSignature( stuff.signature )
    );
}

export function dlgSigToCborObj( stuff: IByronDlgSig ): CborArray
{  
    return new CborArray([
        dlgToCborObj( stuff.dlg ),
        new CborBytes( stuff.signature )
    ]);
}

export function dlgSigFromCborObj( cbor: CborObj ): IByronDlgSig
{
    if(!(
        cbor instanceof CborArray &&
        cbor.array.length === 2
    )) throw new Error("invalid cbor for `IDlgSig`");

    const [ 
        cborDlg, 
        cborSignature 
    ] = cbor.array;

    if(!(
        cborDlg instanceof CborArray &&
        cborSignature instanceof CborBytes
    )) throw new Error("invalid cbor for `IDlgSig`");
    
    return {
        dlg: dlgFromCborObj( cborDlg ) as IByronDlg,
        signature: cborSignature.bytes as Signature
    };
}

// blocksig

export type IByronBlockSig = 
    | { type: 0, signature: Signature }
    | { type: 1, lwdlgSig: IByronLwdlgSig }
    | { type: 2, dlgSig: IByronDlgSig };

export function isIByronBlockSig( stuff: any ): stuff is IByronBlockSig
{
    if(!( 
        isObject( stuff ) &&
        isByte( stuff.type ) &&
        [0, 1, 2].includes( stuff.type )
    )) return false;
    
    switch( stuff.type )
    {
        case 0:
            return( isSignature( stuff.signature ) );
        case 1:
            return( isIByronLwdlgSig( stuff.lwdlgSig ) );
        case 2:
            return( isIByronDlgSig( stuff.dlgSig ) );
        default: return false;
    }
}

export function blockSigToCborObj( stuff: IByronBlockSig ): CborArray
{
    switch( stuff.type )
    {
        case 0: {
            return new CborArray([
                new CborUInt( 0 ),
                new CborBytes( stuff.signature )
            ]);
        }
        case 1: {
            return new CborArray([
                new CborUInt( 1 ),
                lwdlgSigToCborObj( stuff.lwdlgSig )
            ]);
        }
        case 2: {
            return new CborArray([
                new CborUInt( 2 ),
                dlgSigToCborObj( stuff.dlgSig )
            ])
        }
        default: throw new Error("unrecognized 'IByronBlockSig'")
    }
}

export function blockSigFromCborObj( cbor: CborObj ): IByronBlockSig
{
    if(!(
        cbor instanceof CborArray &&
        cbor.array.length === 2
    )) throw new Error("invald cbor for `IByronBlockSig`");

    const [
        cborTypeId,
        cborValue
    ] = cbor.array;

    if(!(
        cborTypeId instanceof CborUInt
    )) throw new Error("invalid cbor for `IByronBlockSig`");

    switch( Number( cborTypeId.num ) )
    {
        case 0: {
            if(!( cborValue instanceof CborBytes )) throw new Error("invalid cbor for `IByronBlockSig`");
            return {
                type: 0,
                signature: cborValue.bytes as Signature
            };
        }
        case 1:
            if(!( cborValue instanceof CborArray )) throw new Error("invalid cbor for `IByronBlockSig`");
            return {
                type: 1,
                lwdlgSig: lwdlgSigFromCborObj( cborValue ) as IByronLwdlgSig
            };
        case 2:
            if(!( cborValue instanceof CborArray )) throw new Error("invalid cbor for `IByronBlockSig`");
            return {
                type: 2,
                dlgSig: dlgSigFromCborObj( cborValue ) as IByronDlgSig
            };
        default: throw new Error("invalid cbor for `IByronBlockSig`");
    }
}

// blockcons

export interface IByronConsData {
    slotid: IByronSlotId,
    pubkey: PubKey,
    difficulty: Difficulty,
    blockSig: IByronBlockSig,
}

export function isIByronConsData( stuff: any ): stuff is IByronConsData
{
    return(
        isObject( stuff ) &&
        isIByronSlotId( stuff.slotid ) &&
        isPubKey( stuff.pubkey ) &&
        isDifficulty( stuff.difficulty ) &&
        isIByronBlockSig( stuff.blockSig )
    );
}

export function consensusDataToCborObj( stuff: IByronConsData ): CborArray
{
    return new CborArray([
        slotIdToCborObj( stuff.slotid ),
        new CborBytes( stuff.pubkey ),
        new CborArray([ new CborUInt( stuff.difficulty ) ]),
        blockSigToCborObj( stuff.blockSig )
    ])
}

export function consensusDataFromCborObj( cbor: CborObj ): IByronConsData
{
    if(!(
        cbor instanceof CborArray &&
        cbor.array.length === 4
    )) throw new Error("invalid cbor for `IByronConsData`");

    const [
        cborSlotid,
        cborPubkey,
        cborDiff,
        cborBlockSig
    ] = cbor.array;

    if(!(
        cborSlotid instanceof CborArray &&
        cborPubkey instanceof CborBytes &&
        cborDiff instanceof CborArray &&
        cborDiff.array.length === 1 &&
        cborDiff.array[0] instanceof CborUInt &&
        cborBlockSig instanceof CborArray
    )) throw new Error("invalid cbor for `IByronConsData`");

    return {
        slotid: slotIdFromCborObj( cborSlotid ) as IByronSlotId,
        pubkey: cborPubkey.bytes as PubKey,
        difficulty: cborDiff.array[0].num as Difficulty,
        blockSig: blockSigFromCborObj( cborBlockSig ) as IByronBlockSig
    };
}

// blockheadex

export interface IByronHeaderExtra {
    version: [ Word16, Word16, Byte ],
    softwareVersion: [ string, Word32 ],
    attributes: Attributes,
    extraProof: ExtraProof
}

export function isIByronHeaderExtra( stuff: any ): stuff is IByronHeaderExtra
{
    return(
        isObject( stuff ) &&
        Array.isArray( stuff.version ) &&
        stuff.version.length === 3 &&
        ( 
            isWord16( stuff.version[0] ) &&
            isWord16( stuff.version[1] )  &&
            isByte( stuff.version[2] ) 
        ) &&
        Array.isArray( stuff.softwareVersion ) &&
        stuff.softwareVersion.length === 2 &&
        (
            stuff.softwareVersion[0] instanceof String &&
            isWord32( stuff.softwareVersion[1] )
        ) &&
        isCborObj( stuff.attributes ) &&
        isExtraProof( stuff.extraProof )
    );
}

export function headerExtraToCborObj( stuff: IByronHeaderExtra ): CborArray
{
    return new CborArray([
        new CborArray( stuff.version.map(
            ( element ) => ( new CborUInt( element ) )
        ) ),
        new CborArray([
            new CborText( stuff.softwareVersion[0] ),
            new CborUInt( stuff.softwareVersion[1] ),
        ]),
        attributesMapToCborObj( stuff.attributes ),
        new CborBytes( stuff.extraProof )
    ]);
}

export function headerExtraFromCborObj( cbor: CborObj ): IByronHeaderExtra
{
    if(!(
        cbor instanceof CborArray &&
        cbor.array.length === 4
    )) throw new Error("invalid cbor for `IByronHeaderExtra`");

    const [
        cborVersion,
        cborSoftwareVersion,
        attributes,
        cborExtraProof
    ] = cbor.array;

    if(!(
        cborVersion instanceof CborArray &&
        cborVersion.array.length === 3 &&
        cborVersion.array.every(( element ) => ( element instanceof CborUInt )) &&
        cborSoftwareVersion instanceof CborArray &&
        cborSoftwareVersion.array.length === 2 &&
        cborSoftwareVersion.array[0] instanceof CborText &&
        cborSoftwareVersion.array[1] instanceof CborUInt &&
        attributes instanceof CborMap &&
        attributes.map.length >= 0 &&
        cborExtraProof instanceof CborBytes
    )) throw new Error("invalid cbor for `IByronHeaderExtra`");

    return {
        version: [
            Number( cborVersion.array[0].num ) as Word16,
            Number( cborVersion.array[1].num ) as Word16,
            Number( cborVersion.array[2].num ) as Byte,
        ],
        softwareVersion: [
            cborSoftwareVersion.array[0].text as string,
            Number( cborSoftwareVersion.array[1].num ) as Word32
        ],
        attributes: cborMapToAttributes( attributes ) as Attributes,
        extraProof: cborExtraProof.bytes as ExtraProof
    };
}

// blockhead

export interface IByronNoEBBHeader extends IHeader
{
    readonly protocolMagic: ProtocolMagic,
    readonly prevBlock: BlockId,
    readonly bodyProof: IByronBodyProof,
    readonly consensusData: IByronConsData,
    readonly extraData: IByronHeaderExtra
}

export function isIByronNoEBBHeader( stuff: any ): stuff is IByronNoEBBHeader 
{
    return ( 
        isObject( stuff ) &&
        isHash32( stuff.hash ) &&
        isSlotNo( stuff.slotNo ) &&
        ( isBoolean( stuff.isEBB ) && !stuff.isEBB ) &&
        isProtocolMagic( stuff.protocolMagic ) &&
        isBlockId( stuff.prevBlock ) &&
        isIByronBodyProof( stuff.bodyProof ) &&
        isIByronConsData( stuff.consensusData ) &&
        isIByronHeaderExtra( stuff.extraData )
    );
}

export class ByronNoEBBHeader
    implements IByronNoEBBHeader
{
    readonly hash: U8Arr32;
    readonly slotNo: SlotNo;
    readonly isEBB: boolean;
    
    readonly protocolMagic: ProtocolMagic;
    readonly prevBlock: BlockId;
    readonly bodyProof: IByronBodyProof;
    readonly consensusData: IByronConsData;
    readonly extraData: IByronHeaderExtra;

    readonly cborBytes?: Uint8Array;

    constructor( stuff: any )
    {
        if(!( isIByronNoEBBHeader( stuff ) ))
            throw new Error( "invalid new `IByronNoEBBHeader` data provided" );

        const hash = Uint8Array.prototype.slice.call( stuff.hash, 0, 32 );
        Object.defineProperties(
            this, {
                hash: {
                    get: () => Uint8Array.prototype.slice.call( hash ),
                    set: (arg) => arg,
                    enumerable: true,
                    configurable: false  
                },
                prevHash: { value: stuff.prevBlock, ...roDescr },
                slotNo: { value: stuff.slotNo, ...roDescr },
                isEBB: { value: stuff.isEBB, ...roDescr },
                protocolMagic: { value: stuff.protocolMagic, ...roDescr },
                bodyProof: { value: stuff.bodyProof, ...roDescr },
                consensusData: { value: stuff.consensusData, ...roDescr },
                extraData: { value: stuff.extraData, ...roDescr },
                cborBytes: getCborBytesDescriptor()
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
            bodyProofToCborObj( this.bodyProof ),
            consensusDataToCborObj( this.consensusData ),
            headerExtraToCborObj( this.extraData )
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

    static fromCbor( cbor: CanBeCborString ): ByronNoEBBHeader
    {
        const bytes = cbor instanceof Uint8Array ? cbor : forceCborString( cbor ).toBuffer();
        return ByronNoEBBHeader.fromCborObj( Cbor.parse( bytes ), bytes );
    }

    static fromCborObj( cbor: CborObj, _originalBytes?: Uint8Array ): ByronNoEBBHeader
    {
        if(!(
            cbor instanceof CborArray &&
            cbor.array.length === 5
        )) throw new Error("invalid cbor for `ByronNoEBBHeader`");

        const [
            cborMagic,
            cborPrevHash,
            cborBodyProof,
            cborConsData,
            cborExtraData
        ] = cbor.array;

        if(!(
            cborMagic instanceof CborUInt &&
            cborPrevHash instanceof CborBytes &&
            cborBodyProof instanceof CborArray &&
            cborConsData instanceof CborArray &&
            cborExtraData instanceof CborArray
        )) throw new Error("invalid cbor for `ByronNoEBBHeader`");

        const consensusData = consensusDataFromCborObj( cborConsData );

        const originalWerePresent = _originalBytes instanceof Uint8Array;
        _originalBytes = _originalBytes instanceof Uint8Array ? _originalBytes : Cbor.encode( cbor ).toBuffer();
        
        const hdr = new ByronNoEBBHeader({
            // byron is a pain
            // the hash is calculated wrapping the header in the second slot of an array
            // the first slot is uint(0) for EBB and uint(1) for normal byron blocks
            hash: blake2b_256( new Uint8Array([ 0x82, 0x01, ..._originalBytes ]) ) as U8Arr32,
            slotNo: consensusData.slotid.epoch * BigInt( 21600 ) + consensusData.slotid.slot as SlotNo,
            isEBB: false,
            protocolMagic: Number( cborMagic.num ) as ProtocolMagic,
            prevBlock: cborPrevHash.bytes as BlockId,
            bodyProof: bodyProofFromCborObj( cborBodyProof ) as IByronBodyProof,
            consensusData: consensusData as IByronConsData,
            extraData: headerExtraFromCborObj( cborExtraData ) as IByronHeaderExtra
        });

        if( originalWerePresent )
        {
            // @ts-ignore Cannot assign to 'cborBytes' because it is a read-only property.
            hdr.cborBytes = _originalBytes;
        }

        return hdr;
    }
}
