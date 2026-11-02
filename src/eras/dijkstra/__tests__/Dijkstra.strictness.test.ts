import { readFileSync } from "fs";
import { join } from "path";
import { Cbor, CborArray, CborBytes, CborUInt } from "@harmoniclabs/cbor";
import { DijkstraHeader } from "../header/DijkstraHeader";
import { DijkstraHeaderBody } from "../header/DijkstraHeaderBody";
import { ProtocolVersion } from "../../common/ledger/protocol";
import { VrfCert } from "../../common/ledger/Vrf";

const FIX = join( __dirname, "..", "__fixtures__" );
const hexOf = ( f: string ) => readFileSync( join( FIX, f ), "utf8" ).replace( /\s+/g, "" );
const bytesOf = ( f: string ) => Buffer.from( hexOf( f ), "hex" );
const toHex = ( b: Uint8Array ) => Buffer.from( b ).toString( "hex" );

describe("Dijkstra strictness (Phase D)", () => {
    test("vrf_cert is exactly [bytes .size 64, bytes .size 80], not a permissive byte pair", () => {
        const hash = new Uint8Array( 64 ).fill( 0x11 );
        const proof = new Uint8Array( 80 ).fill( 0x22 );
        const valid = VrfCert.fromCborObj( new CborArray([ new CborBytes( hash ), new CborBytes( proof ) ]) );
        expect( valid.proofHash.length ).toBe( 64 );
        expect( valid.proof.length ).toBe( 80 );

        const mk = ( h: Uint8Array, extra = false ) => {
            const arr: any[] = [ new CborBytes( h ), new CborBytes( proof ) ];
            if( extra ) arr.push( new CborBytes( new Uint8Array( 1 ) ) );
            return new CborArray( arr );
        };
        expect( () => VrfCert.fromCborObj( mk( hash.slice( 0, 32 ) ) ) ).toThrow( /64/ );
        expect( () => VrfCert.fromCborObj( mk( new Uint8Array( 65 ) ) ) ).toThrow( /64/ );
        expect( () => VrfCert.fromCborObj( mk( hash, true ) ) ).toThrow();
        expect( () => VrfCert.fromCborObj(
            new CborArray([ new CborBytes( hash ), new CborBytes( proof.slice( 0, 79 ) ) ])
        ) ).toThrow( /80/ );

        const bytes = Cbor.encode( new CborArray([ new CborBytes( hash ), new CborBytes( proof ) ]) );
        expect( toHex( VrfCert.fromCbor( bytes ).toCborBytes() ) ).toBe( toHex( bytes ) );
        expect( () => VrfCert.fromCbor( Buffer.from([ ...bytes, 0xff ]) ) ).toThrow( /trailing/ );
    });

    test("Dijkstra header_version_info accepts any uint32 major, unlike ProtVer contexts", () => {
        const headerBytes = bytesOf( "musashi_type8_dijkstra_header.hex" );
        const top = Cbor.parse( headerBytes ) as CborArray;
        const body = top.array[0] as CborArray;
        const fields = body.array.slice();
        fields[9] = new CborArray([ new CborUInt( 14 ), new CborUInt( 7 ) ]);
        const wire = Cbor.encode( new CborArray([ new CborArray( fields ), top.array[1] ]) );
        const hdr = DijkstraHeader.fromCbor( wire );
        expect( hdr.body.versionInfo ).toEqual({ highestSupportedMajorVersion: 14, selfReportedSoftwareTag: 7 });
        expect( toHex( hdr.toCborBytes() ) ).toBe( toHex( wire ) );

        const b = hdr.body;
        const fresh = new DijkstraHeaderBody({
            blockNumber: b.blockNumber, slot: b.slot, prevHash: b.prevHash, issuerPubKey: b.issuerPubKey,
            vrfPubKey: b.vrfPubKey, vrfResult: b.vrfResult, blockBodySize: b.blockBodySize, blockBodyHash: b.blockBodyHash,
            opCert: b.opCert, protocolVersion: { major: 14, minor: 7 },
            leiosCertified: b.leiosCertified, ebAnnouncement: b.ebAnnouncement
        });
        expect( toHex( Cbor.encode( fresh.toCborObj() ) ) ).toBe( toHex( ( Cbor.parseLazy( wire ) as any ).array[0] ) );

        expect( () => ProtocolVersion.fromCbor(
            Cbor.encode( new CborArray([ new CborUInt( 14 ), new CborUInt( 7 ) ]) )
        ) ).toThrow( /unsupported major/ );
        expect( () => ProtocolVersion.fromCbor(
            Cbor.encode( new CborArray([ new CborUInt( 13 ), new CborUInt( 7 ) ]) )
        ) ).not.toThrow();
    });

    test("cardano-ledger master PP golden carries keys 34-56 and refreshed fixtures parse", () => {
        const pp = JSON.parse( readFileSync( join( FIX, "cardano_ledger_dijkstra_pparams.json" ), "utf8" ) );
        for( const key of [
            "maxRefScriptSizePerBlock", "maxRefScriptSizePerTx", "refScriptCostStride", "refScriptCostMultiplier",
            "maxPledgeLeverage", "minPoolMargin", "leiosAnnouncementPeriodLength", "leiosVotePeriodLength",
            "leiosDiffusionPeriodLength", "leiosCommitteeSize", "leiosQuorumStakeThreshold",
            "maxEndorserBlockReferencesSize", "maxEndorserBlockTxsSize", "maxEndorserBlockExecutionUnits",
            "maxRefScriptSizePerEndorserBlock", "perasMinCandidateBlockAge", "perasHealingFactor",
            "perasCertBoost", "perasTargetCommitteeSize", "perasBootstrapRound",
            "perasQuorumThresholdSafetyMargin", "refInputsCostPerMultiAssetPolicy", "refInputsCostPerDatumByte",
                "protocolVersion"
        ]) expect( pp ).toHaveProperty( key );
        expect( pp.maxPledgeLeverage ).toBe( null );
        expect( pp.perasBootstrapRound ).toBe( null );
        const update = JSON.parse( readFileSync( join( FIX, "cardano_ledger_dijkstra_pparams_update.json" ), "utf8" ) );
        expect( update ).toHaveProperty( "costModels" );
    });
});
