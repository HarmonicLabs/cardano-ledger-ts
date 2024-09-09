import { isAddressId, isAttributes, isDelegate, isEpochId, isIssuer, isPubKey, isSignature, isStakeholderId, isTxId, isUpdId, isVssDec, isVssEnc, isVssPubKey, isVssSec } from "../utils/isThatType";
import { AddressId, Attributes, Delegate, EpochId, Issuer, PubKey, Signature, StakeholderId, TxId, UpdId, VssDec, VssEnc, VssPubKey, VssSec } from "../utils/types";
import { CanBeCborString, Cbor, CborArray, CborBytes, CborMap, CborObj, CborString, CborText, CborUInt, forceCborString, isCborObj } from "@harmoniclabs/cbor";
import { isBoolean, isHash, isByte, isWord16, isWord32, isWord64 } from "../../../utils/isThatType";
import { Byte, U8Arr32, Word16, Word32, Word64 } from "../../../utils/types";
import { attributesMapToCborObj } from "../utils/objToCbor";
import { cborMapToAttributes } from "../utils/cbortoObj";
import { blake2b_256 } from "../../../utils/crypto";
import { isObject } from "@harmoniclabs/obj-utils";
import { IBody } from "../../../interfaces/IBody";
import { isStringObject } from "util/types";

// txPayload

// CDDL reference:
// "txPayload" : [* txPayloadEntry]

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

export function txPayloadToCborObj( stuff: IByronTxPayload ): CborArray
{
    return new CborArray(
        stuff.payload.map(( entry ) => txPayloadEntryToCborObj( entry ))
    );
}

export function txPayloadFromCborObj( cbor: CborObj ): IByronTxPayload
{
    if(!(
        cbor instanceof CborArray &&
        cbor.array.every(( cborEntry ) => ( cborEntry instanceof CborArray ))
    )) throw new Error("invalid cbor for `IByronTxPayload`");

    return {
        payload: cbor.array.map(( cborEntry ) => txPayloadEntryFromCborObj( cborEntry ))
    } as IByronTxPayload;
}

// txPayloadEntry

// CDDL reference:
// [tx, [* twit]]

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

export function txPayloadEntryToCborObj( stuff: IByronTxPayloadEntry ): CborArray
{
    return new CborArray([
        txToCborObj( stuff.entryTx ),
        new CborArray(
            stuff.entryTwitList.map(( twit ) => twitToCborObj( twit ))
        )
    ]);
}

export function txPayloadEntryFromCborObj( cbor: CborObj ): IByronTxPayloadEntry
{
    if(!(
        cbor instanceof CborArray &&
        cbor.array.length === 2 &&
        cbor.array[0] instanceof CborArray &&
        cbor.array[1] instanceof CborArray
    )) throw new Error("invalid cbor for `IByronTxPayloadEntry`");

    return {
        entryTx: txFromCborObj( cbor.array[0] ),
        entryTwitList: cbor.array[1].array.map(( cborTwit ) => twitFromCborObj( cborTwit ))
    } as IByronTxPayloadEntry;
}

// tx

// CDDL reference:
// tx = [txin, txout, attributes]

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

export function txToCborObj( stuff: IByronTx ): CborArray
{
    return new CborArray([
        new CborArray(
            stuff.txsInList.map(( txIn ) => txInToCborObj( txIn ))
        ),
        new CborArray(
            stuff.txsOutList.map(( txOut ) => txOutToCborObj( txOut ))
        ),
        attributesMapToCborObj( stuff.attributes )
    ]);
}

export function txFromCborObj( cbor: CborObj ): IByronTx
{
    if(!(
        cbor instanceof CborArray &&
        cbor.array.length === 3 &&
        cbor.array[0] instanceof CborArray &&
        cbor.array[1] instanceof CborArray &&
        cbor.array[2] instanceof CborMap
    )) throw new Error("invalid cbor for `IByronTx`");

    return {
        txsInList: cbor.array[0].array.map(( cborTxIn ) => txInFromCborObj( cborTxIn )) as IByronTxIn[],
        txsOutList: cbor.array[1].array.map(( cborTxOut ) => txOutFromCborObj( cborTxOut )) as IByronTxOut[],
        attributes: cborMapToAttributes( cbor.array[2] ) as Attributes
    } as IByronTx;
}

// txin

// CDDL reference:
// txin = [0, #6.24(bytes .cbor (txInEntry))] / [u8 .ne 0, encoded-cbor]

// idk what #6.24(bytes .cbor (txInEntry)) means....
// does it want me to only decode the content?

export type IByronTxIn 
    = { type: 0, content: IByronTxInEntry } 
    | { type: Byte, content: CborArray };

export function isIByronTxIn( stuff: any ): stuff is IByronTxIn
{
    if( isObject( stuff ) )
    {
        switch( stuff.type )
        {
            case 0:
                return isIByronTxInEntry( stuff.entry );
            default:
                return isByte( stuff.type ) && isCborObj( stuff.cbor );
        }
    }

    return false;
}

export function txInToCborObj( stuff: IByronTxIn ): CborArray
{
    switch( stuff.type )
    {
        case 0:
            return new CborArray([
                new CborUInt( 0 ),
                txInEntryToCborObj( stuff.content as IByronTxInEntry )
            ]);
        default:
            return new CborArray([
                new CborUInt( stuff.type ),
                stuff.content as CborArray
            ]);
    }
}

export function txInFromCborObj( cbor: CborObj ): IByronTxIn
{
    if(!(
        cbor instanceof CborArray &&
        cbor.array.length === 2 &&
        cbor.array[0] instanceof CborUInt
    )) throw new Error("invalid cbor for `IByronTxIn`");

    var type = Number( cbor.array[0].num );
    var cborContent = cbor.array[1];

    switch( type )
    {
        case 0:
            return {
                type: 0,
                content: txInEntryFromCborObj( cborContent ) as IByronTxInEntry
            } as IByronTxIn;
        default:
            return {
                type: type as Byte,
                content: cborContent as CborArray
            } as IByronTxIn;
    }
}

// txInEntry

// CDDL reference:
// [txid, u32]

export type IByronTxInEntry = {
    txId: TxId,
    word32: Word32
}

export function isIByronTxInEntry( stuff: any ): stuff is IByronTxInEntry
{
    return(
        isObject( stuff ) &&
        isTxId( stuff.txId ) &&
        isWord32( stuff.word32 )
    );
}

export function txInEntryToCborObj( stuff: IByronTxInEntry ): CborArray
{
    return new CborArray([
        new CborBytes( stuff.txId ),
        new CborUInt( stuff.word32 )
    ]);
}

export function txInEntryFromCborObj( cbor: CborObj ): IByronTxInEntry
{
    if(!(
        cbor instanceof CborArray &&
        cbor.array.length === 2
    )) throw new Error("invalid cbor for `IByronTxInEntry`");

    const [
        cborTxId,
        cborWord32
    ] = cbor.array;

    if(!(
        cborTxId instanceof CborBytes &&
        cborWord32 instanceof CborUInt
    )) throw new Error("invalid cbor for `IByronTxInEntry`");

    return {
        txId: cborTxId.bytes as TxId,
        word32: Number( cborWord32.num ) as Word32
    } as IByronTxInEntry;
}

// txout

// CDDL reference:
// txout = [address, u64]

export type IByronTxOut = {
    address: IByronAddress,
    word64: Word64
}

export function isIByronTxOut( stuff: any ): stuff is IByronTxOut
{
    return(
        isObject( stuff ) &&
        isIByronAddress( stuff.address ) &&
        isWord64( stuff.word64 )
    );
}

export function txOutToCborObj( stuff: IByronTxOut ): CborArray
{
    return new CborArray([
        addressToCborObj( stuff.address ),
        new CborUInt( stuff.word64 )
    ]);
}

export function txOutFromCborObj( cbor: CborObj ): IByronTxOut
{
    if(!(
        cbor instanceof CborArray &&
        cbor.array.length === 2
    )) throw new Error("invalid cbor for `IByronTxOut`");

    const [
        cborAddress,
        cborWord64
    ] = cbor.array;

    if(!(
        cborWord64 instanceof CborUInt
    )) throw new Error("invalid cbor for `IByronTxOut`");

    return {
        address: addressFromCborObj( cborAddress ),
        word64: cborWord64.num as Word64
    } as IByronTxOut;
}

// address

// CDDL reference:
// address = [ #6.24(bytes .cbor (addressInfo)), u64 ]

// idk what #6.24(bytes .cbor (addressInfo)) means....
// does it want me to only decode the content?

export type IByronAddress = {
    address: IByronAddressInfo,
    word64: Word64
}

export function isIByronAddress( stuff: any ): stuff is IByronAddress
{
    return(
        isObject( stuff ) &&
        isIByronAddressInfo( stuff.address ) &&
        isWord64( stuff.word64 )
    );
}

export function addressToCborObj( stuff: IByronAddress ): CborArray
{
    return new CborArray([
        addressInfoToCborObj( stuff.address ),
        new CborUInt( stuff.word64 )
    ]);
}

export function addressFromCborObj( cbor: CborObj ): IByronAddress
{
    if(!(
        cbor instanceof CborArray &&
        cbor.array.length === 2
    )) throw new Error("invalid cbor for `IByronAddress`");

    const [
        cborAddress,
        cborWord64
    ] = cbor.array;

    if(!(
        cborWord64 instanceof CborUInt
    )) throw new Error("invalid cbor for `IByronAddress`");

    return {
        address: addressInfoFromCborObj( cborAddress ),
        word64: cborWord64.num as Word64
    } as IByronAddress;
}

// addressInfo

// CDDL reference:
// [addressid, addrattr, addrtype]

export type IByronAddressInfo = {
    addressId: AddressId,
    addressAttributes: IByronAddressAttributes,
    addressType: IByronAddressType
}

export function isIByronAddressInfo( stuff: any ): stuff is IByronAddressInfo
{
    return(
        isObject( stuff ) &&
        isAddressId( stuff.addressId ) &&
        isIByronAddressAttributes( stuff.addressAttributes ) &&
        isIByronAddressType( stuff.addressType )
    );
}

export function addressInfoToCborObj( stuff: IByronAddressInfo ): CborArray
{
    return new CborArray([
        new CborBytes( stuff.addressId ),
        addressAttributesToCborObj( stuff.addressAttributes ),
        new CborUInt( stuff.addressType )
    ]);
}

export function addressInfoFromCborObj( cbor: CborObj ): IByronAddressInfo
{
    if(!(
        cbor instanceof CborArray &&
        cbor.array.length === 3
    )) throw new Error("invalid cbor for `IByronAddressInfo`");

    const [
        cborAddressId,
        cborAddressAttributes,
        cborAddressType
    ] = cbor.array;

    if(!(
        cborAddressId instanceof CborBytes &&
        cborAddressType instanceof CborUInt
    )) throw new Error("invalid cbor for `IByronAddressInfo`");

    return {
        addressId: cborAddressId.bytes as AddressId,
        addressAttributes: addressAttributesFromCborObj( cborAddressAttributes ),
        addressType: Number( cborAddressType.num ) as IByronAddressType
    } as IByronAddressInfo;
}

// addrattr

// CDDL reference:
// addrattr = { ? 0 : addrdistr
//     , ? 1 : bytes}

export interface IByronAddressAttributes {
    addrdistr?: IByronAddressDistr,
    bytes?: U8Arr32
}

export function isIByronAddressAttributes( stuff: any ): stuff is IByronAddressAttributes
{
    return(
        isObject( stuff ) &&
        (
            ( stuff.addrdistr === undefined || isIByronAddressDistr( stuff.addrdistr ) ) &&
            ( stuff.bytes === undefined || stuff.bytes instanceof Uint8Array )
        )
    );
}

export function addressAttributesToCborObj( stuff: IByronAddressAttributes ): CborArray
{
    return new CborArray([
        stuff.addrdistr !== undefined ? addressDistrToCborObj( stuff.addrdistr ) : new CborArray([]),
        stuff.bytes !== undefined ? new CborBytes( stuff.bytes ) : new CborArray([])
    ]);
}

export function addressAttributesFromCborObj( cbor: CborObj ): IByronAddressAttributes
{
    if(!(
        cbor instanceof CborArray &&
        cbor.array.length === 2
    )) throw new Error("invalid cbor for `IByronAddressAttributes`");

    const [
        cborAddrdistr,
        cborBytes
    ] = cbor.array;

    if(!(
        cborAddrdistr instanceof CborArray &&
       [0, 1].includes( cborAddrdistr.array.length ) &&
        ( 
            cborBytes instanceof CborArray ||
            cborBytes instanceof CborBytes 
        )
    )) throw new Error("invalid cbor for `IByronAddressAttributes`");

    return {
        addrdistr: cborAddrdistr.array.length === 0 ? undefined : addressDistrFromCborObj( cborAddrdistr ) as IByronAddressDistr,
        bytes: cborBytes instanceof CborArray ? undefined : cborBytes.bytes as U8Arr32
    } as IByronAddressAttributes;
}

// addrdistr

// CDDL reference:
// addrdistr = [1] / [0, stakeholderid]

export type IByronAddressDistr 
    = { type: 0, stakeholderId: StakeholderId }
    | { type: 1 };

export function isIByronAddressDistr( stuff: any ): stuff is IByronAddressDistr
{
    if( isObject( stuff ) )
    {
        switch( stuff.type )
        {
            case 0:
                return(
                    isStakeholderId( stuff.stakeholderId )
                );
            case 1:
                return true;
        }
    }

    return false;
}

export function addressDistrToCborObj( stuff: IByronAddressDistr ): CborArray
{
    switch( stuff.type )
    {
        case 0:
            return new CborArray([
                new CborUInt( 0 ),
                new CborBytes( stuff.stakeholderId )
            ]);
        case 1:
            return new CborArray([
                new CborUInt( 1 )
            ]);
    }
}

export function addressDistrFromCborObj( cbor: CborObj ): IByronAddressDistr
{
    if(!(
        cbor instanceof CborArray &&
        cbor.array.length === 2 &&
        cbor.array[0] instanceof CborUInt
    )) throw new Error("invalid cbor for `IByronAddressDistr`");

    var type = Number( cbor.array[0].num );

    if(!( [0, 1].includes( type ) ) ) throw new Error("invalid cbor for `IByronAddressDistr`");

    if( type === 0 )
    {
        if(!(
            cbor.array[1] instanceof CborBytes
        )) throw new Error("invalid cbor for `IByronAddressDistr`");

        return {
            type: 0,
            stakeholderId: cbor.array[1].bytes as StakeholderId
        } as IByronAddressDistr;
    } 
    else
    {
        return {
            type: 1
        } as IByronAddressDistr;
    }
}

// addrtype

// CDDL reference:
// addrtype = &("PubKey" : 0, "Script" : 1, "Redeem" : 2) / (u64 .gt 2)

// idk how to correctly implment that.....

export enum IByronAddressType {
    "PubKey" = 0,
    "Script" = 1,
    "Redeem" = 2,
    "Other" = 3
}

export function isIByronAddressType( stuff: any ): stuff is IByronAddressType
{
    return(
        isWord64( stuff ) &&
        (
            stuff === IByronAddressType.PubKey ||
            stuff === IByronAddressType.Script ||
            stuff === IByronAddressType.Redeem ||
            stuff === IByronAddressType.Other
        )
    );
}

export function addressTypeToCborObj( stuff: IByronAddressType ): CborArray
{
    return new CborArray([
        new CborUInt( stuff )
    ]);
}

export function addressTypeFromCborObj( cbor: CborObj ): IByronAddressType
{
    if(!(
        cbor instanceof CborArray &&
        cbor.array.length === 1 &&
        cbor.array[0] instanceof CborUInt
    )) throw new Error("invalid cbor for `IByronAddressType`");

    return Number( cbor.array[0].num ) as IByronAddressType;
}

// twit

// CDDL reference:
// twit = [0, #6.24(bytes .cbor ([pubkey, signature]))]
//      / [1, #6.24(bytes .cbor ([[u16, bytes], [u16, bytes]]))]
//      / [2, #6.24(bytes .cbor ([pubkey, signature]))]
//      / [u8 .gt 2, encoded-cbor]

// idk what #6.24(bytes .cbor ([pubkey, signature])) means....
// does it want me to only decode the content?

export type IByronTwit 
    = { type: 0, content: [PubKey, Signature] }
    | { type: 1, content: [[Word16, Uint8Array], [Word16, Uint8Array]] }
    | { type: 2, content: [PubKey, Signature] }
    | { type: Byte, content: CborArray }; 

export function isIByronTwit( stuff: any ): stuff is IByronTwit
{
    if( isObject( stuff ) )
    {
        switch( stuff.type )
        {
            case 0:
                return(
                    Array.isArray( stuff.content ) &&
                    stuff.content.length === 2 &&
                    isPubKey( stuff.content[0] ) &&
                    isSignature( stuff.content[1] )
                );
            case 1:
                return(
                    Array.isArray( stuff.content ) &&
                    stuff.content.length === 2 &&
                    stuff.content.every(( content: [Word16, Uint8Array] ) => (
                        Array.isArray( content ) &&
                        content.length === 2 &&
                        isWord16( content[0] ) &&
                        content[1] instanceof Uint8Array
                    ))
                );
            case 2:
                return(
                    Array.isArray( stuff.content ) &&
                    stuff.content.length === 2 &&
                    isPubKey( stuff.content[0] ) &&
                    isSignature( stuff.content[1] )
                );
            default:
                return(
                    isByte( stuff.type ) &&
                    stuff.content instanceof CborArray
                );
        }
    }

    return false;
}

export function twitToCborObj( stuff: IByronTwit ): CborArray
{
    var currentContent;
    
    switch( stuff.type )
    {
        case 0:
            currentContent = stuff.content as [PubKey, Signature];

            return new CborArray([
                new CborUInt( 0 ),
                new CborArray([
                    new CborBytes( currentContent[0] ),
                    new CborBytes( currentContent[1] )
                ])
            ]);
        case 1:
            currentContent = stuff.content as [[Word16, Uint8Array], [Word16, Uint8Array]];   

            return new CborArray([
                new CborUInt( 1 ),
                new CborArray([
                    new CborArray([
                        new CborUInt( currentContent[0][0] ),
                        new CborBytes( currentContent[0][1] )
                    ]),
                    new CborArray([
                        new CborUInt( currentContent[1][0] ),
                        new CborBytes( currentContent[1][1] )
                    ])
                ])
            ]);
        case 2:
            currentContent = stuff.content as [PubKey, Signature];

            return new CborArray([
                new CborUInt( 2 ),
                new CborArray([
                    new CborBytes( currentContent[0] ),
                    new CborBytes( currentContent[1] )
                ])
            ]);
        default:
            return new CborArray([
                new CborUInt( stuff.type ),
                stuff.content as CborArray
            ]);
    }
}

export function twitFromCborObj( cbor: CborObj ): IByronTwit
{
    if(!(
        cbor instanceof CborArray &&
        cbor.array.length === 2 &&
        cbor.array[0] instanceof CborUInt &&
        cbor.array[1] instanceof CborArray
    )) throw new Error("invalid cbor for `IByronTwit`");

    var type = Number( cbor.array[0].num );
    var cborContent = cbor.array[1];

    switch( type )
    {
        case 0:
            if(!(
                cborContent instanceof CborArray &&
                cborContent.array.length === 2 &&
                cborContent.array.every(( cborPubKey ) => ( cborPubKey instanceof CborBytes ))
            )) throw new Error("invalid cbor for `IByronTwit`");

            return {
                type: 0,
                content: [
                    cborContent.array[0].bytes as PubKey,
                    cborContent.array[1].bytes as Signature
                ]
            } as IByronTwit;
        case 1:
            if(!(
                cborContent instanceof CborArray &&
                cborContent.array.length === 2 &&
                cborContent.array.every(( cborTwit ) => (
                    cborTwit instanceof CborArray &&
                    cborTwit.array.length === 2 &&
                    cborTwit.array[0] instanceof CborUInt &&
                    cborTwit.array[1] instanceof CborBytes
                ))
            )) throw new Error("invalid cbor for `IByronTwit`");

            const [ cborTwit1, cborTwit2 ] = cborContent.array as [CborArray, CborArray];
            const [ cborTwit1_1, cborTwit1_2 ] = cborTwit1.array as [CborUInt, CborBytes];
            const [ cborTwit2_1, cborTwit2_2 ] = cborTwit2.array as [CborUInt, CborBytes];

            return {
                type: 1,
                content: [
                    [ Number( cborTwit1_1.num ) as Word16, cborTwit1_2.bytes as Uint8Array ],
                    [ Number( cborTwit2_1.num ) as Word16, cborTwit2_2.bytes as Uint8Array ]
                ]
            } as IByronTwit;
        case 2:
            if(!(
                cborContent instanceof CborArray &&
                cborContent.array.length === 2 &&
                cborContent.array.every(( cborPubKey ) => ( cborPubKey instanceof CborBytes ))
            )) throw new Error("invalid cbor for `IByronTwit`");

            return {
                type: 2,
                content: [
                    cborContent.array[0].bytes as PubKey,
                    cborContent.array[1].bytes as Signature
                ]
            } as IByronTwit;
        default:
            return {
                type: type as Byte,
                content: cborContent as CborArray
            } as IByronTwit;
    }
}   

// ssccerts

// CDDL reference:
// ssccerts = #6.258([* ssccert])

// idk what #6.258([* ssccomm]) means....
// does it want me to only decode the content?

export type IByronSscCerts = {
    certs: IByronSscCert[]
}

export function isIByronSscCerts( stuff: any ): stuff is IByronSscCerts
{
    return(
        isObject( stuff ) &&
        Array.isArray( stuff.certs ) &&
        stuff.certs.every( isIByronSscCert )
    );
}

export function sscCertsToCborObj( stuff: IByronSscCerts ): CborArray
{
    return new CborArray(
        stuff.certs.map(( cert ) => sscCertToCborObj( cert ))
    );
}

export function sscCertsFromCborObj( cbor: CborObj ): IByronSscCerts
{
    if(!(
        cbor instanceof CborArray &&
        cbor.array.every(( cborCert ) => ( cborCert instanceof CborArray ))
    )) throw new Error("invalid cbor for `IByronSscCerts`");

    return {
        certs: cbor.array.map(( cborCert ) => sscCertFromCborObj( cborCert ))
    } as IByronSscCerts;
}

// ssccert

// CDDL reference:
// ssccert = [vsspubkey, pubkey, epochid, signature]

export type IByronSscCert = {
    vssPubKey: VssPubKey,
    pubKey: PubKey,
    epochId: EpochId,
    signature: Signature
}

export function isIByronSscCert( stuff: any ): stuff is IByronSscCert
{
    return(
        isObject( stuff ) &&
        isVssPubKey( stuff.vssPubKey ) &&
        isPubKey( stuff.pubKey ) &&
        isEpochId( stuff.epochId ) &&
        isSignature( stuff.signature )
    );
}

export function sscCertToCborObj( stuff: IByronSscCert ): CborArray
{
    return new CborArray([
        new CborBytes( stuff.vssPubKey ),
        new CborBytes( stuff.pubKey ),
        new CborUInt( stuff.epochId ),
        new CborBytes( stuff.signature )
    ]);
}

export function sscCertFromCborObj( cbor: CborObj ): IByronSscCert
{
    if(!(
        cbor instanceof CborArray &&
        cbor.array.length === 4
    )) throw new Error("invalid cbor for `IByronSscCert`");

    const [
        cborVssPubKey,
        cborPubKey,
        cborEpochId,
        cborSignature
    ] = cbor.array;

    if(!(
        cborVssPubKey instanceof CborBytes &&
        cborPubKey instanceof CborBytes &&
        cborEpochId instanceof CborUInt &&
        cborSignature instanceof CborBytes
    )) throw new Error("invalid cbor for `IByronSscCert`");

    return {
        vssPubKey: cborVssPubKey.bytes as VssPubKey,
        pubKey: cborPubKey.bytes as PubKey,
        epochId: cborEpochId.num as EpochId,
        signature: cborSignature.bytes as Signature
    } as IByronSscCert;
}

// ssccomms

// CDDL reference:
// ssccomms = #6.258([* ssccomm])

// idk what #6.258([* ssccomm]) means....
// does it want me to only decode the content?

export type IByronSscComms = {
    comms: IByronSscComm[]
}

export function isIByronSscComms( stuff: any ): stuff is IByronSscComms
{
    return(
        isObject( stuff ) &&
        Array.isArray( stuff.comms ) &&
        stuff.comms.every( isIByronSscComm )
    );
}

export function sscCommsToCborObj( stuff: IByronSscComms ): CborArray
{
    return new CborArray(
        stuff.comms.map(( comm ) => sscCommToCborObj( comm ))
    );
}

export function sscCommsFromCborObj( cbor: CborObj ): IByronSscComms
{
    if(!(
        cbor instanceof CborArray &&
        cbor.array.every(( cborComm ) => ( cborComm instanceof CborArray ))
    )) throw new Error("invalid cbor for `IByronSscComms`");

    return {
        comms: cbor.array.map(( cborComm ) => sscCommFromCborObj( cborComm ))
    } as IByronSscComms;
}

// ssccomm

// CDDL reference:
// ssccomm = [pubkey, [{vsspubkey => vssenc},vssproof], signature]

export type IByronSscComm = {
    pubKey: PubKey,
    commMap: [IByronSscCommMap, IByronVssProof]
    signature: Signature
}

export function isIByronSscComm( stuff: any ): stuff is IByronSscComm
{
    return(
        isObject( stuff ) &&
        isPubKey( stuff.pubKey ) &&
        Array.isArray( stuff.commMap ) &&
        stuff.commMap.length === 2 &&
        isIByronSscCommMap( stuff.commMap[0] ) &&
        isIByronVssProof( stuff.commMap[1] ) &&
        isSignature( stuff.signature )
    );
}

export function sscCommToCborObj( stuff: IByronSscComm ): CborArray
{
    return new CborArray([
        new CborBytes( stuff.pubKey ),
        new CborArray([
            sscCommMapToCborObj( stuff.commMap[0] ),
            vssProofToCborObj( stuff.commMap[1] )
        ]),
        new CborBytes( stuff.signature )
    ]);
}

export function sscCommFromCborObj( cbor: CborObj ): IByronSscComm
{
    if(!(
        cbor instanceof CborArray &&
        cbor.array.length === 3
    )) throw new Error("invalid cbor for `IByronSscComm`");

    const [
        cborPubKey,
        cborCommMap,
        cborSignature
    ] = cbor.array;

    if(!(
        cborPubKey instanceof CborBytes &&
        cborCommMap instanceof CborArray &&
        cborCommMap.array.length === 2 &&
        cborSignature instanceof CborBytes
    )) throw new Error("invalid cbor for `IByronSscComm`");

    return {
        pubKey: cborPubKey.bytes as PubKey,
        commMap: [
            sscCommMapFromCborObj( cborCommMap.array[0] ),
            vssProofFromCborObj( cborCommMap.array[1] )
        ],
        signature: cborSignature.bytes as Signature
    } as IByronSscComm;
}

// ssccommEntry

// CDDL reference:
// {vsspubkey => vssenc}

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

export function sscCommMapToCborObj( stuff: IByronSscCommMap ): CborArray
{
    return new CborArray([
        attributesMapToCborObj( stuff )
    ]);
}

export function sscCommMapFromCborObj( cbor: CborObj ): IByronSscCommMap
{
    if(!(
        cbor instanceof CborArray &&
        cbor.array.length === 1 &&
        cbor.array[0] instanceof CborMap
    )) throw new Error("invalid cbor for `IByronSscCommMap`");

    const map = cbor.array[0].map;

    if(!( map.every(({ k, v }) => (
        k instanceof CborBytes &&
        v instanceof CborArray &&
        v.array.every(( cborVssEnc ) => ( cborVssEnc instanceof CborBytes ))
    ))) ) throw new Error("invalid cbor for `IByronSscCommMap`");

    return new Map<VssPubKey, VssEnc>(
        map.map(({ k, v }) => {
            if (!( k instanceof CborBytes )) throw new Error("invalid key type for `IByronSscCommMap`");
            if (!( 
                v instanceof CborArray &&
                v.array.every(( cborVssEnc ) => ( cborVssEnc instanceof CborBytes ))
            )) throw new Error("invalid key type for `IByronSscCommMap`");

            return [k.bytes as VssPubKey, v.array.map(( cborVssEnc ) => ( cborVssEnc.bytes )) as VssEnc];
        })
    ) as IByronSscCommMap;
}

// vssproof

//CDDL reference:
// vssproof = [bytes, bytes, bytes, [* bytes]]

export type IByronVssProof = {
    firstBytes: Uint8Array,
    secondBytes: Uint8Array,
    thirdBytes: Uint8Array,
    byteList: Uint8Array[]
}

export function isIByronVssProof( stuff: any ): stuff is IByronVssProof 
{
    return(
        isObject( stuff ) &&
        isHash( stuff.firstBytes ) &&
        isHash( stuff.secondBytes ) &&
        isHash( stuff.thirdBytes ) &&
        Array.isArray( stuff.byteList ) &&
        stuff.byteList.every( isHash )
    );
}

export function vssProofToCborObj( stuff: IByronVssProof ): CborArray
{
    return new CborArray([
        new CborBytes( stuff.firstBytes ),
        new CborBytes( stuff.secondBytes ),
        new CborBytes( stuff.thirdBytes ),
        new CborArray( stuff.byteList.map(( byte ) => ( new CborBytes( byte ) ) ))
    ]);
}

export function vssProofFromCborObj( cbor: CborObj ): IByronVssProof
{
    if(!(
        cbor instanceof CborArray &&
        cbor.array.length === 4
    )) throw new Error("invalid cbor for `IByronVssProof`");

    const [
        cborFirstBytes,
        cborSecondBytes,
        cborThirdBytes,
        cborByteList
    ] = cbor.array;

    if(!(
        cborFirstBytes instanceof CborBytes &&
        cborSecondBytes instanceof CborBytes &&
        cborThirdBytes instanceof CborBytes &&
        cborByteList instanceof CborArray &&
        cborByteList.array.every(( cborBytes ) => ( cborBytes instanceof CborBytes ))
    )) throw new Error("invalid cbor for `IByronVssProof`");

    return {
        firstBytes: cborFirstBytes.bytes,
        secondBytes: cborSecondBytes.bytes,
        thirdBytes: cborThirdBytes.bytes,
        byteList: cborByteList.array.map(( cborBytes ) => ( cborBytes.bytes ))
    } as IByronVssProof;
}

// sscopens

// CDDL reference:
// sscopens = {stakeholderid => vsssec}

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

export function sscOpensToCborObj( stuff: IByronSscOpens ): CborArray
{
    return new CborArray([
        attributesMapToCborObj( stuff )
    ]);
}

export function sscOpensFromCborObj( cbor: CborObj ): IByronSscOpens
{
    if(!(
        cbor instanceof CborArray &&
        cbor.array.length === 1 &&
        cbor.array[0] instanceof CborMap
    )) throw new Error("invalid cbor for `IByronSscOpens`");

    const map = cbor.array[0].map;

    if(!( map.every(({ k, v }) => (
        k instanceof CborBytes &&
        v instanceof CborBytes
    )) )) throw new Error("invalid cbor for `IByronSscOpens`");

    return new Map<StakeholderId, VssSec>(
        map.map(({ k, v }) => {
            if (!( k instanceof CborBytes )) throw new Error("invalid key type for `IByronSscOpens`");
            if (!( v instanceof CborBytes )) throw new Error("invalid key type for `IByronSscOpens`");

            return [k.bytes as StakeholderId, v.bytes as VssSec];
        })
    ) as IByronSscOpens;
}

// sscshares

// CDDL reference:
// sscshares = {addressid => sscSharesEntry}

//TO BE FIXED: attributesMapToCborObj doesnt turn keys and values in CborObjects

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

export function sscSharesToCborObj( stuff: IByronSscShares ): CborArray
{
    return new CborArray([
        attributesMapToCborObj( stuff )
    ]);
}

export function sscSharesFromCborObj( cbor: CborObj ): IByronSscShares
{
    if(!(
        cbor instanceof CborArray &&
        cbor.array.length === 1 &&
        cbor.array[0] instanceof CborMap
    )) throw new Error("invalid cbor for `IByronSscShares`");

    const map = cbor.array[0].map;

    if(!( map.every(({ k, v }) => (
        k instanceof CborBytes &&
        v instanceof CborArray
    )))) throw new Error("invalid cbor for `IByronSscShares`");

    return new Map<AddressId, IByronSscSharesEntry>(
        map.map(({ k, v }) => {
            if (!( k instanceof CborBytes )) throw new Error("invalid key type for `IByronSscShares`");

            return [k.bytes as AddressId, sscSharesEntryFromCborObj(v)];
        })
    ) as IByronSscShares;
}

// sscSharesEntry

// CDDL reference:
// [addressid, [* vssdec]

export type IByronSscSharesEntry = {
    addressId: AddressId,
    vssDecList: VssDec[]
}

export function isIByronSscSharesEntry( stuff: any ): stuff is IByronSscSharesEntry
{
    return(
        isObject( stuff ) &&
        isAddressId( stuff.addressId ) &&
        Array.isArray( stuff.vssDecList ) &&
        stuff.vssDecList.every( isVssDec )
    );
}

export function sscSharesEntryToCborObj( stuff: IByronSscSharesEntry ): CborArray
{
    return new CborArray([
        new CborBytes( stuff.addressId ),
        new CborArray( stuff.vssDecList.map(( vssDec ) => new CborBytes( vssDec ) ))
    ]);
}

export function sscSharesEntryFromCborObj( cbor: CborObj ): IByronSscSharesEntry
{
    if(!(
        cbor instanceof CborArray &&
        cbor.array.length === 2 &&
        cbor.array[0] instanceof CborBytes &&
        cbor.array[1] instanceof CborArray &&
        cbor.array[1].array.every(( cborVssDec ) => ( cborVssDec instanceof CborBytes ))
    )) throw new Error("invalid cbor for `IByronSscSharesEntry`");

    return {
        addressId: cbor.array[0].bytes as AddressId,
        vssDecList: cbor.array[1].array.map(( cborVssDec ) => ( cborVssDec.bytes )) as VssDec[]
    } as IByronSscSharesEntry;
}

// ssc

// CDDL reference:
// ssc = [0, ssccomms, ssccerts]
//     / [1, sscopens, ssccerts]
//     / [2, sscshares, ssccerts]
//     / [3, ssccerts]

export type IByronSscPayload 
    = { type: 0, comms: IByronSscComms, certs: IByronSscCerts }
    | { type: 1, opens: IByronSscOpens, certs: IByronSscCerts }
    | { type: 2, shares: IByronSscShares, certs: IByronSscCerts }
    | { type: 3, certs: IByronSscCerts };

export function isByronSscPayload( stuff: any ): stuff is IByronSscPayload
{
    if( isObject( stuff ) && isIByronSscCerts( stuff.certs ) )
    {
        switch( stuff.type )
        {
            case 0:
                return( isIByronSscComms( stuff.comms ) );
            case 1:
                return( isIByronSscOpens( stuff.opens ) );
            case 2:
                return( isIByronSscShares( stuff.shares ) );
            case 3:
                return true;
        }
    }

    return false;
}

export function sscPayloadToCborObj( stuff: IByronSscPayload ): CborArray
{
    switch( stuff.type )
    {
        case 0:
            return new CborArray([
                new CborUInt( 0 ),
                sscCommsToCborObj( stuff.comms ),
                sscCertsToCborObj( stuff.certs )
            ]);
        case 1:
            return new CborArray([
                new CborUInt( 1 ),
                sscOpensToCborObj( stuff.opens ) ,
                sscCertsToCborObj( stuff.certs )
            ]);
        case 2:
            return new CborArray([
                new CborUInt( 2 ),
                sscSharesToCborObj( stuff.shares ),
                sscCertsToCborObj( stuff.certs )
            ]);
        case 3:
            return new CborArray([
                new CborUInt( 3 ),
                sscCertsToCborObj( stuff.certs )
            ]);
    }
}

export function sscPayloadFromCborObj( cbor: CborObj ): IByronSscPayload
{
    if(!(
        cbor instanceof CborArray &&
        cbor.array[0] instanceof CborUInt
    )) throw new Error("invalid cbor for `IByronSscPayload`");

    var type = Number( cbor.array[0].num );
    
    if( [0, 1, 2].includes( type ) ) 
    {
        if( cbor.array.length !== 3 ) throw new Error("invalid cbor for `IByronSscPayload`");

        switch( type )
        {
            case 0:
                return {
                    type: 0,
                    comms: sscCommsFromCborObj( cbor.array[1] ) as IByronSscComms,
                    certs: sscCertsFromCborObj( cbor.array[2] ) as IByronSscCerts
                } as IByronSscPayload;
            case 1:
                return {
                    type: 1,
                    opens: sscOpensFromCborObj( cbor.array[1] ) as IByronSscOpens,
                    certs: sscCertsFromCborObj( cbor.array[2] ) as IByronSscCerts
                } as IByronSscPayload;
            case 2:
                return {
                    type: 2,
                    shares: sscSharesFromCborObj( cbor.array[1] ) as IByronSscShares,
                    certs: sscCertsFromCborObj( cbor.array[2] ) as IByronSscCerts
                } as IByronSscPayload;
        }
    }
        
    if(!( cbor.array.length === 2 && type === 3 )) throw new Error("invalid cbor for `IByronSscPayload`");

    return {
        type: 3,
        certs: sscCertsFromCborObj( cbor.array[1] ) as IByronSscCerts
    } as IByronSscPayload;
}

// dlg

// CDDL reference:
// dlg = [ epoch : epochid
//     , issuer : pubkey
//     , delegate : pubkey
//     , certificate : signature
//     ]

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
    } as IByronDlg;
}

// dlgPayload

// CDDL reference:
// "dlgPayload" : [* dlg]

export type IByronDlgPayload = {
    payload: IByronDlg[]
}

export function isIByronDlgPayload( stuff: any ): stuff is IByronDlgPayload
{
    return(
        isObject( stuff ) &&
        Array.isArray( stuff.payload ) &&
        stuff.payload.every( isIByronDlg )
    );
}

export function dlgPayloadToCborObj( stuff: IByronDlgPayload ): CborArray
{
    return new CborArray(
        stuff.payload.map(( dlg ) => dlgToCborObj( dlg ))
    );
}

export function dlgPayloadFromCborObj( cbor: CborObj ): IByronDlgPayload
{
    if(!(
        cbor instanceof CborArray &&
        cbor.array.every(( cborDlg ) => ( cborDlg instanceof CborArray ))
    )) throw new Error("invalid cbor for `IByronDlgPayload`");

    return {
        payload: cbor.array.map(( cborDlg ) => dlgFromCborObj( cborDlg ))
    } as IByronDlgPayload;
}

// upprop

// CDDL reference:
// upprop = [ "blockVersion" : bver
//     , "blockVersionMod" : bvermod
//     , "softwareVersion" : [ text, u32 ]
//     , "data" : #6.258([text, updata])
//     , "attributes" : attributes
//     , "from" : pubkey
//     , "signature" : signature
//     ]

// idk what #6.258([* ssccomm]) means....
// does it want me to only decode the content?

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
        isAttributes( stuff.attributes ) &&
        isPubKey( stuff.from ) &&
        isSignature( stuff.signature )
    );
}

export function upPropToCborObj( stuff: IByronUpProp ): CborArray
{
    return new CborArray([
        bVerToCborObj( stuff.blockVersion ),
        bVerModToCborObj( stuff.blockVersionMod ),
        new CborArray([
            new CborText( stuff.softwareVersion[0] ),
            new CborUInt( stuff.softwareVersion[1] )
        ]),
        new CborArray([
            new CborText( stuff.data[0] ),
            new CborArray( stuff.data[1].map(( hash ) => new CborBytes( hash ) ))
        ]),
        attributesMapToCborObj( stuff.attributes ),
        new CborBytes( stuff.from ),
        new CborBytes( stuff.signature )
    ]);
}

export function upPropFromCborObj( cbor: CborObj ): IByronUpProp
{
    if(!(
        cbor instanceof CborArray &&
        cbor.array.length === 7
    )) throw new Error("invalid cbor for `IByronUpProp`");

    const [
        cborBlockVersion,
        cborBlockVersionMod,
        cborSoftwareVersion,
        cborData,
        cborAttributes,
        cborFrom,
        cborSignature
    ] = cbor.array;

    if(!(
        cborBlockVersion instanceof CborArray &&
        cborBlockVersionMod instanceof CborArray &&
        cborSoftwareVersion instanceof CborArray &&
        cborSoftwareVersion.array.length === 2 &&
        cborSoftwareVersion.array[0] instanceof CborText &&
        cborSoftwareVersion.array[1] instanceof CborUInt &&
        cborData instanceof CborArray &&
        cborData.array.length === 2 &&
        cborData.array[0] instanceof CborText &&
        cborData.array[1] instanceof CborArray &&
        cborData.array[1].array.length === 4 &&
        cborData.array[1].array.every(( cborHash ) => ( cborHash instanceof CborBytes )) &&
        cborAttributes instanceof CborMap &&
        cborFrom instanceof CborBytes &&
        cborSignature instanceof CborBytes
    )) throw new Error("invalid cbor for `IByronUpProp`");

    return {
        blockVersion: bVerFromCborObj( cborBlockVersion ),
        blockVersionMod: bVerModFromCborObj( cborBlockVersionMod ),
        softwareVersion: [
            cborSoftwareVersion.array[0].text as string,
            Number( cborSoftwareVersion.array[1].num ) as Word32
        ],
        data: [
            cborData.array[0].text as string,
            cborData.array[1].array.map(( cborHash ) => ( cborHash.bytes)) as [U8Arr32, U8Arr32, U8Arr32, U8Arr32]
        ],
        attributes: cborMapToAttributes( cborAttributes ),
        from: cborFrom.bytes as PubKey,
        signature: cborSignature.bytes as Signature
    } as IByronUpProp;
}

// bver

// CDDL reference:
// bver = [u16, u16, u8]

export type IByronBVer = {
    firstWord: Word16,
    secondWord: Word16,
    thirdWord: Byte
};

export function isIByronBVer( stuff: any ): stuff is IByronBVer
{
    return(
        isObject( stuff ) &&
        isWord16( stuff.firstWord ) &&
        isWord16( stuff.secondWord ) &&
        isByte( stuff.thirdWord )
    );
}

export function bVerToCborObj( stuff: IByronBVer ): CborArray
{    
    return new CborArray([
        new CborUInt( stuff.firstWord ),
        new CborUInt( stuff.secondWord ),
        new CborUInt( stuff.thirdWord )
    ]);
}

export function bVerFromCborObj( cbor: CborObj ): IByronBVer
{
    if(!(
        cbor instanceof CborArray &&
        cbor.array.length === 3 &&
        cbor.array.every(( cborValue ) => ( cborValue instanceof CborUInt ))
    )) throw new Error("invalid cbor for `IByronBVer`");

    const [
        cborFirstWord,
        cborSecondWord,
        cborThirdWord,
    ] = cbor.array;

    if(!(
        cborFirstWord instanceof CborUInt &&
        cborSecondWord instanceof CborUInt &&
        cborThirdWord instanceof CborUInt
    )) throw new Error("invalid cbor for `IByronBVer`");

    return {
        firstWord: Number( cbor.array[0].num ) as Word16,
        secondWord: Number( cbor.array[1].num ) as Word16,
        thirdWord: Number( cbor.array[2].num ) as Byte
    } as IByronBVer;
}

// bvermod

// CDDL reference:
// bvermod = [ scriptVersion : [? u16]
//           , slotDuration : [? bigint]
//           , maxBlockSize : [? bigint]
//           , maxHeaderSize  : [? bigint]
//           , maxTxSize : [? bigint]
//           , maxProposalSize : [? bigint]
//           , mpcThd : [? u64]
//           , heavyDelThd : [? u64]
//           , updateVoteThd : [? u64]
//           , updateProposalThd : [? u64]
//           , updateImplicit : [? u64]
//           , softForkRule : [? [u64, u64, u64]]
//           , txFeePolicy : [? txfeepol]
//           , unlockStakeEpoch : [? epochid]
//           ]

export interface IByronBVerMod {
    scriptVersion: Word16 | undefined,
    slotDuration: Word64 | undefined,
    maxBlockSize: Word64 | undefined,
    maxHeaderSize: Word64 | undefined,
    maxTxSize: Word64 | undefined,
    maxProposalSize: Word64 | undefined,
    mpcThd: Word64 | undefined,
    heavyDelThd: Word64 | undefined,
    updateVoteThd: Word64 | undefined,
    updateProposalThd: Word64 | undefined,
    updateImplicit: Word64 | undefined,
    softForkRule: [Word64, Word64, Word64] | undefined,
    txFeePolicy: IByronTxFeePol | undefined,
    unlockStakeEpoch: EpochId | undefined
}

export function isIByronBVerMod( stuff: any ): stuff is IByronBVerMod
{
    return(
        isObject( stuff ) &&
        (
            isWord16( stuff.scriptVersion ) ||
            stuff.scriptVersion === undefined
        ) &&
        (
            isWord64( stuff.slotDuration ) ||
            stuff.slotDuration === undefined
        ) &&
        (
            isWord64( stuff.maxBlockSize ) ||
            stuff.maxBlockSize === undefined
        ) &&
        (
            isWord64( stuff.maxHeaderSize ) ||
            stuff.maxHeaderSize === undefined
        ) &&
        (
            isWord64( stuff.maxTxSize ) ||
            stuff.maxTxSize === undefined
        ) &&
        (
            isWord64( stuff.maxProposalSize ) ||
            stuff.maxProposalSize === undefined
        ) &&
        (
            isWord64( stuff.mpcThd ) ||
            stuff.mpcThd === undefined
        ) &&
        (
            isWord64( stuff.heavyDelThd ) ||
            stuff.heavyDelThd === undefined
        ) &&
        (
            isWord64( stuff.updateVoteThd ) ||
            stuff.updateVoteThd === undefined
        ) &&
        (
            isWord64( stuff.updateProposalThd ) ||
            stuff.updateProposalThd === undefined
        ) &&
        (
            isWord64( stuff.updateImplicit ) ||
            stuff.updateImplicit === undefined
        ) &&
        (
            isIByronTxFeePol( stuff.txFeePolicy ) ||
            stuff.txFeePolicy === undefined
        ) &&
        (
            isEpochId( stuff.unlockStakeEpoch ) ||
            stuff.unlockStakeEpoch === undefined
        ) &&
        (
            Array.isArray( stuff.softForkRule ) &&
            stuff.softForkRule.length === 3 &&
            stuff.softForkRule.every( isWord64 ) ||
            stuff.softForkRule === undefined
        )
    );
}

export function bVerModToCborObj( stuff: IByronBVerMod ): CborArray
{    
    var cborValuesArray = [];
    
    for( var prop in stuff ) {
        if ( stuff.hasOwnProperty( prop ) ) {
            if( stuff[ prop as keyof IByronBVerMod ] !== undefined )
            {
                switch( prop )
                {
                    case "scriptVersion":
                        cborValuesArray.push( new CborArray([ new CborUInt( stuff[ prop ] as Word16 ) ]) );
                        break;
                    case "slotDuration":
                    case "maxBlockSize":
                    case "maxHeaderSize":
                    case "maxTxSize":
                    case "maxProposalSize":
                    case "mpcThd":
                    case "heavyDelThd":
                    case "updateVoteThd":
                    case "updateProposalThd":
                    case "updateImplicit":
                        cborValuesArray.push( new CborArray([ new CborUInt( stuff[ prop ] as Word64 ) ]) );
                        break;
                    case "softForkRule":
                        if( stuff[ prop ] !== undefined )
                        {
                            cborValuesArray.push( 
                                new CborArray( ( stuff[ prop ] as Word64[] ).map(( word ) => ( new CborUInt( word as Word64 ) ) ))
                            );
                        }
                        break;
                    case "txFeePolicy":
                        cborValuesArray.push( txFeePolToCborObj( stuff[ prop ] as IByronTxFeePol ) );
                        break;
                    case "unlockStakeEpoch":
                        cborValuesArray.push( new CborArray([ new CborUInt( stuff[ prop ] as EpochId ) ]) );
                        break;
                }   
            }
            else
            {
                cborValuesArray.push( new CborArray([]) );
            }
        }
    }
    
    return new CborArray( cborValuesArray );
}

export function bVerModFromCborObj( cbor: CborObj ): IByronBVerMod
{
    if(!(
        cbor instanceof CborArray &&
        cbor.array.length === 14 &&
        cbor.array.every(( cborValue ) => ( cborValue instanceof CborArray )) &&
        cbor.array.every(( cborValue ) => ( [0, 1].includes( cborValue.array.length ) ))
    )) throw new Error("invalid cbor for `IByronBVerMod`");

    const [
        cborScriptVersion,
        cborSlotDuration,
        cborMaxBlockSize,
        cborMaxHeaderSize,
        cborMaxTxSize,
        cborMaxProposalSize,
        cborMpcThd,
        cborHeavyDelThd,
        cborUpdateVoteThd,
        cborUpdateProposalThd,
        cborUpdateImplicit,
        cborSoftForkRule,
        cborTxFeePolicy,
        cborUnlockStakeEpoch
    ] = cbor.array;

    return {
        scriptVersion: (( cborScriptVersion.array.length === 1 && cborScriptVersion.array[0] instanceof CborUInt )? 
            Number( cborScriptVersion.array[0].num ) as Word16 : undefined 
        ),
        slotDuration: (( cborSlotDuration.array.length === 1 && cborSlotDuration.array[0] instanceof CborUInt ) ? 
            cborSlotDuration.array[0].num as Word64 : undefined
        ),
        maxBlockSize: (( cborMaxBlockSize.array.length === 1 && cborMaxBlockSize.array[0] instanceof CborUInt ) ? 
            cborMaxBlockSize.array[0].num as Word64 : undefined
        ),
        maxHeaderSize: (( cborMaxHeaderSize.array.length === 1 && cborMaxHeaderSize.array[0] instanceof CborUInt ) ? 
            cborMaxHeaderSize.array[0].num as Word64 : undefined
        ),
        maxTxSize: (( cborMaxTxSize.array.length === 1 && cborMaxTxSize.array[0] instanceof CborUInt ) ? 
            cborMaxTxSize.array[0].num as Word64 : undefined
        ),
        maxProposalSize: (( cborMaxProposalSize.array.length === 1 && cborMaxProposalSize.array[0] instanceof CborUInt ) ? 
            cborMaxProposalSize.array[0].num as Word64 : undefined
        ),
        mpcThd: (( cborMpcThd.array.length === 1 && cborMpcThd.array[0] instanceof CborUInt ) ? 
            cborMpcThd.array[0].num as Word64 : undefined
        ),
        heavyDelThd: (( cborHeavyDelThd.array.length === 1 && cborHeavyDelThd.array[0] instanceof CborUInt ) ? 
            cborHeavyDelThd.array[0].num as Word64 : undefined
        ),
        updateVoteThd: (( cborUpdateVoteThd.array.length === 1 && cborUpdateVoteThd.array[0] instanceof CborUInt ) ? 
            cborUpdateVoteThd.array[0].num as Word64 : undefined
        ),
        updateProposalThd: (( cborUpdateProposalThd.array.length === 1 && cborUpdateProposalThd.array[0] instanceof CborUInt ) ? 
            cborUpdateProposalThd.array[0].num as Word64 : undefined
        ),
        updateImplicit: (( cborUpdateImplicit.array.length === 1 && cborUpdateImplicit.array[0] instanceof CborUInt ) ? 
            cborUpdateImplicit.array[0].num as Word64 : undefined
        ),
        softForkRule: (( cborSoftForkRule.array.length === 3 && cborSoftForkRule.array[0] instanceof CborUInt ) ? 
            cborSoftForkRule.array.map(( cborWord ) => {
                if(!( cborWord instanceof CborUInt )) throw new Error("invalid cbor for `IByronBVerMod`");
                return( cborWord.num as Word64 );
            }) as [Word64, Word64, Word64] : undefined
        ),
        txFeePolicy: txFeePolFromCborObj( cborTxFeePolicy ) as IByronTxFeePol,
        unlockStakeEpoch: (( cborUnlockStakeEpoch.array.length === 1 && cborUnlockStakeEpoch.array[0] instanceof CborUInt )? 
            cborUnlockStakeEpoch.array[0].num as EpochId : undefined
        )
    } as IByronBVerMod;
}

// txfeepol

// CDDL reference:
// txfeepol = [0, #6.24(bytes .cbor ([bigint, bigint]))]
//          / [u8 .gt 0, encoded-cbor]

// idk what #6.24(bytes .cbor ([bigint, bigint])) means....
// does it want me to only decode the content?

export type IByronTxFeePol 
    = { type: 0, content: [Word64, Word64] }
    | { type: Byte, content: CborArray };

export function isIByronTxFeePol( stuff: any ): stuff is IByronTxFeePol
{
    if( isObject( stuff ) && isByte( stuff.type ) )
    {
        switch( stuff.type )
        {
            case 0:
                return(
                    Array.isArray( stuff.values ) &&
                    stuff.values.length === 2 &&
                    stuff.values.every( isWord64 )
                );
            default:
                return( stuff.cborArray instanceof CborArray );
        }
    }

    return false;
}

export function txFeePolToCborObj( stuff: IByronTxFeePol ): CborArray
{    
    switch( stuff.type )
    {
        case 0:
            return new CborArray([
                new CborUInt( 0 ),
                new CborArray( ( stuff.content as Word64[] ).map(( word ) => ( new CborUInt( word as Word64 ) ) ))
            ]);
        default:
            return new CborArray([
                new CborUInt( stuff.type ),
                stuff.content as CborArray
            ]);
    }
}

export function txFeePolFromCborObj( cbor: CborObj ): IByronTxFeePol
{
    if(!(
        cbor instanceof CborArray &&
        cbor.array.length === 2
    )) throw new Error("invalid cbor for `IByronTxFeePol`");

    const [
        cborType,
        cborContent
    ] = cbor.array;

    if(!(
        cborType instanceof CborUInt &&
        cborContent instanceof CborArray
    )) throw new Error("invalid cbor for `IByronTxFeePol`");

    const type = Number( cborType.num );

    switch( type )
    {
        case 0:
            if(!( cborContent.array.every(( cborWord ) => ( cborWord instanceof CborUInt )) )) throw new Error("invalid cbor for `IByronTxFeePol`");
            return {
                type: 0,
                content: cborContent.array.map(( cborWord ) => ( cborWord.num as Word64 )) as [Word64, Word64]
            } as IByronTxFeePol;
        default:
            return {
                type: type as Byte,
                content: cborContent as CborArray
            } as IByronTxFeePol;
    }
}

// upvote

// CDDL reference:
// upvote = [ "voter" : pubkey
//     , "proposalId" : updid
//     , "vote" : bool
//     , "signature" : signature
//     ]

export interface IByronUpVote {
    voter: PubKey,
    proposalId: UpdId,
    vote: boolean,
    signature: Signature
}

export function isIByronUpVote( stuff: any ): stuff is IByronUpVote
{
    return(
        isObject( stuff ) &&
        isPubKey( stuff.voter ) &&
        isUpdId( stuff.proposalId ) &&
        isBoolean( stuff.vote ) &&
        isSignature( stuff.signature )
    );
}

export function upVoteToCborObj( stuff: IByronUpVote ): CborArray
{    
    return new CborArray([
        new CborBytes( stuff.voter ),
        new CborBytes( stuff.proposalId ),
        new CborUInt( stuff.vote ? 1 : 0 ),
        new CborBytes( stuff.signature )
    ]);
}

export function upVoteFromCborObj( cbor: CborObj ): IByronUpVote
{
    if(!(
        cbor instanceof CborArray &&
        cbor.array.length === 4
    )) throw new Error("invalid cbor for `IByronUpVote`");

    const [
        cborVoter,
        cborProposalId,
        cborVote,
        cborSignature
    ] = cbor.array;

    if(!(
        cborVoter instanceof CborBytes &&
        cborProposalId instanceof CborBytes &&
        cborVote instanceof CborUInt &&
        cborSignature instanceof CborBytes
    )) throw new Error("invalid cbor for `IByronUpVote`");

    return {
        voter: cborVoter.bytes as PubKey,
        proposalId: cborProposalId.bytes as UpdId,
        vote: Number( cborVote.num ) === 1  ? true : false as boolean,
        signature: cborSignature.bytes as Signature
    } as IByronUpVote;
}

// up

// CDDL reference:
// up = [ "proposal" :  [? upprop]
//      , votes : [* upvote]
//      ]

export interface IByronUpdPayload {
    proposal: IByronUpProp | undefined,
    votes: IByronUpVote[]
}

export function isIByronUpdPayload( stuff: any ): stuff is IByronUpdPayload
{
    return(
        isObject( stuff ) &&
        (
            Array.isArray( stuff.proposal ) &&
            [0, 1].includes( stuff.proposal.length ) &&
            stuff.proposal.every( isIByronUpProp )
        ) &&
        ( 
            Array.isArray( stuff.votes ) &&
            stuff.votes.length >= 0 &&
            stuff.proposal.every( isIByronUpVote )
        )
    );
}

export function updPayloadToCborObj( stuff: IByronUpdPayload ): CborArray
{
    var cborValuesArray = [];

    if( stuff.proposal !== undefined )
    {
        cborValuesArray.push( upPropToCborObj( stuff.proposal as IByronUpProp ) );
    }
    else
    {
        cborValuesArray.push( new CborArray([]) );
    }

    cborValuesArray.push( new CborArray( stuff.votes.map(( upvote ) => ( upVoteToCborObj( upvote as IByronUpVote ) )) ));
    
    return new CborArray( cborValuesArray );
}

export function updPayloadFromCborObj( cbor: CborObj ): IByronUpdPayload
{
    if(!(
        cbor instanceof CborArray &&
        cbor.array.length === 2
    )) throw new Error("invalid cbor for `IByronUpdPayload`");

    const [
        cborProposal,
        cborVotes
    ] = cbor.array;

    if(!(
        cborProposal instanceof CborArray &&
        cborVotes instanceof CborArray
    )) throw new Error("invalid cbor for `IByronUpdPayload`");

    return {
        proposal: cborProposal.array.length === 0 ? undefined : upPropFromCborObj( cborProposal ) as IByronUpProp,
        votes: cborVotes.array.map(( cborVote ) => ( upVoteFromCborObj( cborVote ) )) as IByronUpVote[]
    } as IByronUpdPayload;
}

// blockbody

// CDDL reference:
// blockbody = [ "txPayload" : [* [tx, [* twit]]]
//             , "sscPayload" : ssc
//             , "dlgPayload" : [* dlg]
//             , "updPayload" : up
//             ]

export interface IByronMainBody extends IBody
{
    readonly txPayload: IByronTxPayload,
    readonly sscPayload: IByronSscPayload,
    readonly dlgPayload: IByronDlgPayload,
    readonly updPayload: IByronUpdPayload
}

export function isIByronMainBody( stuff: any ): stuff is IByronMainBody 
{
    return ( 
        isObject( stuff ) &&
        isIByronTxPayload( stuff.txPayload ) &&
        isByronSscPayload( stuff.sscPayload ) &&
        isIByronDlgPayload( stuff.dlgPayload ) &&
        isIByronUpdPayload( stuff.updPayload )
    );
}

export class ByronMainBody
    implements IByronMainBody
{
    readonly hash: U8Arr32;
    readonly isEBB: boolean;
    
    readonly txPayload: IByronTxPayload;
    readonly sscPayload: IByronSscPayload;
    readonly dlgPayload: IByronDlgPayload;
    readonly updPayload: IByronUpdPayload;

    readonly cborBytes?: Uint8Array;

    constructor( stuff: any )
    {
        if(!( isIByronMainBody( stuff ) )) throw new Error( "invalid new `IByronMainBody` data provided" );

        this.txPayload = stuff.txPayload;
        this.sscPayload = stuff.sscPayload;
        this.dlgPayload = stuff.dlgPayload;
        this.updPayload = stuff.updPayload;
    }

    toCbor(): CborString
    {
        return new CborString( this.toCborBytes() );
    }
    toCborObj(): CborArray
    {
        return new CborArray([
            txPayloadToCborObj( this.txPayload ),
            sscPayloadToCborObj( this.sscPayload ),
            dlgPayloadToCborObj( this.dlgPayload ),
            updPayloadToCborObj( this.updPayload )
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

    static fromCbor( cbor: CanBeCborString ): ByronMainBody
    {
        const bytes = cbor instanceof Uint8Array ? cbor : forceCborString( cbor ).toBuffer();
        return ByronMainBody.fromCborObj( Cbor.parse( bytes ), bytes );
    }
    static fromCborObj( cbor: CborObj, _originalBytes?: Uint8Array ): ByronMainBody
    {
        if(!(
            cbor instanceof CborArray &&
            cbor.array.length >= 4
        )) throw new Error("invalid cbor for `ByronMainBody`");

        const [
            cborTxPayload,
            cborSscPayload,
            cborDlgPayload,
            cborUpdPayload
        ] = cbor.array;

        if(!(
            cborTxPayload instanceof CborArray &&
            cborSscPayload instanceof CborArray &&
            cborDlgPayload instanceof CborArray &&
            cborUpdPayload instanceof CborArray
        )) throw new Error("invalid cbor for `ByronMainBody`");

        const originalWerePresent = _originalBytes instanceof Uint8Array;
        _originalBytes = _originalBytes instanceof Uint8Array ? _originalBytes : Cbor.encode( cbor ).toBuffer();
        
        const hdr = new ByronMainBody({
            // byron is a pain
            // the hash is calculated wrapping the header in the second slot of an array
            // the first slot is uint(0) for EBB and uint(1) for normal byron blocks
            hash: blake2b_256( new Uint8Array([ 0x82, 0x01, ..._originalBytes ]) ) as U8Arr32,
            isEBB: false,
            txPayload: txPayloadFromCborObj( cborTxPayload ) as IByronTxPayload,
            sscPayload: sscPayloadFromCborObj( cborSscPayload ) as IByronSscPayload,
            dlgPayload: dlgPayloadFromCborObj( cborDlgPayload ) as IByronDlgPayload,
            updPayload: updPayloadFromCborObj( cborUpdPayload ) as IByronUpdPayload
        });

        if( originalWerePresent )
        {
            // @ts-ignore Cannot assign to 'cborBytes' because it is a read-only property.
            hdr.cborBytes = _originalBytes;
        }

        return hdr;
    }

}
