import { readFileSync } from "fs";
import { join } from "path";
import { Cbor, CborArray, CborUInt, CborMap } from "@harmoniclabs/cbor";
import { fromHex, toHex } from "@harmoniclabs/uint8array-utils";
import { Hash32 } from "../../../hashes";
import { MultiEraHeader } from "../MultiEraHeader";
import { ByronBlockHeaderBody } from "../../byron/header/ByronBlockHeaderBody";
import { ByronEbbHead } from "../../byron/header/ByronEbbHead";

const FIX = join( __dirname, "..", "..", "byron", "__tests__", "fixtures" );

// build a mini-protocol-framed Byron header `[1, blockhead]` from a real block's header
function realByronMainHeaderFramed(): string
{
    const block = Cbor.parse( fromHex( readFileSync( join( FIX, "byron2.block" ), "utf8" ).trim() ) ) as CborArray;
    const blockhead = (block.array[1] as CborArray).array[0]; // mainblock[0]
    return toHex( Cbor.encode( new CborArray([ new CborUInt( 1 ), blockhead ]) ) );
}

describe("MultiEraHeader — Byron (era tag 1 = main, 0 = EBB)", () => {

    test("routes a real main-block header to era 1 / ByronBlockHeaderBody", () => {
        const hex = realByronMainHeaderFramed();
        const meh = MultiEraHeader.fromCbor( hex );
        expect( meh.era ).toBe( 1 );
        expect( meh.header ).toBeInstanceOf( ByronBlockHeaderBody );
        expect( (meh.header as ByronBlockHeaderBody).protocolMagic ).toBe( 764824073 );
        expect( toHex( meh.toCborBytes() ) ).toBe( hex );
    });

    test("routes an EBB header to era 0 / ByronEbbHead (synthetic)", () => {
        const ebbHead = new ByronEbbHead({
            protocolMagic: 764824073,
            prevBlock: new Hash32( "ab".repeat(32) ),
            bodyProof: new Hash32( "cd".repeat(32) ),
            consensusData: { epoch: 7n, difficulty: 42n },
            extra: new CborMap([])
        });
        const hex = toHex( new MultiEraHeader({ era: 0, header: ebbHead }).toCborBytes() );

        const meh = MultiEraHeader.fromCbor( hex );
        expect( meh.era ).toBe( 0 );
        expect( meh.header ).toBeInstanceOf( ByronEbbHead );
        expect( (meh.header as ByronEbbHead).consensusData.epoch ).toBe( 7n );
        expect( toHex( meh.toCborBytes() ) ).toBe( hex );
    });
});
