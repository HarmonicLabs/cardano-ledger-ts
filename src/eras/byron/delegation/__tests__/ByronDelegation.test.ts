import { readFileSync } from "fs";
import { join } from "path";
import { Cbor, CborArray } from "@harmoniclabs/cbor";
import { fromHex, toHex } from "@harmoniclabs/uint8array-utils";
import { ByronDlgSig, ByronLwDelegationCert, ByronLwDlgSig } from "../ByronDelegation";

const FIX = join( __dirname, "..", "..", "__tests__", "fixtures" );

// pull the real heavyweight-delegation signature out of byron2's block header:
// header.consensusData.blockSig = [2, dlgsig]
function realDlgSigHex(): string
{
    const block = Cbor.parse( fromHex( readFileSync( join( FIX, "byron2.block" ), "utf8" ).trim() ) ) as CborArray;
    const header = (block.array[1] as CborArray).array[0] as CborArray;
    const blockSig = (header.array[3] as CborArray).array[3] as CborArray; // consensusData[3]
    return toHex( Cbor.encode( blockSig.array[1] ) ); // the dlgsig
}

describe("Byron delegation (real dlgsig from byron2 header)", () => {

    const DLGSIG = realDlgSigHex();

    test("ByronDlgSig round-trips byte-exactly", () => {
        expect( toHex( ByronDlgSig.fromCbor( DLGSIG ).toCborBytes() ) ).toBe( DLGSIG );
    });

    test("decodes the heavyweight delegation cert fields", () => {
        const sig = ByronDlgSig.fromCbor( DLGSIG );
        expect( sig.cert.issuer.length ).toBe( 64 );      // ed25519 || chaincode
        expect( sig.cert.delegate.length ).toBe( 64 );
        expect( sig.cert.certificate.length ).toBe( 64 ); // signature
        expect( sig.signature.length ).toBe( 64 );
        expect( typeof sig.cert.epoch ).toBe( "bigint" );
    });

    test("lightweight (proxy) delegation round-trips (synthetic)", () => {
        const lw = new ByronLwDlgSig({
            cert: new ByronLwDelegationCert({
                epochRange: [ 0n, 5n ],
                issuer: new Uint8Array(64).fill(1),
                delegate: new Uint8Array(64).fill(2),
                certificate: new Uint8Array(64).fill(3)
            }),
            signature: new Uint8Array(64).fill(4)
        });
        const hex = toHex( lw.toCborBytes() );
        expect( toHex( ByronLwDlgSig.fromCbor( hex ).toCborBytes() ) ).toBe( hex );
        expect( ByronLwDlgSig.fromCbor( hex ).cert.epochRange ).toEqual( [ 0n, 5n ] );
    });
});
