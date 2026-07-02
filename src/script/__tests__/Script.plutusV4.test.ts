import { Script, ScriptType, scriptTypeToNumber, scriptTypeFromNumber } from "../Script";

const FLAT = new Uint8Array([ 0x01, 0x02, 0x03, 0x04 ]);

describe("Plutus V4 script support (Dijkstra)", () => {

    test("ScriptType.PlutusV4 maps to tag 4 (script / script_ref namespace)", () => {
        expect( scriptTypeToNumber( ScriptType.PlutusV4 ) ).toBe( 4 );
        expect( scriptTypeToNumber( "PlutusScriptV4" ) ).toBe( 4 );
        expect( scriptTypeFromNumber( 4 ) ).toBe( ScriptType.PlutusV4 );
    });

    test("Script.plutusV4 constructs a V4 script", () => {
        const s = Script.plutusV4( FLAT );
        expect( s.type ).toBe( ScriptType.PlutusV4 );
    });

    test("V4 script round-trips via ledger CDDL `script` ([4, bytes])", () => {
        const s = Script.plutusV4( FLAT );
        const obj = s.toCborObj();
        expect( (obj as any).array[0].num ).toBe( 4n );

        const decoded = Script.fromCbor( s.toCbor(), ScriptType.PlutusV4 );
        expect( decoded.type ).toBe( ScriptType.PlutusV4 );
        expect( decoded.toCbor().toString() ).toBe( s.toCbor().toString() );
    });

    test("V4 script hash uses namespace byte 0x04 (distinct from V3)", () => {
        const v4 = Script.plutusV4( FLAT ).hash.toString();
        const v3 = Script.plutusV3( FLAT ).hash.toString();
        expect( v4 ).not.toBe( v3 );
    });
});
