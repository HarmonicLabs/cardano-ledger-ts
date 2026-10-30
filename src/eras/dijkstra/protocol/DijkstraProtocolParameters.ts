import { fromUtf8 } from '@harmoniclabs/uint8array-utils';
import { toLocalCborObj } from '../../../utils/strictCbor';
import { ExBudget, ExBudgetJson } from '@harmoniclabs/plutus-machine';
import { freezeAll, hasOwn, isObject } from '@harmoniclabs/obj-utils';
import { Data, DataB, DataConstr, DataI, DataList, DataMap, DataPair } from '@harmoniclabs/plutus-data';
import { CborPositiveRational, CborUInt, CborObj, CborMapEntry, CborMap, CborArray, CborNegInt, CborBytes, CborTag, CborText, CborSimple } from '@harmoniclabs/cbor';
import { CostModels, costModelsToCborObj, costModelsToJson, defaultV1Costs, defaultV2Costs, defaultV3Costs, isCostModels, toCostModelV1, toCostModelV2, toCostModelV3 } from '@harmoniclabs/cardano-costmodels-ts';
import { defaultDijkstraPlutusV4CostModel, DIJKSTRA_PLUTUS_V4_COST_MODEL_LENGTH } from './DijkstraV4CostModel';
import type { Epoch } from '../../common/ledger/Epoch';
import type { Coin } from '../../common/ledger/Coin';
import { CanBeUInteger } from '../../../utils/ints';
import { DijkstraPParamsPoolVotingThresholds, isDijkstraPParamsPoolVotingThresholds, dijkstraPoolVotingThresholdsToCborObj, tryGetDijkstraPParamsPoolVotingThresholdsFromCborObj } from './DijkstraPParamsPoolVotingThresholds';
import { DijkstraPParamsDrepVotingThresholds, isDijkstraPParamsDrepVotingThresholds, dijkstraDrepVotingThresholdsToCborObj, tryGetDijkstraPParamsDrepVotingThresholdsFromCborObj } from './DijkstraPParamsDrepVotingThresholds';
import { Rational, isRational, isRationalOrUndefined, tryCborFromRational } from '../../common';

export interface DijkstraCostModels extends CostModels {
	/**
	 * Plutus V4 cost model (`cost_models` language key 3), raw int64 values.
	 * `cardano-ledger` reuses the Plutus V3 parameter names and initialises
	 * genesis files with 251 values; PP updates may carry more.
	 */
	PlutusScriptV4?: number[];
}

export interface DijkstraProtocolParameters {
	txFeePerByte: CanBeUInteger;
	txFeeFixed: CanBeUInteger;
	maxBlockBodySize: CanBeUInteger;
	maxTxSize: CanBeUInteger;
	maxBlockHeaderSize: CanBeUInteger;
	stakeAddressDeposit: Coin;
	stakePoolDeposit: Coin;
	poolRetireMaxEpoch: Epoch;
	stakePoolTargetNum: CanBeUInteger;
	poolPledgeInfluence: Rational;
	monetaryExpansion: Rational;
	treasuryCut: Rational;
	/** @deprecated protocolVersion removed in Dijkstra */
	// protocolVersion?: IProtocolVersion,
	minPoolCost: Coin;
	utxoCostPerByte: Coin;
	costModels: DijkstraCostModels;
	executionUnitPrices:
		| [mem_price: CborPositiveRational, step_price: CborPositiveRational]
		| {
				priceMemory: number;
				priceSteps: number;
		  };
	maxTxExecutionUnits: ExBudget | ExBudgetJson;
	maxBlockExecutionUnits: ExBudget | ExBudgetJson;
	maxValueSize: CanBeUInteger;
	collateralPercentage: CanBeUInteger;
	maxCollateralInputs: CanBeUInteger;
	// Dijkstra (governance params)
	poolVotingThresholds: DijkstraPParamsPoolVotingThresholds;
	drepVotingThresholds: DijkstraPParamsDrepVotingThresholds;
	minCommitteSize: CanBeUInteger;
	committeeTermLimit: Epoch;
	governanceActionValidityPeriod: Epoch;
	governanceActionDeposit: Epoch;
	drepDeposit: Coin;
	drepActivityPeriod: Epoch;
	minfeeRefScriptCostPerByte: Rational;
	// Dijkstra reference-script limits and cost function (keys 34-37)
	maxRefScriptSizePerBlock?: CanBeUInteger;
	maxRefScriptSizePerTx?: CanBeUInteger;
	refScriptCostStride?: CanBeUInteger;
	refScriptCostMultiplier?: Rational;
	// Dijkstra stake-pool economics (keys 38-39)
	maxPledgeLeverage?: Rational | null;
	minPoolMargin?: Rational;
	// Linear Leios (keys 40-44)
	leiosAnnouncementPeriodLength?: CanBeUInteger;
	leiosVotePeriodLength?: CanBeUInteger;
	leiosDiffusionPeriodLength?: CanBeUInteger;
	leiosCommitteeSize?: CanBeUInteger;
	leiosQuorumStakeThreshold?: Rational;
	// Endorser-block limits (keys 45-48)
	maxEndorserBlockReferencesSize?: CanBeUInteger;
	maxEndorserBlockTxsSize?: CanBeUInteger;
	maxEndorserBlockExecutionUnits?: ExBudget | ExBudgetJson;
	maxRefScriptSizePerEndorserBlock?: CanBeUInteger;
	// Peras codec extensions (keys 49-54), inactive until the phase-2 fork
	perasMinCandidateBlockAge?: CanBeUInteger;
	perasHealingFactor?: Rational;
	perasCertBoost?: CanBeUInteger;
	perasTargetCommitteeSize?: CanBeUInteger;
	perasBootstrapRound?: CanBeUInteger | null;
	perasQuorumThresholdSafetyMargin?: Rational;
	// Reference-input fee function (keys 55-56)
	refInputsCostPerMultiAssetPolicy?: Coin;
	refInputsCostPerDatumByte?: Coin;
}

function isInt64Value( n: any ): n is number | bigint
{
	const MIN = BigInt( "-9223372036854775808" ), MAX = BigInt( "9223372036854775807" );
	if( typeof n === "bigint" ) return n >= MIN && n <= MAX;
	return typeof n === "number" && Number.isSafeInteger( n ) && n >= Number( MIN ) && n <= Number( MAX );
}

/** `cost_models` may carry Plutus V1/V2/V3 (cardano-costmodels-ts) and Dijkstra's V4 raw array (key 3). */
export function isDijkstraCostModels( something: any ): something is DijkstraCostModels
{
	if( !isObject( something ) ) return false;
	const hasBase = isCostModels( something );
	const hasV4 = hasOwn( something, 'PlutusScriptV4' );
	if( !hasBase && !hasV4 ) return false;
	if( hasV4 )
	{
		const v4 = something.PlutusScriptV4;
		if( !Array.isArray( v4 ) || !v4.every( isInt64Value ) ) return false;
	}
	return true;
}

const MAX_UINT64 = BigInt( "18446744073709551615" );

/** exact non-negative uint64: bigint, or a safe-integer number (coins exceed uint32 as numbers) */
function isUInt64Value( value: any ): value is number | bigint
{
	if( typeof value === "bigint" ) return value >= BigInt( 0 ) && value <= MAX_UINT64;
	if( typeof value !== "number" ) return false;
	if( !Number.isSafeInteger( value ) || value < 0 ) return false;
	const n = BigInt( value );
	return n >= BigInt( 0 ) && n <= MAX_UINT64;
}

function bigUIntOf( n: CanBeUInteger ): bigint
{
	if( typeof n === "bigint" )
	{
		if( n < BigInt( 0 ) || n > MAX_UINT64 ) throw new Error( "uint64 out of range" );
		return n;
	}
	if( typeof n === "number" && Number.isSafeInteger( n ) && n >= 0 )
	return BigInt( n );
	throw new Error( "invalid uint64: expected a non-negative safe integer or bigint" );
}

function isUIntOrUndefined( value: any ): boolean
{
	return value === undefined || isUInt64Value( value );
}

function isUIntRangeOrUndefined( value: any, max: bigint ): boolean
{
	if( value === undefined ) return true;
	if( !isUInt64Value( value ) ) return false;
	const n = bigUIntOf( value );
	return n >= BigInt( 0 ) && n <= max;
}

function isUInt32OrUndefined( value: any ): boolean
{
	return isUIntRangeOrUndefined( value, BigInt( 0xffffffff ) );
}

function isUInt16OrUndefined( value: any ): boolean
{
	return isUIntRangeOrUndefined( value, BigInt( 0xffff ) );
}

function isPositiveUInt32OrUndefined( value: any ): boolean
{
	if( value === undefined ) return true;
	if( !isUInt64Value( value ) ) return false;
	const n = bigUIntOf( value );
	return n >= BigInt( 1 ) && n <= BigInt( 0xffffffff );
}

function isRationalOrNullOrUndefined( value: any ): boolean
{
	return value === undefined || value === null || isRational( value );
}

function isExBudgetOrJsonOrUndefined( value: any ): boolean
{
	return value === undefined || value instanceof ExBudget || ExBudget.isJson( value );
}

function hasValidOptionalDijkstraFields( pp: Partial<DijkstraProtocolParameters> ): boolean
{
	if( pp.costModels !== undefined && !isDijkstraCostModels( pp.costModels ) ) return false;

	if( ![
		'maxRefScriptSizePerBlock', 'maxRefScriptSizePerTx',
		'leiosAnnouncementPeriodLength', 'leiosVotePeriodLength', 'leiosDiffusionPeriodLength',
		'maxEndorserBlockReferencesSize', 'maxEndorserBlockTxsSize', 'maxRefScriptSizePerEndorserBlock',
		'perasMinCandidateBlockAge',
	].every( ( k ) => isUInt32OrUndefined( pp[k as keyof DijkstraProtocolParameters] ) ) ) return false;

	if( ![
		'leiosCommitteeSize', 'perasCertBoost', 'perasTargetCommitteeSize',
	].every( ( k ) => isUInt16OrUndefined( pp[k as keyof DijkstraProtocolParameters] ) ) ) return false;

	if( !isPositiveUInt32OrUndefined( pp.refScriptCostStride ) ) return false;
	if( !isRationalOrNullOrUndefined( pp.refScriptCostMultiplier ) ) return false;
	if( !isRationalOrNullOrUndefined( pp.minPoolMargin ) ) return false;
	if( !isRationalOrNullOrUndefined( pp.leiosQuorumStakeThreshold ) ) return false;
	if( !isRationalOrNullOrUndefined( pp.perasHealingFactor ) ) return false;
	if( !isRationalOrNullOrUndefined( pp.perasQuorumThresholdSafetyMargin ) ) return false;
	if( !( pp.maxPledgeLeverage === undefined || pp.maxPledgeLeverage === null || isRational( pp.maxPledgeLeverage ) ) ) return false;
	if( !isExBudgetOrJsonOrUndefined( pp.maxEndorserBlockExecutionUnits ) ) return false;
	if( !( pp.perasBootstrapRound === undefined || pp.perasBootstrapRound === null || isUInt32OrUndefined( pp.perasBootstrapRound ) ) ) return false;
	if( !isUIntOrUndefined( pp.refInputsCostPerMultiAssetPolicy ) ) return false;
	if( !isUIntOrUndefined( pp.refInputsCostPerDatumByte ) ) return false;

	return true;
}

export function isDijkstraProtocolParameters(something: any): something is DijkstraProtocolParameters {
	const expectedKeys = [
		'txFeePerByte',
		'txFeeFixed',
		'maxBlockBodySize',
		'maxTxSize',
		'maxBlockHeaderSize',
		'stakeAddressDeposit',
		'stakePoolDeposit',
		'poolRetireMaxEpoch',
		'stakePoolTargetNum',
		'poolPledgeInfluence',
		'monetaryExpansion',
		'treasuryCut',
		// protocolVersion removed in Dijkstra
		// "protocolVersion",
		'minPoolCost',
		'utxoCostPerByte',
		'costModels',
		'executionUnitPrices',
		'maxTxExecutionUnits',
		'maxBlockExecutionUnits',
		'maxValueSize',
		'collateralPercentage',
		'maxCollateralInputs',
		'poolVotingThresholds',
		'drepVotingThresholds',
		'minCommitteSize',
		'committeeTermLimit',
		'governanceActionValidityPeriod',
		'governanceActionDeposit',
		'drepDeposit',
		'drepActivityPeriod',
		'minfeeRefScriptCostPerByte',
	] as const;

	const actualKeys = Object.keys(something);

	if (!expectedKeys.every((k) => actualKeys.includes(k))) return false;

	const pp: DijkstraProtocolParameters = something;

	if (!(['txFeePerByte', 'txFeeFixed', 'maxBlockBodySize', 'maxTxSize', 'maxBlockHeaderSize', 'stakeAddressDeposit', 'stakePoolDeposit', 'poolRetireMaxEpoch', 'stakePoolTargetNum', 'minPoolCost', 'utxoCostPerByte', 'maxValueSize', 'collateralPercentage', 'maxCollateralInputs', 'minCommitteSize', 'committeeTermLimit', 'governanceActionValidityPeriod', 'governanceActionDeposit', 'drepDeposit', 'drepActivityPeriod'] as const).every((uintKey) => isUInt64Value(pp[uintKey]))) return false;

	if (!(isRational(pp.poolPledgeInfluence) && isRational(pp.monetaryExpansion) && isRational(pp.treasuryCut) && isRational(pp.minfeeRefScriptCostPerByte))) return false;

	const ppexecCosts = pp.executionUnitPrices;

	if (!((Array.isArray(ppexecCosts) && ppexecCosts.length >= 2 && ppexecCosts[0] instanceof CborPositiveRational && ppexecCosts[1] instanceof CborPositiveRational) || (isObject(ppexecCosts) && typeof (ppexecCosts as any).priceSteps === 'number' && typeof (ppexecCosts as any).priceMemory === 'number'))) return false;

	if (!(pp.maxTxExecutionUnits instanceof ExBudget || (ExBudget.isJson(pp.maxTxExecutionUnits) && pp.maxBlockExecutionUnits instanceof ExBudget) || ExBudget.isJson(pp.maxBlockExecutionUnits))) return false;

	if (!(isDijkstraCostModels(pp.costModels) && isDijkstraPParamsPoolVotingThresholds(pp.poolVotingThresholds) && isDijkstraPParamsDrepVotingThresholds(pp.drepVotingThresholds))) return false;

	if (!hasValidOptionalDijkstraFields(pp)) return false;

	return true;
}

export function isPartialDijkstraProtocolParameters(something: object): something is Partial<DijkstraProtocolParameters> {
	if (!isObject(something)) return false;

	const pp: Partial<DijkstraProtocolParameters> = something;

	if (!(['txFeePerByte', 'txFeeFixed', 'maxBlockBodySize', 'maxTxSize', 'maxBlockHeaderSize', 'stakeAddressDeposit', 'stakePoolDeposit', 'poolRetireMaxEpoch', 'stakePoolTargetNum', 'minPoolCost', 'utxoCostPerByte', 'maxValueSize', 'collateralPercentage', 'maxCollateralInputs', 'minCommitteSize', 'committeeTermLimit', 'governanceActionValidityPeriod', 'governanceActionDeposit', 'drepDeposit', 'drepActivityPeriod'] as const).every((uintKey) => isUInt64Value(pp[uintKey]))) return false;

	if (!(isRationalOrUndefined(pp.poolPledgeInfluence) && isRationalOrUndefined(pp.monetaryExpansion) && isRationalOrUndefined(pp.treasuryCut) && isRationalOrUndefined(pp.minfeeRefScriptCostPerByte))) return false;

	const ppexecCosts = pp.executionUnitPrices;

	if (!(ppexecCosts === undefined || (Array.isArray(ppexecCosts) && ppexecCosts.length >= 2 && ppexecCosts[0] instanceof CborPositiveRational && ppexecCosts[1] instanceof CborPositiveRational) || (isObject(ppexecCosts) && typeof (ppexecCosts as any).priceMemory === 'number' && typeof (ppexecCosts as any).priceSteps === 'number'))) return false;

	if (!((pp.maxTxExecutionUnits === undefined || pp.maxTxExecutionUnits instanceof ExBudget || ExBudget.isJson(pp.maxTxExecutionUnits)) && (pp.maxBlockExecutionUnits === undefined || pp.maxBlockExecutionUnits instanceof ExBudget || ExBudget.isJson(pp.maxBlockExecutionUnits)))) return false;

	if (!((pp.costModels === undefined || isDijkstraCostModels(pp.costModels)) && (pp.poolVotingThresholds === undefined || isDijkstraPParamsPoolVotingThresholds(pp.poolVotingThresholds)) && (pp.drepVotingThresholds === undefined || isDijkstraPParamsDrepVotingThresholds(pp.drepVotingThresholds)))) return false;

	if (!hasValidOptionalDijkstraFields(pp)) return false;

	return true;
}

function mapUIntEntryOrUndefined(tag: number, a: CanBeUInteger | undefined): { k: CborUInt; v: CborUInt } | undefined {
	return a === undefined
		? undefined
		: {
				k: new CborUInt(tag),
				v: new CborUInt(bigUIntOf(a)),
			};
}

function fromUIntOrUndef(n: CborObj | undefined): bigint | undefined {
	return n instanceof CborUInt ? n.num : undefined;
}

function fromUInt16OrUndef(n: CborObj | undefined): number | undefined {
	if (!(n instanceof CborUInt) || n.num > BigInt(0xffff)) return undefined;
	return Number(n.num);
}

function fromUInt32OrUndef(n: CborObj | undefined): number | undefined {
	if (!(n instanceof CborUInt) || n.num > BigInt(0xffffffff)) return undefined;
	return Number(n.num);
}

function fromNilOrUInt32OrUndef(n: CborObj | undefined): number | null | undefined {
	if (n === undefined) return undefined;
	if (n instanceof CborSimple && n.simple === null) return null;
	return fromUInt32OrUndef(n);
}

function fromRationalOrNullOrUndef(n: CborObj | undefined): Rational | null | undefined {
	if (n === undefined) return undefined;
	if (n instanceof CborSimple && n.simple === null) return null;
	return CborPositiveRational.fromCborObjOrUndef(n);
}

function kv(k: number, v: CborObj | undefined): CborMapEntry | undefined {
	return v === undefined
		? undefined
		: {
				k: new CborUInt(k),
				v,
			};
}

function mapUInt16EntryOrUndefined(tag: number, a: CanBeUInteger | undefined): CborMapEntry | undefined {
	if (a === undefined) return undefined;
	const n = bigUIntOf(a);
	if (n > BigInt(0xffff)) throw new Error(`Dijkstra PP key ${tag}: uint16 out of range`);
	return { k: new CborUInt(tag), v: new CborUInt(n) };
}

function mapUInt32EntryOrUndefined(tag: number, a: CanBeUInteger | undefined): CborMapEntry | undefined {
	if (a === undefined) return undefined;
	const n = bigUIntOf(a);
	if (n > BigInt(0xffffffff)) throw new Error(`Dijkstra PP key ${tag}: uint32 out of range`);
	return { k: new CborUInt(tag), v: new CborUInt(n) };
}

function mapPositiveUInt32EntryOrUndefined(tag: number, a: CanBeUInteger | undefined): CborMapEntry | undefined {
	if (a === undefined) return undefined;
	const n = bigUIntOf(a);
	if (n < BigInt(1) || n > BigInt(0xffffffff)) throw new Error(`Dijkstra PP key ${tag}: positive uint32 out of range`);
	return { k: new CborUInt(tag), v: new CborUInt(n) };
}

function mapNilOrUInt32EntryOrUndefined(tag: number, a: CanBeUInteger | null | undefined): CborMapEntry | undefined {
	if (a === undefined) return undefined;
	if (a === null) return { k: new CborUInt(tag), v: new CborSimple(null) };
	return mapUInt32EntryOrUndefined(tag, a);
}

function kvRationalOrNull(tag: number, r: Rational | null | undefined, allowNull: boolean): CborMapEntry | undefined {
	if (r === undefined) return undefined;
	if (r === null) {
		if (!allowNull) throw new Error(`Dijkstra PP key ${tag}: null not allowed`);
		return { k: new CborUInt(tag), v: new CborSimple(null) };
	}
	const cbor = tryCborFromRational(r);
	if (cbor === undefined) throw new Error(`Dijkstra PP key ${tag}: invalid rational`);
	return { k: new CborUInt(tag), v: cbor };
}

function costModelIntToCbor(n: number | bigint): CborObj {
	if (typeof n === "bigint") {
		if (n < BigInt("-9223372036854775808") || n > BigInt("9223372036854775807")) throw new Error("PlutusV4 cost model value out of int64 range");
		return n < BigInt(0) ? new CborNegInt(n) : new CborUInt(n);
	}
	if (!Number.isSafeInteger(n) || n < -9223372036854775808 || n > 9223372036854775807) throw new Error("PlutusV4 cost model value out of int64 range");
	return n < 0 ? new CborNegInt(n) : new CborUInt(n);
}

function dijkstraCostModelsToCborObj(costModels: DijkstraCostModels): CborMap {
	const base = toLocalCborObj(costModelsToCborObj(costModels)) as CborMap;
	const entries = base.map.slice();
	const v4 = costModels.PlutusScriptV4;
	if (v4 !== undefined) {
		entries.push({
			k: new CborUInt(3),
			v: new CborArray(v4.map(costModelIntToCbor)),
		});
	}
	return new CborMap(entries);
}

export function dijkstraCostModelsFromCborObj(cObj: CborObj | undefined): DijkstraCostModels | undefined {
	if (cObj === undefined) return undefined;
	if (!(cObj instanceof CborMap)) return undefined;
	const seen = new Set<number>();
	let v4: number[] | undefined;
	const base: CostModels = {};

	for (const entry of cObj.map) {
		const { k, v } = entry;
		if (!(k instanceof CborUInt)) return undefined;
		const language = Number(k.num);
		if (language > 255 || seen.has(language)) return undefined;
		seen.add(language);

		if (!(v instanceof CborArray)) return undefined;
		const values: number[] = [];
		for (const value of v.array) {
			if (!(value instanceof CborUInt || value instanceof CborNegInt)) return undefined;
			values.push(Number(value.num));
		}

		if (language === 3) v4 = values;
		else if (language === 0) base.PlutusScriptV1 = toCostModelV1(values as any) as any;
		else if (language === 1) base.PlutusScriptV2 = toCostModelV2(values as any) as any;
		else if (language === 2) base.PlutusScriptV3 = toCostModelV3(values as any) as any;
	}

	if (base.PlutusScriptV1 === undefined && base.PlutusScriptV2 === undefined && base.PlutusScriptV3 === undefined && v4 === undefined) return undefined;
	return { ...base, ...(v4 === undefined ? {} : { PlutusScriptV4: v4 }) } as DijkstraCostModels;
}

export function partialDijkstraProtocolParametersToCborObj(pps: Partial<DijkstraProtocolParameters>): CborMap {
	const { executionUnitPrices, maxTxExecutionUnits, maxBlockExecutionUnits, costModels } = pps;

	return new CborMap(
		[
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
			kv(18, costModels === undefined ? undefined : dijkstraCostModelsToCborObj(costModels)),
			executionUnitPrices === undefined ? undefined : kv(19, Array.isArray(executionUnitPrices) ? new CborArray(executionUnitPrices) : new CborArray([CborPositiveRational.fromNumber(executionUnitPrices.priceMemory), CborPositiveRational.fromNumber(executionUnitPrices.priceSteps)])),
			kv(20, ExBudget.isJson(maxTxExecutionUnits) ? ExBudget.fromJson(maxTxExecutionUnits).toCborObj() : maxTxExecutionUnits?.toCborObj()),
			kv(21, ExBudget.isJson(maxBlockExecutionUnits) ? ExBudget.fromJson(maxBlockExecutionUnits).toCborObj() : maxBlockExecutionUnits?.toCborObj()),
			mapUIntEntryOrUndefined(22, pps.maxValueSize),
			mapUIntEntryOrUndefined(23, pps.collateralPercentage),
			mapUIntEntryOrUndefined(24, pps.maxCollateralInputs),
			pps.poolVotingThresholds ? kv(25, dijkstraPoolVotingThresholdsToCborObj(pps.poolVotingThresholds)) : undefined,
			pps.drepVotingThresholds ? kv(26, dijkstraDrepVotingThresholdsToCborObj(pps.drepVotingThresholds)) : undefined,
			mapUIntEntryOrUndefined(27, pps.minCommitteSize),
			mapUIntEntryOrUndefined(28, pps.committeeTermLimit),
			mapUIntEntryOrUndefined(29, pps.governanceActionValidityPeriod),
			mapUIntEntryOrUndefined(30, pps.governanceActionDeposit),
			mapUIntEntryOrUndefined(31, pps.drepDeposit),
			mapUIntEntryOrUndefined(32, pps.drepActivityPeriod),
			kv(33, tryCborFromRational(pps.minfeeRefScriptCostPerByte)),
			mapUInt32EntryOrUndefined(34, pps.maxRefScriptSizePerBlock),
			mapUInt32EntryOrUndefined(35, pps.maxRefScriptSizePerTx),
			mapPositiveUInt32EntryOrUndefined(36, pps.refScriptCostStride),
			kvRationalOrNull(37, pps.refScriptCostMultiplier, false),
			kvRationalOrNull(38, pps.maxPledgeLeverage, true),
			kvRationalOrNull(39, pps.minPoolMargin, false),
			mapUInt32EntryOrUndefined(40, pps.leiosAnnouncementPeriodLength),
			mapUInt32EntryOrUndefined(41, pps.leiosVotePeriodLength),
			mapUInt32EntryOrUndefined(42, pps.leiosDiffusionPeriodLength),
			mapUInt16EntryOrUndefined(43, pps.leiosCommitteeSize),
			kvRationalOrNull(44, pps.leiosQuorumStakeThreshold, false),
			mapUInt32EntryOrUndefined(45, pps.maxEndorserBlockReferencesSize),
			mapUInt32EntryOrUndefined(46, pps.maxEndorserBlockTxsSize),
			kv(47, ExBudget.isJson(pps.maxEndorserBlockExecutionUnits) ? ExBudget.fromJson(pps.maxEndorserBlockExecutionUnits).toCborObj() : pps.maxEndorserBlockExecutionUnits?.toCborObj()),
			mapUInt32EntryOrUndefined(48, pps.maxRefScriptSizePerEndorserBlock),
			mapUInt32EntryOrUndefined(49, pps.perasMinCandidateBlockAge),
			kvRationalOrNull(50, pps.perasHealingFactor, false),
			mapUInt16EntryOrUndefined(51, pps.perasCertBoost),
			mapUInt16EntryOrUndefined(52, pps.perasTargetCommitteeSize),
			mapNilOrUInt32EntryOrUndefined(53, pps.perasBootstrapRound),
			kvRationalOrNull(54, pps.perasQuorumThresholdSafetyMargin, false),
			mapUIntEntryOrUndefined(55, pps.refInputsCostPerMultiAssetPolicy),
			mapUIntEntryOrUndefined(56, pps.refInputsCostPerDatumByte),
		].filter((elem) => elem !== undefined) as CborMapEntry[]
	);
}

export function partialDijkstraProtocolParametersToData(pps: Partial<DijkstraProtocolParameters>): Data {
	return cborToDataLitteral(partialDijkstraProtocolParametersToCborObj(pps));
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
		return new DataMap(cbor.map.map(({ k, v }) => new DataPair(cborToDataLitteral(k), cborToDataLitteral(v))));
	}
	if (cbor instanceof CborTag) {
		return cborToDataLitteral(cbor.data);
	}
	if (cbor instanceof CborSimple && cbor.simple === null) {
		return new DataConstr(1, []); // Nothing
	}
	throw new Error('unsupported cbor for literal data');
}

const maxProtocolParamsEntries = 57;

export function partialDijkstraProtocolParametersFromCborObj(cObj: CborObj): Partial<DijkstraProtocolParameters> {
	if (!(cObj instanceof CborMap)) throw new Error(`Invalid CBOR format for "Partial<DijkstraProtocolParameters>"`);

	let fields: (CborObj | undefined)[] = new Array(maxProtocolParamsEntries + 1).fill(undefined);

	for (let i = 0; i <= maxProtocolParamsEntries; i++) {
		const { v } = (cObj as CborMap).map.find(({ k }) => k instanceof CborUInt && Number(k.num) === i) ?? { v: undefined };

		if (v === undefined) continue;

		fields[i] = v;
	}

	const [
		_minFeeCoeff, // 0: txFeePerByte
		_minFeeFix, // 1: txFeeFixed
		_maxBlockBodySize, // 2: maxBlockBodySize
		_maxTxSize, // 3: maxTxSize
		_maxBlockHeaderSize, // 4: maxBlockHeaderSize
		_keyDep, // 5: stakeAddressDeposit
		_poolDep, // 6: stakePoolDeposit
		_epoch, // 7: poolRetireMaxEpoch
		_kParam, // 8: stakePoolTargetNum
		_pledgeInfluence, // 9: poolPledgeInfluence
		_expansionRate, // 10: monetaryExpansion
		_treasureryGrowthRate, // 11: treasuryCut
		_12, // 12: decentralization constant (Shelley, removed in later eras)
		_13, // 13: extra entropy (Shelley, removed in later eras)
		_14, // 14: protocolVersion (removed in Dijkstra)
		_15, // 15: minUTxOValue (Shelley/Mary, replaced by utxoCostPerByte)
		_poolMinFee, // 16: minPoolCost
		_adaPerUtxoByte, // 17: utxoCostPerByte (Mary/Alonzo, aka lovelacePerUTxOWord in Babbage/Dijkstra)
		_costmdls, // 18: costModels (Alonzo/Babbage/Dijkstra)
		_execCosts, // 19: executionUnitPrices (Alonzo/Babbage/Dijkstra)
		_maxTxExecUnits, // 20: maxTxExecutionUnits (Alonzo/Babbage/Dijkstra)
		_maxBlockExecUnits, // 21: maxBlockExecutionUnits (Alonzo/Babbage/Dijkstra)
		_maxValueSize, // 22: maxValueSize (Mary/Alonzo/Babbage/Dijkstra)
		_collatearalPerc, // 23: collateralPercentage (Alonzo/Babbage/Dijkstra)
		_maxCollIns, // 24: maxCollateralInputs (Alonzo/Babbage/Dijkstra)
		_poolVotingThresholds, // 25: poolVotingThresholds (Dijkstra)
		_drepVotingThresholds, // 26: drepVotingThresholds (Dijkstra)
		_minCommitteSize, // 27: minCommitteSize (Dijkstra)
		_committeeTermLimit, // 28: committeeTermLimit (Dijkstra)
		_govActionValidityPeriod, // 29: governanceActionValidityPeriod (Dijkstra)
		_govActionDeposit, // 30: governanceActionDeposit (Dijkstra)
		_drepDeposit, // 31: drepDeposit (Dijkstra)
		_drepActivityPeriod, // 32: drepActivityPeriod (Dijkstra)
		_minfeeRefScriptCostPerByte, // 33: minfeeRefScriptCostPerByte (Dijkstra)
		_maxRefScriptSizePerBlock, // 34: maxRefScriptSizePerBlock
		_maxRefScriptSizePerTx, // 35: maxRefScriptSizePerTx
		_refScriptCostStride, // 36: refScriptCostStride
		_refScriptCostMultiplier, // 37: refScriptCostMultiplier
		_maxPledgeLeverage, // 38: maxPledgeLeverage
		_minPoolMargin, // 39: minPoolMargin
		_leiosAnnouncementPeriodLength, // 40
		_leiosVotePeriodLength, // 41
		_leiosDiffusionPeriodLength, // 42
		_leiosCommitteeSize, // 43
		_leiosQuorumStakeThreshold, // 44
		_maxEndorserBlockReferencesSize, // 45
		_maxEndorserBlockTxsSize, // 46
		_maxEndorserBlockExecutionUnits, // 47
		_maxRefScriptSizePerEndorserBlock, // 48
		_perasMinCandidateBlockAge, // 49
		_perasHealingFactor, // 50
		_perasCertBoost, // 51
		_perasTargetCommitteeSize, // 52
		_perasBootstrapRound, // 53
		_perasQuorumThresholdSafetyMargin, // 54
		_refInputsCostPerMultiAssetPolicy, // 55
		_refInputsCostPerDatumByte, // 56
	] = fields;

	let executionUnitPrices: [CborPositiveRational, CborPositiveRational] | undefined = undefined;
	if (_execCosts instanceof CborArray) {
		const mem_price = CborPositiveRational.fromCborObjOrUndef(_execCosts.array[0]);
		const cpu_price = CborPositiveRational.fromCborObjOrUndef(_execCosts.array[1]);
		executionUnitPrices = mem_price !== undefined && cpu_price !== undefined ? [mem_price, cpu_price] : undefined;
	}

	const _costModels = dijkstraCostModelsFromCborObj(_costmdls);

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
		costModels: _costModels,
		executionUnitPrices,
		maxTxExecutionUnits: _maxTxExecUnits === undefined ? undefined : ExBudget.fromCborObj(_maxTxExecUnits),
		maxBlockExecutionUnits: _maxBlockExecUnits === undefined ? undefined : ExBudget.fromCborObj(_maxBlockExecUnits),
		maxValueSize: fromUIntOrUndef(_maxValueSize),
		collateralPercentage: fromUIntOrUndef(_collatearalPerc),
		maxCollateralInputs: fromUIntOrUndef(_maxCollIns),
		poolVotingThresholds: tryGetDijkstraPParamsPoolVotingThresholdsFromCborObj(_poolVotingThresholds),
		drepVotingThresholds: tryGetDijkstraPParamsDrepVotingThresholdsFromCborObj(_drepVotingThresholds),
		minCommitteSize: fromUIntOrUndef(_minCommitteSize),
		committeeTermLimit: fromUIntOrUndef(_committeeTermLimit),
		governanceActionValidityPeriod: fromUIntOrUndef(_govActionValidityPeriod),
		governanceActionDeposit: fromUIntOrUndef(_govActionDeposit),
		drepDeposit: fromUIntOrUndef(_drepDeposit),
		drepActivityPeriod: fromUIntOrUndef(_drepActivityPeriod),
		minfeeRefScriptCostPerByte: CborPositiveRational.fromCborObjOrUndef(_minfeeRefScriptCostPerByte),
		maxRefScriptSizePerBlock: fromUInt32OrUndef(_maxRefScriptSizePerBlock),
		maxRefScriptSizePerTx: fromUInt32OrUndef(_maxRefScriptSizePerTx),
		refScriptCostStride: fromUInt32OrUndef(_refScriptCostStride),
		refScriptCostMultiplier: CborPositiveRational.fromCborObjOrUndef(_refScriptCostMultiplier),
		maxPledgeLeverage: fromRationalOrNullOrUndef(_maxPledgeLeverage),
		minPoolMargin: CborPositiveRational.fromCborObjOrUndef(_minPoolMargin),
		leiosAnnouncementPeriodLength: fromUInt32OrUndef(_leiosAnnouncementPeriodLength),
		leiosVotePeriodLength: fromUInt32OrUndef(_leiosVotePeriodLength),
		leiosDiffusionPeriodLength: fromUInt32OrUndef(_leiosDiffusionPeriodLength),
		leiosCommitteeSize: fromUInt16OrUndef(_leiosCommitteeSize),
		leiosQuorumStakeThreshold: CborPositiveRational.fromCborObjOrUndef(_leiosQuorumStakeThreshold),
		maxEndorserBlockReferencesSize: fromUInt32OrUndef(_maxEndorserBlockReferencesSize),
		maxEndorserBlockTxsSize: fromUInt32OrUndef(_maxEndorserBlockTxsSize),
		maxEndorserBlockExecutionUnits: _maxEndorserBlockExecutionUnits === undefined ? undefined : ExBudget.fromCborObj(_maxEndorserBlockExecutionUnits),
		maxRefScriptSizePerEndorserBlock: fromUInt32OrUndef(_maxRefScriptSizePerEndorserBlock),
		perasMinCandidateBlockAge: fromUInt32OrUndef(_perasMinCandidateBlockAge),
		perasHealingFactor: CborPositiveRational.fromCborObjOrUndef(_perasHealingFactor),
		perasCertBoost: fromUInt16OrUndef(_perasCertBoost),
		perasTargetCommitteeSize: fromUInt16OrUndef(_perasTargetCommitteeSize),
		perasBootstrapRound: fromNilOrUInt32OrUndef(_perasBootstrapRound),
		perasQuorumThresholdSafetyMargin: CborPositiveRational.fromCborObjOrUndef(_perasQuorumThresholdSafetyMargin),
		refInputsCostPerMultiAssetPolicy: fromUIntOrUndef(_refInputsCostPerMultiAssetPolicy),
		refInputsCostPerDatumByte: fromUIntOrUndef(_refInputsCostPerDatumByte),
	};
}

export const defaultDijkstraProtocolParameters: DijkstraProtocolParameters = freezeAll({
	txFeePerByte: 44, // minFeeA, fixed fee component (historical value for Dijkstra)
	txFeeFixed: 155381, // minFeeB, per-byte fee component (historical value for Dijkstra)
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
	minPoolCost: 170_000_000, // 170 ADA, lowered on mainnet via governance
	utxoCostPerByte: 4310, // coinsPerUTxOByte (CIP-55), unchanged since Babbage
	costModels: {
		PlutusScriptV1: defaultV1Costs, // Plutus V1 cost model (from Alonzo)
		PlutusScriptV2: defaultV2Costs, // Plutus V2 cost model (from Babbage/Vasil)
		PlutusScriptV3: defaultV3Costs, // Plutus V3 cost model
		PlutusScriptV4: defaultDijkstraPlutusV4CostModel.slice(0, DIJKSTRA_PLUTUS_V4_COST_MODEL_LENGTH), // Dijkstra initial V4 model (251 values)
	},
	executionUnitPrices: [
		CborPositiveRational.fromNumber(0.0577), // Memory price (historical approximation)
		CborPositiveRational.fromNumber(0.0000721), // CPU/Steps price (historical approximation)
	],
	maxTxExecutionUnits: new ExBudget({ mem: 16_500_000, cpu: 10_000_000_000 }), // mainnet, mem raised from 14M via governance
	maxBlockExecutionUnits: new ExBudget({
		mem: 72_000_000,
		cpu: 20_000_000_000,
	}), // mainnet, mem raised from 62M via governance
	maxValueSize: 5000, // Unchanged, relevant for multi-asset and script data
	collateralPercentage: 150, // Unchanged, percentage of fee as collateral
	maxCollateralInputs: 3, // Unchanged, maximum number of collateral inputs
	// Dijkstra governance parameters (approximate values based on initial settings or reasonable defaults)
	poolVotingThresholds: {
		committeeNormal: CborPositiveRational.fromNumber(0.51),
		committeeNoConfidence: CborPositiveRational.fromNumber(0.51),
		hardForkInitiation: CborPositiveRational.fromNumber(0.51),
		motionNoConfidence: CborPositiveRational.fromNumber(0.51),
		securityRelevantVotingThresholds: CborPositiveRational.fromNumber(0.51),
	} as DijkstraPParamsPoolVotingThresholds,
	drepVotingThresholds: {
		motionNoConfidence: CborPositiveRational.fromNumber(0.67),
		committeeNormal: CborPositiveRational.fromNumber(0.67),
		committeeNoConfidence: CborPositiveRational.fromNumber(0.6),
		updateConstitution: CborPositiveRational.fromNumber(0.75),
		hardForkInitiation: CborPositiveRational.fromNumber(0.6),
		ppNetworkGroup: CborPositiveRational.fromNumber(0.67),
		ppEconomicGroup: CborPositiveRational.fromNumber(0.67),
		ppTechnicalGroup: CborPositiveRational.fromNumber(0.67),
		ppGovGroup: CborPositiveRational.fromNumber(0.75),
		treasuryWithdrawal: CborPositiveRational.fromNumber(0.67),
	} as DijkstraPParamsDrepVotingThresholds,
	minCommitteSize: 5, // Minimum constitutional committee size on mainnet
	committeeTermLimit: 146, // Epochs, term limit for committee members
	governanceActionValidityPeriod: 6, // Epochs, validity period for governance actions
	governanceActionDeposit: 100_000_000_000, // 100_000 ADA, deposit for governance actions
	drepDeposit: 500_000_000, // 500 ADA, deposit for DRep registration
	drepActivityPeriod: 20, // Epochs, activity period for DReps before becoming inactive
	minfeeRefScriptCostPerByte: CborPositiveRational.fromNumber(15.0), // Cost per byte for reference scripts (approximation)
	maxRefScriptSizePerBlock: 1_048_576, // Conway fixed default; Dijkstra makes it a protocol parameter
	maxRefScriptSizePerTx: 204_800, // Conway fixed default
	refScriptCostStride: 25_600, // Conway fixed default
	refScriptCostMultiplier: CborPositiveRational.fromNumber(1.2), // Conway fixed default
	maxPledgeLeverage: null, // CIP-50: Nothing preserves current reward behaviour
	minPoolMargin: CborPositiveRational.fromNumber(0.015), // live Dijkstra genesis value (dingo), CIP-23
	leiosAnnouncementPeriodLength: 1000, // ms, CIP-0164
	leiosVotePeriodLength: 4000, // ms
	leiosDiffusionPeriodLength: 7000, // ms
	leiosCommitteeSize: 900, // seats
	leiosQuorumStakeThreshold: CborPositiveRational.fromNumber(0.75), // CIP-0164 quorum
	maxEndorserBlockReferencesSize: 40_000, // bytes of EB references
	maxEndorserBlockTxsSize: 260_000, // bytes of endorsed txs
	maxEndorserBlockExecutionUnits: new ExBudget({ mem: 720_000_000, cpu: 200_000_000_000 }),
	maxRefScriptSizePerEndorserBlock: 1_048_576,
	perasMinCandidateBlockAge: 90, // slots
	perasHealingFactor: CborPositiveRational.fromNumber(0.5),
	perasCertBoost: 15,
	perasTargetCommitteeSize: 800,
	perasBootstrapRound: 0, // nil disables the manual bootstrap; genesis uses 0 on DijkstraNet
	perasQuorumThresholdSafetyMargin: CborPositiveRational.fromNumber(0.05),
	refInputsCostPerMultiAssetPolicy: 0, // fee function: hardcoded zero at launch
	refInputsCostPerDatumByte: 0,
} as DijkstraProtocolParameters);

export function dijkstraCostModelsToJson(costModels: DijkstraCostModels) {
	const base = costModelsToJson(costModels as CostModels) as any;
	return {
		...base,
		...(costModels.PlutusScriptV4 === undefined ? {} : { PlutusScriptV4: costModels.PlutusScriptV4.map(n => Number(n)) }),
	};
}

export function partialDijkstraProtocolParamsToJson(pp: Partial<DijkstraProtocolParameters>) {
	return {
		...pp,
		poolPledgeInfluence: typeof pp.poolPledgeInfluence === 'number' ? pp.poolPledgeInfluence : pp.poolPledgeInfluence?.toNumber(),
		monetaryExpansion: typeof pp.monetaryExpansion === 'number' ? pp.monetaryExpansion : pp.monetaryExpansion?.toNumber(),
		treasuryCut: typeof pp.treasuryCut === 'number' ? pp.treasuryCut : pp.treasuryCut?.toNumber(),
		refScriptCostMultiplier: typeof pp.refScriptCostMultiplier === 'number' ? pp.refScriptCostMultiplier : pp.refScriptCostMultiplier?.toNumber(),
		maxPledgeLeverage: pp.maxPledgeLeverage === null ? null : typeof pp.maxPledgeLeverage === 'number' ? pp.maxPledgeLeverage : pp.maxPledgeLeverage?.toNumber(),
		minPoolMargin: typeof pp.minPoolMargin === 'number' ? pp.minPoolMargin : pp.minPoolMargin?.toNumber(),
		leiosQuorumStakeThreshold: typeof pp.leiosQuorumStakeThreshold === 'number' ? pp.leiosQuorumStakeThreshold : pp.leiosQuorumStakeThreshold?.toNumber(),
		perasHealingFactor: typeof pp.perasHealingFactor === 'number' ? pp.perasHealingFactor : pp.perasHealingFactor?.toNumber(),
		perasQuorumThresholdSafetyMargin: typeof pp.perasQuorumThresholdSafetyMargin === 'number' ? pp.perasQuorumThresholdSafetyMargin : pp.perasQuorumThresholdSafetyMargin?.toNumber(),
		costModels: pp.costModels === undefined ? undefined : dijkstraCostModelsToJson(pp.costModels),
		executionUnitPrices: Array.isArray(pp.executionUnitPrices)
			? {
					priceSteps: pp.executionUnitPrices[1].toNumber(),
					priceMemory: pp.executionUnitPrices[0].toNumber(),
				}
			: pp.executionUnitPrices,
		maxTxExecutionUnits: ExBudget.isJson(pp.maxTxExecutionUnits) ? pp.maxTxExecutionUnits : pp.maxTxExecutionUnits?.toJson(),
		maxBlockExecutionUnits: ExBudget.isJson(pp.maxBlockExecutionUnits) ? pp.maxBlockExecutionUnits : pp.maxBlockExecutionUnits?.toJson(),
	};
}
