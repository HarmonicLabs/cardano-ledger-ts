import { CanBeCborString, Cbor, CborArray, CborBytes, CborObj, CborString, CborText, CborUInt, forceCborString, isCborObj } from "@harmoniclabs/cbor";
import { AddressId, Attributes, BlockId, Delegate, EpochId, Issuer, ProtocolMagic, PubKey, Signature, SlotNo, StakeholderId, TxId, UpdId, VssDec, VssEnc, VssPubKey, VssSec } from "../utils/types";
import { getCborBytesDescriptor } from "../../../utils/getCborBytesDescriptor";
import { Byte, U8Arr32, Word16, Word32, Word64 } from "../../../utils/types";
import { blake2b_256 } from "../../../utils/crypto";
import { IBody } from "../../../interfaces/IBody";
import { roDescr } from "../../../utils/roDescr";
import { isDelegate, isEpochId, isIssuer, isSignature } from "../utils/isThatType";

// txPayload

export interface IByronTxPayload {
    payload: IByronTxPayloadEntry[]
}

// txPayloadEntry

export interface IByronTxPayloadEntry {
    entryTx: IByronTx,
    entryTwitList: IByronTwit[]
}

// tx

export interface IByronTx {
    txsInList: IByronTxIn[],
    txsOutList: IByronTxOut[], 
    attributes: Attributes
}

// txin

export type IByronTxIn
    = [0, IByronTxInEntry]
    | [Byte, CborString];

// txInEntry

export type IByronTxInEntry = [ TxId, Word32 ];

// txout

export type IByronTxOut = [ IByronAddress, Word64 ];

// address

export type IByronAddress = [ IByronAddressInfo, Word64 ];

// addressInfo

export type IByronAddressInfo = [ AddressId, IByronAddressAttributes, IByronAddressType ]

// addrattr

export interface IByronAddressAttributes {
    0?: IByronAddressDistr,
    1?: U8Arr32
}

// addrdistr

export type IByronAddressDistr
    = [0, StakeholderId]
    | [1];

// addrtype

export type IByronAddressType = {
    command: Word64
}

// twit

export type IByronTwit 
    = [0, [PubKey, Signature]]
    | [1, [[Word16, Uint8Array], [Word16, Uint8Array]]]
    | [2, [PubKey, Signature]]
    | [Byte, CborArray];

// ssccerts

export type IByronSscCerts = IByronSscCert[];

// ssccert

export type IByronSscCert = [VssPubKey, PubKey, EpochId, Signature];

// ssccomms

export type IByronSscComms = IByronSscComm[];

// ssccomm

export type IByronSscComm = [PubKey, [IByronSscCommMap, IByronVssProof], Signature];

// ssccommEntry

export type IByronSscCommMap = Map<VssPubKey, VssEnc>;

// vssproof

export type IByronVssProof = [Uint8Array, Uint8Array, Uint8Array, Uint8Array[]];

// sscopens

export type IByronSscOpens = Map<StakeholderId, VssSec>;

// sscshares

export type IByronSscShares = Map<AddressId, IByronSscSharesEntry>;

// sscSharesEntry

export type IByronSscSharesEntry = [ AddressId, VssDec[]];

// ssc

export type IByronSscPayload 
    = [0, IByronSscComms, IByronSscCerts]
    | [1, IByronSscOpens, IByronSscCerts]
    | [2, IByronSscShares, IByronSscCerts]
    | [3, IByronSscCerts];

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

export function isIByronNoEBBDlg( stuff: any ): stuff is IByronDlg
{
    return(
        isEpochId( stuff.epoch ) &&
        isIssuer( stuff.issuer ) &&
        isDelegate( stuff.delegate ) &&
        isSignature( stuff.certificate )
    );
}

// dlgPayload

export type IByronDlgPayload = [IByronDlg[]];

// up

export interface IByronUp {
    proposal?: IByronUpProp[],
    votes: IByronUpVote[]
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

// bver

export type IByronBVer = [Word16, Word16, Byte];

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

// txfeepol

export type IByronTxFeePol 
    = [0, [Word64, Word64]]
    | [Byte, CborArray];

// upvote

export interface IByronUpVote {
    voter: PubKey,
    proposalId: UpdId,
    vote: boolean,
    signature: Signature
}

// updPayload

export type IByronUpdPayload = [IByronUp[]];

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