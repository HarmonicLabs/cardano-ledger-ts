import { IHeader } from "../../IHeader";
import { CanBeCborString, Cbor, CborArray, CborBytes, CborObj, CborString, CborText, CborUInt, forceCborString, isCborObj } from "@harmoniclabs/cbor";
import { EpochId, U8Arr32 } from "../../../utils/types";
import { roDescr } from "../../../utils/roDescr";
import { getCborBytesDescriptor } from "../../../utils/getCborBytesDescriptor";
import { blake2b_256, isAValidHash } from "../../../utils/crypto";
import { isWord32 } from "../../../utils/isWord32";
import { isWord64 } from "../../../utils/isWord64";

// txproof

export type IByronTxProof = [ number, U8Arr32, U8Arr32 ];

export function byronTxProofToCborObj( txProof: IByronTxProof ): CborArray
{
    return new CborArray([
        new CborUInt( txProof[0] ),
        new CborBytes( txProof[1] ),
        new CborBytes( txProof[2] ),
    ]);
}

export function byronTxProofFromCborObj( cbor: CborObj ): IByronTxProof
{
    if(!(
        cbor instanceof CborArray &&
        cbor.array.length >= 3
    )) throw new Error("invalid cbor for ByronNoEBBHeader::IByronBodyProof::IByronTxProof");

    const [
        cN,
        cHash1,
        cHash2
    ] = cbor.array;

    if(!(
        cN instanceof CborUInt &&
        cHash1 instanceof CborBytes &&
        cHash2 instanceof CborBytes
    )) throw new Error("invalid cbor for ByronNoEBBHeader::IByronBodyProof::IByronTxProof");
    
    return [
        Number( cN.num ),
        cHash1.bytes as U8Arr32,
        cHash2.bytes as U8Arr32,
    ];
}

export function isIByronNoEbbTxProof( txProof: any ): txProof is IByronTxProof
{
    return(
        Array.isArray( txProof ) &&
        txProof.length === 3 &&
        isWord32( txProof[0] ) &&
        isAValidHash( txProof[1] ) &&
        isAValidHash( txProof[2] )
    );
}

// sscproof

export type IByronSscProof 
    = [ 0, U8Arr32, U8Arr32 ]
    | [ 1, U8Arr32, U8Arr32 ]
    | [ 2, U8Arr32, U8Arr32 ]
    | [ 3, U8Arr32 ];

export function byronSscProofToCborObj( sscProof: IByronSscProof ): CborArray
{
    const fst = new CborUInt( sscProof[0] );
    const rest = sscProof.slice(1) as Uint8Array[];
    return new CborArray([
        fst,
        ...rest.map( b => new CborBytes( b ) )
    ]);
}

export function byronSscProofFromCborObj( cbor: CborObj ): IByronSscProof
{
    if(!(
        cbor instanceof CborArray &&
        cbor.array.length >= 2
    )) throw new Error("invalid cbor for ByronNoEBBHeader::IByronBodyProof::IByronSscProof");

    const [
        cIdx,
        cHash1,
        cHash2
    ] = cbor.array;

    if(!(
        cIdx instanceof CborUInt &&
        cHash1 instanceof CborBytes
        // do not check cHash2 as it might be undefined
    )) throw new Error("invalid cbor for ByronNoEBBHeader::IByronBodyProof::IByronSscProof");

    const idx = Number( cIdx.num );

    if(!( 0 <= idx && idx <= 3 )) throw new Error("invalid index for ByronNoEBBHeader::IByronBodyProof::IByronSscProof");

    if( idx === 3 )
    {
        return [ 3, cHash1.bytes as U8Arr32 ];
    }

    if(!( cHash2 instanceof CborBytes )) throw new Error("invalid cbor for ByronNoEBBHeader::IByronBodyProof::IByronSscProof");

    return [
        idx as 0 | 1 | 2 | 3,
        cHash1.bytes as U8Arr32,
        cHash2.bytes as U8Arr32
    ] as any;
}

export function isIByronNoEbbSscProof( sscProof: any ): sscProof is IByronSscProof
{
    return(
        Array.isArray( sscProof ) &&
        ( sscProof[0] >= 0 && sscProof[0] <= 3 ) &&
        sscProof.slice(1).every( isAValidHash )
    );
}

// blockproof

export interface IByronBodyProof {
    txProof: IByronTxProof,
    sscProof: IByronSscProof,
    dlgProof: U8Arr32,
    updProof: U8Arr32,
}

export function byronBodyProofToCborObj( bProof: IByronBodyProof ): CborArray
{
    return new CborArray([
        byronTxProofToCborObj( bProof.txProof ),
        byronSscProofToCborObj( bProof.sscProof ),
        new CborBytes( bProof.dlgProof ),
        new CborBytes( bProof.updProof ),
    ]);
}

export function byronBodyProofFromCborObj( cbor: CborObj ): IByronBodyProof
{
    if(!(
        cbor instanceof CborArray &&
        cbor.array.length >= 4
    )) throw new Error("invalid cbor for ByronNoEBBHeader::IByronBodyProof");

    const [
        cTxProof,
        cSscProof,
        cDlgProof,
        cUpdProof
    ] = cbor.array;

    if(!(
        cDlgProof instanceof CborBytes &&
        cUpdProof instanceof CborBytes
    )) throw new Error("invalid cbor for ByronNoEBBHeader::IByronBodyProof");

    return {
        txProof : byronTxProofFromCborObj( cTxProof ),
        sscProof: byronSscProofFromCborObj( cSscProof ),
        dlgProof: cDlgProof.bytes as U8Arr32,
        updProof: cUpdProof.bytes as U8Arr32
    }
}

export function isIByronNoEbbBodyProof( bodyProof: any ): bodyProof is IByronBodyProof
{
    return(
        isIByronNoEbbTxProof( bodyProof.txProof ) &&
        isIByronNoEbbSscProof( bodyProof.sscProof ) &&
        isAValidHash( bodyProof.dlgProof ) &&
        isAValidHash( bodyProof.updProof )
    );
}

// slotid

export interface IByronSlotId {
    epoch: EpochId,
    slot: bigint
}

export function byronSlotIdToCborObj( slotid: IByronSlotId ): CborArray
{
    return new CborArray([
        new CborUInt( slotid.epoch ),
        new CborUInt( slotid.slot ),
    ]);
}

export function byronSlotIdFromCborObj( cbor: CborObj ): IByronSlotId
{
    if(!(
        cbor instanceof CborArray &&
        cbor.array.length >= 2 &&
        cbor.array.every( c => c instanceof CborUInt )
    )) throw new Error("invalid cbor for IByronSlotId");

    const [ epoch, slot ] = cbor.array as CborUInt[];

    return {
        epoch: epoch.num,
        slot: slot.num
    };
}

export function isIByronNoEbbSlotId( slotId: any ): slotId is IByronSlotId
{
    return(
        isWord64( slotId.epochId ) &&
        isWord64( slotId.slot )
    );
}

// lwdlg

// wtf is this name? <- idk bro ç-ç
export interface ILwdlg {
    epochRange: [EpochId, EpochId],
    issuer: U8Arr32,
    delegate: U8Arr32,
    certificate: Uint8Array,
}

export function byronLwdlgToCborObj({
    epochRange,
    issuer,
    delegate,
    certificate
}: ILwdlg ): CborArray
{
    return new CborArray([
        new CborArray( epochRange.map( n => new CborUInt( n ) )),
        new CborBytes( issuer ),
        new CborBytes( delegate ),
        new CborBytes( certificate ),
    ]);
}

export function byronLwdlgFromCborObj( cbor: CborObj ): ILwdlg
{
    if(!(
        cbor instanceof CborArray &&
        cbor.array.length >= 4
    )) throw new Error("invalid cbor for Lwdlg");

    const [
        cEpochRange,
        cIssuer,
        cDelegate,
        cCert
    ] = cbor.array;

    if(!(
        cEpochRange instanceof CborArray &&
        cEpochRange.array.length >= 2 &&
        cEpochRange.array[0] instanceof CborUInt &&
        cEpochRange.array[1] instanceof CborUInt &&
        cIssuer instanceof CborBytes &&
        cDelegate instanceof CborBytes &&
        cCert instanceof CborBytes
    )) throw new Error("invalid cbor for Lwdlg");

    return {
        epochRange: [ cEpochRange.array[0].num, cEpochRange.array[1].num ],
        issuer: cIssuer.bytes as U8Arr32,
        delegate: cDelegate.bytes as U8Arr32,
        certificate: cCert.bytes,
    };
}

export function isIByronNoEbbLwdlg( lwdlg: any ): lwdlg is ILwdlg
{
    return(
        Array.isArray( lwdlg.epochRange ) && 
        lwdlg.epochRange.length === 2 &&
        lwdlg.epochRange.every( isWord64 ) &&
        isAValidHash( lwdlg.issuer ) &&
        isAValidHash( lwdlg.delegate ) &&
        isAValidHash( lwdlg.certificate )
    );
}

// dlg

// wtf is this name? <- idk bro ç-ç
export interface IDlg {
    epoch: EpochId,
    issuer: U8Arr32,
    delegate: U8Arr32,
    certificate: Uint8Array,
}

export function byronDlgToCborObj({
    epoch,
    issuer,
    delegate,
    certificate,
}: IDlg ): CborArray
{
    return new CborArray([
        new CborUInt ( epoch ),
        new CborBytes( issuer ),
        new CborBytes( delegate ),
        new CborBytes( certificate ),
    ]);
}


export function byronDlgFromCborObj( cbor: CborObj ): IDlg
{
    if(!(
        cbor instanceof CborArray &&
        cbor.array.length >= 4
    )) throw new Error("invalid cbor for Lwdlg");

    const [
        cEpoch,
        cIssuer,
        cDelegate,
        cCert
    ] = cbor.array;

    if(!(
        cEpoch instanceof CborUInt &&
        cIssuer instanceof CborBytes &&
        cDelegate instanceof CborBytes &&
        cCert instanceof CborBytes
    )) throw new Error("invalid cbor for Lwdlg");

    return {
        epoch: cEpoch.num,
        issuer: cIssuer.bytes as U8Arr32,
        delegate: cDelegate.bytes as U8Arr32,
        certificate: cCert.bytes,
    };
}

export function isIByronNoEbbDlg( dlg: any ): dlg is IDlg
{
    return(
        isWord64( dlg.epoch ) &&
        isAValidHash( dlg.issuer ) &&
        isAValidHash( dlg.delegate ) &&
        isAValidHash( dlg.certificate )
    );
}

// lwdlgsig

export type ILwdlgSig = [ ILwdlg, Uint8Array ];

export function byronLwdlgSigToCborObj( [ lwdlg, signature ]: ILwdlgSig ): CborArray
{
    return new CborArray([
        byronLwdlgToCborObj( lwdlg ),
        new CborBytes( signature )
    ]);
}

export function byronLwdlgSigFromCborObj( cbor: CborObj ): ILwdlgSig
{
    if(!(
        cbor instanceof CborArray &&
        cbor.array.length >= 2
    )) throw new Error("invalid cbor for ByronNoEBBHeader::IByronConsData::IByronBlockSig::ILwdlgSig");

    const [
        cLwdlg,
        cSignature
    ] = cbor.array;

    if(!(
        cLwdlg instanceof CborArray &&
        cSignature instanceof CborBytes
    )) throw new Error("invalid cbor for ByronNoEBBHeader::IByronConsData::IByronBlockSig::ILwdlgSig");
    
    return [
        byronLwdlgFromCborObj( cLwdlg ),
        cSignature.bytes as Uint8Array
    ];
}

export function isIByronNoEbbLwdlgSig( lwdlgsig: any ): lwdlgsig is ILwdlgSig
{
    return(
        Array.isArray( lwdlgsig ) &&
        lwdlgsig.length === 2 &&
        isIByronNoEbbLwdlg( lwdlgsig[0] ) &&
        isAValidHash( lwdlgsig[1] )
    );
}

// dlgsig

export type IDlgSig = [ IDlg, Uint8Array ];

export function byronDlgSigToCborObj( [ dlg, signature ]: IDlgSig ): CborArray
{  
    return new CborArray([
        byronDlgToCborObj( dlg ),
        new CborBytes( signature )
    ]);
}

export function byronDlgSigFromCborObj( cbor: CborObj ): IDlgSig
{
    if(!(
        cbor instanceof CborArray &&
        cbor.array.length >= 2
    )) throw new Error("invalid cbor for ByronNoEBBHeader::IByronConsData::IByronBlockSig::IDlgSig");

    const [ cDlg, cSignature ] = cbor.array;

    if(!(
        cDlg instanceof CborArray &&
        cSignature instanceof CborBytes
    )) throw new Error("invalid cbor for ByronNoEBBHeader::IByronConsData::IByronBlockSig::IDlgSig");
    
    return [
        byronDlgFromCborObj( cDlg ),
        cSignature.bytes as Uint8Array
    ];
}

export function isIByronNoEbbDlgSig( dlgsig: any ): dlgsig is IDlgSig
{
    return(
        Array.isArray( dlgsig ) &&
        dlgsig.length === 2 &&
        isIByronNoEbbDlg( dlgsig[0] ) &&
        isAValidHash( dlgsig[1] )
    );
}

// blocksig

export type IByronBlockSig 
    = [ 0, Uint8Array ]
    | [ 1, ILwdlgSig ]
    | [ 2, IDlgSig ];

export function byronBlockSigToCborObj( bSig: IByronBlockSig ): CborArray
{
    switch( bSig[0] )
    {
        case 0: {
            return new CborArray([
                new CborUInt( 0 ),
                new CborBytes( bSig[1] )
            ]);
            break;
        }
        case 1: {
            return new CborArray([
                new CborUInt( 1 ),
                byronLwdlgSigToCborObj( bSig[1] )
            ]);
            break;
        }
        case 2: {
            return new CborArray([
                new CborUInt( 2 ),
                byronDlgSigToCborObj( bSig[1] )
            ])
            break;
        }
        default: throw new Error("unrecognized 'IByronBlockSig'")
    }
}

export function byronBlockSigFromCborObj( cbor: CborObj ): IByronBlockSig
{
    if(!(
        cbor instanceof CborArray &&
        cbor.array.length >= 2 &&
        cbor.array[0] instanceof CborUInt
    )) throw new Error("invald cbor for IByronBlockSig");

    const idx = Number( cbor.array[0].num );
    const other = cbor.array[1];

    switch( idx )
    {
        case 0: {
            if(!( other instanceof CborBytes )) throw new Error("invald cbor for IByronBlockSig");
            return [ 0, other.bytes ];
            break;
        }
        case 1:
        case 2: {
            if(!(
                other instanceof CborArray &&
                other.array.length >= 2 &&
                other.array[1] instanceof CborBytes
            )) throw new Error("invald cbor for IByronBlockSig");
            break;
        }
        default: throw new Error("unrecognized 'IByronBlockSig' index from cbor")
    }

    const sig = idx === 1 ? byronLwdlgSigFromCborObj( other ) : byronDlgSigFromCborObj( other );
    
    return [
        idx,
        sig
    ] as any;
}

export function isIByronNoEbbBlockSig( bSig: any ): bSig is IByronBlockSig
{
    if(!( 
        Array.isArray( bSig ) &&
        bSig.length === 2 &&
        ( bSig[0] >= 0 && bSig[0] <= 2 )
    )) return false;
    
    switch( bSig[0] )
    {
        case 0:
            return( isAValidHash(bSig[1]) );
            break;
        case 1:
            return( isIByronNoEbbLwdlgSig( bSig[1] ) );
            break;
        case 2:
            return( isIByronNoEbbDlgSig( bSig[1] ) );
            break;
        default: throw new Error("provided 'IByronBlockSig' is not valid")
    }
}

// blockcons

export interface IByronConsData {
    slotid: IByronSlotId,
    pubkey: U8Arr32, // pubkey is32; pub key hash is 28
    difficulty: bigint,
    blockSig: IByronBlockSig,
}

export function byronConsDataToCborObj( consData: IByronConsData ): CborArray
{
    return new CborArray([
        byronSlotIdToCborObj( consData.slotid ),
        new CborBytes( consData.pubkey ),
        new CborArray([ new CborUInt( consData.difficulty ) ]),
        byronBlockSigToCborObj( consData.blockSig )
    ])
}

export function byronConsDataFromCborObj( cbor: CborObj ): IByronConsData
{
    if(!(
        cbor instanceof CborArray &&
        cbor.array.length >= 4
    )) throw new Error("invalid cbor for ByronNoEBBHeader::IByronConsData");

    const [
        cSlotid,
        cPubkey,
        cDiff,
        cBlockSig
    ] = cbor.array;

    if(!(
        cPubkey instanceof CborBytes &&
        cDiff instanceof CborArray &&
        cDiff.array.length === 1 &&
        cDiff.array[0] instanceof CborUInt
    )) throw new Error("invalid cbor for ByronNoEBBHeader::IByronConsData");

    const slotid = byronSlotIdFromCborObj( cSlotid );
    const blockSig = byronBlockSigFromCborObj( cBlockSig );

    return {
        slotid,
        pubkey: cPubkey.bytes as U8Arr32,
        difficulty: cDiff.array[0].num,
        blockSig
    };
}

export function isIByronNoEbbConsData( consData: any ): consData is IByronConsData
{
    return(
        isIByronNoEbbSlotId( consData.slotid ) &&
        isAValidHash( consData.pubkey ) &&
        isWord64( consData.difficulty ) &&
        isIByronNoEbbBlockSig( consData.blockSig )
    );
}

// blockheadex

export interface IByronHeaderExtra {
    version: [ number, number, number ],
    softwareVersion: [ string, number ],
    attributes: CborObj,
    extraProof: U8Arr32
}

export function byronHeaderExtraToCborObj({
    version,
    softwareVersion,
    attributes,
    extraProof
}: IByronHeaderExtra ): CborArray
{
    return new CborArray([
        new CborArray( version.map( n => new CborUInt( n ) )),
        new CborArray([
            new CborText( softwareVersion[0] ),
            new CborUInt( softwareVersion[1] ),
        ]),
        attributes,
        new CborBytes( extraProof )
    ]);
}

export function byronHeaderExtraFromCborObj( cbor: CborObj ): IByronHeaderExtra
{
    if(!(
        cbor instanceof CborArray &&
        cbor.array.length >= 4
    )) throw new Error("invalid cbor for IByronHeaderExtra");

    const [
        cVer,
        cSoftVer,
        attributes,
        cExtraProof
    ] = cbor.array;

    if(!(
        cVer instanceof CborArray &&
        cSoftVer instanceof CborArray &&
        cVer.array.length >= 3 &&
        cVer.array.every( c => c instanceof CborUInt ) &&
        cSoftVer.array.length >= 2 &&
        cSoftVer.array[0] instanceof CborText &&
        cSoftVer.array[1] instanceof CborUInt &&
        cExtraProof instanceof CborBytes
    ))  throw new Error("invalid cbor for IByronHeaderExtra");

    const verArr = cVer.array as CborUInt[];

    return {
        version: [
            Number( verArr[0] ),
            Number( verArr[1] ),
            Number( verArr[2] ),
        ],
        softwareVersion: [
            cSoftVer.array[0].text,
            Number( cSoftVer.array[1].num )
        ],
        attributes,
        extraProof: cExtraProof.bytes as U8Arr32
    }
}

export function isIByronNoEbbHeadExtra( headExtra: any ): headExtra is IByronHeaderExtra
{
    return(
        Array.isArray( headExtra.version ) &&
        headExtra.version.length === 3 &&
        headExtra.version.every( isWord32 ) &&
        Array.isArray( headExtra.softwareVersion ) &&
        headExtra.softwareVersion.length === 2 &&
        headExtra.softwareVersion[0] instanceof String &&
        isWord32( headExtra.softwareVersion[1] ) &&
        isCborObj( headExtra.attributes ) &&
        isAValidHash( headExtra.extraProof )
    );
}

// blockhead

export interface IByronNoEBBHeader
    extends IHeader
{
    readonly protocolMagic: number,
    readonly prevBlock: U8Arr32,                            //previous block hash
    readonly bodyProof: IByronBodyProof,
    readonly consensusData: IByronConsData,
    readonly extraData: IByronHeaderExtra
}

export function isIByronNoEBBHeader( header: any ): header is IByronNoEBBHeader 
{
    return ( 
        !header.isEBB &&
        isWord32( header.protocolMagic ) &&
        isAValidHash( header.prevBlock ) &&
        isIByronNoEbbBodyProof( header.bodyProof ) &&
        isIByronNoEbbConsData( header.consensusData ) &&
        isIByronNoEbbHeadExtra( header.extraData )
    );
}

export class ByronNoEBBHeader
    implements IByronNoEBBHeader
{
    readonly hash: U8Arr32;
    readonly slotNo: bigint;
    readonly isEBB: boolean;
    
    readonly protocolMagic: number;
    readonly prevBlock: U8Arr32;
    readonly bodyProof: IByronBodyProof;
    readonly consensusData: IByronConsData;
    readonly extraData: IByronHeaderExtra;

    readonly cborBytes?: Uint8Array;

    constructor( header: IByronNoEBBHeader )
    {
        if(!( isIByronNoEBBHeader( header ) ))
            throw new Error( "invalid new `IByronNoEBBHeader` data provided" );

        const hash = Uint8Array.prototype.slice.call( header.hash, 0, 32 );
        Object.defineProperties(
            this, {
                hash: {
                    get: () => Uint8Array.prototype.slice.call( hash ),
                    set: (arg) => arg,
                    enumerable: true,
                    configurable: false  
                },
                prevHash: { value: header.prevBlock, ...roDescr },
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
            byronBodyProofToCborObj( this.bodyProof ),
            byronConsDataToCborObj( this.consensusData ),
            byronHeaderExtraToCborObj( this.extraData )
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
            cbor.array.length >= 5
        )) throw new Error("invalid cbor for ByronNoEBBHeader");

        const [
            cborMagic,
            cborPrevHash,
            cborBodyProof,
            cborConsData,
            cborExtra
        ] = cbor.array;

        if(!(
            cborMagic instanceof CborUInt &&
            cborPrevHash instanceof CborBytes
        )) throw new Error("invalid cbor for ByronNoEBBHeader");

        const bodyProof = byronBodyProofFromCborObj( cborBodyProof );
        const consensusData = byronConsDataFromCborObj( cborConsData );
        const extraData = byronHeaderExtraFromCborObj( cborExtra );

        const originalWerePresent = _originalBytes instanceof Uint8Array;
        _originalBytes = _originalBytes instanceof Uint8Array ? _originalBytes : Cbor.encode( cbor ).toBuffer();
        
        const hdr = new ByronNoEBBHeader({
            // byron is a pain
            // the hash is calculated wrapping the header in the second slot of an array
            // the first slot is uint(0) for EBB and uint(1) for normal byron blocks
            hash: blake2b_256( new Uint8Array([ 0x82, 0x01, ..._originalBytes ]) ) as U8Arr32,
            prevBlock: cborPrevHash.bytes as U8Arr32,
            slotNo: consensusData.slotid.epoch * BigInt( 21600 ) + consensusData.slotid.slot,
            isEBB: false,
            protocolMagic: Number( cborMagic.num ),
            bodyProof,
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