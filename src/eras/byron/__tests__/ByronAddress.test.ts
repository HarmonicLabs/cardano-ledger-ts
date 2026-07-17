import { fromHex, toHex } from "@harmoniclabs/uint8array-utils";
import { ByronAddress, isByronAddress, BYRON_MAINNET_PROTOCOL_MAGIC } from "../ByronAddress";

// real mainnet Icarus address (from Michele's report); empty attributes, type 0
const MAINNET = "Ae2tdPwUPEZG5vXaeYjSJJNuFzZ2cgAhJe7AaVGFW4epbC1h8nFeaxhgzR3";
const MAINNET_ROOT = "c1362168fb5b07670cecb68caeba9d4fdac1c5527afc728544f74d3e";

// synthetic fixtures (hand-encoded) exercising the two optional attributes.
// root = 00112233445566778899aabbccddeeff00112233445566778899aabb, type 0
const TESTNET = "2cWKMJemoBah8Uarj53Jq9sGYzUHn2EBndw9wL3PRtCqtYQK6L4ozwLkDELBMCgYrjeS4"; // attr key 2 = magic 1097911063
const DERIV_PATH = "Ge7xpZdib9TzREAhcCAPsg4KJVgdoUuqiAMT2ELV9GeC912KfnWM11jNtMFuLDu1Qxea1MxpyGM9jJ"; // attr key 1
const SYNTH_ROOT = "00112233445566778899aabbccddeeff00112233445566778899aabb";

describe("ByronAddress", () => {

    test("decodes the mainnet example", () => {
        const b = ByronAddress.fromBase58( MAINNET );
        expect( isByronAddress( b ) ).toBe( true );
        expect( toHex( b.rootHash ) ).toBe( MAINNET_ROOT );
        expect( b.byronType ).toBe( 0 );
        expect( b.type ).toBe( "byron" );
        expect( b.attributes.derivationPath ).toBeUndefined();
        expect( b.attributes.networkMagic ).toBeUndefined();
        expect( b.network ).toBe( "mainnet" );
        expect( b.protocolMagic() ).toBe( BYRON_MAINNET_PROTOCOL_MAGIC );
    });

    test("round-trips base58 byte-exactly", () => {
        for( const s of [ MAINNET, TESTNET, DERIV_PATH ] )
        {
            expect( ByronAddress.fromBase58( s ).toBase58() ).toBe( s );
        }
    });

    test("re-encodes from fields (no preserved bytes) identically", () => {
        for( const s of [ MAINNET, TESTNET, DERIV_PATH ] )
        {
            const decoded = ByronAddress.fromBase58( s );
            const rebuilt = new ByronAddress({
                rootHash: decoded.rootHash,
                attributes: decoded.attributes,
                type: decoded.byronType
            }); // note: NO originalBytes -> forces the encode path
            expect( rebuilt.toBase58() ).toBe( s );
        }
    });

    test("parses the network-magic attribute (testnet)", () => {
        const b = ByronAddress.fromBase58( TESTNET );
        expect( toHex( b.rootHash ) ).toBe( SYNTH_ROOT );
        expect( b.attributes.networkMagic ).toBe( 1097911063 );
        expect( b.network ).toBe( "testnet" );
        expect( b.protocolMagic() ).toBe( 1097911063 );
    });

    test("parses the derivation-path attribute", () => {
        const b = ByronAddress.fromBase58( DERIV_PATH );
        expect( b.attributes.derivationPath ).toBeInstanceOf( Uint8Array );
        expect( toHex( b.attributes.derivationPath! ) ).toBe( "aabbbbbbbbbbbbbbbbbbbbbb" );
        expect( b.attributes.networkMagic ).toBeUndefined();
        expect( b.network ).toBe( "mainnet" );
    });

    test("rejects a CRC32 mismatch", () => {
        // mainnet bytes with the first root byte flipped c1 -> c2 (stale crc)
        const tampered = "82d818582183581cc2362168fb5b07670cecb68caeba9d4fdac1c5527afc728544f74d3ea0001a07d70d2e";
        expect( () => ByronAddress.fromBytes( fromHex( tampered ) ) ).toThrow( /CRC32 mismatch/ );
    });

    test("isValid guards without throwing", () => {
        expect( ByronAddress.isValid( MAINNET ) ).toBe( true );
        expect( ByronAddress.isValid( "not a byron address" ) ).toBe( false );
        expect( ByronAddress.isValid( "addr_test1xyz" ) ).toBe( false );
    });

    test("fromCbor / toCbor round-trips as a CBOR byte string", () => {
        const b = ByronAddress.fromBase58( MAINNET );
        const back = ByronAddress.fromCbor( b.toCbor() );
        expect( back.toBase58() ).toBe( MAINNET );
    });
});
