import { readFileSync } from "fs";
import { join } from "path";
import { CborMap } from "@harmoniclabs/cbor";
import { toHex } from "@harmoniclabs/uint8array-utils";
import { Hash32, Hash28 } from "../../../hashes";
import { MultiEraBlock } from "../MultiEraBlock";
import { ByronMainBlock } from "../../byron/block/ByronMainBlock";
import { ByronEbBlock } from "../../byron/block/ByronEbBlock";
import { ByronEbbHead } from "../../byron/header/ByronEbbHead";

const FIX = join( __dirname, "..", "..", "byron", "__tests__", "fixtures" );
const readBlock = ( n: number ) => readFileSync( join( FIX, `byron${n}.block` ), "utf8" ).trim();

describe("MultiEraBlock — Byron (era tag 1 = main, 0 = EBB)", () => {

    // a Pallas byron block is `[1, mainblock]` — already the mini-protocol-framed shape
    test("routes a real main block (byron2) to era 1 / ByronMainBlock", () => {
        const hex = readBlock( 2 );
        const meb = MultiEraBlock.fromCbor( hex );
        expect( meb.era ).toBe( 1 );
        expect( meb.block ).toBeInstanceOf( ByronMainBlock );
        expect( (meb.block as ByronMainBlock).body.txPayload.length ).toBe( 2 );
        expect( toHex( meb.toCborBytes() ) ).toBe( hex );
    });

    test("all real fixtures decode as era 1 main blocks", () => {
        for( const n of [1, 2, 3, 4, 5, 6, 7, 8] )
        {
            const meb = MultiEraBlock.fromCbor( readBlock( n ) );
            expect( meb.era ).toBe( 1 );
            expect( meb.block ).toBeInstanceOf( ByronMainBlock );
        }
    });

    test("routes the real preprod genesis EBB to era 0 / ByronEbBlock", () => {
        // real epoch-boundary block from a cardano-node immutable-DB chunk
        const PREPROD_GENESIS_EBB =
            "82008385015820d4b8de7a11d929a323373cbab6c1a9bdc931beffff11db111cf9d57356ee1937" +
            "5820afc0da64183bf2664f3d4eec7238d524ba607faeeab24fc100eb861dba69971b8200810081a09fff81a0";
        const meb = MultiEraBlock.fromCbor( PREPROD_GENESIS_EBB );
        expect( meb.era ).toBe( 0 );
        expect( meb.block ).toBeInstanceOf( ByronEbBlock );
        expect( toHex( meb.toCborBytes() ) ).toBe( PREPROD_GENESIS_EBB );
    });

    test("routes an epoch-boundary block to era 0 / ByronEbBlock (synthetic)", () => {
        const ebb = new ByronEbBlock({
            header: new ByronEbbHead({
                protocolMagic: 764824073,
                prevBlock: new Hash32( "ab".repeat(32) ),
                bodyProof: new Hash32( "cd".repeat(32) ),
                consensusData: { epoch: 0n, difficulty: 0n },
                extra: new CborMap([])
            }),
            stakeholders: [ new Hash28( "11".repeat(28) ) ],
            extra: new CborMap([])
        });
        const hex = toHex( new MultiEraBlock({ era: 0, block: ebb }).toCborBytes() );

        const meb = MultiEraBlock.fromCbor( hex );
        expect( meb.era ).toBe( 0 );
        expect( meb.block ).toBeInstanceOf( ByronEbBlock );
        expect( toHex( meb.toCborBytes() ) ).toBe( hex );
    });
});
