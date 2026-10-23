import { CborArray, CborBytes, CborMap, CborText, CborUInt, Cbor } from "@harmoniclabs/cbor";
import { TxOutRef } from "../../eras/common/tx/TxOutRef";
import {
    boundedText, cborArray, cborSet, cborUInt16, expectSize, expectTag, getDecodeStrictness, isLenientDecoding,
    noDuplicates, parseCborFull, setDefaultDecodeStrictness, sparseMapKeys, withDecodeStrictness, withDecodeVersion,
    withLenientDecoding
} from "../strictCbor";

const TX_ID = "aa".repeat( 32 );
// [ h'aa..aa', 0 ]
const REF = "825820" + TX_ID + "00";

describe("lenient decoding", () => {

    test("strict is the default; scopes nest and restore, also on throw", () => {
        expect( getDecodeStrictness() ).toBe( "strict" );
        withLenientDecoding(() => {
            expect( isLenientDecoding() ).toBe( true );
            withDecodeStrictness( "strict", () => expect( isLenientDecoding() ).toBe( false ) );
            expect( isLenientDecoding() ).toBe( true );
        });
        expect( () => withLenientDecoding(() => { throw new Error("boom"); }) ).toThrow( "boom" );
        expect( getDecodeStrictness() ).toBe( "strict" );
    });

    test("setDefaultDecodeStrictness changes the default until reset", () => {
        try {
            setDefaultDecodeStrictness( "lenient" );
            expect( isLenientDecoding() ).toBe( true );
            withDecodeStrictness( "strict", () => expect( isLenientDecoding() ).toBe( false ) );
        } finally {
            setDefaultDecodeStrictness( "strict" );
        }
        expect( isLenientDecoding() ).toBe( false );
        expect( () => setDefaultDecodeStrictness( "loose" as any ) ).toThrow();
    });

    test("trailing bytes: rejected strictly, ignored leniently", () => {
        expect( () => TxOutRef.fromCbor( REF + "00" ) ).toThrow( /trailing/ );
        const ref = withLenientDecoding(() => TxOutRef.fromCbor( REF + "00" ));
        expect( ref.id.toString() ).toBe( TX_ID );
        expect( ref.index ).toBe( 0 );
        expect( () => withLenientDecoding(() => parseCborFull( "0000", "x" )) ).not.toThrow();
    });

    test("bignum and out-of-range index: rejected strictly, read leniently", () => {
        const bigIndex = "825820" + TX_ID + "c24101";          // index as #6.2(h'01')
        expect( () => TxOutRef.fromCbor( bigIndex ) ).toThrow( /bignum/ );
        expect( withLenientDecoding(() => TxOutRef.fromCbor( bigIndex )).index ).toBe( 1 );

        const wide = new CborUInt( 70_000 );                      // > Word16
        expect( () => cborUInt16( wide, "idx" ) ).toThrow( /out of range/ );
        expect( withLenientDecoding(() => cborUInt16( wide, "idx" )) ).toBe( BigInt( 70_000 ) );
    });

    test("record shape: extra elements and indefinite arrays", () => {
        const three = new CborArray([ new CborUInt( 1 ), new CborUInt( 2 ), new CborUInt( 3 ) ]);
        expect( () => cborArray( three, "rec", { len: 2 } ) ).toThrow();
        expect( withLenientDecoding(() => cborArray( three, "rec", { len: 2 } )).length ).toBe( 3 );
        // too few elements stay an error: the decoder could not read the record
        expect( () => withLenientDecoding(() => cborArray( three, "rec", { len: 4 } )) ).toThrow();

        const indef = new CborArray([ new CborUInt( 1 ) ], { indefinite: true });
        expect( () => cborArray( indef, "rec", { definite: true } ) ).toThrow( /indefinite/ );
        expect( withLenientDecoding(() => cborArray( indef, "rec", { definite: true } )).length ).toBe( 1 );

        expect( () => expectSize( 3, 2, "rec" ) ).toThrow();
        expect( () => withLenientDecoding(() => expectSize( 3, 2, "rec" )) ).not.toThrow();
        expect( () => withLenientDecoding(() => expectSize( 1, 2, "rec" )) ).toThrow();
    });

    test("chunked strings below protocol 12", () => {
        const chunked = Cbor.parse( "5f4101410" + "2ff" ) as CborBytes;   // (_ h'01', h'02')
        withDecodeVersion( 11, () => {
            expect( () => TxOutRef.fromCborObj( new CborArray([ chunked, new CborUInt( 0 ) ]) ) ).toThrow();
        });
        const t = Cbor.parse( "7f61616162ff" ) as CborText;              // (_ "a", "b")
        expect( () => boundedText( t, 64, "url" ) ).toThrow( /indefinite/ );
        expect( withLenientDecoding(() => boundedText( t, 64, "url" )) ).toBe( "ab" );
    });

    test("missing tag, duplicates, empty sets, text bounds", () => {
        const pair = new CborArray([ new CborUInt( 1 ), new CborUInt( 2 ) ]);
        expect( () => expectTag( pair, 30, "rational" ) ).toThrow( /tag 30/ );
        expect( withLenientDecoding(() => expectTag( pair, 30, "rational" )) ).toBe( pair );

        const dupKeys = new CborMap([ { k: new CborUInt( 0 ), v: new CborUInt( 1 ) }, { k: new CborUInt( 0 ), v: new CborUInt( 2 ) } ]);
        expect( () => sparseMapKeys( dupKeys, "body" ) ).toThrow( /duplicate/ );
        expect( withLenientDecoding(() => sparseMapKeys( dupKeys, "body" )) ).toEqual([ 0, 0 ]);

        withDecodeVersion( 9, () => {
            expect( () => noDuplicates([ "a", "a" ], x => x, "set") ).toThrow( /duplicate/ );
            expect( withLenientDecoding(() => noDuplicates([ "a", "a" ], x => x, "set")) ).toEqual([ "a", "a" ]);
        });

        const empty = new CborArray([]);
        expect( () => cborSet( empty, "inputs", { nonEmpty: true } ) ).toThrow( /non-empty/ );
        expect( withLenientDecoding(() => cborSet( empty, "inputs", { nonEmpty: true } )) ).toEqual([]);

        const long = new CborText( "x".repeat( 100 ) );
        expect( () => boundedText( long, 64, "url" ) ).toThrow( /exceeds/ );
        expect( withLenientDecoding(() => boundedText( long, 64, "url" )) ).toHaveLength( 100 );
    });

    test("not relaxed: field types and hash sizes", () => {
        // a text where the tx id belongs, and a 31-byte tx id
        expect( () => withLenientDecoding(() => TxOutRef.fromCbor( "82" + "6161" + "00" )) ).toThrow();
        expect( () => withLenientDecoding(() => TxOutRef.fromCbor( "82" + "581f" + "aa".repeat( 31 ) + "00" )) ).toThrow();
    });
});
