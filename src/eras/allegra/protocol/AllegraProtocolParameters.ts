import { CborPositiveRational, CborUInt, CborObj, CborMapEntry, CborMap, CborArray, CborNegInt, CborBytes, CborTag, CborText } from "@harmoniclabs/cbor";
import { Data, DataB, DataConstr, DataI, DataList, DataMap, DataPair } from "@harmoniclabs/plutus-data";
import { fromUtf8 } from "@harmoniclabs/uint8array-utils";
import type { Epoch } from "../../common/ledger/Epoch";
import type { Coin } from "../../common/ledger/Coin";
import { CanBeUInteger, canBeUInteger, forceBigUInt } from "../../../utils/ints";
import { freezeAll, isObject } from "@harmoniclabs/obj-utils";
import { Rational, cborFromRational, isRational, isRationalOrUndefined, tryCborFromRational } from "./Rational";
import { IProtocolVersion, isIProtocolVersion, ProtocolVersion } from "./protocolVersion";


export interface AllegraProtocolParameters {
    txFeePerByte: CanBeUInteger,
    txFeeFixed: CanBeUInteger,
    maxBlockBodySize: CanBeUInteger,
    maxTxSize: CanBeUInteger,
    maxBlockHeaderSize: CanBeUInteger,
    stakeAddressDeposit: Coin,
    stakePoolDeposit: Coin,
    poolRetireMaxEpoch: Epoch,
    stakePoolTargetNum: CanBeUInteger,
    poolPledgeInfluence: Rational,
    monetaryExpansion: Rational,
    treasuryCut: Rational,
    protocolVersion?: IProtocolVersion,
    minPoolCost: Coin
}

export function isProtocolParameters( something: any ): something is AllegraProtocolParameters
{
    const expectedKeys = [
        "txFeePerByte",
        "txFeeFixed",
        "maxBlockBodySize",
        "maxTxSize",
        "maxBlockHeaderSize",
        "stakeAddressDeposit",
        "stakePoolDeposit",
        "poolRetireMaxEpoch",
        "stakePoolTargetNum",
        "poolPledgeInfluence",
        "monetaryExpansion",
        "treasuryCut",
        "protocolVersion",
        "minPoolCost"
    ] as const;

    const actualKeys = Object.keys( something );

    if(
        !expectedKeys.every( k => actualKeys.includes( k ) )
    ) return false;

    const pp: AllegraProtocolParameters = something;

    if(!
        ([
            "txFeePerByte",
            "txFeeFixed",
            "maxBlockBodySize",
            "maxTxSize",
            "maxBlockHeaderSize",
            "stakeAddressDeposit",
            "stakePoolDeposit",
            "poolRetireMaxEpoch",
            "stakePoolTargetNum",
            "minPoolCost"
        ] as const).every( uintKey => canBeUInteger( pp[uintKey] ) )
    ) return false;

    if(!(
        isRational( pp.poolPledgeInfluence ) &&
        isRational( pp.monetaryExpansion ) &&
        isRational( pp.treasuryCut )
    )) return false

    
    const ppv = pp.protocolVersion;

    if(!(
        // protocolVersion removed in conway
        ppv === undefined ||
        isIProtocolVersion( ppv )
    )) return false;

    return true;
}

export function isPartialProtocolParameters( something: object ): something is Partial<AllegraProtocolParameters>
{
    if( !isObject( something ) ) return false;

    const pp: Partial<AllegraProtocolParameters> = something;

    if(!
        ([
            "txFeePerByte",
            "txFeeFixed",
            "maxBlockBodySize",
            "maxTxSize",
            "maxBlockHeaderSize",
            "stakeAddressDeposit",
            "stakePoolDeposit",
            "poolRetireMaxEpoch",
            "stakePoolTargetNum",
            "minPoolCost"
        ] as const).every( uintKey => pp[uintKey] === undefined || canBeUInteger( pp[uintKey] ) )
    ) return false;


    if(!(
        isRationalOrUndefined( pp.poolPledgeInfluence ) &&
        isRationalOrUndefined( pp.monetaryExpansion ) &&
        isRationalOrUndefined( pp.treasuryCut )
    )) return false;

    
    const ppv = pp.protocolVersion;

    if(!(
        ppv === undefined ||
        isIProtocolVersion( ppv )
    )) return false;
    

    return true;
}

function mapUIntEntryOrUndefined( tag: number, a: CanBeUInteger | undefined ): { k: CborUInt, v: CborUInt } | undefined
{
    return a === undefined ? undefined : {
        k: new CborUInt( tag ),
        v: new CborUInt( forceBigUInt( a ) )
    };
}

function fromUIntOrUndef( n: CborObj | undefined ): bigint | undefined
{
    return n instanceof CborUInt ? n.num : undefined;
}

function kv( k: number, v: CborObj | undefined ): CborMapEntry | undefined
{
    return v === undefined ? undefined : {
        k: new CborUInt( k ),
        v
    };
}

export function partialProtocolParametersToCborObj( pps: Partial<AllegraProtocolParameters> ): CborMap
{
    const {
        protocolVersion
    } = pps;

    return new CborMap([
        mapUIntEntryOrUndefined( 0, pps.txFeePerByte ),
        mapUIntEntryOrUndefined( 1, pps.txFeeFixed ),
        mapUIntEntryOrUndefined( 2, pps.maxBlockBodySize ),
        mapUIntEntryOrUndefined( 3, pps.maxTxSize ),
        mapUIntEntryOrUndefined( 4, pps.maxBlockHeaderSize ),
        mapUIntEntryOrUndefined( 5, pps.stakeAddressDeposit ),
        mapUIntEntryOrUndefined( 6, pps.stakePoolDeposit ),
        mapUIntEntryOrUndefined( 7, pps.poolRetireMaxEpoch ),
        mapUIntEntryOrUndefined( 8, pps.stakePoolTargetNum ),
        kv( 9 , tryCborFromRational( pps.poolPledgeInfluence ) ),
        kv( 10, tryCborFromRational( pps.monetaryExpansion   ) ),
        kv( 11, tryCborFromRational( pps.treasuryCut         ) ),
        protocolVersion === undefined ? undefined :
        kv(
            14,
            new ProtocolVersion( protocolVersion ).toCborObj()
        ),
        mapUIntEntryOrUndefined( 16, pps.minPoolCost ),
    ].filter( elem => elem !== undefined ) as CborMapEntry[])
}

export function partialProtocolParametersToData( pps: Partial<AllegraProtocolParameters> ): Data
{
    return cborToDataLitteral( partialProtocolParametersToCborObj( pps ) );
}

function cborToDataLitteral( cbor: CborObj ): Data
{
    if( cbor instanceof CborPositiveRational )
    {
        return new DataConstr( 0, [ new DataI( cbor.num ), new DataI( cbor.den ) ] );
    }

    if( cbor instanceof CborUInt || cbor instanceof CborNegInt )
    {
        return new DataI( cbor.num );
    }
    if( cbor instanceof CborBytes )
    {
        return new DataB( cbor.bytes );
    }
    if( cbor instanceof CborText )
    {
        return new DataB( fromUtf8( cbor.text ) );
    }
    if( cbor instanceof CborArray )
    {
        return new DataList( cbor.array.map( cborToDataLitteral ) );
    }
    if( cbor instanceof CborMap )
    {
        return new DataMap(
            cbor.map.map(({ k, v }) => 
                new DataPair(
                    cborToDataLitteral( k ),
                    cborToDataLitteral( v )
                )
            )
        );
    }
    if( cbor instanceof CborTag )
    {
        return cborToDataLitteral( cbor.data );
    }

    throw new Error("unsupported cbor for litteral data");
}

const maxProtocolParamsEntries = 17;

export function partialProtocolParametersFromCborObj( cObj: CborObj ): Partial<AllegraProtocolParameters>
{
    if(!( cObj instanceof CborMap ))
    throw new Error(`Invalid CBOR format for "Partial<AllegraProtocolParameters>"`)

    let fields: (CborObj | undefined)[] = new Array( maxProtocolParamsEntries ).fill( undefined );

    for( let i = 0; i <= maxProtocolParamsEntries; i++)
    {
        const { v } = (cObj as CborMap).map.find(
            ({ k }) => k instanceof CborUInt && Number( k.num ) === i
        ) ?? { v: undefined };

        if( v === undefined ) continue;

        fields[i] = v;
    }

    const [
        _minFeeCoeff,              // 0: txFeePerByte
        _minFeeFix,                // 1: txFeeFixed
        _maxBlockBodySize,         // 2: maxBlockBodySize
        _maxTxSize,                // 3: maxTxSize
        _maxBlockHeaderSize,       // 4: maxBlockHeaderSize
        _keyDep,                   // 5: stakeAddressDeposit
        _poolDep,                  // 6: stakePoolDeposit
        _epoch,                    // 7: poolRetireMaxEpoch
        _kParam,                   // 8: stakePoolTargetNum
        _pledgeInfluence,          // 9: poolPledgeInfluence
        _expansionRate,            // 10: monetaryExpansion
        _treasureryGrowthRate,     // 11: treasuryCut
        _12,                       // 12: decentralization constant (Shelley, removed in later eras)
        _13,                       // 13: extra entropy (Shelley, removed in later eras)
        _protocolVersion,          // 14: protocolVersion
        _15,                       // 15: minUTxOValue (Shelley/Mary, replaced by utxoCostPerByte)
        _poolMinFee,               // 16: minPoolCost
    ] = fields;

    
    let protocolVersion: ProtocolVersion | undefined;
    try{
        protocolVersion =  _protocolVersion ? ProtocolVersion.fromCborObj( _protocolVersion ) : undefined;
    } catch {}


    return {
        txFeePerByte:                   fromUIntOrUndef( _minFeeCoeff ),
        txFeeFixed:                     fromUIntOrUndef( _minFeeFix ),
        maxBlockBodySize:               fromUIntOrUndef( _maxBlockBodySize ),
        maxTxSize:                      fromUIntOrUndef( _maxTxSize ),
        maxBlockHeaderSize:             fromUIntOrUndef( _maxBlockHeaderSize ),
        stakeAddressDeposit:            fromUIntOrUndef( _keyDep ),
        stakePoolDeposit:               fromUIntOrUndef( _poolDep ),
        poolRetireMaxEpoch:             fromUIntOrUndef( _epoch ),
        stakePoolTargetNum:             fromUIntOrUndef( _kParam ),
        poolPledgeInfluence:            CborPositiveRational.fromCborObjOrUndef( _pledgeInfluence ),
        monetaryExpansion:              CborPositiveRational.fromCborObjOrUndef( _expansionRate ),
        treasuryCut:                    CborPositiveRational.fromCborObjOrUndef( _treasureryGrowthRate ),
        protocolVersion,
        minPoolCost:                    fromUIntOrUndef( _poolMinFee )
    }
}

export const defaultProtocolParameters: AllegraProtocolParameters = freezeAll({
    txFeePerByte: 44,
    txFeeFixed: 155381,
    maxBlockBodySize: 65536,
    maxTxSize: 16384,
    maxBlockHeaderSize: 1100,
    stakeAddressDeposit:  2_000_000,
    stakePoolDeposit: 500_000_000,
    poolRetireMaxEpoch: 18,
    stakePoolTargetNum: 150,
    poolPledgeInfluence: new CborPositiveRational( 3, 10 ),
    monetaryExpansion: new CborPositiveRational( 3, 1000 ),
    treasuryCut: new CborPositiveRational( 2, 10 ),
    protocolVersion: new ProtocolVersion({ major: 2, minor: 0 }),
    minPoolCost: 340_000_000
} as AllegraProtocolParameters)

export function partialProtocolParamsToJson( pp: Partial<AllegraProtocolParameters> )
{
    return {
        ...pp,
        poolPledgeInfluence:    typeof pp.poolPledgeInfluence === "number" ? pp.poolPledgeInfluence : pp.poolPledgeInfluence?.toNumber() ,
        monetaryExpansion:      typeof pp.monetaryExpansion === "number" ? pp.monetaryExpansion : pp.monetaryExpansion?.toNumber() ,
        treasuryCut:            typeof pp.treasuryCut === "number" ? pp.treasuryCut : pp.treasuryCut?.toNumber() ,
    }
}