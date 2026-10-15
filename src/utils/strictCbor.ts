import { CanBeCborString, Cbor, CborArray, CborBytes, CborMap, CborNegInt, CborObj, CborSimple, CborTag, CborText, CborUInt, forceCborString } from "@harmoniclabs/cbor";
import { InvalidCborFormatError } from "./InvalidCborFormatError";

/**
 * Decoding helpers that follow cardano-ledger's decoders (cardano-ledger-binary
 * `Cardano.Ledger.Binary.Decoding.Decoder`) exactly, so that a structure is
 * rejected iff the Haskell node rejects it.
 *
 * Some rules depend on the decoder version (the protocol version the era is
 * decoded at, `eraProtVerLow`). Everything up to Conway decodes below 12;
 * Dijkstra decodes at 12, where cardano-ledger accepts chunked byte and text
 * strings everywhere (`decodeBytes` / `decodeString` switch to
 * `decodeBytesDefOrIndef` / `decodeStringDefOrIndef` at version 12) and its
 * record decoders accept indefinite-length arrays. The Dijkstra decoders run
 * inside `withDecodeVersion( 12, ... )`.
 */

let _decodeVersion: number = 11;

/** current decoder (protocol) version; defaults to Conway (11) for decoders called directly */
export function getDecodeVersion(): number
{
    return _decodeVersion;
}

export function decodeVersionAtLeast( v: number ): boolean
{
    return _decodeVersion >= v;
}

/** runs `fn` with the decoder version set to `v` (restored afterwards, also on throw) */
export function withDecodeVersion<T>( v: number, fn: () => T ): T
{
    const prev = _decodeVersion;
    _decodeVersion = v;
    try {
        return fn();
    }
    finally {
        _decodeVersion = prev;
    }
}

const U64_MAX = BigInt("0xffffffffffffffff");
export const MAX_WORD16 = BigInt( 0xffff );
export const MAX_WORD32 = BigInt( 0xffffffff );
export const MAX_WORD64 = U64_MAX;
export const MAX_INT64 = BigInt("0x7fffffffffffffff");
export const MIN_INT64 = -BigInt("0x8000000000000000");

/**
 * `true` if the integer was encoded as a bignum (`#6.2` / `#6.3` over bytes).
 * cardano-ledger reads every fixed-width integer with `decodeWord*` / `decodeInt*`,
 * which take major types 0 / 1 only; bignums are only valid in Plutus Data and
 * in `decodeInteger` contexts (rationals).
 */
export function isBigNum( n: CborObj ): boolean
{
    const flag = ( n as any )?.isBigNum;
    if( typeof flag === "function" ) return Boolean( flag.call( n ) );
    if( typeof flag === "boolean" ) return flag;
    return ( n as any )?.bigNumEncoding instanceof CborBytes;
}

function fail( what: string, msg: string ): never
{
    throw new InvalidCborFormatError( what, msg );
}

/**
 * bytes of a byte string as cardano-ledger's `decodeBytes` reads them:
 * definite length only below protocol version 12 (cborg `decodeBytes`),
 * chunked strings accepted from 12.
 *
 * Plutus Data (`bounded_bytes`) and transaction metadata do not use this.
 */
export function definiteBytes( cObj: CborObj | undefined, what: string ): Uint8Array
{
    if(!( cObj instanceof CborBytes )) fail( what, "expected a byte string" );
    if( !cObj.isDefiniteLength && !decodeVersionAtLeast( 12 ) )
        fail( what, "indefinite-length (chunked) byte strings are not allowed here" );
    return cObj.bytes;
}

/** same as `definiteBytes` for text strings (`decodeString`) */
export function definiteText( cObj: CborObj | undefined, what: string ): string
{
    if(!( cObj instanceof CborText )) fail( what, "expected a text string" );
    const definite = ( cObj as any ).isDefiniteLength;
    const isDefinite = typeof definite === "boolean" ? definite : typeof ( cObj as any ).chunks === "string";
    if( !isDefinite && !decodeVersionAtLeast( 12 ) )
        fail( what, "indefinite-length (chunked) text strings are not allowed here" );
    return cObj.text;
}

/** throws if the byte string is not exactly `len` bytes */
export function fixedBytes( cObj: CborObj | undefined, len: number, what: string ): Uint8Array
{
    const b = definiteBytes( cObj, what );
    if( b.length !== len ) fail( what, `expected ${len} bytes, got ${b.length}` );
    return b;
}

/**
 * unsigned integer as `decodeWord64` (or narrower) reads it: major type 0 only,
 * no bignum, at most `max`.
 */
export function cborUInt( cObj: CborObj | undefined, what: string, max: bigint = U64_MAX ): bigint
{
    if(!( cObj instanceof CborUInt )) fail( what, "expected an unsigned integer" );
    if( isBigNum( cObj ) ) fail( what, "bignums are not allowed here" );
    const n = cObj.num;
    if( n > max ) fail( what, `integer ${n} out of range (max ${max})` );
    return n;
}

export function cborUInt16( cObj: CborObj | undefined, what: string ): bigint
{
    return cborUInt( cObj, what, MAX_WORD16 );
}

export function cborUInt32( cObj: CborObj | undefined, what: string ): bigint
{
    return cborUInt( cObj, what, MAX_WORD32 );
}

/**
 * signed integer as `decodeInt64` (or narrower) reads it: major types 0 / 1,
 * no bignum, within `[min, max]`.
 */
export function cborInt( cObj: CborObj | undefined, what: string, min: bigint = MIN_INT64, max: bigint = MAX_INT64 ): bigint
{
    if(!( cObj instanceof CborUInt || cObj instanceof CborNegInt )) fail( what, "expected an integer" );
    if( isBigNum( cObj ) ) fail( what, "bignums are not allowed here" );
    const n = cObj.num;
    if( n < min || n > max ) fail( what, `integer ${n} out of range [${min}, ${max}]` );
    return n;
}

/** `decodeInteger`: major types 0 / 1 and bignums */
export function cborInteger( cObj: CborObj | undefined, what: string ): bigint
{
    if(!( cObj instanceof CborUInt || cObj instanceof CborNegInt )) fail( what, "expected an integer" );
    return cObj.num;
}

export interface ArrayOpts {
    /** exact number of elements (definite or indefinite) */
    len?: number;
    /**
     * the array must have a definite length; cardano-ledger's `RecD` record
     * decoders (used below protocol version 12) reject indefinite-length arrays
     * because they look for the break right after the header.
     * Ignored from protocol version 12.
     */
    definite?: boolean;
}

/** elements of an array, checking arity and length encoding */
export function cborArray( cObj: CborObj | undefined, what: string, opts: ArrayOpts = {} ): CborObj[]
{
    if(!( cObj instanceof CborArray )) fail( what, "expected an array" );
    if( opts.definite && cObj.indefinite && !decodeVersionAtLeast( 12 ) )
        fail( what, "indefinite-length arrays are not allowed here" );
    if( typeof opts.len === "number" && cObj.array.length !== opts.len )
        fail( what, `expected ${opts.len} elements, got ${cObj.array.length}` );
    return cObj.array;
}

/** the payload of a tag, checking the tag number */
export function expectTag( cObj: CborObj | undefined, tag: number, what: string ): CborObj
{
    if(!( cObj instanceof CborTag )) fail( what, `expected tag ${tag}` );
    if( Number( cObj.tag ) !== tag ) fail( what, `expected tag ${tag}, got tag ${cObj.tag}` );
    return cObj.data;
}

/** `true` for the CBOR `null` simple value */
export function isCborNull( cObj: CborObj | undefined ): boolean
{
    return cObj instanceof CborSimple && cObj.simple === null;
}

/** map entries */
export function cborMapEntries( cObj: CborObj | undefined, what: string )
{
    if(!( cObj instanceof CborMap )) fail( what, "expected a map" );
    return cObj.map;
}

/**
 * keys of a record-like map (`decodeWord` keys): unsigned, not bignum;
 * duplicates are rejected (cardano-ledger's sparse decoders fail with
 * `duplicateKey`).
 */
export function sparseMapKeys( cObj: CborObj | undefined, what: string ): number[]
{
    const entries = cborMapEntries( cObj, what );
    const seen = new Set<number>();
    const keys: number[] = [];
    for( const { k } of entries )
    {
        const n = Number( cborUInt( k, what ) );
        if( seen.has( n ) ) fail( what, `duplicate key ${n}` );
        seen.add( n );
        keys.push( n );
    }
    return keys;
}

/**
 * parses exactly one CBOR item spanning the whole input (cardano-ledger's
 * `decodeFull` fails on leftover bytes); keeps the sub-references.
 */
export function parseCborFull( cStr: CanBeCborString, what: string ): CborObj
{
    const bytes = forceCborString( cStr );
    const { parsed, offset } = Cbor.parseWithOffset( bytes, { keepRef: true } );
    if( offset !== bytes.length )
        fail( what, `${bytes.length - offset} trailing bytes after the CBOR item` );
    return parsed;
}

/**
 * makes `cls.fromCborObj` run at decoder version `v` (used for the Dijkstra
 * era types, decoded by cardano-ledger at protocol version 12); everything the
 * decoder calls, shared types included, sees that version.
 */
export function decodeAtVersion<C extends { fromCborObj: ( ...args: any[] ) => any }>( v: number, cls: C ): C
{
    const orig = cls.fromCborObj;
    ( cls as any ).fromCborObj = function( this: any, ...args: any[] ) {
        return withDecodeVersion( v, () => orig.apply( this, args ) );
    };
    return cls;
}
