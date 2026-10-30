import { freezeAll, isObject } from '@harmoniclabs/obj-utils';
import { ExBudget, ExBudgetJson } from '@harmoniclabs/plutus-machine';
import { Rational, isRational } from '../../common';
import { CanBeUInteger, canBeUInteger } from '../../../utils/ints';
import { DijkstraCostModels, DijkstraProtocolParameters } from './DijkstraProtocolParameters';
import { defaultDijkstraPlutusV4CostModel, DIJKSTRA_PLUTUS_V4_COST_MODEL_LENGTH } from './DijkstraV4CostModel';

/**
 * JSON shape of `DijkstraGenesis` as cardano-ledger `UpgradeDijkstraPParams`
 * parses it from a genesis file, and as Dingo's
 * `config/cardano/{dijkstra,musashi}/dijkstra-genesis.json` carries it.
 *
 * `plutusV4CostModel` is inside the genesis file rather than the Conway
 * genesis proper; Dijkstra installs it as cost-model language key 3.
 */
export interface DijkstraGenesis {
	maxRefScriptSizePerBlock?: CanBeUInteger;
	maxRefScriptSizePerTx?: CanBeUInteger;
	refScriptCostStride?: CanBeUInteger;
	refScriptCostMultiplier?: Rational;
	maxPledgeLeverage?: Rational | null;
	minPoolMargin?: Rational;
	plutusV4CostModel?: number[];
	leiosAnnouncementPeriodLength?: CanBeUInteger;
	leiosVotePeriodLength?: CanBeUInteger;
	leiosDiffusionPeriodLength?: CanBeUInteger;
	leiosCommitteeSize?: CanBeUInteger;
	leiosQuorumStakeThreshold?: Rational;
	maxEndorserBlockReferencesSize?: CanBeUInteger;
	maxEndorserBlockTxsSize?: CanBeUInteger;
	maxEndorserBlockExecutionUnits?: ExBudget | ExBudgetJson;
	maxRefScriptSizePerEndorserBlock?: CanBeUInteger;
	perasMinCandidateBlockAge?: CanBeUInteger;
	perasHealingFactor?: Rational;
	perasCertBoost?: CanBeUInteger;
	perasTargetCommitteeSize?: CanBeUInteger;
	perasBootstrapRound?: CanBeUInteger | null;
	perasQuorumThresholdSafetyMargin?: Rational;
	refInputsCostPerMultiAssetPolicy?: CanBeUInteger;
	refInputsCostPerDatumByte?: CanBeUInteger;
	/** Conway genesis field, present on some networks */
	committeeStakeCoverage?: Rational;
	/** Conway genesis field, present on some networks */
	quorumStakeThreshold?: Rational;
}

function isInt64Value( n: any ): n is number | bigint
{
	const MIN = BigInt( "-9223372036854775808" ), MAX = BigInt( "9223372036854775807" );
	if( typeof n === "bigint" ) return n >= MIN && n <= MAX;
	return typeof n === "number" && Number.isSafeInteger( n ) && n >= Number( MIN ) && n <= Number( MAX );
}

function isUIntOrUndefined( value: any ): boolean
{
	return value === undefined || canBeUInteger( value );
}

function isRationalOrNullOrUndefined( value: any ): boolean
{
	return value === undefined || value === null || isRational( value );
}

function isPlutusV4CostModel( value: any ): value is number[]
{
	return Array.isArray( value ) && value.length === DIJKSTRA_PLUTUS_V4_COST_MODEL_LENGTH && value.every( isInt64Value );
}

function isExBudgetOrJsonOrUndefined( value: any ): boolean
{
	return value === undefined || value instanceof ExBudget || ExBudget.isJson( value );
}

export function isDijkstraGenesis( something: any ): something is DijkstraGenesis
{
	if( !isObject( something ) ) return false;
	if( !isUIntOrUndefined( something.maxRefScriptSizePerBlock ) ) return false;
	if( !isUIntOrUndefined( something.maxRefScriptSizePerTx ) ) return false;
	if( !isUIntOrUndefined( something.refScriptCostStride ) ) return false;
	if( !isRationalOrNullOrUndefined( something.refScriptCostMultiplier ) ) return false;
	if( !( something.maxPledgeLeverage === undefined || something.maxPledgeLeverage === null || isRational( something.maxPledgeLeverage ) ) ) return false;
	if( !isRationalOrNullOrUndefined( something.minPoolMargin ) ) return false;
	if( something.plutusV4CostModel !== undefined && !isPlutusV4CostModel( something.plutusV4CostModel ) ) return false;
	if( !isUIntOrUndefined( something.leiosAnnouncementPeriodLength ) ) return false;
	if( !isUIntOrUndefined( something.leiosVotePeriodLength ) ) return false;
	if( !isUIntOrUndefined( something.leiosDiffusionPeriodLength ) ) return false;
	if( !isUIntOrUndefined( something.leiosCommitteeSize ) ) return false;
	if( !isRationalOrNullOrUndefined( something.leiosQuorumStakeThreshold ) ) return false;
	if( !isUIntOrUndefined( something.maxEndorserBlockReferencesSize ) ) return false;
	if( !isUIntOrUndefined( something.maxEndorserBlockTxsSize ) ) return false;
	if( !isExBudgetOrJsonOrUndefined( something.maxEndorserBlockExecutionUnits ) ) return false;
	if( !isUIntOrUndefined( something.maxRefScriptSizePerEndorserBlock ) ) return false;
	if( !isUIntOrUndefined( something.perasMinCandidateBlockAge ) ) return false;
	if( !isRationalOrNullOrUndefined( something.perasHealingFactor ) ) return false;
	if( !isUIntOrUndefined( something.perasCertBoost ) ) return false;
	if( !isUIntOrUndefined( something.perasTargetCommitteeSize ) ) return false;
	if( !( something.perasBootstrapRound === undefined || something.perasBootstrapRound === null || canBeUInteger( something.perasBootstrapRound ) ) ) return false;
	if( !isRationalOrNullOrUndefined( something.perasQuorumThresholdSafetyMargin ) ) return false;
	if( !isUIntOrUndefined( something.refInputsCostPerMultiAssetPolicy ) ) return false;
	if( !isUIntOrUndefined( something.refInputsCostPerDatumByte ) ) return false;
	if( !isRationalOrNullOrUndefined( something.committeeStakeCoverage ) ) return false;
	if( !isRationalOrNullOrUndefined( something.quorumStakeThreshold ) ) return false;
	return true;
}

/** Parses a genesis JSON file/string and validates the modelled fields. */
export function dijkstraGenesisFromJson( json: string | object ): DijkstraGenesis
{
	const parsed = typeof json === "string" ? JSON.parse( json ) : json;
	if( !isDijkstraGenesis( parsed ) ) throw new Error( "Invalid DijkstraGenesis" );
	return freezeAll( parsed );
}

/**
 * The genesis → protocol-parameters upgrade (`updatePParams`): Dijkstra's
 * genesis fields win over the Conway values they extend, and the V4 cost model
 * lands at language key 3.
 */
export function dijkstraGenesisToProtocolParamsPartial( genesis: DijkstraGenesis ): Partial<DijkstraProtocolParameters>
{
	const costModels: DijkstraCostModels | undefined = genesis.plutusV4CostModel === undefined ? undefined : {
		PlutusScriptV4: genesis.plutusV4CostModel.slice(),
	};
	return {
		maxRefScriptSizePerBlock: genesis.maxRefScriptSizePerBlock,
		maxRefScriptSizePerTx: genesis.maxRefScriptSizePerTx,
		refScriptCostStride: genesis.refScriptCostStride,
		refScriptCostMultiplier: genesis.refScriptCostMultiplier,
		maxPledgeLeverage: genesis.maxPledgeLeverage,
		minPoolMargin: genesis.minPoolMargin,
		leiosAnnouncementPeriodLength: genesis.leiosAnnouncementPeriodLength,
		leiosVotePeriodLength: genesis.leiosVotePeriodLength,
		leiosDiffusionPeriodLength: genesis.leiosDiffusionPeriodLength,
		leiosCommitteeSize: genesis.leiosCommitteeSize,
		leiosQuorumStakeThreshold: genesis.leiosQuorumStakeThreshold,
		maxEndorserBlockReferencesSize: genesis.maxEndorserBlockReferencesSize,
		maxEndorserBlockTxsSize: genesis.maxEndorserBlockTxsSize,
		maxEndorserBlockExecutionUnits: genesis.maxEndorserBlockExecutionUnits,
		maxRefScriptSizePerEndorserBlock: genesis.maxRefScriptSizePerEndorserBlock,
		perasMinCandidateBlockAge: genesis.perasMinCandidateBlockAge,
		perasHealingFactor: genesis.perasHealingFactor,
		perasCertBoost: genesis.perasCertBoost,
		perasTargetCommitteeSize: genesis.perasTargetCommitteeSize,
		perasBootstrapRound: genesis.perasBootstrapRound,
		perasQuorumThresholdSafetyMargin: genesis.perasQuorumThresholdSafetyMargin,
		refInputsCostPerMultiAssetPolicy: genesis.refInputsCostPerMultiAssetPolicy,
		refInputsCostPerDatumByte: genesis.refInputsCostPerDatumByte,
		costModels,
	};
}

/** Initial DijkstraNet genesis values (Dingo devnet config). */
export const defaultDijkstraGenesis: DijkstraGenesis = freezeAll({
	maxRefScriptSizePerBlock: 1_048_576,
	maxRefScriptSizePerTx: 204_800,
	refScriptCostStride: 25_600,
	refScriptCostMultiplier: 1.2,
	maxPledgeLeverage: null,
	minPoolMargin: 0.015,
	plutusV4CostModel: defaultDijkstraPlutusV4CostModel.slice(0, DIJKSTRA_PLUTUS_V4_COST_MODEL_LENGTH),
	leiosAnnouncementPeriodLength: 1000,
	leiosVotePeriodLength: 4000,
	leiosDiffusionPeriodLength: 7000,
	leiosCommitteeSize: 900,
	leiosQuorumStakeThreshold: 0.75,
	maxEndorserBlockReferencesSize: 40_000,
	maxEndorserBlockTxsSize: 260_000,
	maxEndorserBlockExecutionUnits: new ExBudget({ mem: 720_000_000, cpu: 200_000_000_000 }),
	maxRefScriptSizePerEndorserBlock: 1_048_576,
	perasMinCandidateBlockAge: 90,
	perasHealingFactor: 0.5,
	perasCertBoost: 15,
	perasTargetCommitteeSize: 800,
	perasBootstrapRound: 0,
	perasQuorumThresholdSafetyMargin: 0.05,
	refInputsCostPerMultiAssetPolicy: 0,
	refInputsCostPerDatumByte: 0,
} as DijkstraGenesis);
