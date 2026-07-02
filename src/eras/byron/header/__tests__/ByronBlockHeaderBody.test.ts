import { toHex } from "@harmoniclabs/uint8array-utils";
import { Hash32 } from "../../../../hashes";
import { ByronBlockHeaderBody } from "../ByronBlockHeaderBody";

// A structurally-complete Byron block-header-body fixture (constructed, then frozen as hex).
// Layout matches byron.cddl `blockhead`: [ protocolMagic, prevBlock, bodyProof, consensusData, extraData ].
// Note the `a0` near the end -> attributes encoded as an empty CBOR *map* (as real Byron blocks do).
const HEX = "851a2d964a095820abababababababababababababababababababababababababababababababab848303582011111111111111111111111111111111111111111111111111111111111111115820222222222222222222222222222222222222222222222222222222222222222283005820333333333333333333333333333333333333333333333333333333333333333358204444444444444444444444444444444444444444444444444444444444444444582055555555555555555555555555555555555555555555555555555555555555555820666666666666666666666666666666666666666666666666666666666666666684820c190d80584077777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777811a000181cd82005840888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888483010000826a63617264616e6f2d736c01a058209999999999999999999999999999999999999999999999999999999999999999";

const h = ( x: string ) => new Hash32( x.repeat(64).slice(0,64) );

function sampleHeader(): ByronBlockHeaderBody
{
    return new ByronBlockHeaderBody({
        protocolMagic: 764824073,
        prevBlock: h("ab"),
        bodyProof: {
            txProof: { n: 3, root: h("11"), witnessesHash: h("22") },
            sscProof: [ 0, h("33"), h("44") ],
            dlgProof: h("55"),
            updProof: h("66")
        },
        consensusData: {
            slotId: { epoch: 12n, slot: 3456n },
            pubkey: new Uint8Array( 64 ).fill( 0x77 ),
            difficulty: [ 98765n ],
            blockSig: [ 0, new Uint8Array( 64 ).fill( 0x88 ) ]
        },
        extraData: {
            blockVersion: [ 1, 0, 0 ],
            softwareVersion: [ "cardano-sl", 1 ],
            attributes: {},
            extraProof: h("99")
        }
    });
}

describe("ByronBlockHeaderBody", () => {

    test("fromCbor(hex).toCbor() round-trips byte-exactly", () => {
        const decoded = ByronBlockHeaderBody.fromCbor( HEX );
        expect( toHex( decoded.toCborBytes() ) ).toBe( HEX );
    });

    test("construct -> encode -> decode preserves every field", () => {
        const original = sampleHeader();
        const hex = toHex( original.toCborBytes() );
        expect( hex ).toBe( HEX );

        const decoded = ByronBlockHeaderBody.fromCbor( hex );

        expect( decoded.protocolMagic ).toBe( 764824073 );
        expect( decoded.prevBlock.toString() ).toBe( h("ab").toString() );

        expect( decoded.bodyProof.txProof.n ).toBe( 3 );
        expect( decoded.bodyProof.txProof.root.toString() ).toBe( h("11").toString() );
        expect( decoded.bodyProof.txProof.witnessesHash.toString() ).toBe( h("22").toString() );
        expect( decoded.bodyProof.sscProof[0] ).toBe( 0 );
        expect( decoded.bodyProof.sscProof.length ).toBe( 3 );
        expect( (decoded.bodyProof.sscProof[1] as Hash32).toString() ).toBe( h("33").toString() );
        expect( (decoded.bodyProof.sscProof[2] as Hash32).toString() ).toBe( h("44").toString() );
        expect( decoded.bodyProof.dlgProof.toString() ).toBe( h("55").toString() );
        expect( decoded.bodyProof.updProof.toString() ).toBe( h("66").toString() );

        expect( decoded.consensusData.slotId.epoch ).toBe( 12n );
        expect( decoded.consensusData.slotId.slot ).toBe( 3456n );
        expect( toHex( decoded.consensusData.pubkey ) ).toBe( "77".repeat(64) );
        expect( decoded.consensusData.difficulty[0] ).toBe( 98765n );
        expect( decoded.consensusData.blockSig[0] ).toBe( 0 );
        expect( toHex( decoded.consensusData.blockSig[1] as Uint8Array ) ).toBe( "88".repeat(64) );

        expect( decoded.extraData.blockVersion ).toEqual( [ 1, 0, 0 ] );
        expect( decoded.extraData.softwareVersion ).toEqual( [ "cardano-sl", 1 ] );
        expect( decoded.extraData.extraProof.toString() ).toBe( h("99").toString() );
    });

    test("encodes header attributes as an empty CBOR map (a0), not an array", () => {
        const hex = toHex( sampleHeader().toCborBytes() );
        // a0 (empty map) precedes the final extraProof (5820...) — 80 (empty array) would be wrong
        expect( hex.includes( "a05820" ) ).toBe( true );
        expect( hex.includes( "805820" ) ).toBe( false );
    });

    test("rejects malformed CBOR", () => {
        expect( () => ByronBlockHeaderBody.fromCbor( "8100" ) ).toThrow();
        expect( () => ByronBlockHeaderBody.fromCbor( "a0" ) ).toThrow();
    });
});

// Genuine on-chain Byron `blockhead` bytes, extracted from real main blocks in the
// TxPipe/Pallas test corpus (github.com/txpipe/pallas/tree/main/test_data).
// Each block is `[1, [header, body, extra]]`, so the header = the bytes after the
// leading `820183`. These exercise the real-world variants a synthetic fixture misses:
// blockSig tag 2 (heavyweight delegation), and sscProof tags 3 (single hash) / 0 / 2.
const REAL = {
    // byron1.block — mainnet, empty block (0 txs), sscProof tag 3, blockVersion [2,0,0]
    byron1: "851a2d964a095820a5a5c235200bbe91f16cd3e5dcb67369c25dcfb1279c83d22021f5d960c485e684830058200e5751c026e543b2e8ab2eb06099daa1d1e5df47778f7787faab45cdf12fe3a85820afc0da64183bf2664f3d4eec7238d524ba607faeeab24fc100eb861dba69971b82035820d36a2619a672494604e11bb447cbcf5231e9f2ba25c2169177edc941bd50ad6c5820afc0da64183bf2664f3d4eec7238d524ba607faeeab24fc100eb861dba69971b58204e66280cd94d591072349bec0a3090a53aa945562efb6d08d56e53654b0e4098848218cf19545a584026566e86fc6b9b177c8480e275b2b112b573f6d073f9deea53b8d99c4ed976b335b2b3842f0e380001f090bc923caa9691ed9115e286da9421e2745c7acc87f1811a004485098202828400584026566e86fc6b9b177c8480e275b2b112b573f6d073f9deea53b8d99c4ed976b335b2b3842f0e380001f090bc923caa9691ed9115e286da9421e2745c7acc87f15840f14f712dc600d793052d4842d50cefa4e65884ea6cf83707079eb8ce302efc85dae922d5eb3838d2b91784f04824d26767bfb65bd36a36e74fec46d09d98858d58408ab43e904b06e799c1817c5ced4f3a7bbe15cdbf422dea9d2d5dc2c6105ce2f4d4c71e5d4779f6c44b770a133636109949e1f7786acb5a732bcdea0470fea4065840c15d273e3e0735777e2b38359224803aa4a0fcd1cde37ed1f2f399d7e095b18bdc698a2aff59b2118cbbe45498c7bdc6ccf3a88a806cbd3e73bcf2fc6d7364028483020000826a63617264616e6f2d736c01a058204ba92aa320c60acc9ad7b9a64f2eda55c4d2ec28e604faf186708b4f0c4e8edf",
    // byron2.block — mainnet, 2 txs, sscProof tag 0 (two hashes), blockVersion [0,2,0]
    byron2: "851a2d964a0958208b5add21497fa1749292318f1ac96a252ee58ac9bf60d321d1273f5135e72f2f8483025820eba8b3720ab760171e4900b88cc0379bf6c78c4dac55d1dc3d646b00c13515405820187817e2ba9ff807dd905e3a4e0d061630979da49071495b2b38201f7ffbc97b8300582025777aca9e4a73d48fc73b4f961d345b06d4a6f349cb7916570d35537d53479f5820d36a2619a672494604e11bb447cbcf5231e9f2ba25c2169177edc941bd50ad6c5820afc0da64183bf2664f3d4eec7238d524ba607faeeab24fc100eb861dba69971b58204e66280cd94d591072349bec0a3090a53aa945562efb6d08d56e53654b0e40988482189619056558400bdb1f5ef3d994037593f2266255f134a564658bb2df814b3b9cefb96da34fa9c888591c85b770fd36726d5f3d991c668828affc7bbe0872fd699136e664d9d8811a00316fa2820282840058400bdb1f5ef3d994037593f2266255f134a564658bb2df814b3b9cefb96da34fa9c888591c85b770fd36726d5f3d991c668828affc7bbe0872fd699136e664d9d858405fddeedade2714d6db2f9e1104743d2d8d818ecddc306e176108db14caadd441b457d5840c60f8840b99c8f78c290ae229d4f8431e678ba7a545c35607b94ddb5840552741f728196e62f218047b944b24ce4d374300d04b9b281426f55aa000d53ded66989ad5ea0908e6ff6492001ff18ece6c7040a934060759e9ae09863bf20358400e663202ff860e5a1cc84f32ad8ceffb0adb6cf476b07829e922312e038ba23573728e02f3775f6714b3b731f8b8084d92b3f38f51a41ba859e7e700feeeab038483000200826a63617264616e6f2d736c01a058204ba92aa320c60acc9ad7b9a64f2eda55c4d2ec28e604faf186708b4f0c4e8edf",
    // byron7.block — testnet (magic 1097911063), sscProof tag 2, softwareVersion ["cardano-sl",0]
    byron7: "851a4170cb175820a5a83bceba54da593e89630b5f4039a0488533f25a74f5e588ed61920e3e406e848306582075c3da9d8894ad97363c0c679c04c2ee348ffffbb86be847125e2d0b7d4126215820443f91adfb5be9b21d131da32c9aac9ce4d8c2a42c666a73c6e778c97f8d019483025820d36a2619a672494604e11bb447cbcf5231e9f2ba25c2169177edc941bd50ad6c5820d36a2619a672494604e11bb447cbcf5231e9f2ba25c2169177edc941bd50ad6c5820afc0da64183bf2664f3d4eec7238d524ba607faeeab24fc100eb861dba69971b58204e66280cd94d591072349bec0a3090a53aa945562efb6d08d56e53654b0e409884820d1952ff5840dbbe961151576dadfac3bb579ec2b1c147c00aa4cee03c7ebef495a0ea382940aa0603da8699da09c6bdca320fcd68550ba8b2ac7919e7bd33ed58c5d9dacd44811a000497cd82028284005840dbbe961151576dadfac3bb579ec2b1c147c00aa4cee03c7ebef495a0ea382940aa0603da8699da09c6bdca320fcd68550ba8b2ac7919e7bd33ed58c5d9dacd44584073ae41eca2be37fc15c55a50d668c8647e10bf222172c2d58abfa6e9310e59623f8f26f8edc1ce8f698bd5dc9feaa31acbc364bff6fb81d343ff3826ebdd8d555840b2c8e6ff8fc380c4a4c4e16f909803e786ccfbf4267e5016e24a34a843093b4d81736939500fb6fdd358d2be2b255858ea1abc35f62d381d6c62d111d1f0c80d58400f7687aa8bfacb93191d65754f505ae4eb064a423ddef3cdbd0aeb5639958611d367f3dccef98f5f76cbbe209f7a7be509e5186841aa195c3a0bfc0a4311310d8483000000826a63617264616e6f2d736c00a058204ba92aa320c60acc9ad7b9a64f2eda55c4d2ec28e604faf186708b4f0c4e8edf"
};

describe("ByronBlockHeaderBody — real Pallas main-block headers", () => {

    test.each( Object.entries( REAL ) )( "%s round-trips byte-exactly", ( _name, hex ) => {
        expect( toHex( ByronBlockHeaderBody.fromCbor( hex ).toCborBytes() ) ).toBe( hex );
    });

    test("byron2 (mainnet) decodes the expected real field values", () => {
        const b = ByronBlockHeaderBody.fromCbor( REAL.byron2 );
        expect( b.protocolMagic ).toBe( 764824073 );
        expect( b.bodyProof.txProof.n ).toBe( 2 );
        expect( b.bodyProof.sscProof[0] ).toBe( 0 );
        expect( b.bodyProof.sscProof.length ).toBe( 3 ); // [tag, hash, hash]
        expect( b.consensusData.blockSig[0] ).toBe( 2 ); // heavyweight delegation
        expect( b.extraData.blockVersion ).toEqual( [ 0, 2, 0 ] );
        expect( b.extraData.softwareVersion ).toEqual( [ "cardano-sl", 1 ] );
    });

    test("byron1 (mainnet, empty) has sscProof tag 3 with a single hash", () => {
        const b = ByronBlockHeaderBody.fromCbor( REAL.byron1 );
        expect( b.bodyProof.txProof.n ).toBe( 0 );
        expect( b.bodyProof.sscProof[0] ).toBe( 3 );
        expect( b.bodyProof.sscProof.length ).toBe( 2 ); // [tag, hash]
        expect( b.consensusData.blockSig[0] ).toBe( 2 );
    });

    test("byron7 is a testnet header (protocol magic 1097911063)", () => {
        const b = ByronBlockHeaderBody.fromCbor( REAL.byron7 );
        expect( b.protocolMagic ).toBe( 1097911063 );
        expect( b.bodyProof.sscProof[0] ).toBe( 2 );
        expect( b.extraData.softwareVersion ).toEqual( [ "cardano-sl", 0 ] );
    });
});
