import { nativeScriptToCborObj, nativeScriptToCbor, nativeScriptFromCborObj, ScriptRequireGuard } from "../NativeScript";
import { Credential } from "../../credentials";
import { CborUInt } from "@harmoniclabs/cbor";

describe("NativeScript script_require_guard (tag 6)", () => {

    test("encodes as (6, credential)", () => {
        const s: ScriptRequireGuard = { type: "requireGuard", credential: Credential.keyHash("ab".repeat(28)) };
        const obj = nativeScriptToCborObj( s );
        expect( (obj.array[0] as CborUInt).num ).toBe( 6n );
    });

    test("round-trips with key-hash credential", () => {
        const s: ScriptRequireGuard = { type: "requireGuard", credential: Credential.keyHash("ab".repeat(28)) };
        const decoded = nativeScriptFromCborObj( nativeScriptToCborObj( s ) );
        expect( decoded.type ).toBe( "requireGuard" );
        expect( nativeScriptToCbor( decoded ).toString() )
            .toBe( nativeScriptToCbor( s ).toString() );
    });

    test("round-trips with script credential", () => {
        const s: ScriptRequireGuard = { type: "requireGuard", credential: Credential.script("cd".repeat(28)) };
        const decoded = nativeScriptFromCborObj( nativeScriptToCborObj( s ) );
        expect( decoded.type ).toBe( "requireGuard" );
        expect( nativeScriptToCbor( decoded ).toString() )
            .toBe( nativeScriptToCbor( s ).toString() );
    });
});
