import { readFileSync } from "fs";
import { join } from "path";
import { CborMap, CborSimple, CborTag, CborUInt } from "@harmoniclabs/cbor";
import {
	DijkstraProtocolParameters,
	defaultDijkstraProtocolParameters,
	isDijkstraProtocolParameters,
	partialDijkstraProtocolParametersToCborObj,
	partialDijkstraProtocolParametersFromCborObj,
	dijkstraCostModelsToJson,
} from "../DijkstraProtocolParameters";
import {
	DijkstraGenesis,
	defaultDijkstraGenesis,
	dijkstraGenesisFromJson,
	dijkstraGenesisToProtocolParamsPartial,
	isDijkstraGenesis,
} from "../DijkstraGenesis";
import { DIJKSTRA_PLUTUS_V4_COST_MODEL_LENGTH } from "../DijkstraV4CostModel";

function cborKeys( pp: Partial<DijkstraProtocolParameters> ): number[]
{
	return partialDijkstraProtocolParametersToCborObj( pp )
	.map.map(({ k }) => { if( !(k instanceof CborUInt) ) throw new Error("non-uint key"); return Number(k.num); });
}

function keyValue( pp: Partial<DijkstraProtocolParameters>, key: number )
{
	return partialDijkstraProtocolParametersToCborObj( pp )
	.map.find(({ k }) => { if( !(k instanceof CborUInt) ) throw new Error("non-uint key"); return Number(k.num) === key; });
}

describe( "Dijkstra Phase B protocol parameters", () => {

	test( "defaults are a complete Dijkstra PP and carry keys 34-56", () => {
		expect( isDijkstraProtocolParameters( defaultDijkstraProtocolParameters ) ).toBe( true );
		const keys = cborKeys( defaultDijkstraProtocolParameters );
		for( const key of [ 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56 ] )
		expect( keys ).toContain( key );
	});

	test( "full CBOR round-trip preserves 38-56", () => {
		const cbor = partialDijkstraProtocolParametersToCborObj( defaultDijkstraProtocolParameters );
		const decoded = partialDijkstraProtocolParametersFromCborObj( cbor );

		expect( decoded.maxRefScriptSizePerBlock ).toBe( 1_048_576 );
		expect( decoded.maxRefScriptSizePerTx ).toBe( 204_800 );
		expect( decoded.refScriptCostStride ).toBe( 25_600 );
		expect( decoded.refScriptCostMultiplier?.toNumber() ).toBeCloseTo( 1.2 );
		expect( decoded.maxPledgeLeverage ).toBe( null );
		expect( decoded.minPoolMargin?.toNumber() ).toBeCloseTo( 0.015 );
		expect( decoded.leiosAnnouncementPeriodLength ).toBe( 1000 );
		expect( decoded.leiosVotePeriodLength ).toBe( 4000 );
		expect( decoded.leiosDiffusionPeriodLength ).toBe( 7000 );
		expect( decoded.leiosCommitteeSize ).toBe( 900 );
		expect( decoded.leiosQuorumStakeThreshold?.toNumber() ).toBeCloseTo( 0.75 );
		expect( decoded.maxEndorserBlockReferencesSize ).toBe( 40_000 );
		expect( decoded.maxEndorserBlockTxsSize ).toBe( 260_000 );
		expect( decoded.maxEndorserBlockExecutionUnits?.mem ).toBe( BigInt( 720_000_000 ) );
		expect( decoded.maxEndorserBlockExecutionUnits?.cpu ).toBe( BigInt( 200_000_000_000 ) );
		expect( decoded.maxRefScriptSizePerEndorserBlock ).toBe( 1_048_576 );
		expect( decoded.perasMinCandidateBlockAge ).toBe( 90 );
		expect( decoded.perasHealingFactor?.toNumber() ).toBeCloseTo( 0.5 );
		expect( decoded.perasCertBoost ).toBe( 15 );
		expect( decoded.perasTargetCommitteeSize ).toBe( 800 );
		expect( decoded.perasBootstrapRound ).toBe( 0 );
		expect( decoded.perasQuorumThresholdSafetyMargin?.toNumber() ).toBeCloseTo( 0.05 );
		expect( Number( decoded.refInputsCostPerMultiAssetPolicy ) ).toBe( 0 );
		expect( Number( decoded.refInputsCostPerDatumByte ) ).toBe( 0 );

		expect( partialDijkstraProtocolParametersToCborObj( decoded ).toString() ).toBe( cbor.toString() );
		expect( isDijkstraProtocolParameters( decoded as DijkstraProtocolParameters ) ).toBe( true );
	});

	test( "null encodings: maxPledgeLeverage (38) and perasBootstrapRound (53)", () => {
		const pp: DijkstraProtocolParameters = { ...defaultDijkstraProtocolParameters, maxPledgeLeverage: null, perasBootstrapRound: null };
		const k38 = keyValue( pp, 38 );
		const k53 = keyValue( pp, 53 );
		expect( k38?.v instanceof CborSimple && k38.v.simple === null ).toBe( true );
		expect( k53?.v instanceof CborSimple && k53.v.simple === null ).toBe( true );

		const decoded = partialDijkstraProtocolParametersFromCborObj( partialDijkstraProtocolParametersToCborObj( pp ) );
		expect( decoded.maxPledgeLeverage ).toBe( null );
		expect( decoded.perasBootstrapRound ).toBe( null );
	});

	test( "rational values use tag-30 intervals and all cost models land at key 3", () => {
		const pp: DijkstraProtocolParameters = {
			...defaultDijkstraProtocolParameters,
			perasHealingFactor: 0.5,
			perasQuorumThresholdSafetyMargin: 0.05,
		};
		const cbor = partialDijkstraProtocolParametersToCborObj( pp );

		const k50 = cbor.map.find(({ k }) => k instanceof CborUInt && Number( k.num ) === 50 );
		expect( k50?.v instanceof CborTag && Number( (k50.v as any).tag ) === 30 ).toBe( true );

		const k18 = cbor.map.find(({ k }) => k instanceof CborUInt && Number( k.num ) === 18 );
		expect( k18?.v instanceof CborMap ).toBe( true );
		const langs = ((k18?.v as CborMap).map.map(({ k }) => Number( (k as CborUInt).num ) ));
		expect( langs ).toEqual( expect.arrayContaining([ 0, 1, 2, 3 ]) );

		const v4 = ((k18?.v as CborMap).map.find(({ k }) => Number( (k as CborUInt).num ) === 3 ))?.v as any;
		expect( Array.isArray( v4.array ) ).toBe( true );
		expect( v4.array.length ).toBe( DIJKSTRA_PLUTUS_V4_COST_MODEL_LENGTH );

		const decoded = partialDijkstraProtocolParametersFromCborObj( cbor );
		expect( decoded.costModels?.PlutusScriptV4?.length ).toBe( DIJKSTRA_PLUTUS_V4_COST_MODEL_LENGTH );
		expect( decoded.costModels?.PlutusScriptV1 ).toBeDefined();
		expect( decoded.costModels?.PlutusScriptV2 ).toBeDefined();
		expect( decoded.costModels?.PlutusScriptV3 ).toBeDefined();
	});

	test( "cost-model JSON keeps the raw V4 array", () => {
		const json = dijkstraCostModelsToJson( defaultDijkstraProtocolParameters.costModels as any );
		expect( json.PlutusScriptV4.length ).toBe( DIJKSTRA_PLUTUS_V4_COST_MODEL_LENGTH );
		expect( json.PlutusScriptV4[0] ).toBe( 100788 );
	});
});

describe( "Dijkstra genesis", () => {

	const fixturePath = join( __dirname, "../../__fixtures__/dingo_dijkstra_genesis.json" );
	const musashiPath = join( __dirname, "../../__fixtures__/dingo_musashi_dijkstra_genesis.json" );

	test( "default genesis validates and upgrades into partial PPs", () => {
		expect( isDijkstraGenesis( defaultDijkstraGenesis ) ).toBe( true );
		const pp = dijkstraGenesisToProtocolParamsPartial( defaultDijkstraGenesis );
		expect( pp.costModels?.PlutusScriptV4?.length ).toBe( DIJKSTRA_PLUTUS_V4_COST_MODEL_LENGTH );
		expect( pp.maxPledgeLeverage ).toBe( null );
		expect( pp.perasCertBoost ).toBe( 15 );
	});

	test( "Dingo Dijkstra genesis fixture parses", () => {
		const genesis = dijkstraGenesisFromJson( readFileSync( fixturePath, "utf8" ) );
		expect( isDijkstraGenesis( genesis ) ).toBe( true );
		expect( genesis.plutusV4CostModel?.length ).toBe( 251 );
		const pp = dijkstraGenesisToProtocolParamsPartial( genesis );
		expect( pp.maxRefScriptSizePerBlock ).toBe( 1_048_576 );
		expect( pp.leiosCommitteeSize ).toBe( 900 );
		expect( pp.perasBootstrapRound ).toBe( 0 );
	});

	test( "Dingo Musashi genesis keeps a null bootstrap round", () => {
		const genesis: DijkstraGenesis = dijkstraGenesisFromJson( readFileSync( musashiPath, "utf8" ) );
		expect( genesis.perasBootstrapRound ).toBe( null );
		expect( dijkstraGenesisToProtocolParamsPartial( genesis ).perasBootstrapRound ).toBe( null );
	});

	test( "genesis rejects a V4 model of the wrong length", () => {
		const bad: any = { ...defaultDijkstraGenesis, plutusV4CostModel: defaultDijkstraGenesis.plutusV4CostModel!.slice( 0, 250 ) };
		expect( isDijkstraGenesis( bad ) ).toBe( false );
	});
});

describe( "Dijkstra PP predicate", () => {
	test( "rejects a PP with an invalid optional uint32", () => {
		const bad: DijkstraProtocolParameters = {
			...defaultDijkstraProtocolParameters,
			leiosAnnouncementPeriodLength: BigInt( 2 ) ** BigInt( 32 ),
		};
		expect( isDijkstraProtocolParameters( bad ) ).toBe( false );
	});
});
