import type { Epoch } from "../../common/ledger/Epoch";
import type { Coin } from "../../common/ledger/Coin";
import { CborPositiveRational, CborUInt, CborObj, CborMapEntry, CborMap, CborArray, CborNegInt, CborBytes, CborTag, CborText } from "@harmoniclabs/cbor";
import { CanBeUInteger, canBeUInteger, forceBigUInt } from "../../../utils/ints";
import { CostModels, costModelsFromCborObj, costModelsToCborObj, costModelsToJson, defaultV1Costs, defaultV2Costs, defaultV3Costs, isCostModels } from "@harmoniclabs/cardano-costmodels-ts";
import { ExBudget, ExBudgetJson } from "@harmoniclabs/plutus-machine";
import { freezeAll, isObject } from "@harmoniclabs/obj-utils";
import { PParamsPoolVotingThresholds, isPParamsPoolVotingThresholds, poolVotingThresholdsToCborObj, tryGetPParamsPoolVotingThresholdsFromCborObj } from "./PParamsPoolVotingThresholds";
import { PParamsDrepVotingThresholds, drepVotingThresholdsToCborObj, isPParamsDrepVotingThresholds, tryGetPParamsDrepVotingThresholdsFromCborObj } from "./PParamsDrepVotingThresholds";
import { Data, DataB, DataConstr, DataI, DataList, DataMap, DataPair } from "@harmoniclabs/plutus-data";
import { fromUtf8 } from "@harmoniclabs/uint8array-utils";
import { Rational, isRational, isRationalOrUndefined, tryCborFromRational } from "../../common";

export interface ConwayProtocolParameters {
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
    /** @deprecated protocolVersion removed in Conway */
    // protocolVersion?: IProtocolVersion,
    minPoolCost: Coin,
    utxoCostPerByte: Coin,
    costModels: CostModels,
    executionUnitPrices: [
        mem_price: CborPositiveRational,
        step_price: CborPositiveRational,
    ] | {
        priceMemory: number,
        priceSteps: number
    },
    maxTxExecutionUnits: ExBudget | ExBudgetJson,
    maxBlockExecutionUnits: ExBudget | ExBudgetJson,
    maxValueSize: CanBeUInteger,
    collateralPercentage: CanBeUInteger,
    maxCollateralInputs: CanBeUInteger,
    // Conway (governance params)
    poolVotingThresholds: PParamsPoolVotingThresholds,
    drepVotingThresholds: PParamsDrepVotingThresholds,
    minCommitteSize: CanBeUInteger,
    committeeTermLimit: Epoch,
    governanceActionValidityPeriod: Epoch,
    governanceActionDeposit: Epoch,
    drepDeposit: Coin,
    drepActivityPeriod: Epoch,
    minfeeRefScriptCostPerByte: Rational
}

export function isConwayProtocolParameters(something: any): something is ConwayProtocolParameters {
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
        // protocolVersion removed in Conway
        // "protocolVersion",
        "minPoolCost",
        "utxoCostPerByte",
        "costModels",
        "executionUnitPrices",
        "maxTxExecutionUnits",
        "maxBlockExecutionUnits",
        "maxValueSize",
        "collateralPercentage",
        "maxCollateralInputs",
        "poolVotingThresholds",
        "drepVotingThresholds",
        "minCommitteSize",
        "committeeTermLimit",
        "governanceActionValidityPeriod",
        "governanceActionDeposit",
        "drepDeposit",
        "drepActivityPeriod",
        "minfeeRefScriptCostPerByte"
    ] as const;

    const actualKeys = Object.keys(something);

    if (!expectedKeys.every(k => actualKeys.includes(k))) return false;

    const pp: ConwayProtocolParameters = something;

    if (!([
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
        "minCommitteSize",
        "committeeTermLimit",
        "governanceActionValidityPeriod",
        "governanceActionDeposit",
        "drepDeposit",
        "drepActivityPeriod"
    ] as const).every(uintKey => canBeUInteger(pp[uintKey]))) return false;

    if (!(
        isRational(pp.poolPledgeInfluence) &&
        isRational(pp.monetaryExpansion) &&
        isRational(pp.treasuryCut) &&
        isRational(pp.minfeeRefScriptCostPerByte)
    )) return false;

    const ppexecCosts = pp.executionUnitPrices;

    if (!(
        (
            Array.isArray(ppexecCosts) &&
            ppexecCosts.length >= 2 &&
            ppexecCosts[0] instanceof CborPositiveRational &&
            ppexecCosts[1] instanceof CborPositiveRational
        ) ||
        (
            isObject(ppexecCosts) &&
            typeof (ppexecCosts as any).priceSteps === "number" &&
            typeof (ppexecCosts as any).priceMemory === "number"
        )
    )) return false;

    if (!(
        pp.maxTxExecutionUnits instanceof ExBudget || ExBudget.isJson(pp.maxTxExecutionUnits) &&
        pp.maxBlockExecutionUnits instanceof ExBudget || ExBudget.isJson(pp.maxBlockExecutionUnits)
    )) return false;

    if (!(
        isCostModels(pp.costModels) &&
        isPParamsPoolVotingThresholds(pp.poolVotingThresholds) &&
        isPParamsDrepVotingThresholds(pp.drepVotingThresholds)
    )) return false;

    return true;
}

export function isPartialConwayProtocolParameters(something: object): something is Partial<ConwayProtocolParameters> {
    if (!isObject(something)) return false;

    const pp: Partial<ConwayProtocolParameters> = something;

    if (!([
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
        "minCommitteSize",
        "committeeTermLimit",
        "governanceActionValidityPeriod",
        "governanceActionDeposit",
        "drepDeposit",
        "drepActivityPeriod"
    ] as const).every(uintKey => pp[uintKey] === undefined || canBeUInteger(pp[uintKey]))) return false;

    if (!(
        isRationalOrUndefined(pp.poolPledgeInfluence) &&
        isRationalOrUndefined(pp.monetaryExpansion) &&
        isRationalOrUndefined(pp.treasuryCut) &&
        isRationalOrUndefined(pp.minfeeRefScriptCostPerByte)
    )) return false;

    const ppexecCosts = pp.executionUnitPrices;

    if (!(
        ppexecCosts === undefined ||
        (
            Array.isArray(ppexecCosts) &&
            ppexecCosts.length >= 2 &&
            ppexecCosts[0] instanceof CborPositiveRational &&
            ppexecCosts[1] instanceof CborPositiveRational
        ) || (
            isObject(ppexecCosts) &&
            typeof (ppexecCosts as any).priceMemory === "number" &&
            typeof (ppexecCosts as any).priceSteps === "number"
        )
    )) return false;

    if (!(
        (
            pp.maxTxExecutionUnits === undefined ||
            pp.maxTxExecutionUnits instanceof ExBudget ||
            ExBudget.isJson(pp.maxTxExecutionUnits)
        ) &&
        (
            pp.maxBlockExecutionUnits === undefined ||
            pp.maxBlockExecutionUnits instanceof ExBudget ||
            ExBudget.isJson(pp.maxBlockExecutionUnits)
        )
    )) return false;

    if (!(
        (pp.costModels === undefined || isCostModels(pp.costModels)) &&
        (pp.poolVotingThresholds === undefined || isPParamsPoolVotingThresholds(pp.poolVotingThresholds)) &&
        (pp.drepVotingThresholds === undefined || isPParamsDrepVotingThresholds(pp.drepVotingThresholds))
    )) return false;

    return true;
}

function mapUIntEntryOrUndefined(tag: number, a: CanBeUInteger | undefined): { k: CborUInt, v: CborUInt } | undefined {
    return a === undefined ? undefined : {
        k: new CborUInt(tag),
        v: new CborUInt(forceBigUInt(a))
    };
}

function fromUIntOrUndef(n: CborObj | undefined): bigint | undefined {
    return n instanceof CborUInt ? n.num : undefined;
}

function kv(k: number, v: CborObj | undefined): CborMapEntry | undefined {
    return v === undefined ? undefined : {
        k: new CborUInt(k),
        v
    };
}

export function partialConwayProtocolParametersToCborObj(pps: Partial<ConwayProtocolParameters>): CborMap {
    const {
        executionUnitPrices,
        maxTxExecutionUnits,
        maxBlockExecutionUnits,
        costModels
    } = pps;

    const costModelsKeys = Object.keys(costModels ?? {});

    return new CborMap([
        mapUIntEntryOrUndefined(0, pps.txFeePerByte),
        mapUIntEntryOrUndefined(1, pps.txFeeFixed),
        mapUIntEntryOrUndefined(2, pps.maxBlockBodySize),
        mapUIntEntryOrUndefined(3, pps.maxTxSize),
        mapUIntEntryOrUndefined(4, pps.maxBlockHeaderSize),
        mapUIntEntryOrUndefined(5, pps.stakeAddressDeposit),
        mapUIntEntryOrUndefined(6, pps.stakePoolDeposit),
        mapUIntEntryOrUndefined(7, pps.poolRetireMaxEpoch),
        mapUIntEntryOrUndefined(8, pps.stakePoolTargetNum),
        kv(9, tryCborFromRational(pps.poolPledgeInfluence)),
        kv(10, tryCborFromRational(pps.monetaryExpansion)),
        kv(11, tryCborFromRational(pps.treasuryCut)),
        mapUIntEntryOrUndefined(16, pps.minPoolCost),
        mapUIntEntryOrUndefined(17, pps.utxoCostPerByte),
        kv(18, 
            (costModels === undefined || 
            (!costModelsKeys.includes("PlutusV1") && !costModelsKeys.includes("PlutusV2") && !costModelsKeys.includes("PlutusV3"))) ?
                undefined :
                costModelsToCborObj(costModels)
        ),
        executionUnitPrices === undefined ? undefined :
        kv(
            19,
            Array.isArray(executionUnitPrices) ? 
                new CborArray(executionUnitPrices) :
                new CborArray([
                    CborPositiveRational.fromNumber(executionUnitPrices.priceMemory),
                    CborPositiveRational.fromNumber(executionUnitPrices.priceSteps),
                ])
        ),
        kv(20, ExBudget.isJson(maxTxExecutionUnits) ? ExBudget.fromJson(maxTxExecutionUnits).toCborObj() : maxTxExecutionUnits?.toCborObj()),
        kv(21, ExBudget.isJson(maxBlockExecutionUnits) ? ExBudget.fromJson(maxBlockExecutionUnits).toCborObj() : maxBlockExecutionUnits?.toCborObj()),
        mapUIntEntryOrUndefined(22, pps.maxValueSize),
        mapUIntEntryOrUndefined(23, pps.collateralPercentage),
        mapUIntEntryOrUndefined(24, pps.maxCollateralInputs),
        pps.poolVotingThresholds ? kv(25, poolVotingThresholdsToCborObj(pps.poolVotingThresholds)) : undefined, 
        pps.drepVotingThresholds ? kv(26, drepVotingThresholdsToCborObj(pps.drepVotingThresholds)) : undefined,
        mapUIntEntryOrUndefined(27, pps.minCommitteSize),
        mapUIntEntryOrUndefined(28, pps.committeeTermLimit),
        mapUIntEntryOrUndefined(29, pps.governanceActionValidityPeriod),
        mapUIntEntryOrUndefined(30, pps.governanceActionDeposit),
        mapUIntEntryOrUndefined(31, pps.drepDeposit),
        mapUIntEntryOrUndefined(32, pps.drepActivityPeriod),
        kv(33, tryCborFromRational(pps.minfeeRefScriptCostPerByte))
    ].filter(elem => elem !== undefined) as CborMapEntry[]);
}

export function partialConwayProtocolParametersToData(pps: Partial<ConwayProtocolParameters>): Data {
    return cborToDataLitteral(partialConwayProtocolParametersToCborObj(pps));
}

function cborToDataLitteral(cbor: CborObj): Data {
    if (cbor instanceof CborPositiveRational) {
        return new DataConstr(0, [new DataI(cbor.num), new DataI(cbor.den)]);
    }
    if (cbor instanceof CborUInt || cbor instanceof CborNegInt) {
        return new DataI(cbor.num);
    }
    if (cbor instanceof CborBytes) {
        return new DataB(cbor.bytes);
    }
    if (cbor instanceof CborText) {
        return new DataB(fromUtf8(cbor.text));
    }
    if (cbor instanceof CborArray) {
        return new DataList(cbor.array.map(cborToDataLitteral));
    }
    if (cbor instanceof CborMap) {
        return new DataMap(
            cbor.map.map(({ k, v }) =>
                new DataPair(
                    cborToDataLitteral(k),
                    cborToDataLitteral(v)
                )
            )
        );
    }
    if (cbor instanceof CborTag) {
        return cborToDataLitteral(cbor.data);
    }
    throw new Error("unsupported cbor for literal data");
}

const maxProtocolParamsEntries = 34;

export function partialConwayProtocolParametersFromCborObj(cObj: CborObj): Partial<ConwayProtocolParameters> {
    if (!(cObj instanceof CborMap))
        throw new Error(`Invalid CBOR format for "Partial<ConwayProtocolParameters>"`);

    let fields: (CborObj | undefined)[] = new Array(maxProtocolParamsEntries).fill(undefined);

    for (let i = 0; i <= maxProtocolParamsEntries; i++) {
        const { v } = (cObj as CborMap).map.find(
            ({ k }) => k instanceof CborUInt && Number(k.num) === i
        ) ?? { v: undefined };

        if (v === undefined) continue;

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
        _14,                       // 14: protocolVersion (removed in Conway)
        _15,                       // 15: minUTxOValue (Shelley/Mary, replaced by utxoCostPerByte)
        _poolMinFee,               // 16: minPoolCost
        _adaPerUtxoByte,           // 17: utxoCostPerByte (Mary/Alonzo, aka lovelacePerUTxOWord in Babbage/Conway)
        _costmdls,                 // 18: costModels (Alonzo/Babbage/Conway)
        _execCosts,                // 19: executionUnitPrices (Alonzo/Babbage/Conway)
        _maxTxExecUnits,           // 20: maxTxExecutionUnits (Alonzo/Babbage/Conway)
        _maxBlockExecUnits,        // 21: maxBlockExecutionUnits (Alonzo/Babbage/Conway)
        _maxValueSize,             // 22: maxValueSize (Mary/Alonzo/Babbage/Conway)
        _collatearalPerc,          // 23: collateralPercentage (Alonzo/Babbage/Conway)
        _maxCollIns,               // 24: maxCollateralInputs (Alonzo/Babbage/Conway)
        _poolVotingThresholds,     // 25: poolVotingThresholds (Conway)
        _drepVotingThresholds,     // 26: drepVotingThresholds (Conway)
        _minCommitteSize,          // 27: minCommitteSize (Conway)
        _committeeTermLimit,       // 28: committeeTermLimit (Conway)
        _govActionValidityPeriod,  // 29: governanceActionValidityPeriod (Conway)
        _govActionDeposit,         // 30: governanceActionDeposit (Conway)
        _drepDeposit,              // 31: drepDeposit (Conway)
        _drepActivityPeriod,       // 32: drepActivityPeriod (Conway)
        _minfeeRefScriptCostPerByte // 33: minfeeRefScriptCostPerByte (Conway)
    ] = fields;

    let executionUnitPrices: [CborPositiveRational, CborPositiveRational] | undefined = undefined;
    if (_execCosts instanceof CborArray) {
        const mem_price = CborPositiveRational.fromCborObjOrUndef(_execCosts.array[0]);
        const cpu_price = CborPositiveRational.fromCborObjOrUndef(_execCosts.array[1]);
        executionUnitPrices = mem_price !== undefined && cpu_price !== undefined ? [mem_price, cpu_price] : undefined;
    }

    const _costModels = costModelsFromCborObj(_costmdls);

    return {
        txFeePerByte: fromUIntOrUndef(_minFeeCoeff),
        txFeeFixed: fromUIntOrUndef(_minFeeFix),
        maxBlockBodySize: fromUIntOrUndef(_maxBlockBodySize),
        maxTxSize: fromUIntOrUndef(_maxTxSize),
        maxBlockHeaderSize: fromUIntOrUndef(_maxBlockHeaderSize),
        stakeAddressDeposit: fromUIntOrUndef(_keyDep),
        stakePoolDeposit: fromUIntOrUndef(_poolDep),
        poolRetireMaxEpoch: fromUIntOrUndef(_epoch),
        stakePoolTargetNum: fromUIntOrUndef(_kParam),
        poolPledgeInfluence: CborPositiveRational.fromCborObjOrUndef(_pledgeInfluence),
        monetaryExpansion: CborPositiveRational.fromCborObjOrUndef(_expansionRate),
        treasuryCut: CborPositiveRational.fromCborObjOrUndef(_treasureryGrowthRate),
        minPoolCost: fromUIntOrUndef(_poolMinFee),
        utxoCostPerByte: fromUIntOrUndef(_adaPerUtxoByte),
        costModels: Object.keys(_costModels).length === 0 ? undefined : _costModels,
        executionUnitPrices,
        maxTxExecutionUnits: _maxTxExecUnits === undefined ? undefined : ExBudget.fromCborObj(_maxTxExecUnits),
        maxBlockExecutionUnits: _maxBlockExecUnits === undefined ? undefined : ExBudget.fromCborObj(_maxBlockExecUnits),
        maxValueSize: fromUIntOrUndef(_maxValueSize),
        collateralPercentage: fromUIntOrUndef(_collatearalPerc),
        maxCollateralInputs: fromUIntOrUndef(_maxCollIns),
        poolVotingThresholds: tryGetPParamsPoolVotingThresholdsFromCborObj(_poolVotingThresholds),
        drepVotingThresholds: tryGetPParamsDrepVotingThresholdsFromCborObj(_drepVotingThresholds),
        minCommitteSize: fromUIntOrUndef(_minCommitteSize),
        committeeTermLimit: fromUIntOrUndef(_committeeTermLimit),
        governanceActionValidityPeriod: fromUIntOrUndef(_govActionValidityPeriod),
        governanceActionDeposit: fromUIntOrUndef(_govActionDeposit),
        drepDeposit: fromUIntOrUndef(_drepDeposit),
        drepActivityPeriod: fromUIntOrUndef(_drepActivityPeriod),
        minfeeRefScriptCostPerByte: tryCborFromRational(_minfeeRefScriptCostPerByte)
    };
}

export const defaultConwayProtocolParameters: ConwayProtocolParameters = freezeAll({
    txFeePerByte: 44, // minFeeA, fixed fee component (historical value for Conway)
    txFeeFixed: 155381, // minFeeB, per-byte fee component (historical value for Conway)
    maxBlockBodySize: 90112, // Consistent with Babbage, may be adjusted (historical approximation)
    maxTxSize: 16384, // Unchanged from previous eras
    maxBlockHeaderSize: 1100, // Unchanged from previous eras
    stakeAddressDeposit: 2_000_000, // 2 ADA, unchanged
    stakePoolDeposit: 500_000_000, // 500 ADA, unchanged
    poolRetireMaxEpoch: 18, // Unchanged
    stakePoolTargetNum: 500, // Unchanged from Mary/Alonzo/Babbage
    poolPledgeInfluence: new CborPositiveRational(3, 10), // 0.3, unchanged
    monetaryExpansion: new CborPositiveRational(3, 1000), // 0.003, unchanged
    treasuryCut: new CborPositiveRational(2, 10), // 0.2, unchanged
    minPoolCost: 340_000_000, // 340 ADA, unchanged
    utxoCostPerByte: 4310, // Consistent with Babbage (lovelacePerUTxOWord, historical approximation)
    costModels: {
        PlutusScriptV1: defaultV1Costs, // Plutus V1 cost model (from Alonzo)
        PlutusScriptV2: defaultV2Costs, // Plutus V2 cost model (from Babbage/Vasil)
        PlutusScriptV3: defaultV3Costs  // Plutus V3, potentially introduced or updated in Conway or prior
    },
    executionUnitPrices: [
        CborPositiveRational.fromNumber(0.0577), // Memory price (historical approximation)
        CborPositiveRational.fromNumber(0.0000721) // CPU/Steps price (historical approximation)
    ],
    maxTxExecutionUnits: new ExBudget({ mem: 14_000_000, cpu: 11_500_000_000 }), // Consistent with Babbage
    maxBlockExecutionUnits: new ExBudget({ mem: 62_000_000, cpu: 50_000_000_000 }), // Consistent with Babbage
    maxValueSize: 5000, // Unchanged, relevant for multi-asset and script data
    collateralPercentage: 150, // Unchanged, percentage of fee as collateral
    maxCollateralInputs: 3, // Unchanged, maximum number of collateral inputs
    // Conway governance parameters (approximate values based on initial settings or reasonable defaults)
    poolVotingThresholds: {
        committeeNormal: CborPositiveRational.fromNumber(0.51),
        committeeNoConfidence: CborPositiveRational.fromNumber(0.51),
        hardForkInitiation: CborPositiveRational.fromNumber(0.51),
        motionNoConfidence: CborPositiveRational.fromNumber(0.51),
        securityRelevantVotingThresholds: CborPositiveRational.fromNumber(0.51)
    } as PParamsPoolVotingThresholds,
    drepVotingThresholds: {
        motionNoConfidence: CborPositiveRational.fromNumber(0.51),
        committeeNormal: CborPositiveRational.fromNumber(0.51),
        committeeNoConfidence: CborPositiveRational.fromNumber(0.51),
        updateConstitution: CborPositiveRational.fromNumber(0.51),
        hardForkInitiation: CborPositiveRational.fromNumber(0.51),
        ppNetworkGroup: CborPositiveRational.fromNumber(0.51),
        ppEconomicGroup: CborPositiveRational.fromNumber(0.51),
        ppTechnicalGroup: CborPositiveRational.fromNumber(0.51),
        ppGovGroup: CborPositiveRational.fromNumber(0.51),
        treasuryWithdrawal: CborPositiveRational.fromNumber(0.51)
    } as PParamsDrepVotingThresholds,
    minCommitteSize: 7, // Reasonable default for minimum constitutional committee size
    committeeTermLimit: 200, // Epochs, reasonable term limit for committee members
    governanceActionValidityPeriod: 10, // Epochs, validity period for governance actions
    governanceActionDeposit: 1_000_000_000, // 1000 ADA, deposit for governance actions (approximation)
    drepDeposit: 2_000_000, // 2 ADA, deposit for DRep registration (consistent with stake key deposit)
    drepActivityPeriod: 20, // Epochs, activity period for DReps before becoming inactive
    minfeeRefScriptCostPerByte: CborPositiveRational.fromNumber(0.5) // Cost per byte for reference scripts (approximation)
} as ConwayProtocolParameters);

export function partialConwayProtocolParamsToJson(pp: Partial<ConwayProtocolParameters>) {
    return {
        ...pp,
        poolPledgeInfluence: typeof pp.poolPledgeInfluence === "number" ? pp.poolPledgeInfluence : pp.poolPledgeInfluence?.toNumber(),
        monetaryExpansion: typeof pp.monetaryExpansion === "number" ? pp.monetaryExpansion : pp.monetaryExpansion?.toNumber(),
        treasuryCut: typeof pp.treasuryCut === "number" ? pp.treasuryCut : pp.treasuryCut?.toNumber(),
        costModels: pp.costModels === undefined ? undefined : costModelsToJson(pp.costModels),
        executionUnitPrices: Array.isArray(pp.executionUnitPrices) ?
            {
                priceSteps: pp.executionUnitPrices[1].toNumber(),
                priceMemory: pp.executionUnitPrices[0].toNumber()
            } :
            pp.executionUnitPrices,
        maxTxExecutionUnits: ExBudget.isJson(pp.maxTxExecutionUnits) ? pp.maxTxExecutionUnits : pp.maxTxExecutionUnits?.toJson(),
        maxBlockExecutionUnits: ExBudget.isJson(pp.maxBlockExecutionUnits) ? pp.maxBlockExecutionUnits : pp.maxBlockExecutionUnits?.toJson(),
    };
}
