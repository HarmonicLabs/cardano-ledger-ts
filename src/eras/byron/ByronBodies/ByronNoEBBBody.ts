import { CanBeCborString, Cbor, CborArray, CborBytes, CborObj, CborString, CborText, CborUInt, forceCborString, isCborObj } from "@harmoniclabs/cbor";
import { AddressId, Attributes, BlockId, Delegate, EpochId, Issuer, ProtocolMagic, PubKey, Signature, SlotNo, StakeholderId, TxId, UpdId, VssDec, VssEnc, VssPubKey, VssSec } from "../utils/types";
import { getCborBytesDescriptor } from "../../../utils/getCborBytesDescriptor";
import { Byte, U8Arr32, Word16, Word32, Word64 } from "../../../utils/types";
import { blake2b_256 } from "../../../utils/crypto";
import { IBody } from "../../../interfaces/IBody";
import { roDescr } from "../../../utils/roDescr";
import { isAddressId, isAttributes, isDelegate, isEpochId, isIssuer, isPubKey, isSignature, isStakeholderId, isTxId, isUpdId, isVssDec, isVssEnc, isVssPubKey, isVssSec } from "../utils/isThatType";
import { isStringObject } from "util/types";
import { isBoolean, isHash, isByte, isWord16, isWord32, isWord64 } from "../../../utils/isThatType";
import { isObject } from "@harmoniclabs/obj-utils";

// txPayload

export interface IByronTxPayload {
    payload: IByronTxPayloadEntry[]
}

export function isIByronTxPayload( stuff: any ): stuff is IByronTxPayload
{
    return(
        isObject( stuff ) &&
        Array.isArray( stuff.payload ) &&
        stuff.payload.length >= 0 &&
        stuff.payload.every( isIByronTxPayload )
    );
}

// txPayloadEntry

export interface IByronTxPayloadEntry {
    entryTx: IByronTx,
    entryTwitList: IByronTwit[]
}

export function isIByronTxPayloadEntry( stuff: any ): stuff is IByronTxPayloadEntry
{
    return(
        isObject( stuff ) &&
        isIByronTx( stuff.entryTx ) &&
        Array.isArray( stuff.entryTwitList ) &&
        stuff.entryTwitList.length >= 0 &&
        stuff.payload.every( isIByronTwit )
    );
}

// tx

export interface IByronTx {
    txsInList: IByronTxIn[],
    txsOutList: IByronTxOut[], 
    attributes: Attributes
}

export function isIByronTx( stuff: any ): stuff is IByronTx
{
    return(
        isObject( stuff ) &&
        Array.isArray( stuff.txsInList ) &&
        stuff.txsInList.every( isIByronTxIn ) &&
        Array.isArray( stuff.txsOutList ) &&
        stuff.txsOutList.every( isIByronTxOut ) &&
        isAttributes( stuff.attributes )
    );
}

// txin

export type IByronTxIn
    = [0, IByronTxInEntry]
    | [Byte, CborString];

export function isIByronTxIn( stuff: any ): stuff is IByronTxIn
{
    return(
        Array.isArray( stuff ) &&
        (
            (
                stuff[0] == 0 &&
                isIByronTxInEntry( stuff[1] )
            ) 
            || 
            (
                isByte( stuff[0] ) &&
                stuff[1] instanceof CborString
            )
        )
    );
}

// txInEntry

export type IByronTxInEntry = [ TxId, Word32 ];

export function isIByronTxInEntry( stuff: any ): stuff is IByronTxInEntry
{
    return(
        Array.isArray( stuff ) &&
        stuff.length === 2 &&
        isTxId( stuff[0] ) &&
        isWord32( stuff[1] )
    );
}

// txout

export type IByronTxOut = [ IByronAddress, Word64 ];

export function isIByronTxOut( stuff: any ): stuff is IByronTxOut
{
    return(
        Array.isArray( stuff ) &&
        stuff.length === 2 &&
        isIByronAddress( stuff[0] ) &&
        isWord64( stuff[1] )
    );
}

// address

export type IByronAddress = [ IByronAddressInfo, Word64 ];

export function isIByronAddress( stuff: any ): stuff is IByronAddress
{
    return(
        Array.isArray( stuff ) &&
        stuff.length === 2 &&
        isIByronAddressInfo( stuff[0] ) &&
        isWord64( stuff[1] )
    );
}

// addressInfo

export type IByronAddressInfo = [ AddressId, IByronAddressAttributes, IByronAddressType ];

export function isIByronAddressInfo( stuff: any ): stuff is IByronAddressInfo
{
    return(
        Array.isArray( stuff ) &&
        stuff.length === 3 &&
        isAddressId( stuff[0] ) &&
        isIByronAddressAttributes( stuff[1] ) &&
        isIByronAddressType( stuff[2] )
    );
}

// addrattr

export interface IByronAddressAttributes {
    addrdistr?: IByronAddressDistr,
    bytes?: U8Arr32
}

export function isIByronAddressAttributes( stuff: any ): stuff is IByronAddressAttributes
{
    // how those '?' must be handled?
    // if( 
    //     isObject( stuff ) &&
    //     ( 
    //         stuff.addrdistr === undefined ||
    //         stuff.bytes === undefined
    //     )
    // ) 
    // {
    //     return true;
    // }
    
    return(
        isObject( stuff ) &&
        isIByronAddressDistr( stuff.addrdistr ) &&
        isHash( stuff.bytes )
    );
}

// addrdistr

export type IByronAddressDistr
    = [0, StakeholderId]
    | [1];

export function isIByronAddressDistr( stuff: any ): stuff is IByronAddressDistr
{
    return( 
        Array.isArray( stuff ) &&
        (
            (
                stuff[0] === 0 &&
                stuff.length === 2 &&
                isStakeholderId( stuff[1] )
            ) 
            ||
            (
                stuff[0] === 1 &&
                stuff.length === 1
            )
        )
    );
}

// addrtype

export type IByronAddressType = {
    command: Word64
}

export function isIByronAddressType( stuff: any ): stuff is IByronAddressType
{
    return(
        isObject( stuff ) &&
        isWord64( stuff.command )
    );
}

// twit

export type IByronTwit 
    = [0, [PubKey, Signature]]
    | [1, [[Word16, Uint8Array], [Word16, Uint8Array]]]
    | [2, [PubKey, Signature]]
    | [Byte, CborArray];

export function isIByronTwit( stuff: any ): stuff is IByronTwit
{
    if( Array.isArray( stuff ) )
    {
        switch( stuff[0] )
        {
            case 0 || 2:
                return(
                    stuff.length === 2 &&
                    Array.isArray( stuff[1] ) &&
                    stuff[1].length == 2 &&
                    isPubKey( stuff[1][0] ) &&
                    isSignature( stuff[1][1] )
                );
                break;
            case 1:
                return(
                    stuff.length === 2 &&
                    Array.isArray( stuff[1] ) &&
                    stuff[1].length == 2 &&
                    Array.isArray( stuff[1][0] ) &&
                    stuff[1][0].length == 2 &&
                    isWord16( stuff[1][0][0] ) &&
                    isHash( stuff[1][0][1] ) &&
                    Array.isArray( stuff[1][1] ) &&
                    stuff[1][1].length == 2 &&
                    isWord16( stuff[1][1][0] ) &&
                    isHash( stuff[1][1][1] )
                );
                break;
            default:
                return(
                    stuff.length === 2 &&
                    isByte( stuff[0] ) &&
                    stuff[1] instanceof CborArray
                );
        }
    }

    return false
}

// ssccerts

export type IByronSscCerts = IByronSscCert[];

export function isIByronSscCerts( stuff: any ): stuff is IByronSscCerts
{
    return(
        Array.isArray( stuff ) &&
        stuff.length >= 0 &&
        stuff.every( isIByronSscCert )
    );
}

// ssccert

export type IByronSscCert = [ VssPubKey, PubKey, EpochId, Signature ];

export function isIByronSscCert( stuff: any ): stuff is IByronSscCert
{
    return(
        Array.isArray( stuff ) &&
        stuff.length === 4 &&
        isVssPubKey( stuff[0] ) &&
        isPubKey( stuff[1] ) &&
        isEpochId( stuff[2] ) &&
        isSignature( stuff[3] )
    );
}

// ssccomms

export type IByronSscComms = IByronSscComm[];

export function isIByronSscComms( stuff: any ): stuff is IByronSscComms
{
    return(
        Array.isArray( stuff ) &&
        stuff.length >= 0 &&
        stuff.every( isIByronSscComm )
    );
}

// ssccomm

export type IByronSscComm = [ PubKey, [IByronSscCommMap, IByronVssProof], Signature ];

export function isIByronSscComm( stuff: any ): stuff is IByronSscComm
{
    return(
        Array.isArray( stuff ) &&
        stuff.length === 3 &&
        isPubKey( stuff[0] ) &&
        (
            Array.isArray( stuff[1] ) &&
            stuff[1].length == 2 &&
            isIByronSscCommMap( (stuff[1])[0] ) &&
            isIByronVssProof( (stuff[1])[1] )
        ) &&
        isSignature( stuff[2] )
    );
}

// ssccommEntry

export type IByronSscCommMap = Map<VssPubKey, VssEnc>;

export function isIByronSscCommMap( stuff: any ): stuff is IByronSscCommMap
{
    return(
        stuff instanceof Map &&
        Array.from(stuff.keys()).every(( key: VssPubKey ) => { 
            return isVssEnc( stuff.get( key ) );
        })
    );
}

// vssproof

export type IByronVssProof = [ Uint8Array, Uint8Array, Uint8Array, Uint8Array[] ];

export function isIByronVssProof( stuff: any ): stuff is IByronVssProof 
{
    return(
        Array.isArray( stuff ) &&
        isHash( stuff[0] ) &&
        isHash( stuff[1] ) &&
        isHash( stuff[2] ) &&
        Array.isArray( stuff[3] ) &&
        stuff[3].length >= 0 &&
        stuff[3].every( isHash )
    );
}

// sscopens

export type IByronSscOpens = Map<StakeholderId, VssSec>;

export function isIByronSscOpens( stuff: any ): stuff is IByronSscOpens
{
    return(
        stuff instanceof Map &&
        Array.from(stuff.keys()).every(( key: StakeholderId ) => ( 
            isVssSec( stuff.get( key ) )
        ))
    );
}

// sscshares

export type IByronSscShares = Map<AddressId, IByronSscSharesEntry>;

export function isIByronSscShares( stuff: any ): stuff is IByronSscShares
{
    return(
        stuff instanceof Map &&
        Array.from(stuff.keys()).every(( key: AddressId ) => ( 
            isIByronSscSharesEntry( stuff.get( key ) )
        ))
    );
}

// sscSharesEntry

export type IByronSscSharesEntry = [ AddressId, VssDec[] ];

export function isIByronSscSharesEntry( stuff: any ): stuff is IByronSscSharesEntry
{
    return(
        Array.isArray( stuff ) &&
        isAddressId( stuff[0] ) &&
        Array.isArray( stuff[1] ) &&
        stuff[1].length >= 0 &&
        stuff[1].every( isVssDec )
    );
}

// ssc

export type IByronSscPayload 
    = [0, IByronSscComms, IByronSscCerts]
    | [1, IByronSscOpens, IByronSscCerts]
    | [2, IByronSscShares, IByronSscCerts]
    | [3, IByronSscCerts];

export function isByronSscPayload( stuff: any ): stuff is IByronSscPayload
{
    if( Array.isArray( stuff ) && isByte( stuff[0] ))
    {
        switch( stuff[0] )
        {
            case 0: 
                return(
                    stuff.length === 3 &&
                    isIByronSscComms( stuff[1] ) &&
                    isIByronSscCerts( stuff[2] )
                );
                break;
            case 1:
                return(
                    stuff.length === 3 &&
                    isIByronSscOpens( stuff[1] ) &&
                    isIByronSscCerts( stuff[2] )
                );
                break;
            case 2:
                return(
                    stuff.length === 3 &&
                    isIByronSscShares( stuff[1] ) &&
                    isIByronSscCerts( stuff[2] )
                );
                break;
            case 3:
                return(
                    stuff.length === 2 &&
                    isIByronSscCerts( stuff[1] )
                );
                break;
            default:
                return false;        
        }
    } 
    else
    {
        return false;
    }
}

// dlg

export interface IByronDlg {
    epoch: EpochId,
    issuer: Issuer,
    delegate: Delegate,
    certificate: Signature,
}

export function byronDlgToCborObj({
    epoch,
    issuer,
    delegate,
    certificate,
}: IByronDlg ): CborArray
{
    return new CborArray([
        new CborUInt ( epoch ),
        new CborBytes( issuer ),
        new CborBytes( delegate ),
        new CborBytes( certificate ),
    ]);
}

export function byronDlgFromCborObj( cbor: CborObj ): IByronDlg
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
        issuer: cIssuer.bytes as Issuer,
        delegate: cDelegate.bytes as U8Arr32,
        certificate: cCert.bytes,
    };
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

// dlgPayload

export type IByronDlgPayload = IByronDlg[];

export function isIByronDlgPayload( stuff: any ): stuff is IByronDlgPayload
{
    return(
        Array.isArray( stuff ) &&
        stuff.length >= 0 &&
        stuff.every( isIByronDlg )
    );
}

// upprop

export interface IByronUpProp {
    blockVersion: IByronBVer,
    blockVersionMod: IByronBVerMod,
    softwareVersion: [string, Word32],
    data: [string, [U8Arr32, U8Arr32, U8Arr32, U8Arr32]],
    attributes: Attributes,
    from: PubKey,
    signature: Signature
}

export function isIByronUpProp( stuff: any ): stuff is IByronUpProp
{
    return(
        isObject( stuff ) &&
        isIByronBVer( stuff.blockVersion ) &&
        isIByronBVerMod( stuff.blockVersionMod ) &&
        (
            Array.isArray( stuff.softwareVersion ) &&
            stuff.softwareVersion.length === 2 &&
            isStringObject( stuff.softwareVersion[0] ) &&
            isWord32( stuff.softwareVersion[1] )
        ) &&
        (
            Array.isArray( stuff.data ) &&
            stuff.data.length === 2 &&
            isStringObject( stuff.data[0] ) &&
            (
                Array.isArray( stuff.data[1] ) &&
                stuff.data[1].length === 4 &&
                stuff.data[1].every( isHash )
            )
        ) &&
        // isAttributes( stuff.attributes ) &&
        isPubKey( stuff.from ) &&
        isSignature( stuff.signature )
    );
}

// bver

export type IByronBVer = [ Word16, Word16, Byte ];

export function isIByronBVer( stuff: any ): stuff is IByronBVer
{
    return(
        Array.isArray( stuff ) &&
        stuff.length === 3 &&
        isWord16( stuff[0] ) &&
        isWord16( stuff[1] ) &&
        isByte( stuff[2] )
    );
}

// bvermod

export interface IByronBVerMod {
    scriptVersion: [Word16?],
    slotDuration: [Word64?],
    maxBlockSize: [Word64?],
    maxHeaderSize: [Word64?],
    maxTxSize: [Word64?],
    maxProposalSize: [Word64?],
    mpcThd: [Word64?],
    heavyDelThd: [Word64?],
    updateVoteThd: [Word64?],
    updateProposalThd: [Word64?],
    updateImplicit: [Word64?],
    softForkRule: [[Word64, Word64, Word64]?],
    txFeePolicy: [IByronTxFeePol?],
    unlockStakeEpoch: [EpochId?]
}

export function isIByronBVerMod( stuff: any ): stuff is IByronBVerMod
{
    return(
        isObject( stuff ) &&
        ( 
            Array.isArray( stuff.scriptVersion ) &&
            stuff.scriptVersion.every( isWord16 )
        ) &&
        ( 
            Array.isArray( stuff.slotDuration ) &&
            stuff.slotDuration.every( isWord64 )
        ) &&
        ( 
            Array.isArray( stuff.maxBlockSize ) &&
            stuff.maxBlockSize.every( isWord64 )
        ) &&
        ( 
            Array.isArray( stuff.maxHeaderSize ) &&
            stuff.maxHeaderSize.every( isWord64 )
        ) &&
        ( 
            Array.isArray( stuff.maxTxSize ) &&
            stuff.maxTxSize.every( isWord64 )
        ) &&
        ( 
            Array.isArray( stuff.maxProposalSize ) &&
            stuff.maxProposalSize.every( isWord64 )
        ) &&
        ( 
            Array.isArray( stuff.mpcThd ) &&
            stuff.mpcThd.every( isWord64 )
        ) &&
        ( 
            Array.isArray( stuff.heavyDelThd ) &&
            stuff.heavyDelThd.every( isWord64 )
        ) &&
        ( 
            Array.isArray( stuff.updateVoteThd ) &&
            stuff.updateVoteThd.every( isWord64 )
        ) &&
        ( 
            Array.isArray( stuff.updateProposalThd ) &&
            stuff.updateProposalThd.every( isWord64 )
        ) &&
        ( 
            Array.isArray( stuff.updateImplicit ) &&
            Array.isArray( stuff.updateImplicit[0] ) &&
            stuff.updateImplicit[0].every( isWord64 )
        ) &&
        ( 
            Array.isArray( stuff.softForkRule ) &&
            stuff.softForkRule.every( isWord16 )
        ) &&
        ( 
            Array.isArray( stuff.txFeePolicy ) &&
            stuff.txFeePolicy.every( isIByronTxFeePol )
        ) &&
        ( 
            Array.isArray( stuff.unlockStakeEpoch ) &&
            stuff.unlockStakeEpoch.every( isEpochId )
        )
    );
}

// txfeepol

export type IByronTxFeePol 
    = [0, [Word64, Word64]]
    | [Byte, CborArray];

export function isIByronTxFeePol( stuff: any ): stuff is IByronTxFeePol
{
    return(
        Array.isArray( stuff ) &&
        (
            (
                stuff[0] == 0 &&
                Array.isArray( stuff[1] ) &&
                stuff[1].every( isWord64 )
            ) || 
            (
                isByte( stuff[0] ) &&
                stuff[1] instanceof CborArray
            )
        )
    );
}

// upvote

export interface IByronUpVote {
    voter: PubKey,
    proposalId: UpdId,
    vote: boolean,
    signature: Signature
}

export function isIByronUpVote( stuff: any ): stuff is IByronUpVote
{
    return(
        isPubKey( stuff.voter ) &&
        isUpdId( stuff.proposalId ) &&
        isBoolean( stuff.vote ) &&
        isSignature( stuff.signature )
    );
}

// up

export interface IByronUpdPayload {
    proposal: [IByronUpProp?],
    votes: IByronUpVote[]
}

export function isIByronUpdPayload( stuff: any ): stuff is IByronUpdPayload
{
    return(
        (
            ( 
                Array.isArray( stuff.proposal ) &&
                (
                    stuff.proposal.length >= 0 &&
                    stuff.proposal.length <= 1
                ) &&
                stuff.proposal.every( isIByronUpProp )
            )
        ) &&
        ( 
            Array.isArray( stuff.votes ) &&
            stuff.votes.length >= 0 &&
            stuff.proposal.every( isIByronUpVote )
        )
    );
}

// blockbody

export interface IByronNoEBBBody extends IBody
{
    readonly txPayload: IByronTxPayload,
    readonly sscPayload: IByronSscPayload,
    readonly dlgPayload: IByronDlgPayload,
    readonly updPayload: IByronUpdPayload
}

export function isIByronNoEBBBody( stuff: any ): stuff is IByronNoEBBBody 
{
    return ( 
        isIByronTxPayload( stuff.txPayload ) &&
        isByronSscPayload( stuff.sscPayload ) &&
        isIByronDlgPayload( stuff.dlgPayload ) &&
        isIByronUpdPayload( stuff.updPayload )
    );
}

export class ByronNoEBBBody
    implements IByronNoEBBBody
{
    readonly hash: U8Arr32;
    readonly slotNo: SlotNo;
    readonly isEBB: boolean;
    
    readonly txPayload: IByronTxPayload;
    readonly sscPayload: IByronSscPayload;
    readonly dlgPayload: IByronDlgPayload;
    readonly updPayload: IByronUpdPayload;

    readonly cborBytes?: Uint8Array;

    // constructor( header: IByronNoEBBHeader )
    // {
    //     if(!( isIByronNoEBBHeader( header ) ))
    //         throw new Error( "invalid new `IByronNoEBBHeader` data provided" );

    //     const hash = Uint8Array.prototype.slice.call( header.hash, 0, 32 );
    //     Object.defineProperties(
    //         this, {
    //             hash: {
    //                 get: () => Uint8Array.prototype.slice.call( hash ),
    //                 set: (arg) => arg,
    //                 enumerable: true,
    //                 configurable: false  
    //             },
    //             prevHash: { value: header.prevBlock, ...roDescr },
    //             slotNo: { value: header.slotNo, ...roDescr },
    //             isEBB: { value: header.isEBB, ...roDescr },
    //             protocolMagic: { value: header.protocolMagic, ...roDescr },
    //             bodyProof: { value: header.bodyProof, ...roDescr },
    //             consensusData: { value: header.consensusData, ...roDescr },
    //             extraData: { value: header.extraData, ...roDescr },
    //             cborBytes: getCborBytesDescriptor(),
    //         }
    //     );
    // }

    // toCbor(): CborString
    // {
    //     return new CborString( this.toCborBytes() );
    // }

    // toCborObj(): CborArray
    // {
    //     return new CborArray([
    //         new CborUInt( this.protocolMagic ),
    //         new CborBytes( this.prevBlock ),
    //         byronBodyProofToCborObj( this.bodyProof ),
    //         byronConsDataToCborObj( this.consensusData ),
    //         byronHeaderExtraToCborObj( this.extraData )
    //     ]);
    // }

    // toCborBytes(): Uint8Array
    // {
    //     if(!( this.cborBytes instanceof Uint8Array ))
    //     {
    //         // @ts-ignore Cannot assign to 'cborBytes' because it is a read-only property.
    //         this.cborBytes = Cbor.encode( this.toCborObj() ).toBuffer();
    //     }

    //     return Uint8Array.prototype.slice.call( this.cborBytes );
    // }

    // static fromCbor( cbor: CanBeCborString ): ByronNoEBBHeader
    // {
    //     const bytes = cbor instanceof Uint8Array ? cbor : forceCborString( cbor ).toBuffer();
    //     return ByronNoEBBHeader.fromCborObj( Cbor.parse( bytes ), bytes );
    // }

    // static fromCborObj( cbor: CborObj, _originalBytes?: Uint8Array ): ByronNoEBBHeader
    // {
    //     if(!(
    //         cbor instanceof CborArray &&
    //         cbor.array.length >= 5
    //     )) throw new Error("invalid cbor for ByronNoEBBHeader");

    //     const [
    //         cborMagic,
    //         cborPrevHash,
    //         cborBodyProof,
    //         cborConsData,
    //         cborExtra
    //     ] = cbor.array;

    //     if(!(
    //         cborMagic instanceof CborUInt &&
    //         cborPrevHash instanceof CborBytes
    //     )) throw new Error("invalid cbor for ByronNoEBBHeader");

    //     const bodyProof = byronBodyProofFromCborObj( cborBodyProof );
    //     const consensusData = byronConsDataFromCborObj( cborConsData );
    //     const extraData = byronHeaderExtraFromCborObj( cborExtra );

    //     const originalWerePresent = _originalBytes instanceof Uint8Array;
    //     _originalBytes = _originalBytes instanceof Uint8Array ? _originalBytes : Cbor.encode( cbor ).toBuffer();
        
    //     const hdr = new ByronNoEBBHeader({
    //         // byron is a pain
    //         // the hash is calculated wrapping the header in the second slot of an array
    //         // the first slot is uint(0) for EBB and uint(1) for normal byron blocks
    //         hash: blake2b_256( new Uint8Array([ 0x82, 0x01, ..._originalBytes ]) ) as U8Arr32,
    //         prevBlock: cborPrevHash.bytes as U8Arr32,
    //         slotNo: consensusData.slotid.epoch * BigInt( 21600 ) + consensusData.slotid.slot,
    //         isEBB: false,
    //         protocolMagic: Number( cborMagic.num ),
    //         bodyProof,
    //         consensusData,
    //         extraData
    //     });

    //     if( originalWerePresent )
    //     {
    //         // @ts-ignore Cannot assign to 'cborBytes' because it is a read-only property.
    //         hdr.cborBytes = _originalBytes;
    //     }

    //     return hdr;
    // }

}