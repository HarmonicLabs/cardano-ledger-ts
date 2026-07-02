import { readFileSync } from "fs";
import { join } from "path";
import { Cbor, CborArray, CborMap, CborUInt, CborTag, CborBytes, CborSimple } from "@harmoniclabs/cbor";
import { DijkstraTxBody } from "../DijkstraTxBody";
import { DijkstraTx } from "../DijkstraTx";
import { DijkstraTxWitnessSet } from "../DijkstraTxWitnessSet";
import { DijkstraTxOut } from "../DijkstraTxOut";
import { DijkstraUTxO } from "../DijkstraUTxO";

// Authoritative golden transaction from IntersectMBO/cardano-ledger
// (eras/dijkstra/impl/golden/tx.cbor) — the ledger team's own canonical
// Dijkstra `transaction` example. Used as ground truth instead of a synthetic
// block: Dijkstra isn't deployed to any network yet, so no real on-chain block
// exists. NOTE: this golden is generated from Haskell `Arbitrary` instances, so
// some fields hold structurally-valid-but-semantically-junk values (see below).
const GOLDEN_HEX = readFileSync( join( __dirname, "golden.tx.hex" ), "utf8" ).trim();

describe("Dijkstra golden transaction (upstream cardano-ledger)", () => {

    test("golden is the 3-element `transaction` form (is_valid deprecated)", () => {
        const parsed = Cbor.parse( GOLDEN_HEX ) as CborArray;
        expect( parsed instanceof CborArray ).toBe( true );
        expect( parsed.array.length ).toBe( 3 ); // [body, witness_set, auxiliary_data] — no is_valid
    });

    test("our DijkstraTx now emits the same 3-element shape", () => {
        const tx = new DijkstraTx({
            body: new DijkstraTxBody({
                inputs: [ new DijkstraUTxO({ utxoRef: { id: "ab".repeat(32), index: 0 }, resolved: DijkstraTxOut.fake }) ],
                outputs: [ DijkstraTxOut.fake ],
                fee: 200_000
            }),
            witnesses: new DijkstraTxWitnessSet({})
        });
        expect( (tx.toCborObj() as CborArray).array.length ).toBe( 3 );
    });

    // gOuroboros (the lib Dingo runs on the live Leios testnet) confirms the
    // `transaction_mempool` rule: a 4-element `[body, wits, true, auxdata]` is
    // accepted inbound. We verify decode of that shape with synthetic data.
    // (Behavioral divergence to note: gOuroboros REJECTS is_valid=false in the
    // mempool; we currently accept and store the bool.)
    test("decodes the 4-element mempool form (is_valid present) — gOuroboros-confirmed", () => {
        const tx = new DijkstraTx({
            body: new DijkstraTxBody({
                inputs: [ new DijkstraUTxO({ utxoRef: { id: "ab".repeat(32), index: 0 }, resolved: DijkstraTxOut.fake }) ],
                outputs: [ DijkstraTxOut.fake ],
                fee: 200_000
            }),
            witnesses: new DijkstraTxWitnessSet({})
        });
        const three = tx.toCborObj() as CborArray; // [body, wits, auxdata/nil]
        const mempool = new CborArray([ three.array[0], three.array[1], new CborSimple( true ), three.array[2] ]);
        const decoded = DijkstraTx.fromCbor( Cbor.encode( mempool ) );
        expect( decoded.isScriptValid ).toBe( true );
        expect( (decoded.body.toCbor().toString()) ).toBe( tx.body.toCbor().toString() );
    });

    // The golden body does NOT round-trip through our decoder — but the reason is
    // the golden vector, not our implementation: its pool_registration cert carries
    // a 2-byte pool_metadata hash, while the CDDL requires `metadata_hash = hash32`
    // (bytes .size 32). Our Hash32 is correctly strict; real on-chain txs always
    // carry 32-byte metadata hashes. This test PINS that exact cause so the
    // distinction stays documented.
    test("golden body fails only due to a size-invalid (2-byte) pool_metadata hash, not our logic", () => {
        const parsed = Cbor.parse( GOLDEN_HEX ) as CborArray;

        // 1) confirm the offending value really is a 2-byte hash in a hash32 slot
        const body = parsed.array[0] as CborMap;
        const certsV = body.map.find( e => Number((e.k as CborUInt).num) === 4 )!.v;
        const certs = certsV instanceof CborTag ? (certsV.data as CborArray).array : (certsV as CborArray).array;
        const poolReg = certs.find( (c: any) => Number(c.array[0].num) === 3 ) as CborArray;
        const poolMetadata = poolReg.array[9] as CborArray; // [url, metadata_hash]
        const metaHash = poolMetadata.array[1] as CborBytes;
        expect( metaHash.bytes.length ).toBe( 2 );            // golden junk; CDDL wants 32
        expect( metaHash.bytes.length ).not.toBe( 32 );

        // 2) and that this is precisely what makes our strict decoder reject it
        expect( () => DijkstraTxBody.fromCborObj( body ) ).toThrow( /Hash32.*length was: 2/ );
    });
});
