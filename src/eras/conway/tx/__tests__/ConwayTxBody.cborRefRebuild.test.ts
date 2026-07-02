import { Cbor, CborMap, CborUInt, CborBytes } from "@harmoniclabs/cbor";
import { ConwayTxBody } from "../ConwayTxBody";
import { ScriptDataHash } from "../../../../hashes";

// Real Conway TxBody CBOR ("mutexo 0" fixture from ConwayTxBody.fromCbor.test.ts):
// map { 0: inputs, 1: outputs, 2: fee } — no scriptDataHash (key 11) yet.
const HEX = "a300d9010281825820fa8b8effda36dc959a297850e721fcfcbac71dc47215044694bb17a8429900e4185e018182581d60da0eb5ed7611482ec5089b69d870e0c56c1c45180256112398e0835b1b00000002540be400021a00030d40";

const NEW_HASH_HEX = "ab".repeat(32);

function scriptDataHashInCbor( bodyCbor: Uint8Array ): string | undefined {
    const m = Cbor.parse( bodyCbor ) as CborMap;
    const e = m.map.find( ({ k }) => k instanceof CborUInt && Number(k.num) === 11 );
    return e && e.v instanceof CborBytes ? Buffer.from( e.v.bytes ).toString("hex") : undefined;
}

// Michele's bug: rebuilding a DECODED body with a changed field via spread returns the
// STALE original CBOR (the cached cborRef gets copied by the spread and reused), so the
// re-encoded bytes don't reflect the change — without manually nulling cborRef.
describe("ConwayTxBody rebuild-with-changed-field must re-encode (cborRef staleness)", () => {

    test("rebuilding with a new scriptDataHash is reflected in toCbor()", () => {
        const decoded = ConwayTxBody.fromCbor( HEX );
        expect( decoded.scriptDataHash ).toBeUndefined();      // fixture has no key 11

        // exactly Michele's pattern — spread the decoded instance + override one field, no manual cborRef nulling
        const rebuilt = new ConwayTxBody({
            ...decoded,
            scriptDataHash: new ScriptDataHash( NEW_HASH_HEX )
        });

        // the field is set on the instance...
        expect( rebuilt.scriptDataHash?.toString() ).toBe( NEW_HASH_HEX );

        // ...and it MUST show up in the re-encoded bytes (this is what breaks today)
        expect( scriptDataHashInCbor( rebuilt.toCbor() ) ).toBe( NEW_HASH_HEX );
        expect( Buffer.from( rebuilt.toCbor() ).toString("hex") ).not.toBe( HEX );
    });

    // fidelity guard: an UNCHANGED decoded body must still round-trip byte-identical
    test("unchanged decoded body still round-trips byte-identical (fidelity)", () => {
        const decoded = ConwayTxBody.fromCbor( HEX );
        expect( Buffer.from( decoded.toCbor() ).toString("hex") ).toBe( HEX );
    });
});
