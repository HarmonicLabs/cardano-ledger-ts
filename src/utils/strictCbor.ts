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
/** how many withDecodeVersion scopes are active (0 = a decoder was called directly, with no era context) */
let _explicitDepth = 0;

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
    _explicitDepth++;
    try {
        return fn();
    }
    finally {
        _explicitDepth--;
        _decodeVersion = prev;
    }
}

/**
 * runs `fn` at decoder version `v` only when no era context is active; inside an era decoder
 * (`withDecodeVersion` / `decodeAtVersion`) the enclosing version is kept. For era-agnostic entry
 * points that decode data of any era, e.g. a stored UTxO output created in Mary (zero-quantity assets
 * were legal before protocol 9) read back with `TxOut.fromCbor`.
 */
export function withDefaultDecodeVersion<T>( v: number, fn: () => T ): T
{
    return _explicitDepth > 0 ? fn() : withDecodeVersion( v, fn );
}

/**
 * decoder version for era-agnostic entry points: before protocol 9, where cardano-ledger's
 * decoders are most permissive for outputs and values (duplicate keys, zero quantities and empty
 * asset maps were only rejected from 9), so stored outputs of every era decode
 */
export const ERA_AGNOSTIC_DECODE_VERSION = 7;

/**
 * Decoding strictness.
 *
 * - `"strict"` (the default): every decoder accepts exactly what cardano-ledger accepts.
 * - `"lenient"`: the CBOR *form* checks added in 0.6.0 are relaxed, so data that is well-formed
 *   enough to read but not canonical decodes the way 0.5.x decoded it. Relaxed: definite-length
 *   byte and text strings and records (indefinite ones are accepted), bignums and integer
 *   ranges in fixed-width fields, extra elements after the expected ones, a missing tag where
 *   one is expected (the untagged value is read), duplicate keys and set elements, empty
 *   non-empty sets, text length bounds, and trailing bytes after the item.
 *   Not relaxed: the type of each field, hash sizes, required fields, and the era rules gated by
 *   protocol version (use `withDecodeVersion` for those).
 *
 * Use lenient decoding to read data a node would reject (explorers, debugging, data produced by
 * older tools). Never use it to decide whether a transaction or block is valid.
 */
export type DecodeStrictness = "strict" | "lenient";

let _defaultStrictness: DecodeStrictness = "strict";
let _scopedStrictness: DecodeStrictness | undefined = undefined;

/** the strictness decoders use right now */
export function getDecodeStrictness(): DecodeStrictness
{
    return _scopedStrictness ?? _defaultStrictness;
}

/** `true` while decoders run in lenient mode */
export function isLenientDecoding(): boolean
{
    return getDecodeStrictness() === "lenient";
}

/** sets the strictness used outside any `withDecodeStrictness` scope (process-wide; default "strict") */
export function setDefaultDecodeStrictness( strictness: DecodeStrictness ): void
{
    if(!( strictness === "strict" || strictness === "lenient" ))
    throw new Error("decode strictness must be \"strict\" or \"lenient\"");
    _defaultStrictness = strictness;
}

/** runs `fn` with the given strictness (restored afterwards, also on throw) */
export function withDecodeStrictness<T>( strictness: DecodeStrictness, fn: () => T ): T
{
    if(!( strictness === "strict" || strictness === "lenient" ))
    throw new Error("decode strictness must be \"strict\" or \"lenient\"");
    const prev = _scopedStrictness;
    _scopedStrictness = strictness;
    try {
        return fn();
    }
    finally {
        _scopedStrictness = prev;
    }
}

/** `withDecodeStrictness( "lenient", fn )` */
export function withLenientDecoding<T>( fn: () => T ): T
{
    return withDecodeStrictness( "lenient", fn );
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
    if( !cObj.isDefiniteLength && !decodeVersionAtLeast( 12 ) && !isLenientDecoding() )
        fail( what, "indefinite-length (chunked) byte strings are not allowed here" );
    return cObj.bytes;
}

/** same as `definiteBytes` for text strings (`decodeString`) */
export function definiteText( cObj: CborObj | undefined, what: string ): string
{
    if(!( cObj instanceof CborText )) fail( what, "expected a text string" );
    const definite = ( cObj as any ).isDefiniteLength;
    const isDefinite = typeof definite === "boolean" ? definite : typeof ( cObj as any ).chunks === "string";
    if( !isDefinite && !decodeVersionAtLeast( 12 ) && !isLenientDecoding() )
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
    const n = cObj.num;
    if( isLenientDecoding() ) return n;
    if( isBigNum( cObj ) ) fail( what, "bignums are not allowed here" );
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
    const n = cObj.num;
    if( isLenientDecoding() ) return n;
    if( isBigNum( cObj ) ) fail( what, "bignums are not allowed here" );
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
    const lenient = isLenientDecoding();
    if( opts.definite && cObj.indefinite && !decodeVersionAtLeast( 12 ) && !lenient )
        fail( what, "indefinite-length arrays are not allowed here" );
    if( typeof opts.len === "number" && ( lenient ? cObj.array.length < opts.len : cObj.array.length !== opts.len ) )
        fail( what, `expected ${opts.len} elements, got ${cObj.array.length}` );
    return cObj.array;
}

/** the payload of a tag, checking the tag number */
export function expectTag( cObj: CborObj | undefined, tag: number, what: string ): CborObj
{
    if(!( cObj instanceof CborTag ))
    {
        if( isLenientDecoding() && cObj !== undefined ) return cObj;
        fail( what, `expected tag ${tag}` );
    }
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
        if( seen.has( n ) && !isLenientDecoding() ) fail( what, `duplicate key ${n}` );
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
    if( offset !== bytes.length && !isLenientDecoding() )
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

/**
 * text of at most `maxBytes` UTF-8 bytes (`textDecCBOR n`: Url and DnsName
 * take 128 bytes from protocol version 9, 64 before)
 */
export function boundedText( cObj: CborObj | undefined, maxBytes: number, what: string ): string
{
    const t = definiteText( cObj, what );
    const n = new TextEncoder().encode( t ).length;
    if( n > maxBytes && !isLenientDecoding() ) fail( what, `text of ${n} bytes exceeds ${maxBytes}` );
    return t;
}

/** Url / DnsName size bound for the current decoder version */
export function urlMaxBytes(): number
{
    return decodeVersionAtLeast( 9 ) ? 128 : 64;
}

/** `decodeNullStrictMaybe`: `null` is absent, anything else goes to `dec` */
export function nullOr<T>( cObj: CborObj | undefined, dec: ( c: CborObj ) => T ): T | undefined
{
    if( isCborNull( cObj ) ) return undefined;
    return dec( cObj as CborObj );
}

/**
 * `decodeRecordSum`: `[tag, ...fields]`, definite or indefinite; the tag is a
 * `decodeWord`, a definite array must have exactly the size the branch expects.
 * Returns the tag and the elements; the caller checks the size with `expectSize`.
 */
export function recordSum( cObj: CborObj | undefined, what: string ): { tag: number, fields: CborObj[], size: number }
{
    const arr = cborArray( cObj, what );
    if( arr.length < 1 ) fail( what, "empty sum" );
    const tag = Number( cborUInt( arr[0], what ) );
    return { tag, fields: arr.slice( 1 ), size: arr.length };
}

export function expectSize( actual: number, expected: number, what: string ): void
{
    if( isLenientDecoding() ? actual < expected : actual !== expected )
        fail( what, `expected ${expected} elements, got ${actual}` );
}

export type RationalBounds = "unit" | "nonNegative" | "positiveUnit" | "positive";

function gcd( a: bigint, b: bigint ): bigint
{
    while( b !== BigInt(0) ) { const t = a % b; a = b; b = t; }
    return a;
}

/**
 * cardano-ledger `DecCBOR (BoundedRatio b Word64)` (UnitInterval, NonNegativeInterval, ...).
 *
 * Below protocol version 12 (`Plain.decodeRationalWithTag`): tag 30 is required, the
 * array (definite or indefinite) has exactly two `decodeInteger`s (bignums allowed),
 * the denominator is not zero; the value is reduced (`n % d`, sign on the numerator)
 * and must fit Word64 / the interval bounds.
 * From 12 (`decodeIntegralRational @Word64`): tag 30 and two Word64s.
 *
 * Returns the reduced numerator and denominator.
 */
export function boundedRational( cObj: CborObj | undefined, bounds: RationalBounds, what: string ): { num: bigint, den: bigint }
{
    const data = expectTag( cObj, 30, what );
    const elems = cborArray( data, what, { len: 2 } );
    let n: bigint, d: bigint;
    if( decodeVersionAtLeast( 12 ) )
    {
        n = cborUInt( elems[0], what );
        d = cborUInt( elems[1], what );
    }
    else
    {
        n = cborInteger( elems[0], what );
        d = cborInteger( elems[1], what );
    }
    if( d === BigInt(0) ) fail( what, "denominator cannot be zero" );
    if( d < BigInt(0) ) { n = -n; d = -d; }
    const g = gcd( n < BigInt(0) ? -n : n, d );
    if( g > BigInt(1) ) { n = n / g; d = d / g; }
    if( n < BigInt(0) || n > U64_MAX || d > U64_MAX ) fail( what, `${n}/${d} out of the Word64 range` );
    // positiveIntervalEpsilon = 1 % 10^19
    const eps = BigInt("10000000000000000000");
    switch( bounds )
    {
        case "unit": if( n > d ) fail( what, `${n}/${d} is not in [0, 1]` ); break;
        case "positiveUnit": if( n > d || n * eps < d ) fail( what, `${n}/${d} is not in (0, 1]` ); break;
        case "positive": if( n * eps < d ) fail( what, `${n}/${d} is not positive` ); break;
        case "nonNegative": break;
    }
    return { num: n, den: d };
}

/**
 * converts a CborObj built by another copy of @harmoniclabs/cbor (e.g. the one
 * nested under cardano-costmodels-ts) into this copy's classes, so `instanceof`
 * based encoders and decoders accept it.
 */
export function toLocalCborObj( obj: any ): CborObj
{
    if( obj instanceof CborUInt || obj instanceof CborNegInt || obj instanceof CborBytes || obj instanceof CborText
        || obj instanceof CborArray || obj instanceof CborMap || obj instanceof CborTag || obj instanceof CborSimple ) return obj;
    if( Array.isArray( obj?.map ) )
        return new CborMap( obj.map.map( ({ k, v }: any) => ({ k: toLocalCborObj( k ), v: toLocalCborObj( v ) }) ), { indefinite: Boolean( obj.indefinite ) } );
    if( Array.isArray( obj?.array ) )
        return new CborArray( obj.array.map( toLocalCborObj ), { indefinite: Boolean( obj.indefinite ) } );
    if( obj?.tag !== undefined && obj?.data !== undefined ) return new CborTag( obj.tag, toLocalCborObj( obj.data ) );
    if( typeof obj?.num === "bigint" ) return obj.num < BigInt(0) ? new CborNegInt( obj.num ) : new CborUInt( obj.num );
    if( obj?.bytes instanceof Uint8Array ) return new CborBytes( obj.bytes );
    if( typeof obj?.text === "string" ) return new CborText( obj.text );
    if( obj && "simple" in obj ) return new CborSimple( obj.simple, obj.numAs );
    throw new Error("toLocalCborObj: not a CborObj");
}

/** cardano-ledger-binary `MaxVersion` */
export const MAX_PROTOCOL_VERSION = 13;

/**
 * cardano-ledger `fromCborAccountAddress`: a definite byte string of exactly 29
 * bytes whose header is `0b111s000n` (`header .&. 0b11101110 == 0b11100000`)
 * followed by a 28-byte key or script hash, nothing after it.
 */
export function rewardAccountBytes( cObj: CborObj | undefined, what: string ): Uint8Array
{
    const b = definiteBytes( cObj, what );
    if( b.length < 1 ) fail( what, "empty reward account" );
    if( ( b[0] & 0b11101110 ) !== 0b11100000 ) fail( what, `invalid reward account header ${b[0]}` );
    if( b.length !== 29 ) fail( what, `reward account of ${b.length} bytes, expected 29` );
    return b;
}

/**
 * elements of a CBOR set as cardano-ledger's `decodeSet` reads it: from protocol
 * version 9 the tag 258 is allowed (any other tag fails) and duplicates are
 * rejected (`keyOf` gives the identity of an element); below 9 a plain array
 * (duplicates collapse; the tag is still accepted here, as this library always did).
 */
export function cborSet( cObj: CborObj | undefined, what: string, opts: { nonEmpty?: boolean } = {} ): CborObj[]
{
    let data = cObj;
    if( data instanceof CborTag )
    {
        if( Number( data.tag ) !== 258 ) fail( what, `expected tag 258 for a set, got tag ${data.tag}` );
        data = data.data;
    }
    const elems = cborArray( data, what );
    if( opts.nonEmpty && elems.length === 0 && !isLenientDecoding() ) fail( what, "empty set where a non-empty set is required" );
    return elems;
}

/** rejects repeated elements from protocol version 9 (`decodeSetEnforceNoDuplicates`, `decodeMap`) */
export function noDuplicates<T>( items: T[], keyOf: ( x: T ) => string, what: string ): T[]
{
    if( !decodeVersionAtLeast( 9 ) || isLenientDecoding() ) return items;
    const seen = new Set<string>();
    for( const x of items )
    {
        const k = keyOf( x );
        if( seen.has( k ) ) fail( what, "duplicate element" );
        seen.add( k );
    }
    return items;
}

/** identity of a CBOR element by its canonical re-encoding (for duplicate checks) */
export function cborKey( c: CborObj ): string
{
    const bytes = Cbor.encode( stripRefs( c ) );
    let s = "";
    for( let i = 0; i < bytes.length; i++ ) s += bytes[i].toString(16).padStart(2, "0");
    return s;
}

function stripRefs( c: CborObj ): CborObj
{
    if( c instanceof CborArray ) return new CborArray( c.array.map( stripRefs ) );
    if( c instanceof CborMap ) return new CborMap( c.map.map(({ k, v }) => ({ k: stripRefs( k ), v: stripRefs( v ) })) );
    if( c instanceof CborTag ) return new CborTag( c.tag, stripRefs( c.data ) );
    if( c instanceof CborBytes ) return new CborBytes( c.bytes );
    if( c instanceof CborText ) return new CborText( c.text );
    if( c instanceof CborUInt ) return new CborUInt( c.num );
    if( c instanceof CborNegInt ) return new CborNegInt( c.num );
    return c;
}
