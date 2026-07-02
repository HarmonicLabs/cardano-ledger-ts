import { readFileSync } from "fs";
import { join } from "path";
import { Cbor, CborArray } from "@harmoniclabs/cbor";
import { fromHex, toHex } from "@harmoniclabs/uint8array-utils";
import { ByronUpdate } from "../ByronUpdate";

const FIX = join( __dirname, "..", "..", "__tests__", "fixtures" );

// update payload lives at block[1][1][3] (up = [[?upprop], [*upvote]])
function upHex( n: number ): string
{
    const block = Cbor.parse( fromHex( readFileSync( join( FIX, `byron${n}.block` ), "utf8" ).trim() ) ) as CborArray;
    const body = (block.array[1] as CborArray).array[1] as CborArray;
    return toHex( Cbor.encode( body.array[3] ) );
}

describe("Byron update payload (real byron5 / byron8)", () => {

    test("byron5 up (proposal + 1 vote) round-trips byte-exactly", () => {
        const hex = upHex( 5 );
        expect( toHex( ByronUpdate.fromCbor( hex ).toCborBytes() ) ).toBe( hex );
    });

    test("byron5 decodes the real proposal fields", () => {
        const up = ByronUpdate.fromCbor( upHex( 5 ) );
        expect( up.proposal ).toBeDefined();
        expect( up.votes.length ).toBe( 1 );
        // real byron5 proposal: softwareVersion ["csl-daedalus", 1], bvermod has 14 fields
        expect( up.proposal!.softwareVersion[0] ).toBe( "csl-daedalus" );
        expect( up.proposal!.blockVersionMod.raw.array.length ).toBe( 14 );
        expect( up.proposal!.from.length ).toBeGreaterThan( 0 );
        expect( up.votes[0].vote ).toBe( true );
    });

    test("byron8 up (proposal + 7 votes) round-trips byte-exactly", () => {
        const hex = upHex( 8 );
        expect( toHex( ByronUpdate.fromCbor( hex ).toCborBytes() ) ).toBe( hex );
        const up = ByronUpdate.fromCbor( hex );
        expect( up.votes.length ).toBe( 7 );
        expect( up.proposal!.blockVersion.major ).toBe( 2 ); // bver [2,0,0]
        expect( up.proposal!.softwareVersion[0] ).toBe( "cardano-sl" );
    });

    test("blocks without updates have an empty up payload that still round-trips", () => {
        const hex = upHex( 3 ); // no proposal, no votes
        expect( toHex( ByronUpdate.fromCbor( hex ).toCborBytes() ) ).toBe( hex );
        const up = ByronUpdate.fromCbor( hex );
        expect( up.proposal ).toBeUndefined();
        expect( up.votes.length ).toBe( 0 );
    });
});
