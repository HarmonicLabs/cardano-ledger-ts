import { readFileSync } from "fs";
import { join } from "path";
import { Cbor, CborArray, CborBytes, CborMap, CborSimple, CborUInt, CborTag, LazyCborArray } from "@harmoniclabs/cbor";
import { blake2b_256 } from "@harmoniclabs/crypto";
import { DijkstraBlock } from "../block/DijkstraBlock";
import { DijkstraHeader } from "../header/DijkstraHeader";
import { DijkstraHeaderBody } from "../header/DijkstraHeaderBody";
import { DijkstraTx } from "../tx/DijkstraTx";
import { DijkstraTxBody } from "../tx/DijkstraTxBody";
import { DijkstraTxWitnessSet } from "../tx/DijkstraTxWitnessSet";
import { dijkstraCertificateFromCborObj, DijkstraCertPoolRegistration } from "../tx/DijkstraCertificates";
import { MultiEraBlock } from "../../common/MultiEraBlock";
import { MultiEraHeader } from "../../common/MultiEraHeader";

const FIX = join( __dirname, "..", "__fixtures__" );
const hexOf = ( f: string ) => readFileSync( join( FIX, f ), "utf8" ).replace( /\s+/g, "" );
const bytesOf = ( f: string ) => Buffer.from( hexOf( f ), "hex" );
const toHex = ( b: Uint8Array ) => Buffer.from( b ).toString("hex");
/** the upstream goldens hold 2-byte "{}" placeholders for pool metadata hashes (see gouroboros dijkstra_leios_w30_test.go) */
const expandPlaceholders = ( hex: string ) => hex.split("427b7d").join( "5820" + "00".repeat( 32 ) );

describe("Dijkstra header (12-field header_body)", () => {

    const headerBytes = bytesOf("musashi_type8_dijkstra_header.hex");

    test("decodes the live musashi header and re-encodes byte-identically", () => {
        const hdr = DijkstraHeader.fromCbor( headerBytes );
        expect( Number( hdr.body.blockNumber ) ).toBe( 4329 );
        expect( Number( hdr.body.slot ) ).toBe( 86407 );
        expect( hdr.body.versionInfo ).toEqual({ highestSupportedMajorVersion: 12, selfReportedSoftwareTag: 0 });
        expect( hdr.body.protocolVersion.major ).toBe( 12 );
        expect( hdr.body.leiosCertified ).toBe( false );
        expect( hdr.body.ebAnnouncement ).toBe( null );
        expect( toHex( hdr.toCborBytes() ) ).toBe( toHex( headerBytes ) );
    });

    test("re-encodes from fields (no cached bytes) byte-identically", () => {
        const hdr = DijkstraHeader.fromCbor( headerBytes );
        const b = hdr.body;
        const fresh = new DijkstraHeaderBody({
            blockNumber: b.blockNumber, slot: b.slot, prevHash: b.prevHash, issuerPubKey: b.issuerPubKey,
            vrfPubKey: b.vrfPubKey, vrfResult: b.vrfResult, blockBodySize: b.blockBodySize, blockBodyHash: b.blockBodyHash,
            opCert: b.opCert, protocolVersion: { major: b.protocolVersion.major, minor: b.protocolVersion.minor },
            leiosCertified: b.leiosCertified, ebAnnouncement: b.ebAnnouncement
        });
        const lazy = Cbor.parseLazy( headerBytes ) as LazyCborArray;
        expect( toHex( Cbor.encode( fresh.toCborObj() ) ) ).toBe( toHex( lazy.array[0] ) );
    });

    // Dingo ouroboros/dijkstra_header_arity_test.go `headerArityCases`
    const hash = new Uint8Array( 32 ).fill( 0x5a );
    const cases: [ string, any[], boolean ][] = [
        [ "ten fields", [], false ],
        [ "eleven fields", [ CborSimple.true ], false ],
        [ "thirteen fields", [ CborSimple.true, CborSimple.null, CborSimple.null ], false ],
        [ "fourteen fields", [ CborSimple.true, CborSimple.null, CborSimple.null, CborSimple.null ], false ],
        [ "null announcement", [ CborSimple.false, CborSimple.null ], true ],
        [ "certified null announcement", [ CborSimple.true, CborSimple.null ], true ],
        [ "valid announcement", [ CborSimple.false, new CborArray([ new CborBytes( hash ), new CborUInt( 4096 ) ]) ], true ],
        [ "announcement at the uint32 maximum", [ CborSimple.false, new CborArray([ new CborBytes( hash ), new CborUInt( 4294967295 ) ]) ], true ],
        [ "certified is not a boolean", [ new CborUInt( 1 ), CborSimple.null ], false ],
        [ "certified is null", [ CborSimple.null, CborSimple.null ], false ],
        [ "announcement hash too short", [ CborSimple.false, new CborArray([ new CborBytes( hash.slice( 0, 31 ) ), new CborUInt( 1 ) ]) ], false ],
        [ "announcement without a size", [ CborSimple.false, new CborArray([ new CborBytes( hash ) ]) ], false ],
        [ "announcement size exceeds uint32", [ CborSimple.false, new CborArray([ new CborBytes( hash ), new CborUInt( BigInt( 2 ) ** BigInt( 32 ) ) ]) ], false ],
        [ "announcement is not an array", [ CborSimple.false, new CborUInt( 7 ) ], false ],
    ];
    for( const [ name, extra, valid ] of cases )
    {
        test( "arity: " + name, () => {
            const top = Cbor.parse( headerBytes ) as CborArray;
            const body = top.array[0] as CborArray;
            const variant = new CborArray([ new CborArray([ ...body.array.slice( 0, 10 ), ...extra ]), top.array[1] ]);
            const bytes = Cbor.encode( variant );
            if( valid ) expect( () => DijkstraHeader.fromCbor( bytes ) ).not.toThrow();
            else expect( () => DijkstraHeader.fromCbor( bytes ) ).toThrow();
        });
    }

    test("MultiEraHeader dispatches era 8 to DijkstraHeader", () => {
        const wrapped = Cbor.encode( new CborArray([ new CborUInt( 8 ), Cbor.parse( headerBytes ) ]) );
        const meh = MultiEraHeader.fromCbor( wrapped );
        expect( meh.era ).toBe( 8 );
        expect( meh.header instanceof DijkstraHeader ).toBe( true );
    });
});

describe("Dijkstra block ([header, block_body], 3-field body)", () => {

    const blockBytes = bytesOf("musashi_type8_dijkstra_block.hex");

    test("decodes the live musashi block; body hash and size match the header", () => {
        const blk = DijkstraBlock.fromCbor( blockBytes );
        expect( blk.transactions.length ).toBe( 0 );
        expect( blk.leiosCertificate ).toBe( null );
        expect( blk.perasCertificate ).toBe( null );
        expect( toHex( blk.computeBlockBodyHash() ) ).toBe( toHex( blk.header.body.blockBodyHash ) );
        expect( blk.blockBodyBytes.length ).toBe( blk.header.body.blockBodySize );
        expect( toHex( blk.toCborBytes() ) ).toBe( toHex( blockBytes ) );
    });

    test("MultiEraBlock [8, block] decodes to DijkstraBlock with Conway-compatible views", () => {
        const wrapped = Cbor.encode( new CborArray([ new CborUInt( 8 ), Cbor.parse( blockBytes ) ]) );
        const meb = MultiEraBlock.fromCbor( wrapped );
        expect( meb.era ).toBe( 8 );
        const blk = meb.block as DijkstraBlock;
        expect( blk instanceof DijkstraBlock ).toBe( true );
        expect( blk.transactionBodies ).toEqual( [] );
        expect( blk.transactionWitnessSets ).toEqual( [] );
        expect( blk.invalidTransactions ).toEqual( [] );
        expect( toHex( meb.toCborBytes() ) ).toBe( toHex( wrapped ) );
    });

    test("rejects the legacy 4-field musashi body", () => {
        expect( () => DijkstraBlock.fromCbor( bytesOf("musashi_legacy_4field_block.hex") ) ).toThrow( /expected 3 components, got 4/ );
    });

    test("block with a transaction: is_valid flag drives invalidTransactions; fresh re-encode matches", () => {
        const txHex = expandPlaceholders( hexOf("cardano_ledger_golden_tx.hex") );
        const parts = Cbor.parseLazy( Buffer.from( txHex, "hex" ) ) as LazyCborArray;
        const blockTx = ( valid: boolean ) => new CborArray([
            Cbor.parse( parts.array[0] ), Cbor.parse( parts.array[1] ), Cbor.parse( parts.array[2] ), new CborSimple( valid )
        ]);
        const hdr = Cbor.parse( blockBytes ) as CborArray;
        const leios = new CborArray([ new CborBytes( new Uint8Array( 3 ).fill( 1 ) ), new CborBytes( new Uint8Array( 48 ).fill( 2 ) ) ]);
        const blkObj = new CborArray([ hdr.array[0], new CborArray([ new CborArray([ blockTx( true ), blockTx( false ) ]), leios, CborSimple.null ]) ]);
        const bytes = Cbor.encode( blkObj );
        const blk = DijkstraBlock.fromCbor( bytes );
        expect( blk.transactions.length ).toBe( 2 );
        expect( blk.invalidTransactions ).toEqual( [ 1 ] );
        expect( blk.transactionBodies.length ).toBe( 2 );
        expect( Object.keys( blk.auxiliaryDataSet ) ).toEqual( [ "0", "1" ] );
        expect( blk.leiosCertificate!.signature.length ).toBe( 48 );
        // block body hash is the hash of the block_body bytes
        const lazyBlock = Cbor.parseLazy( bytes ) as LazyCborArray;
        expect( toHex( blk.computeBlockBodyHash() ) ).toBe( toHex( blake2b_256( lazyBlock.array[1] ) ) );
        // re-encode without the cached block bytes
        const rebuilt = new DijkstraBlock({ header: blk.header, transactions: blk.transactions, leiosCertificate: blk.leiosCertificate, perasCertificate: null });
        expect( toHex( rebuilt.toCborBytes() ) ).toBe( toHex( bytes ) );
    });

    test("rejects a block_transaction without the trailing bool and a malformed leios certificate", () => {
        const hdr = Cbor.parse( blockBytes ) as CborArray;
        const badTx = new CborArray([ new CborArray([ new CborMap([]), new CborMap([]), CborSimple.null ]) ]);
        expect( () => DijkstraBlock.fromCbor( Cbor.encode( new CborArray([ hdr.array[0], new CborArray([ badTx, CborSimple.null, CborSimple.null ]) ]) ) ) ).toThrow();
        const badLeios = new CborArray([ new CborBytes( new Uint8Array( 1 ) ), new CborBytes( new Uint8Array( 47 ) ) ]);
        expect( () => DijkstraBlock.fromCbor( Cbor.encode( new CborArray([ hdr.array[0], new CborArray([ new CborArray([]), badLeios, CborSimple.null ]) ]) ) ) ).toThrow();
    });
});

describe("Dijkstra transactions (cardano-ledger and gouroboros goldens)", () => {

    const goldenHex = expandPlaceholders( hexOf("cardano_ledger_golden_tx.hex") );
    const goldenBytes = Buffer.from( goldenHex, "hex" );

    test("golden mempool tx decodes with every new body field", () => {
        const tx = DijkstraTx.fromCbor( goldenBytes );
        const b = tx.body;
        expect( b.subTransactions?.length ).toBe( 1 );
        expect( b.accountBalanceIntervals?.length ).toBe( 3 );
        expect( b.directDeposits ).toBeDefined();
        expect( b.votingProcedures ).toBeDefined();
        expect( b.proposalProcedures?.length ).toBeGreaterThan( 0 );
        expect( b.donation ).toBeDefined();
        expect( b.certs?.length ).toBe( 17 );
        expect( b.certs?.some( c => c instanceof DijkstraCertPoolRegistration && c.blsKey !== null ) ).toBe( true );
        expect( toHex( tx.toCborBytes() ) ).toBe( goldenHex );
    });

    test("Dijkstra hashTx of the original golden matches golden/hashtx.hex", () => {
        // the original golden holds placeholder pool metadata hashes, so hash its bytes without decoding
        expect( toHex( DijkstraTx.hashTxBytes( bytesOf("cardano_ledger_golden_tx.hex") ) ) ).toBe( hexOf("cardano_ledger_golden_hashtx.hex") );
        // a decoded tx hashes the same way as its bytes
        const tx = DijkstraTx.fromCbor( goldenBytes );
        expect( toHex( tx.hashTx() ) ).toBe( toHex( DijkstraTx.hashTxBytes( goldenBytes ) ) );
    });

    test("tx body encodes from fields in the Haskell key order and round-trips", () => {
        const tx = DijkstraTx.fromCbor( goldenBytes );
        const b = tx.body as any;
        const fresh = new DijkstraTxBody({ ...b, subTransactions: b.subTransactions, nastyTransactions: undefined, guards: b.guards });
        expect( fresh.cborRef ).toBeUndefined();
        const keys = ( m: CborMap ) => m.map.map( e => Number( ( e.k as CborUInt ).num ) );
        const lazy = Cbor.parseLazy( goldenBytes ) as LazyCborArray;
        // the golden was written by the Haskell encoder: same keys, same order
        expect( keys( fresh.toCborObj() as CborMap ) ).toEqual( keys( Cbor.parse( lazy.array[0] ) as CborMap ) );
        // nested objects without cached bytes may pick another (equally valid) encoding; the content survives
        const again = DijkstraTxBody.fromCbor( fresh.toCborBytes() );
        expect( JSON.stringify( again.toJson() ) ).toBe( JSON.stringify( tx.body.toJson() ) );
    });

    test("gouroboros current golden: account balance intervals by reward account", () => {
        const tx = DijkstraTx.fromCbor( Buffer.from( expandPlaceholders( hexOf("gouroboros_current_tx.hex") ), "hex" ) );
        const got = Object.fromEntries( ( tx.body.accountBalanceIntervals ?? [] ).map( e => [ toHex( e.rewardAccount ), e.interval.toJson() ] ) );
        expect( got ).toEqual({
            "e1415082a4d7a407bb3837bca2179336d8f9fa51fc4eecba911ead8407": { inclusiveLowerBound: "500", exclusiveUpperBound: null },
            "e101a1d395abb1baa33c53d26889d484437301cbba548c0fa0d28b4bd7": { inclusiveLowerBound: null, exclusiveUpperBound: "10000" },
            "f1a9bfee58b8bda1a3df2861735baacb11b594c51dcfe49a4f2a6ea1c4": { inclusiveLowerBound: "100", exclusiveUpperBound: "5000" },
        });
        expect( tx.body.startingAccountBalanceIntervals ).toBeUndefined();
    });

    test("account balance intervals reject non reward accounts (gouroboros)", () => {
        let h = expandPlaceholders( hexOf("gouroboros_current_tx.hex") );
        for( const ra of [ "581de101a1d395abb1baa33c53d26889d484437301cbba548c0fa0d28b4bd7", "581de1415082a4d7a407bb3837bca2179336d8f9fa51fc4eecba911ead8407" ] )
        {
            expect( h.includes( ra ) ).toBe( true );
            h = h.split( ra ).join( "581d61" + ra.slice( 6 ) );
        }
        expect( () => DijkstraTx.fromCbor( Buffer.from( h, "hex" ) ) ).toThrow( /invalid reward account/ );
    });

    test("mempool form: [b, w, true, aux] accepted, [b, w, false, aux] rejected", () => {
        const parts = Cbor.parseLazy( goldenBytes ) as LazyCborArray;
        const mk = ( flag: boolean ) => Cbor.encode( new CborArray([ Cbor.parse( parts.array[0] ), Cbor.parse( parts.array[1] ), new CborSimple( flag ), Cbor.parse( parts.array[2] ) ]) );
        expect( DijkstraTx.fromCbor( mk( true ) ).isScriptValid ).toBe( true );
        expect( () => DijkstraTx.fromCbor( mk( false ) ) ).toThrow();
    });

    test("body decoder rejects unknown, duplicate and wrong-level keys", () => {
        const base = new CborMap([
            { k: new CborUInt( 0 ), v: new CborTag( 258, new CborArray([]) ) },
            { k: new CborUInt( 1 ), v: new CborArray([]) },
            { k: new CborUInt( 2 ), v: new CborUInt( 0 ) },
        ]);
        expect( () => DijkstraTxBody.fromCbor( Cbor.encode( base ) ) ).not.toThrow();
        const withKey = ( k: number, v: any ) => Cbor.encode( new CborMap([ ...base.map, { k: new CborUInt( k ), v } ]) );
        expect( () => DijkstraTxBody.fromCbor( withKey( 6, new CborMap([]) ) ) ).toThrow( /unexpected key 6/ );
        expect( () => DijkstraTxBody.fromCbor( withKey( 28, new CborUInt( 1 ) ) ) ).toThrow( /unexpected key 28/ );
        expect( () => DijkstraTxBody.fromCbor( withKey( 2, new CborUInt( 1 ) ) ) ).toThrow( /duplicate key 2/ );
        expect( () => DijkstraTxBody.fromCbor( withKey( 22, new CborUInt( 0 ) ) ) ).toThrow( /non-zero/ );
        expect( () => DijkstraTxBody.fromCbor( withKey( 25, new CborMap([]) ) ) ).toThrow( /non-empty/ );
    });

    test("guards: key hashes become requiredSigners, script credentials are scriptGuards", () => {
        const kh = new Uint8Array( 28 ).fill( 7 ), sh = new Uint8Array( 28 ).fill( 9 );
        const mk = ( guards: any ) => DijkstraTxBody.fromCbor( Cbor.encode( new CborMap([
            { k: new CborUInt( 0 ), v: new CborArray([]) },
            { k: new CborUInt( 1 ), v: new CborArray([]) },
            { k: new CborUInt( 2 ), v: new CborUInt( 0 ) },
            { k: new CborUInt( 14 ), v: guards },
        ]) ) );
        const asKeys = mk( new CborTag( 258, new CborArray([ new CborBytes( kh ) ]) ) );
        expect( asKeys.requiredSigners!.map( h => h.toString() ) ).toEqual( [ toHex( kh ) ] );
        const asCreds = mk( new CborArray([
            new CborArray([ new CborUInt( 0 ), new CborBytes( kh ) ]),
            new CborArray([ new CborUInt( 1 ), new CborBytes( sh ) ])
        ]) );
        expect( asCreds.requiredSigners!.map( h => h.toString() ) ).toEqual( [ toHex( kh ) ] );
        expect( asCreds.scriptGuards.map( c => c.hash.toString() ) ).toEqual( [ toHex( sh ) ] );
        expect( () => mk( new CborArray([ new CborArray([ new CborUInt( 0 ), new CborBytes( kh ) ]), new CborBytes( kh ) ]) ) ).toThrow();
    });
});

describe("Dijkstra certificates and witnesses", () => {

    test("certificates 0, 1, 5 and 6 are rejected", () => {
        const cred = new CborArray([ new CborUInt( 0 ), new CborBytes( new Uint8Array( 28 ) ) ]);
        for( const t of [ 0, 1 ] ) expect( () => dijkstraCertificateFromCborObj( new CborArray([ new CborUInt( t ), cred ]) ) ).toThrow( /no longer supported/ );
        expect( () => dijkstraCertificateFromCborObj( new CborArray([ new CborUInt( 5 ), new CborBytes( new Uint8Array( 28 ) ), new CborBytes( new Uint8Array( 28 ) ), new CborBytes( new Uint8Array( 32 ) ) ]) ) ).toThrow( /no longer supported/ );
        expect( () => dijkstraCertificateFromCborObj( new CborArray([ new CborUInt( 6 ), new CborArray([]) ]) ) ).toThrow( /no longer supported/ );
        // tag 7 (registration with deposit) still decodes
        expect( () => dijkstraCertificateFromCborObj( new CborArray([ new CborUInt( 7 ), cred, new CborUInt( 2000000 ) ]) ) ).not.toThrow();
    });

    test("witness set: map-form redeemers only, guarding tag 6 accepted, key 8 Plutus V4 scripts", () => {
        const rdmr = ( tag: number ) => new CborMap([{
            k: new CborArray([ new CborUInt( tag ), new CborUInt( 0 ) ]),
            v: new CborArray([ new CborUInt( 0 ), new CborArray([ new CborUInt( 1 ), new CborUInt( 2 ) ]) ])
        }]);
        const ws = DijkstraTxWitnessSet.fromCbor( Cbor.encode( new CborMap([
            { k: new CborUInt( 5 ), v: rdmr( 6 ) },
            { k: new CborUInt( 8 ), v: new CborTag( 258, new CborArray([ new CborBytes( new Uint8Array([ 1, 2, 3 ]) ) ]) ) },
        ]) ) );
        expect( ws.redeemers?.[0].tag ).toBe( 6 );
        expect( ws.plutusV4Scripts?.length ).toBe( 1 );
        const arrayForm = new CborArray([ new CborArray([ new CborUInt( 0 ), new CborUInt( 0 ), new CborUInt( 0 ), new CborArray([ new CborUInt( 1 ), new CborUInt( 2 ) ]) ]) ]);
        expect( () => DijkstraTxWitnessSet.fromCbor( Cbor.encode( new CborMap([ { k: new CborUInt( 5 ), v: arrayForm } ]) ) ) ).toThrow( /map format/ );
        expect( () => DijkstraTxWitnessSet.fromCbor( Cbor.encode( new CborMap([ { k: new CborUInt( 9 ), v: new CborArray([]) } ]) ) ) ).toThrow();
    });
});
