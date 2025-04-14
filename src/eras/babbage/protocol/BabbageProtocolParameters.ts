import type { Epoch } from "../../common/ledger/Epoch";
import type { Coin } from "../../common/ledger/Coin";
import { CborPositiveRational, CborUInt, CborObj, CborMapEntry, CborMap, CborArray, CborNegInt, CborBytes, CborTag, CborText } from "@harmoniclabs/cbor";
import { CanBeUInteger, canBeUInteger, forceBigUInt } from "../../../utils/ints";
import { CostModels, costModelsFromCborObj, costModelsToCborObj, costModelsToJson, defaultV1Costs, defaultV2Costs, defaultV3Costs, isCostModels } from "@harmoniclabs/cardano-costmodels-ts";
import { ExBudget, ExBudgetJson } from "@harmoniclabs/plutus-machine";
import { freezeAll, isObject } from "@harmoniclabs/obj-utils";
import { Rational, cborFromRational, isRational, isRationalOrUndefined, tryCborFromRational } from "./Rational";
import { IProtocolVersion, isIProtocolVersion, ProtocolVersion } from "./protocolVersion";
import { Data, DataB, DataConstr, DataI, DataList, DataMap, DataPair } from "@harmoniclabs/plutus-data";
import { fromUtf8 } from "@harmoniclabs/uint8array-utils";

export interface BabbageProtocolParameters {
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
    minPoolCost: Coin,
    utxoCostPerByte: Coin,
    costModels: CostModels,
    executionUnitPrices: [
        mem_price: CborPositiveRational,
        step_price: CborPositiveRational,
    ] | {
        priceMemory: number,
        priceSteps: number
    }
    maxTxExecutionUnits: ExBudget | ExBudgetJson,
    maxBlockExecutionUnits: ExBudget | ExBudgetJson,
    maxValueSize: CanBeUInteger,
    collateralPercentage: CanBeUInteger,
    maxCollateralInputs: CanBeUInteger,
}

export function isProtocolParameters( something: any ): something is BabbageProtocolParameters
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
        "minPoolCost",
        "utxoCostPerByte",
        "costModels",
        "executionUnitPrices",
        "maxTxExecutionUnits",
        "maxBlockExecutionUnits",
        "maxValueSize",
        "collateralPercentage",
        "maxCollateralInputs",
    ] as const;

    const actualKeys = Object.keys( something );

    if(
        !expectedKeys.every( k => actualKeys.includes( k ) )
    ) return false;

    const pp: BabbageProtocolParameters = something;

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
            "minPoolCost",
            "utxoCostPerByte",
            "maxValueSize",
            "collateralPercentage",
            "maxCollateralInputs",
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
    

    const ppexecCosts = pp.executionUnitPrices;

    if(!(
        (
            Array.isArray( ppexecCosts ) &&
            ppexecCosts.length >= 2 &&
            ppexecCosts[0] instanceof CborPositiveRational &&
            ppexecCosts[1] instanceof CborPositiveRational
        ) ||
        (
            isObject( ppexecCosts ) &&
            typeof (ppexecCosts as any).priceSteps === "number" &&
            typeof (ppexecCosts as any).priceMemory === "number"
        )
    )) return false;

    if(!(
        pp.maxTxExecutionUnits instanceof ExBudget      || ExBudget.isJson(pp.maxTxExecutionUnits) &&
        pp.maxBlockExecutionUnits instanceof ExBudget   || ExBudget.isJson(pp.maxBlockExecutionUnits)
    )) return false

    if(!(
        isCostModels( pp.costModels )
    )) return false;

    return true;
}

export function isPartialProtocolParameters( something: object ): something is Partial<BabbageProtocolParameters>
{
    if( !isObject( something ) ) return false;

    const pp: Partial<BabbageProtocolParameters> = something;

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
            "minPoolCost",
            "utxoCostPerByte",
            "maxValueSize",
            "collateralPercentage",
            "maxCollateralInputs",
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
    

    const ppexecCosts = pp.executionUnitPrices;

    if(!(
        ppexecCosts === undefined ||
        (
            Array.isArray( ppexecCosts ) &&
            ppexecCosts.length >= 2 &&
            ppexecCosts[0] instanceof CborPositiveRational &&
            ppexecCosts[1] instanceof CborPositiveRational
        ) || (
            isObject( ppexecCosts ) &&
            typeof (ppexecCosts as any).priceMemory === "number" &&
            typeof (ppexecCosts as any).priceSteps  === "number"
        )
    )) return false;

    if(!(
        (
            pp.maxTxExecutionUnits === undefined        ||
            pp.maxTxExecutionUnits instanceof ExBudget  ||
            ExBudget.isJson( pp.maxTxExecutionUnits )
        ) &&
        (
            pp.maxBlockExecutionUnits === undefined         ||
            pp.maxBlockExecutionUnits instanceof ExBudget   ||
            ExBudget.isJson( pp.maxBlockExecutionUnits )
        )
    )) return false

    if(!(
        (pp.costModels === undefined || isCostModels( pp.costModels ))
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

export function partialProtocolParametersToCborObj( pps: Partial<BabbageProtocolParameters> ): CborMap
{
    const {
        protocolVersion,
        executionUnitPrices,
        maxTxExecutionUnits,
        maxBlockExecutionUnits,
        costModels
    } = pps;

    const costModelsKeys = Object.keys( costModels ?? {} );

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
        /* 
        protocolVersion === undefined ? undefined :
        kv(
            14,
            new ProtocolVersion( protocolVersion ).toCborObj()
        ),
        */
        mapUIntEntryOrUndefined( 16, pps.minPoolCost ),
        mapUIntEntryOrUndefined( 17, pps.utxoCostPerByte ),
        kv( 18, 
            (costModels === undefined || 
            (!costModelsKeys.includes("PlutusV1") && !costModelsKeys.includes("PlutusV2"))) ?
                undefined :
                costModelsToCborObj( costModels )
        ),
        executionUnitPrices === undefined ? undefined:
        kv(
            19,
            Array.isArray(executionUnitPrices) ? 
                new CborArray(executionUnitPrices) :
                new CborArray([
                    CborPositiveRational.fromNumber( executionUnitPrices.priceSteps ),
                    CborPositiveRational.fromNumber( executionUnitPrices.priceMemory ),
                ])
        ),
        kv( 20, ExBudget.isJson( maxTxExecutionUnits    ) ? ExBudget.fromJson( maxTxExecutionUnits    ).toCborObj() : maxTxExecutionUnits?.toCborObj()      ),
        kv( 21, ExBudget.isJson( maxBlockExecutionUnits ) ? ExBudget.fromJson( maxBlockExecutionUnits ).toCborObj() : maxBlockExecutionUnits?.toCborObj()   ),
        mapUIntEntryOrUndefined( 22, pps.maxValueSize ),
        mapUIntEntryOrUndefined( 23, pps.collateralPercentage ),
        mapUIntEntryOrUndefined( 24, pps.maxCollateralInputs )
    ].filter( elem => elem !== undefined ) as CborMapEntry[])
}

export function partialProtocolParametersToData( pps: Partial<BabbageProtocolParameters> ): Data
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

const maxProtocolParamsEntries = 33;

export function partialProtocolParametersFromCborObj( cObj: CborObj ): Partial<BabbageProtocolParameters>
{
    if(!( cObj instanceof CborMap ))
    throw new Error(`Invalid CBOR format for "Partial<BabbageProtocolParameters>"`)

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
        _minFeeCoeff,
        _minFeeFix,
        _maxBlockBodySize,
        _maxTxSize,
        _maxBlockHeaderSize,
        _keyDep,
        _poolDep,
        _epoch,
        _kParam,
        _pledgeInfluence,
        _expansionRate,
        _treasureryGrowthRate,
        _12,
        _13,
        _protocolVersion,
        _15,
        _poolMinFee,
        _adaPerUtxoByte,
        _costmdls,
        _execCosts,
        _maxTxExecUnits,
        _maxBlockExecUnits,
        _maxValueSize,
        _collatearalPerc,
        _maxCollIns,

    ] = fields;

    
    let protocolVersion: ProtocolVersion | undefined;
    try{
        protocolVersion =  _protocolVersion ? ProtocolVersion.fromCborObj( _protocolVersion ) : undefined;
    } catch {}
    
    
    let executionUnitPrices: [CborPositiveRational, CborPositiveRational] | undefined = undefined;
    if( _execCosts instanceof CborArray )
    {
        const mem_price = CborPositiveRational.fromCborObjOrUndef( _execCosts.array[0] )
        const cpu_price = CborPositiveRational.fromCborObjOrUndef( _execCosts.array[1] )
        executionUnitPrices = mem_price !== undefined && cpu_price !== undefined ? [ mem_price, cpu_price ] : undefined;
    }

    const _costModels = costModelsFromCborObj( _costmdls );

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
        minPoolCost:                    fromUIntOrUndef( _poolMinFee ),
        utxoCostPerByte:                fromUIntOrUndef( _adaPerUtxoByte ),
        costModels:                     Object.keys( _costModels ).length === 0 ? undefined : _costModels,
        executionUnitPrices,
        maxTxExecutionUnits:            _maxTxExecUnits === undefined ? undefined : ExBudget.fromCborObj( _maxTxExecUnits ),
        maxBlockExecutionUnits:         _maxBlockExecUnits === undefined ? undefined : ExBudget.fromCborObj( _maxBlockExecUnits ),
        maxValueSize:                   fromUIntOrUndef( _maxValueSize ),
        collateralPercentage:           fromUIntOrUndef( _collatearalPerc ),
        maxCollateralInputs:            fromUIntOrUndef( _maxCollIns )
    }
}

export const defaultProtocolParameters: BabbageProtocolParameters = freezeAll({
    txFeePerByte: 44,
    txFeeFixed: 155381,
    maxBlockBodySize: 73728,
    maxTxSize: 16384,
    maxBlockHeaderSize: 1100,
    stakeAddressDeposit:  2_000_000,
    stakePoolDeposit: 500_000_000,
    poolRetireMaxEpoch: 18,
    stakePoolTargetNum: 500,
    poolPledgeInfluence: new CborPositiveRational( 3, 10 ),
    monetaryExpansion: new CborPositiveRational( 3, 1000 ),
    treasuryCut: new CborPositiveRational( 2, 10 ),
    protocolVersion: new ProtocolVersion({ major: 8, minor: 0 }),
    minPoolCost: 340_000_000,
    utxoCostPerByte: 34482,
    costModels: {
        PlutusScriptV1: defaultV1Costs,
        PlutusScriptV2: defaultV2Costs,
        PlutusScriptV3: defaultV3Costs
    },
    executionUnitPrices: [
        CborPositiveRational.fromNumber( 0.0577 ), // mem
        CborPositiveRational.fromNumber( 0.0000721 )  // cpu
    ],
    maxTxExecutionUnits: new ExBudget({ mem: 12_500_000, cpu: 10_000_000_000 }),
    maxBlockExecutionUnits: new ExBudget({ mem: 50_000_000, cpu: 40_000_000_000 }),
    maxValueSize: 5000,
    collateralPercentage: 150,
    maxCollateralInputs: 3
} as BabbageProtocolParameters)

export function partialProtocolParamsToJson( pp: Partial<BabbageProtocolParameters> )
{
    return {
        ...pp,
        poolPledgeInfluence:    typeof pp.poolPledgeInfluence === "number" ? pp.poolPledgeInfluence : pp.poolPledgeInfluence?.toNumber() ,
        monetaryExpansion:      typeof pp.monetaryExpansion === "number" ? pp.monetaryExpansion : pp.monetaryExpansion?.toNumber() ,
        treasuryCut:            typeof pp.treasuryCut === "number" ? pp.treasuryCut : pp.treasuryCut?.toNumber() ,
        costModels: pp.costModels === undefined ? undefined : costModelsToJson( pp.costModels ),
        executionUnitPrices: Array.isArray(pp.executionUnitPrices) ?
            {
                priceSteps:  pp.executionUnitPrices[1].toNumber(),
                priceMemory: pp.executionUnitPrices[0].toNumber()
            } :
            pp.executionUnitPrices,
        maxTxExecutionUnits:    ExBudget.isJson( pp.maxTxExecutionUnits ) ?    pp.maxTxExecutionUnits    : pp.maxTxExecutionUnits?.toJson(),
        maxBlockExecutionUnits: ExBudget.isJson( pp.maxBlockExecutionUnits ) ? pp.maxBlockExecutionUnits : pp.maxBlockExecutionUnits?.toJson(),
    }
}