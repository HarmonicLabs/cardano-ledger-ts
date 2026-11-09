import { CborObj, CborMap, CborArray, CborUInt, CborNegInt, CborBytes, CborText, ToCbor, CborString, Cbor, SubCborRef } from "@harmoniclabs/cbor";
import { getDecodeVersion, isBigNum } from "../../utils/strictCbor";
import { has_n_determined_keys, defineReadOnlyProperty } from "@harmoniclabs/obj-utils";
import { fromHex, isUint8Array, toHex } from "@harmoniclabs/uint8array-utils";
import { InvalidCborFormatError } from "../../utils/InvalidCborFormatError";
import { ToJson } from "../../utils/ToJson";
import { subCborRefOrUndef } from "../../utils/getSubCborRef";

export type TxMetadatum
    = TxMetadatumMap
    | TxMetadatumList
    | TxMetadatumInt
    | TxMetadatumBytes
    | TxMetadatumText;

/**
 * cardano-ledger `decodeMetadatum`: maps and lists (definite or indefinite), integers
 * from CBOR heads only (no bignum), byte strings and text strings, definite or chunked,
 * of at most 64 bytes (enforced from Allegra, decoder version > 2); nothing else.
 */
export function txMetadatumFromCborObj( cObj: CborObj ): TxMetadatum
{
    const checkSizes = getDecodeVersion() > 2;
    // Metadata is a JSON-like tree and can be arbitrarily deep. Decode it with an explicit
    // stack: a recursive walk overflows the JS stack on real preview blocks (slot 127055999),
    // even though the ledger accepts them. Containers are created empty and filled below.
    let root: TxMetadatum | undefined;
    type Job = { obj: CborObj; set: (v: TxMetadatum) => void };
    const stack: Job[] = [{ obj: cObj, set: (v) => { root = v; } }];
    const freeze: Array<() => void> = [];
    while( stack.length > 0 )
    {
        const { obj, set } = stack.pop()!;

        if( obj instanceof CborMap )
        {
            const entries: TxMetadatumMapEntry[] = obj.map.map( () => ({ k: undefined as any, v: undefined as any }) );
            const out = new TxMetadatumMap( [] );
            // `map` is a writable own property on the instance (only the initial array was frozen).
            (out as any).map = entries;
            set( out );
            freeze.push( () => { Object.freeze( entries ); } );
            for( let i = obj.map.length - 1; i >= 0; i-- )
            {
                const entry = obj.map[i]!;
                stack.push({ obj: entry.v, set: (v) => { entries[i]!.v = v; } });
                stack.push({ obj: entry.k, set: (v) => { entries[i]!.k = v; } });
            }
            continue;
        }

        if( obj instanceof CborArray )
        {
            const items: TxMetadatum[] = new Array( obj.array.length );
            const out = new TxMetadatumList( [] );
            (out as any).list = items;
            set( out );
            freeze.push( () => { Object.freeze( items ); } );
            for( let i = obj.array.length - 1; i >= 0; i-- )
                stack.push({ obj: obj.array[i]!, set: (v) => { items[i] = v; } });
            continue;
        }

        if( obj instanceof CborUInt || obj instanceof CborNegInt )
        {
            if( isBigNum( obj ) ) throw new InvalidCborFormatError("TxMetadatum", "big integers are not allowed in metadata");
            set( new TxMetadatumInt( obj.num ) );
            continue;
        }
        if( obj instanceof CborBytes )
        {
            const bytes = obj.bytes;
            if( checkSizes && bytes.length > 64 ) throw new InvalidCborFormatError("TxMetadatum", "bytes .size (0..64): bytestring exceeds 64 bytes");
            set( new TxMetadatumBytes( bytes ) );
            continue;
        }
        if( obj instanceof CborText )
        {
            const text = obj.text;
            if( checkSizes && new TextEncoder().encode( text ).length > 64 ) throw new InvalidCborFormatError("TxMetadatum", "text .size (0..64): text exceeds 64 bytes");
            set( new TxMetadatumText( text ) );
            continue;
        }

        throw new InvalidCborFormatError("TxMetadatum")
    }
    for( const f of freeze ) f();
    return root!;
}

export function isTxMetadatum( something: any ): something is TxMetadatum
{
    return (
        something instanceof TxMetadatumMap     ||
        something instanceof TxMetadatumList    ||
        something instanceof TxMetadatumInt     ||
        something instanceof TxMetadatumBytes   ||
        something instanceof TxMetadatumText
    );
}

export type TxMetadatumMapEntry = {
    k: TxMetadatum,
    v: TxMetadatum
};

function isTxMetadatumMapEntry( something: any ): something is TxMetadatumMapEntry
{
    return (
        has_n_determined_keys(
            something, 2, "k", "v"
        ) &&
        isTxMetadatum( something["k"] ) &&
        isTxMetadatum( something["v"] )
    );
}

export class TxMetadatumMap
    implements ToCbor, ToJson
{
    readonly map!: Readonly<TxMetadatumMapEntry[]>;

    constructor(
        map: TxMetadatumMapEntry[],
        readonly cborRef: SubCborRef | undefined = undefined
    )
    {
        if(!(
            map.every( isTxMetadatumMapEntry )
        ))throw new Error("invalid entries for TxMetadatumMap");

        this.map = Object.freeze( map );

        /* Done: this.cboRref params */
        this.cborRef = cborRef ?? subCborRefOrUndef( map );
    }

    toCborBytes(): Uint8Array
    {
        if( this.cborRef instanceof SubCborRef ) return this.cborRef.toBuffer();
        return this.toCbor();
    }
    toCbor(): CborString
    {
        if( this.cborRef instanceof SubCborRef )
        {
            // TODO: validate cbor structure
            // we assume correctness here
            return this.cborRef.toBuffer();
        }
        
        return Cbor.encode( this.toCborObj() );
    }
    toCborObj(): CborObj
    {
        if( this.cborRef instanceof SubCborRef )
        {
            // TODO: validate cbor structure
            // we assume correctness here
            return Cbor.parse( this.cborRef.toBuffer() );
        }
        return new CborMap(
            this.map.map( entry => {
                return {
                    k: entry.k.toCborObj(),
                    v: entry.v.toCborObj(),
                }
            })
        )
    }

    toJSON() { return this.toJson(); }
    toJson(): { k: any, v: any }[]
    {
        return this.map.map( entry => {
            return {
                k: entry.k.toJson(),
                v: entry.v.toJson(),
            }
        })
    }
}

export class TxMetadatumList
    implements ToCbor, ToJson
{
    readonly list!: Readonly<TxMetadatum[]>;

    constructor(
        map: TxMetadatum[],
        readonly cborRef: SubCborRef | undefined = undefined
    )
    {
        if(!(
            map.every( isTxMetadatum )
        ))throw new Error("invalid entries for TxMetadatumList");
        
        this.list = Object.freeze( map );

         /* Done: this.cboRref params */
        this.cborRef = cborRef ?? subCborRefOrUndef( map );        
    }

    toCborBytes(): Uint8Array
    {
        if( this.cborRef instanceof SubCborRef ) return this.cborRef.toBuffer();
        return this.toCbor();
    }
    toCbor(): CborString
    {
        if( this.cborRef instanceof SubCborRef )
        {
            // TODO: validate cbor structure
            // we assume correctness here
            return this.cborRef.toBuffer();
        }
        
        return Cbor.encode( this.toCborObj() );
    }
    toCborObj(): CborObj
    {
        if( this.cborRef instanceof SubCborRef )
        {
            // TODO: validate cbor structure
            // we assume correctness here
            return Cbor.parse( this.cborRef.toBuffer() );
        }
        return new CborArray( this.list.map( _ => _.toCborObj() ) );
    }

    toJSON() { return this.toJson(); }
    toJson(): any[]
    {
        return this.list.map( _ => _.toJson() );
    }
}

export class TxMetadatumInt
    implements ToCbor, ToJson
{
    readonly n!: bigint;

    constructor(
        n: number | bigint,
        readonly cborRef: SubCborRef | undefined = undefined
    )
    {
        this.n = BigInt( n );
    }

    toCborBytes(): Uint8Array
    {
        if( this.cborRef instanceof SubCborRef ) return this.cborRef.toBuffer();
        return this.toCbor();
    }
    toCbor(): CborString
    {
        if( this.cborRef instanceof SubCborRef )
        {
            // TODO: validate cbor structure
            // we assume correctness here
            return this.cborRef.toBuffer();
        }
        
        return Cbor.encode( this.toCborObj() );
    }
    toCborObj(): CborObj
    {
        if( this.cborRef instanceof SubCborRef )
        {
            // TODO: validate cbor structure
            // we assume correctness here
            return Cbor.parse( this.cborRef.toBuffer() );
        }
        return this.n < BigInt( 0 ) ? new CborNegInt( this.n ) : new CborUInt( this.n )
    }

    toJSON() { return this.toJson(); }
    toJson(): { int: string; }
    {
        return { int: this.n.toString() }
    }
}
export class TxMetadatumBytes
    implements ToCbor, ToJson
{
    readonly bytes!: Uint8Array

    constructor(
        bytes: Uint8Array | string,
        readonly cborRef: SubCborRef | undefined = undefined
    )
    {
        this.bytes = bytes instanceof Uint8Array ? bytes : fromHex( bytes );
        /* Done: this.cboRref params */
        this.cborRef = cborRef ?? subCborRefOrUndef( bytes );
    }

    toCborBytes(): Uint8Array
    {
        if( this.cborRef instanceof SubCborRef ) return this.cborRef.toBuffer();
        return this.toCbor();
    }
    toCbor(): CborString
    {
        if( this.cborRef instanceof SubCborRef )
        {
            // TODO: validate cbor structure
            // we assume correctness here
            return this.cborRef.toBuffer();
        }
        
        return Cbor.encode( this.toCborObj() );
    }
    toCborObj(): CborObj
    {
        if( this.cborRef instanceof SubCborRef )
        {
            // TODO: validate cbor structure
            // we assume correctness here
            return Cbor.parse( this.cborRef.toBuffer() );
        }
        if( this.bytes.length > 64 )
        {
            const chunks: CborBytes[] = [];

            for( let ptr: number = 0; ptr < this.bytes.length; ptr += 64 )
            {
                chunks.push(
                    new CborBytes(
                        this.bytes.subarray( ptr, ptr + 64 )
                    )
                );
            }

            return new CborArray( chunks );
        }

        return new CborBytes( this.bytes );
    }

    toJSON() { return this.toJson(); }
    toJson(): { bytes: string }
    {
        return { bytes: toHex( this.bytes ) }
    }
}

export class TxMetadatumText
    implements ToCbor, ToJson
{
    readonly text!: string

    constructor(
        text: string,
        readonly cborRef: SubCborRef | undefined = undefined
    )
    {
        if(!(
            typeof text === "string"
        ))throw new Error("invalid text");

        this.text = text;
        
     /* Done: this.cboRref params */
     this.cborRef = cborRef ?? subCborRefOrUndef( text );
    }

    toCborBytes(): Uint8Array
    {
        if( this.cborRef instanceof SubCborRef ) return this.cborRef.toBuffer();
        return this.toCbor();
    }
    toCbor(): CborString
    {
        if( this.cborRef instanceof SubCborRef )
        {
            // TODO: validate cbor structure
            // we assume correctness here
            return this.cborRef.toBuffer();
        }
        
        return Cbor.encode( this.toCborObj() );
    }
    toCborObj(): CborObj
    {
        if( this.cborRef instanceof SubCborRef )
        {
            // TODO: validate cbor structure
            // we assume correctness here
            return Cbor.parse( this.cborRef.toBuffer() );
        }
        if( this.text.length > 64 )
        {
            const chunks: CborText[] = [];

            for( let ptr: number = 0; ptr < this.text.length; ptr += 64 )
            {
                chunks.push(
                    new CborText(
                        this.text.slice( ptr, ptr + 64 )
                    )
                );
            }

            return new CborArray( chunks );
        }

        return new CborText( this.text );
    }

    toJSON() { return this.toJson(); }
    toJson(): { text: string }
    {
        return { text: this.text }
    }
}