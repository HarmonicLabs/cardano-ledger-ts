import { Cbor, CborArray, CborMap, CborMapEntry, CborObj, CborTag, CborUInt } from "@harmoniclabs/cbor";
import { costModelsFromCbor, CostModels } from "@harmoniclabs/cardano-costmodels-ts";
import { InvalidCborFormatError } from "../../../utils/InvalidCborFormatError";
import {
    boundedRational, cborArray, cborInt, cborMapEntries, cborUInt, decodeVersionAtLeast, getDecodeVersion,
    MAX_INT64, MAX_WORD16, MAX_WORD32, RationalBounds
} from "../../../utils/strictCbor";

/**
 * Conway `PParamsUpdate` as cardano-ledger decodes it below protocol version 12
 * (`decode $ SparseKeyed name emptyPParamsUpdate updateField []`):
 *
 * - a map (definite or indefinite) whose keys are `decodeWord`s; a repeated key
 *   fails (`duplicateKey`), a key that is not a Conway parameter fails (`invalidField`);
 * - every value is decoded with the parameter's own `DecCBOR` (`decode From`):
 *   Word16 / Word32 / Word64 fields take major type 0 only (no bignum, no float,
 *   no null), intervals are tag-30 rationals within their bounds, `Prices` and
 *   `ExUnits` are `RecD` records (definite arrays of exactly two), the voting
 *   thresholds are `decodeRecordNamed` records of 5 / 10 unit intervals and the
 *   cost models a map from Word8 to lists of Int64 (no duplicate languages).
 *
 * Conway keys: 0-11 and 16-33 (12 `d`, 13 extra entropy, 14 protocol version and
 * 15 min UTxO value are not updatable in Conway).
 */

const w64 = ( c: CborObj, what: string ) => { cborUInt( c, what ); };
const w32 = ( c: CborObj, what: string ) => { cborUInt( c, what, MAX_WORD32 ); };
const w16 = ( c: CborObj, what: string ) => { cborUInt( c, what, MAX_WORD16 ); };

/** reduced, tag-30 form of a bounded rational */
function rational( bounds: RationalBounds ): ( c: CborObj, what: string ) => CborObj
{
    return ( c, what ) => {
        const { num, den } = boundedRational( c, bounds, what );
        return new CborTag( 30, new CborArray([ new CborUInt( num ), new CborUInt( den ) ]) );
    };
}

/** `ExUnits` below version 12: `RecD ExUnits <! D decNat <! D decNat`, decNat = Word64 <= maxBound Int64 */
export function checkExUnitsCbor( c: CborObj | undefined, what: string ): [ bigint, bigint ]
{
    const [ mem, steps ] = cborArray( c, what, { len: 2, definite: true } );
    return [ cborUInt( mem, what, MAX_INT64 ), cborUInt( steps, what, MAX_INT64 ) ];
}

function prices( c: CborObj, what: string ): CborObj
{
    const [ mem, steps ] = cborArray( c, what, { len: 2, definite: true } );
    const r = rational( "nonNegative" );
    return new CborArray([ r( mem, what ), r( steps, what ) ]);
}

function thresholds( n: number ): ( c: CborObj, what: string ) => CborObj
{
    return ( c, what ) => {
        const elems = cborArray( c, what, { len: n } );
        const r = rational( "unit" );
        return new CborArray( elems.map( e => r( e, what ) ) );
    };
}

/** v9+ `decodeCostModelsLenient`: `Map Word8 [Int64]`, no duplicate keys */
function costModels( c: CborObj, what: string ): void
{
    const seen = new Set<number>();
    for( const { k, v } of cborMapEntries( c, what ) )
    {
        const lang = Number( cborUInt( k, what, BigInt( 255 ) ) );
        if( seen.has( lang ) ) throw new InvalidCborFormatError( what, `duplicate language ${lang}` );
        seen.add( lang );
        for( const x of cborArray( v, what ) ) cborInt( x, what );
    }
}

type FieldCheck = ( c: CborObj, what: string ) => CborObj | void;

const conwayFields: { [key: number]: FieldCheck } = {
    0: w64, 1: w64, 2: w32, 3: w32, 4: w16, 5: w64, 6: w64, 7: w32, 8: w16,
    9: rational( "nonNegative" ), 10: rational( "unit" ), 11: rational( "unit" ),
    16: w64, 17: w64, 18: costModels, 19: prices,
    20: ( c, what ) => { checkExUnitsCbor( c, what ); },
    21: ( c, what ) => { checkExUnitsCbor( c, what ); },
    22: w32, 23: w16, 24: w16,
    25: thresholds( 5 ), 26: thresholds( 10 ),
    27: w16, 28: w32, 29: w32, 30: w64, 31: w64, 32: w32,
    33: rational( "nonNegative" ),
};

/** `true` when the current decoder version decodes Conway parameter updates */
export function isConwayPParamsUpdateVersion(): boolean
{
    const v = getDecodeVersion();
    return v >= 9 && !decodeVersionAtLeast( 12 );
}

/**
 * validates a Conway parameter update and returns it with every rational
 * reduced to the `#6.30([n, d])` form the ledger stores
 */
export function checkConwayPParamsUpdateCbor( cObj: CborObj ): CborMap
{
    const what = "Conway PParamsUpdate";
    const entries = cborMapEntries( cObj, what );
    const seen = new Set<number>();
    const out: CborMapEntry[] = [];
    for( const { k, v } of entries )
    {
        const key = Number( cborUInt( k, what ) );
        if( seen.has( key ) ) throw new InvalidCborFormatError( what, `duplicate key ${key}` );
        seen.add( key );
        const check = conwayFields[key];
        if( check === undefined ) throw new InvalidCborFormatError( what, `unknown parameter key ${key}` );
        const norm = check( v, `${what} key ${key}` );
        out.push({ k, v: norm === undefined ? v : norm });
    }
    return new CborMap( out );
}

/**
 * cost models through the bytes, so the copy of @harmoniclabs/cbor nested under
 * cardano-costmodels-ts does not have to recognise this copy's objects
 */
export function costModelsFromCborObjViaBytes( cObj: CborObj | undefined ): CostModels | undefined
{
    if( cObj === undefined ) return undefined;
    // the structure was checked by the era decoder; cardano-costmodels-ts may still
    // refuse what cardano-ledger keeps (short or unknown-language cost models), and
    // a cost model it cannot represent must not reject the block: it is left out,
    // as before (Gerolamo reads key 18 from the body bytes)
    try {
        return costModelsFromCbor( Cbor.encode( cObj ) );
    }
    catch {
        return undefined;
    }
}
