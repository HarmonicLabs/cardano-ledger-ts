import { readFileSync } from "fs";
import { join } from "path";
import { toHex } from "@harmoniclabs/uint8array-utils";
import { Hash32, Hash28 } from "../../../../hashes";
import { CborMap } from "@harmoniclabs/cbor";
import { ByronBlock } from "../ByronBlock";
import { ByronEbBlock } from "../ByronEbBlock";
import { ByronEbbHead } from "../../header/ByronEbbHead";

const FIX = join( __dirname, "..", "..", "__tests__", "fixtures" );
const readBlock = ( n: number ) => readFileSync( join( FIX, `byron${n}.block` ), "utf8" ).trim();

// (file, txs, sscTag, hasProposal, votes) — expectations per real fixture
const CASES: [number, number, number, boolean, number][] = [
    [1, 0, 3, false, 0],
    [2, 2, 0, false, 0],
    [3, 0, 0, false, 0],
    [4, 1, 2, false, 0],
    [5, 1, 1, true, 1],
    [6, 1, 2, false, 0],
    [7, 6, 2, false, 0],
    [8, 0, 3, true, 7],
];

describe("ByronBlock — real Pallas main blocks", () => {

    test.each( CASES )( "byron%i round-trips byte-exactly", ( n ) => {
        const hex = readBlock( n );
        expect( toHex( ByronBlock.fromCbor( hex ).toCborBytes() ) ).toBe( hex );
    });

    test.each( CASES )( "byron%i decodes expected body contents", ( n, txs, sscTag, hasProp, votes ) => {
        const b = ByronBlock.fromCbor( readBlock( n ) );
        expect( b.isEbb ).toBe( false );
        const mb = b.mainBlock!;
        expect( mb.body.txPayload.length ).toBe( txs );
        expect( mb.body.ssc.type ).toBe( sscTag );
        expect( !!mb.body.update.proposal ).toBe( hasProp );
        expect( mb.body.update.votes.length ).toBe( votes );
        // header always present, with a heavyweight-delegation (tag 2) block signature
        expect( mb.header.consensusData.blockSig[0] ).toBe( 2 );
    });

    test("byron2 tx round-trips and exposes real inputs/outputs", () => {
        const mb = ByronBlock.fromCbor( readBlock( 2 ) ).mainBlock!;
        const aux = mb.body.txPayload[0];
        expect( aux.tx.inputs.length ).toBe( 1 );
        expect( aux.tx.outputs.length ).toBe( 2 );
        expect( aux.witnesses[0].type ).toBe( 0 );          // pk witness
        expect( aux.tx.outputs[0].address.toBase58().length ).toBeGreaterThan( 40 );
    });
});

// the real preprod genesis epoch-boundary block (slot 0), from a cardano-node
// immutable-DB chunk. `82 00 …` -> era tag 0 (EBB), protocolMagic 1 (preprod).
const PREPROD_GENESIS_EBB =
    "82008385015820d4b8de7a11d929a323373cbab6c1a9bdc931beffff11db111cf9d57356ee1937" +
    "5820afc0da64183bf2664f3d4eec7238d524ba607faeeab24fc100eb861dba69971b8200810081a09fff81a0";

describe("ByronBlock — real preprod genesis EBB", () => {
    test("decodes + round-trips the real epoch-boundary block", () => {
        const b = ByronBlock.fromCbor( PREPROD_GENESIS_EBB );
        expect( b.isEbb ).toBe( true );
        expect( toHex( b.toCborBytes() ) ).toBe( PREPROD_GENESIS_EBB );
        const ebb = b.ebBlock!;
        expect( ebb.header.protocolMagic ).toBe( 1 );          // preprod
        expect( ebb.header.consensusData.epoch ).toBe( 0n );
        expect( ebb.stakeholders.length ).toBe( 0 );
    });
});

describe("ByronEbBlock — synthetic epoch-boundary block round-trip", () => {
    // complements the real EBB above by exercising the construct/encode path
    test("construct -> encode -> decode is byte-exact", () => {
        const ebb = new ByronEbBlock({
            header: new ByronEbbHead({
                protocolMagic: 764824073,
                prevBlock: new Hash32( "ab".repeat(32) ),
                bodyProof: new Hash32( "cd".repeat(32) ),
                consensusData: { epoch: 0n, difficulty: 0n },
                extra: new CborMap([])
            }),
            stakeholders: [ new Hash28( "11".repeat(28) ), new Hash28( "22".repeat(28) ) ],
            extra: new CborMap([])
        });
        const block = new ByronBlock( ebb );
        const hex = toHex( block.toCborBytes() );

        const decoded = ByronBlock.fromCbor( hex );
        expect( decoded.isEbb ).toBe( true );
        expect( toHex( decoded.toCborBytes() ) ).toBe( hex );
        expect( decoded.ebBlock!.stakeholders.length ).toBe( 2 );
        expect( decoded.ebBlock!.header.consensusData.epoch ).toBe( 0n );
    });
});
