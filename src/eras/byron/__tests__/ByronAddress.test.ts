import { fromHex, toHex } from "@harmoniclabs/uint8array-utils";
import { blake2b_256 } from "@harmoniclabs/crypto";
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

// Mainnet Byron genesis `avvmDistr` entries (base64url redeem public keys) and the
// redeem addresses they must derive to. Verified 2026-09-03 against mainnet via
// Blockfrost: each address received exactly its genesis lovelace in the redeem tx.
const AVVM_VECTORS: Array<{ pk: string; addr: string; utxoId: string }> = [
    { pk: "-0BJDi-gauylk4LptQTgjMeo7kY9lTCbZv12vwOSTZk=", addr: "Ae2tdPwUPEZHFQnrr2dYB4GEQ8WVKspEyrg29pJ3f7qdjzaxjeShEEokF5f", utxoId: "8ee33c9906974706223d7d500d63bbee2369d7150f972757a9fdded2f706b938" },
    { pk: "-0Np4pyTOWF26iXWVIvu6fhz9QupwWRS2hcCaOEYlw0=", addr: "Ae2tdPwUPEZFF5MA48FeLbPhKPbC9pG5DpzReXzzoFhofPR7nZQ8DSR3A4G", utxoId: "2d8208189f58f59c674fbe8f8c421f84c9060aa4b790d498c5f6083819f3e131" },
    { pk: "-0_pjw54ACGTrCsH3SXreedq-Cj9pFBcZDbxT9sXaqQ=", addr: "Ae2tdPwUPEZEESRbZwe58ZcwLRD7P9kxCLad3gxBVNdFRCP4En5z8eh5QCF", utxoId: "cec733c7d6c052103194446440669995adb76f13a70eed526e2d1241b16feda3" },
];

function base64urlToBytes( s: string ): Uint8Array
{
    return new Uint8Array( Buffer.from( s.replace(/-/g, "+").replace(/_/g, "/"), "base64" ) );
}

describe("ByronAddress construction from spending data", () => {

    test("fromRedeemPublicKey reproduces mainnet AVVM genesis addresses", () => {
        for( const v of AVVM_VECTORS )
        {
            const a = ByronAddress.fromRedeemPublicKey( base64urlToBytes( v.pk ) );
            expect( a.byronType ).toBe( 2 );
            expect( a.attributes.networkMagic ).toBeUndefined();
            expect( a.toBase58() ).toBe( v.addr );
            // genesis UTxO id = blake2b-256 of the address bytes (cardano-ledger-byron genesisUtxo)
            expect( toHex( blake2b_256( a.toBuffer() ) ) ).toBe( v.utxoId );
            // decode → re-encode is byte-exact
            expect( ByronAddress.fromBase58( v.addr ).toBase58() ).toBe( v.addr );
        }
    });

    test("testnet redeem addresses carry the network-magic attribute", () => {
        const a = ByronAddress.fromRedeemPublicKey( base64urlToBytes( AVVM_VECTORS[0].pk ), 1 );
        expect( a.attributes.networkMagic ).toBe( 1 );
        expect( a.network ).toBe( "testnet" );
        const back = ByronAddress.fromBase58( a.toBase58() );
        expect( back.attributes.networkMagic ).toBe( 1 );
        expect( toHex( back.rootHash ) ).toBe( toHex( a.rootHash ) );
        // mainnet magic is normalised to "no attribute"
        expect( ByronAddress.fromRedeemPublicKey( base64urlToBytes( AVVM_VECTORS[0].pk ), BYRON_MAINNET_PROTOCOL_MAGIC ).toBase58() ).toBe( AVVM_VECTORS[0].addr );
    });

    test("fromPublicKey builds a decodable type-0 address and rejects bad key sizes", () => {
        const xpub = new Uint8Array( 64 ).map( (_, i) => (i * 13 + 1) & 0xff );
        const a = ByronAddress.fromPublicKey( xpub );
        expect( a.byronType ).toBe( 0 );
        expect( a.rootHash.length ).toBe( 28 );
        expect( ByronAddress.fromBase58( a.toBase58() ).toBase58() ).toBe( a.toBase58() );
        expect( () => ByronAddress.fromPublicKey( new Uint8Array( 32 ) ) ).toThrow();
        expect( () => ByronAddress.fromRedeemPublicKey( new Uint8Array( 31 ) ) ).toThrow();
    });
});
