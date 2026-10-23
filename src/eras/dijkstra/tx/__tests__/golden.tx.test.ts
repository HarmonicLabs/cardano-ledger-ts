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

    // The golden body does NOT decode with this library. KNOWN DRIFT, ours: cardano-ledger
    // master keys `account_balance_intervals` (body key 26) by `credential`
    // (`{+ credential => account_balance_interval}`), while DijkstraAccountBalanceInterval
    // still follows the earlier draft (29-byte reward accounts, plus a key 27). Updating the
    // Dijkstra shapes to the current CDDL is a follow-up; when it lands, this test should
    // become a full decode / re-encode round trip of the golden body.
    test("golden body is rejected because of the balance-interval key drift (credential keys upstream)", () => {
        const parsed = Cbor.parse( GOLDEN_HEX ) as CborArray;
        const body = parsed.array[0] as CborMap;
        const abi = body.map.find( e => Number((e.k as CborUInt).num) === 26 )!.v as CborMap;
        expect( abi.map.length ).toBeGreaterThan( 0 );
        for( const { k } of abi.map ) {
            // credential = [0, addr_keyhash] / [1, script_hash]
            expect( k ).toBeInstanceOf( CborArray );
            expect( (k as CborArray).array.length ).toBe( 2 );
        }
        expect( () => DijkstraTxBody.fromCborObj( body ) ).toThrow( /invalid reward account/ );
    });
});
