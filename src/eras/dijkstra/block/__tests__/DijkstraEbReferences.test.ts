import { readFileSync } from "fs";
import { join } from "path";
import { blake2b_256 } from "@harmoniclabs/crypto";
import { DijkstraEbReferences, LEIOS_MAX_ENDORSER_BLOCK_REFS } from "../DijkstraEbReferences";
import { DijkstraEndorserBlock } from "../DijkstraEndorserBlock";
import { DijkstraTx } from "../../tx/DijkstraTx";

const FIX = join( __dirname, "..", "..", "__fixtures__" );
const hexOf = ( f: string ) => readFileSync( join( FIX, f ), "utf8" ).replace( /\s+/g, "" );
const bytesOf = ( f: string ) => Buffer.from( hexOf( f ), "hex" );
const toHex = ( b: Uint8Array ) => Buffer.from( b ).toString( "hex" );

describe("Leios eb_references omap (gouroboros ledger/common/leios_endorser_block_test.go @5f854b)", () => {
    const hash = new Uint8Array( 32 );
    hash[0] = 0xaa;

    test("encodes exactly like the reference node and hashes its canonical bytes", () => {
        const refs = new DijkstraEbReferences({ references: [{ hash, size: 300 }] });
        const want = Buffer.from([ 0xa1, 0x58, 0x20, ...hash, 0x19, 0x01, 0x2c ]);
        expect( Buffer.from( refs.canonicalBytes ).toString( "hex" ) ).toBe( toHex( want ) );
        expect( toHex( refs.hash ) ).toBe( toHex( blake2b_256( new Uint8Array( want ) ) ) );
        expect( refs.size ).toBe( want.length );
        expect( refs.count ).toBe( 1 );
        expect( refs.announcement ).toEqual({ hash: blake2b_256( new Uint8Array( want ) ), size: want.length });
    });

    test("decodes wider CBOR heads but hashes and re-encodes the canonical omap", () => {
        const canonical = Buffer.from([ 0xa1, 0x58, 0x20, ...hash, 0x18, 0x26 ]);
        const want = toHex( blake2b_256( new Uint8Array( canonical ) ) );
        const cases: [ string, Buffer ][] = [
            [ "canonical", canonical ],
            [ "size with a four-byte argument", Buffer.from([ 0xa1, 0x58, 0x20, ...hash, 0x1a, 0, 0, 0, 0x26 ]) ],
            [ "size with an eight-byte argument", Buffer.from([ 0xa1, 0x58, 0x20, ...hash, 0x1b, 0, 0, 0, 0, 0, 0, 0, 0x26 ]) ],
            [ "map length with a one-byte argument", Buffer.from([ 0xb8, 0x01, 0x58, 0x20, ...hash, 0x18, 0x26 ]) ],
            [ "hash length with a two-byte argument", Buffer.from([ 0xa1, 0x59, 0x00, 0x20, ...hash, 0x18, 0x26 ]) ],
        ];
        for( const [ name, wire ] of cases )
        {
            const decoded = DijkstraEbReferences.fromCbor( wire );
            expect( toHex( decoded.hash ) ).toBe( want );
            expect( toHex( decoded.toCborBytes() ) ).toBe( toHex( wire ) );
            expect( toHex( DijkstraEbReferences.fromCbor( decoded.canonicalBytes ).hash ) ).toBe( want );
        }
    });

    test("rejects non-definite keys, tags, bignums, negative sizes, arrays and trailing bytes", () => {
        const base = [ 0xa1, 0x58, 0x20, ...hash ];
        const cases: [ string, Buffer ][] = [
            [ "indefinite-length hash", Buffer.from([ 0xa1, 0x5f, 0x58, 0x20, ...hash, 0xff, 0x18, 0x26 ]) ],
            [ "tagged hash", Buffer.from([ 0xa1, 0xd8, 0x18, 0x58, 0x20, ...hash, 0x18, 0x26 ]) ],
            [ "bignum size", Buffer.from([ ...base, 0xc2, 0x41, 0x26 ]) ],
            [ "negative size", Buffer.from([ ...base, 0x20 ]) ],
            [ "array wrapper", Buffer.from([ 0x81, ...Buffer.from([ 0xa1, 0x58, 0x20, ...hash, 0x18, 0x26 ]) ]) ],
            [ "trailing bytes", Buffer.from([ 0xa1, 0x58, 0x20, ...hash, 0x18, 0x26, 0xff ]) ],
        ];
        for( const [ name, wire ] of cases )
            expect( () => DijkstraEbReferences.fromCbor( wire ) ).toThrow();
    });

    test("enforces 1..17142 references, non-zero sizes and unique hashes", () => {
        const one = ( size: number ) => new DijkstraEbReferences({ references: [{ hash, size }] });
        expect( one( 1 ).count ).toBe( 1 );
        expect( one( 0xffffffff ).count ).toBe( 1 );
        expect( () => one( 0 ) ).toThrow( /non-zero/ );
        expect( () => one( 0xffffffff + 1 ) ).toThrow();
        expect( () => new DijkstraEbReferences({ references: [] }) ).toThrow( /1\.\.17142/ );
        expect( () => new DijkstraEbReferences({ references: [{ hash, size: 1 }, { hash, size: 1 }] }) ).toThrow( /duplicate/ );
        expect( () => DijkstraEbReferences.fromCbor( Buffer.from([ 0xa2, 0x58, 0x20, ...hash, 0x01, 0x58, 0x20, ...hash, 0x01 ]) ) ).toThrow( /duplicate/ );
    });

    test("reference-count boundaries match gouroboros", () => {
        const wire = ( count: number ) => {
            const parts: number[] = [];
            if( count < 24 ) parts.push( 0xa0 + count );
            else if( count <= 0xff ) parts.push( 0xb8, count );
            else parts.push( 0xb9, Math.floor( count / 256 ), count % 256 );
            for( let i = 0; i < count; i++ )
            {
                const h = new Uint8Array( 32 );
                const view = new DataView( h.buffer );
                view.setUint32( 28, i );
                parts.push( 0x58, 0x20, ...h, 0x01 );
            }
            return Buffer.from( parts );
        };
        expect( DijkstraEbReferences.fromCbor( wire( LEIOS_MAX_ENDORSER_BLOCK_REFS ) ).count ).toBe( LEIOS_MAX_ENDORSER_BLOCK_REFS );
        expect( () => DijkstraEbReferences.fromCbor( wire( LEIOS_MAX_ENDORSER_BLOCK_REFS + 1 ) ) ).toThrow( /1\.\.17142/ );
    });
});

describe("Dijkstra endorser block references", () => {
    const goldenHex = hexOf( "cardano_ledger_golden_tx.hex" );
    const golden = DijkstraTx.fromCbor( Buffer.from( goldenHex, "hex" ) );
    const current = DijkstraTx.fromCbor( bytesOf( "gouroboros_current_tx.hex" ) );

    test("fromTransactions uses the whole block-format transaction bytes, not hashTx", () => {
        const eb = DijkstraEndorserBlock.fromTransactions([ golden ]);
        expect( eb.references.count ).toBe( 1 );
        const ref = eb.references.references[0];
        expect( toHex( ref.hash ) ).toBe( toHex( golden.blockTransactionHash() ) );
        expect( ref.size ).toBe( golden.blockTransactionSize );
        expect( golden.blockTransactionSize ).toBe( golden.blockTransactionBytes.length );
        expect( toHex( golden.blockTransactionHash() ) ).not.toBe( toHex( golden.hashTx() ) );
        expect( eb.announcement ).toEqual( eb.references.announcement );
    });

    test("multi-transaction manifest is sorted and validates every reference", () => {
        const eb = DijkstraEndorserBlock.fromTransactions([ current, golden ]);
        expect( eb.references.count ).toBe( 2 );
        expect( () => eb.validateTransactions() ).not.toThrow();
        const hexes = eb.references.references.map( r => toHex( r.hash ) );
        expect( hexes ).toEqual( [...hexes].sort() );
    });

    test("mismatched sizes and missing/extra references throw", () => {
        const ref = { hash: golden.blockTransactionHash(), size: golden.blockTransactionSize };
        expect( () => new DijkstraEndorserBlock({
            references: new DijkstraEbReferences({ references: [ { ...ref, size: ref.size + 1 } ] }),
            transactions: [ golden ]
        }) ).toThrow( /reference size/ );
        expect( () => new DijkstraEndorserBlock({
            references: new DijkstraEbReferences({ references: [ ref ] }),
            transactions: [ golden, current ]
        }) ).toThrow( /cover 1 transactions/ );
        expect( () => new DijkstraEndorserBlock({
            references: new DijkstraEbReferences({ references: [ ref, { ...ref, size: ref.size + 1 } ] }),
            transactions: [ golden ]
        }) ).toThrow( /duplicate/ );
    });
});
