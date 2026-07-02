import { Cbor, CborMap, CborUInt } from "@harmoniclabs/cbor";
import { DijkstraTxWitnessSet } from "../DijkstraTxWitnessSet";
import { Script } from "../../../../script";

// Plutus V4 in the witness set is key 8 — confirmed by gOuroboros (the ledger
// lib Dingo runs on the live Dijkstra/Leios testnet): WsPlutusV4Scripts `cbor:"8"`.
const V4 = Script.plutusV4( new Uint8Array([ 0x46, 0x01, 0x00, 0x00, 0x22, 0x22, 0x00 ]) );

describe("DijkstraTxWitnessSet Plutus V4 (key 8)", () => {

    test("encodes plutusV4Scripts under map key 8", () => {
        const ws = new DijkstraTxWitnessSet({ plutusV4Scripts: [ V4 ] });
        const obj = ws.toCborObj() as CborMap;
        const keys = obj.map.map( e => Number((e.k as CborUInt).num) );
        expect( keys ).toContain( 8 );
        expect( keys ).not.toContain( 7 ); // no V3 present
    });

    test("round-trips a V4-only witness set", () => {
        const ws = new DijkstraTxWitnessSet({ plutusV4Scripts: [ V4 ] });
        const cbor = ws.toCbor();
        const decoded = DijkstraTxWitnessSet.fromCbor( cbor );
        expect( decoded.plutusV4Scripts?.length ).toBe( 1 );
        expect( decoded.plutusV4Scripts?.[0].type ).toBe( "PlutusScriptV4" );
        expect( decoded.toCbor().toString() ).toBe( cbor.toString() );
    });

    test("V4 coexists with V3 (keys 7 and 8 both present)", () => {
        const ws = new DijkstraTxWitnessSet({
            plutusV3Scripts: [ Script.plutusV3( new Uint8Array([ 0x46, 0x01, 0x00, 0x00, 0x22, 0x22, 0x00 ]) ) ],
            plutusV4Scripts: [ V4 ]
        });
        const keys = (ws.toCborObj() as CborMap).map.map( e => Number((e.k as CborUInt).num) );
        expect( keys ).toContain( 7 );
        expect( keys ).toContain( 8 );
        const decoded = DijkstraTxWitnessSet.fromCbor( ws.toCbor() );
        expect( decoded.plutusV3Scripts?.length ).toBe( 1 );
        expect( decoded.plutusV4Scripts?.length ).toBe( 1 );
    });
});
