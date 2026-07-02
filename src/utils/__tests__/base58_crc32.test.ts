import { fromHex, toHex } from "@harmoniclabs/uint8array-utils";
import { base58Decode, base58Encode } from "../base58";
import { crc32 } from "../crc32";

describe("base58", () => {

    test("decodes the Byron mainnet example to the expected CBOR bytes", () => {
        const addr = "Ae2tdPwUPEZG5vXaeYjSJJNuFzZ2cgAhJe7AaVGFW4epbC1h8nFeaxhgzR3";
        const expected = "82d818582183581cc1362168fb5b07670cecb68caeba9d4fdac1c5527afc728544f74d3ea0001a07d70d2e";
        expect( toHex( base58Decode( addr ) ) ).toBe( expected );
    });

    test("encode/decode round-trip", () => {
        const bytes = fromHex( "82d818582183581cc1362168fb5b07670cecb68caeba9d4fdac1c5527afc728544f74d3ea0001a07d70d2e" );
        expect( base58Decode( base58Encode( bytes ) ) ).toEqual( bytes );
    });

    test("preserves leading zero bytes as leading '1's", () => {
        const bytes = new Uint8Array([ 0, 0, 1, 2, 3 ]);
        const s = base58Encode( bytes );
        expect( s.startsWith( "11" ) ).toBe( true );
        expect( base58Decode( s ) ).toEqual( bytes );
    });

    test("throws on an invalid base58 character", () => {
        expect( () => base58Decode( "0OIl" ) ).toThrow();
    });
});

describe("crc32 (ISO-HDLC)", () => {

    test('crc32("123456789") === 0xCBF43926 (standard check value)', () => {
        const bytes = new Uint8Array( "123456789".split("").map( c => c.charCodeAt(0) ) );
        expect( crc32( bytes ) >>> 0 ).toBe( 0xcbf43926 );
    });

    test("matches the Byron example payload checksum", () => {
        const payload = fromHex( "83581cc1362168fb5b07670cecb68caeba9d4fdac1c5527afc728544f74d3ea000" );
        expect( crc32( payload ) ).toBe( 0x07d70d2e );
    });
});
