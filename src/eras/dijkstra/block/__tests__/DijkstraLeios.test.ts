import { readFileSync } from "fs";
import { join } from "path";
import { blake2b_256 } from "@harmoniclabs/crypto";
import { Cbor, CborArray, CborBytes } from "@harmoniclabs/cbor";
import {
    DijkstraLeiosCertificate,
    LEIOS_CERTIFICATE_SIGNATURE_SIZE,
    LEIOS_COMMITTEE_MAX_SIZE,
    isLeiosSigner,
    leiosSignerBitfieldSize,
    validateLeiosSignerBitfield
} from "../DijkstraLeiosCertificate";
import {
    leiosCertificationWindowSlots,
    leiosEarliestCertificationSlot,
    validateLeiosCertificationTiming
} from "../DijkstraLeiosTiming";
import { DijkstraBlock } from "../DijkstraBlock";
import { DijkstraHeaderBody } from "../../header/DijkstraHeaderBody";

const FIX = join( __dirname, "..", "..", "__fixtures__" );
const bytesOf = ( f: string ) => Buffer.from(
    readFileSync( join( FIX, f ), "utf8" ).replace( /\s+/g, "" ),
    "hex"
);
const toHex = ( b: Uint8Array ) => Buffer.from( b ).toString( "hex" );

const pp = {
    leiosAnnouncementPeriodLength: 1000,
    leiosVotePeriodLength: 4000,
    leiosDiffusionPeriodLength: 7000
};

describe("Leios committee bitfield (gouroboros IsSignerBitfieldValidForSize)", () => {
    test("width is ceil(committee/8) and 65536 is the committee maximum", () => {
        expect( leiosSignerBitfieldSize( 0 ) ).toBe( 0 );
        expect( leiosSignerBitfieldSize( 1 ) ).toBe( 1 );
        expect( leiosSignerBitfieldSize( 16 ) ).toBe( 2 );
        expect( leiosSignerBitfieldSize( 900 ) ).toBe( 113 );
        expect( leiosSignerBitfieldSize( LEIOS_COMMITTEE_MAX_SIZE ) ).toBe( 8192 );
        expect( () => leiosSignerBitfieldSize( LEIOS_COMMITTEE_MAX_SIZE + 1 ) ).toThrow();
    });

    test("unused high bits must be zero", () => {
        expect( () => validateLeiosSignerBitfield( new Uint8Array([ 0xff, 0x0f ]), 12 ) ).not.toThrow();
        expect( () => validateLeiosSignerBitfield( new Uint8Array([ 0xff, 0x1f ]), 12 ) ).toThrow( /unused high bits/ );
        expect( () => validateLeiosSignerBitfield( new Uint8Array([ 0xc0 ]), 8 ) ).not.toThrow();
        expect( () => validateLeiosSignerBitfield( new Uint8Array([ 0xc0 ]), 17 ) ).toThrow( /needs 3 bytes/ );
        expect( () => validateLeiosSignerBitfield( new Uint8Array( 0 ), 0 ) ).not.toThrow();
    });

    test("first voter is the most-significant bit, like the reference decoder", () => {
        expect( isLeiosSigner( new Uint8Array([ 0x80 ]), 0 ) ).toBe( true );
        expect( isLeiosSigner( new Uint8Array([ 0x80 ]), 1 ) ).toBe( false );
        expect( isLeiosSigner( new Uint8Array([ 0x01 ]), 7 ) ).toBe( true );
        expect( isLeiosSigner( new Uint8Array([ 0x00, 0x04 ]), 13 ) ).toBe( true );
    });
});

describe("Dijkstra leios_certificate", () => {
    const certBlock = DijkstraBlock.fromCbor( bytesOf( "gouroboros_leios_rc_2026w41_certifying_block.hex" ) );
    const certInput = certBlock.leiosCertificate!;
    const certBytes = Cbor.encode( new CborArray([
        new CborBytes( certInput.signers ),
        new CborBytes( certInput.signature )
    ]) );

    test("decodes, validates the bitfield and re-encodes the reference certificate", () => {
        const cert = DijkstraLeiosCertificate.fromCbor( certBytes );
        expect( cert.signature.length ).toBe( LEIOS_CERTIFICATE_SIGNATURE_SIZE );
        expect( toHex( cert.toCborBytes() ) ).toBe( toHex( certBytes ) );
        expect( () => cert.validateSignerBitfield( 8 ) ).not.toThrow();
        expect( () => cert.validateSignerBitfield( 9 ) ).toThrow();
        expect( () => cert.validateSignerBitfield( 900 ) ).toThrow();
        expect( cert.isSigner( 0 ) ).toBe( true );
        expect( cert.isSigner( 1 ) ).toBe( true );
    });

    test("signers > 8192 bytes and signatures not 48 bytes are rejected", () => {
        expect( () => new DijkstraLeiosCertificate(
            { signers: new Uint8Array( 8193 ), signature: new Uint8Array( 48 ) }
        ) ).toThrow( /8192/ );
        expect( () => new DijkstraLeiosCertificate(
            { signers: new Uint8Array( 1 ), signature: new Uint8Array( 47 ) }
        ) ).toThrow( /48/ );
    });
});

describe("Dijkstra block_body Leios rules and certification timing", () => {
    const announcing = DijkstraBlock.fromCbor( bytesOf( "gouroboros_leios_rc_2026w41_announcing_block.hex" ) );
    const certified = DijkstraBlock.fromCbor( bytesOf( "gouroboros_leios_rc_2026w41_certifying_block.hex" ) );
    const announcement = announcing.header.body.ebAnnouncement!;

    test("the announcing block decodes the header announcement and passes block checks", () => {
        expect( toHex( announcement.hash ) ).toBe( "9674ce55de686a62cfa3074c6987f7af1891e62065cfad6a31e179550a7d170d" );
        expect( announcement.size ).toBe( 38 );
        expect( () => announcing.validate({
            maxEndorserBlockReferencesSize: 40000,
            minProtocolMajor: 12
        }) ).not.toThrow();
        expect( () => announcing.validate({ maxEndorserBlockReferencesSize: 37 }) ).toThrow( /eb_references_announcement/ );
        expect( () => announcing.validate({ minProtocolMajor: 13 }) ).toThrow( /major version/ );
    });

    test("the certified block has zero transactions, a certificate and no Peras certificate", () => {
        expect( certified.header.body.leiosCertified ).toBe( true );
        expect( certified.leiosCertificate ).not.toBeNull();
        expect( certified.transactions.length ).toBe( 0 );
        expect( certified.perasCertificate ).toBeNull();
        expect( () => certified.validate({
            maxEndorserBlockReferencesSize: 40000,
            minProtocolMajor: 12,
            leiosCommitteeSize: 8
        }) ).not.toThrow();
        expect( () => certified.validate({ leiosCommitteeSize: 9 }) ).toThrow( /bitfield/ );
        expect( () => certified.validate({ maxEndorserBlockReferencesSize: 72 }) ).toThrow( /eb_references_announcement/ );
    });

    test("the certified flag and certificate presence agree", () => {
        const noCertHeader = ( announcing.header.body as any );
        noCertHeader.leiosCertified = true;
        const badFlag = new DijkstraBlock({
            header: announcing.header,
            transactions: [],
            leiosCertificate: null
        });
        expect( ( badFlag.header.body as any ).leiosCertified ).toBe( true );
        expect( () => badFlag.validate() ).toThrow( /block_body_contains_leios_cert/ );
        noCertHeader.leiosCertified = false;

        const certHeader = certified.header.body as any;
        certHeader.leiosCertified = false;
        const badCert = new DijkstraBlock({
            header: certified.header,
            transactions: [],
            leiosCertificate: certified.leiosCertificate
        });
        expect( () => badCert.validate() ).toThrow( /block_body_contains_leios_cert/ );
        certHeader.leiosCertified = true;
    });

    test("Peras certificates are rejected unless Peras is enabled", () => {
        const block = new DijkstraBlock({
            header: certified.header,
            transactions: [],
            leiosCertificate: certified.leiosCertificate,
            perasCertificate: new Uint8Array([ 1, 2, 3 ])
        });
        const body = block.blockBodyBytes;
        ( block.header.body as any ).blockBodySize = body.length;
        ( block.header.body as any ).blockBodyHash = blake2b_256( body );
        expect( () => block.validate() ).toThrow( /Peras/ );
        expect( () => block.validate({ perasEnabled: true }) ).not.toThrow();
        ( certified.header.body as any ).blockBodySize = 56;
        ( certified.header.body as any ).blockBodyHash = certified.computeBlockBodyHash();
    });

    test("certification timing is 3*announcement + vote + diffusion slots at the announcing block", () => {
        expect( leiosCertificationWindowSlots( pp ) ).toBe( 14000n );
        expect( leiosEarliestCertificationSlot( 459, 1000, pp ) ).toBe( 473n );
        expect( certified.validateLeiosCertificateTiming( announcing.header.body, 1000, pp ) ).toBe( 473n );
        expect( () => certified.validateLeiosCertificateTiming( announcing.header.body, 500, pp ) ).toThrow( /earlier than 487/ );
        expect( () => certified.validateLeiosCertificateTiming( announcing.header.body, 1000, { ...pp, leiosVotePeriodLength: 1000 }) ).not.toThrow();
        expect( () => certified.validateLeiosCertificateTiming( announcing.header.body, 1000, { ...pp, leiosDiffusionPeriodLength: 10000 }) ).not.toThrow();
        expect( () => certified.validateLeiosCertificateTiming( announcing.header.body, 1000, { ...pp, leiosAnnouncementPeriodLength: 3000 }) ).toThrow( /earlier than/ );
    });

    test("announcement is required on the predecessor and the certified block must follow it", () => {
        expect( () => validateLeiosCertificationTiming( certified.header.body, announcing.header.body, 1000, pp ) ).not.toThrow();
        expect( () => validateLeiosCertificationTiming( certified.header.body, null, 1000, pp ) ).toThrow( /predecessor/ );
        expect( () => validateLeiosCertificationTiming( certified.header.body, {
            slot: 460,
            ebAnnouncement: null
        }, 1000, pp ) ).toThrow( /no eb_references_announcement/ );
        expect( () => validateLeiosCertificationTiming( certified.header.body, {
            slot: 459,
            ebAnnouncement: announcement
        }, 1000, pp ) ).not.toThrow();
        expect( () => validateLeiosCertificationTiming( certified.header.body, {
            slot: certified.header.body.slot,
            ebAnnouncement: announcement
        }, 1000, pp ) ).toThrow( /after the announcing block/ );
    });
});
