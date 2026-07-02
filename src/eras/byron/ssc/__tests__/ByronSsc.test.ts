import { readFileSync } from "fs";
import { join } from "path";
import { Cbor, CborArray } from "@harmoniclabs/cbor";
import { fromHex, toHex } from "@harmoniclabs/uint8array-utils";
import { Hash32 } from "../../../../hashes";
import { ByronSsc } from "../ByronSsc";
import { ByronSscProof } from "../ByronSscProof";

const FIX = join( __dirname, "..", "..", "__tests__", "fixtures" );

// ssc payload lives at block[1][1][1]; header sscProof at block[1][0][2][1]
function sscHex( n: number ): string
{
    const block = Cbor.parse( fromHex( readFileSync( join( FIX, `byron${n}.block` ), "utf8" ).trim() ) ) as CborArray;
    const body = (block.array[1] as CborArray).array[1] as CborArray;
    return toHex( Cbor.encode( body.array[1] ) );
}
function sscProofHex( n: number ): string
{
    const block = Cbor.parse( fromHex( readFileSync( join( FIX, `byron${n}.block` ), "utf8" ).trim() ) ) as CborArray;
    const header = (block.array[1] as CborArray).array[0] as CborArray;
    const bodyProof = header.array[2] as CborArray;
    return toHex( Cbor.encode( bodyProof.array[1] ) ); // sscProof
}

describe("ByronSsc — all four real variants (byron fixtures)", () => {

    // byron2->tag0, byron5->tag1, byron4->tag2, byron1->tag3
    test.each( [ [2, 0], [5, 1], [4, 2], [1, 3] ] )( "byron%i ssc (tag %i) round-trips + decodes tag", ( n, tag ) => {
        const hex = sscHex( n );
        expect( toHex( ByronSsc.fromCbor( hex ).toCborBytes() ) ).toBe( hex );
        expect( ByronSsc.fromCbor( hex ).type ).toBe( tag );
    });

    test("tag 3 (certificates-only) has a single member; tags 0-2 have two", () => {
        expect( ByronSsc.fromCbor( sscHex( 1 ) ).members.length ).toBe( 1 ); // tag 3
        expect( ByronSsc.fromCbor( sscHex( 2 ) ).members.length ).toBe( 2 ); // tag 0
    });
});

describe("ByronSscProof — real header proofs", () => {

    test.each( [ [1, 3], [2, 0], [4, 2] ] )( "byron%i sscProof (tag %i) round-trips", ( n, tag ) => {
        const hex = sscProofHex( n );
        expect( toHex( ByronSscProof.fromCbor( hex ).toCborBytes() ) ).toBe( hex );
        expect( ByronSscProof.fromCbor( hex ).type ).toBe( tag );
    });

    test("tag 3 proof has one hash, tag 0 has two", () => {
        expect( ByronSscProof.fromCbor( sscProofHex( 1 ) ).hashes.length ).toBe( 1 );
        expect( ByronSscProof.fromCbor( sscProofHex( 2 ) ).hashes.length ).toBe( 2 );
        expect( ByronSscProof.fromCbor( sscProofHex( 1 ) ).hashes[0] ).toBeInstanceOf( Hash32 );
    });
});
