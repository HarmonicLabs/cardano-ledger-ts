import { nativeScriptToCborObj, nativeScriptToCbor, nativeScriptFromCborObj, ScriptRequireGuard } from "../NativeScript";
import { Credential } from "../../credentials";
import { CborUInt } from "@harmoniclabs/cbor";
import { withDecodeVersion } from "../../utils/strictCbor";

// script_require_guard (tag 6) exists from protocol 12 (Dijkstra): decode it in a Dijkstra context;
// cardano-ledger rejects tag 6 below 12, and so does a direct call at the default (Conway) version.

describe("NativeScript script_require_guard (tag 6)", () => {

    test("is rejected below protocol 12 (Conway)", () => {
        const s: ScriptRequireGuard = { type: "requireGuard", credential: Credential.keyHash("ab".repeat(28)) };
        expect( () => nativeScriptFromCborObj( nativeScriptToCborObj( s ) ) ).toThrow();
    });

    test("encodes as (6, credential)", () => {
        const s: ScriptRequireGuard = { type: "requireGuard", credential: Credential.keyHash("ab".repeat(28)) };
        const obj = nativeScriptToCborObj( s );
        expect( (obj.array[0] as CborUInt).num ).toBe( 6n );
    });

    test("round-trips with key-hash credential", () => {
        const s: ScriptRequireGuard = { type: "requireGuard", credential: Credential.keyHash("ab".repeat(28)) };
        const decoded = withDecodeVersion( 12, () => nativeScriptFromCborObj( nativeScriptToCborObj( s ) ) );
        expect( decoded.type ).toBe( "requireGuard" );
        expect( nativeScriptToCbor( decoded ).toString() )
            .toBe( nativeScriptToCbor( s ).toString() );
    });

    test("round-trips with script credential", () => {
        const s: ScriptRequireGuard = { type: "requireGuard", credential: Credential.script("cd".repeat(28)) };
        const decoded = withDecodeVersion( 12, () => nativeScriptFromCborObj( nativeScriptToCborObj( s ) ) );
        expect( decoded.type ).toBe( "requireGuard" );
        expect( nativeScriptToCbor( decoded ).toString() )
            .toBe( nativeScriptToCbor( s ).toString() );
    });
});
