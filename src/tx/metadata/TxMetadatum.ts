import { CborObj, CborMap, CborArray, CborUInt, CborNegInt, CborBytes, CborText, ToCbor, CborString, Cbor, SubCborRef } from "@harmoniclabs/cbor";
import { has_n_determined_keys, defineReadOnlyProperty } from "@harmoniclabs/obj-utils";
import { fromHex, isUint8Array, toHex } from "@harmoniclabs/uint8array-utils";
import { InvalidCborFormatError } from "../../utils/InvalidCborFormatError";
import { ToJson } from "../../utils/ToJson";
import { assert } from "../../utils/assert";


export type TxMetadatum
    = TxMetadatumMap
    | TxMetadatumList
    | TxMetadatumInt
    | TxMetadatumBytes
    | TxMetadatumText;

export function txMetadatumFromCborObj( cObj: CborObj ): TxMetadatum
{
    if( cObj instanceof CborMap )
    {
        return new TxMetadatumMap( 
            cObj.map.map( entry => ({ 
                k: txMetadatumFromCborObj( entry.k ), 
                v: txMetadatumFromCborObj( entry.v )})
            )
        );
    }
    if( cObj instanceof CborArray )
    {
        return new TxMetadatumList( 
            cObj.array.map( txMetadatumFromCborObj )
        );
    }
    if( cObj instanceof CborUInt || cObj instanceof CborNegInt )
    {
        return new TxMetadatumInt( cObj.num );
    }
    if( cObj instanceof CborBytes )
    {
        return new TxMetadatumBytes( cObj.buffer );
    }
    if( cObj instanceof CborText )
    {
        return new TxMetadatumText( cObj.text );
    }

    throw new InvalidCborFormatError("TxMetadatum")
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
    readonly map!: TxMetadatumMapEntry[];

    constructor(
        map: TxMetadatumMapEntry[],
        readonly cborRef: SubCborRef | undefined = undefined
    )
    {
        if(!(
            map.every( isTxMetadatumMapEntry )
        ))throw new Error("invalid entries for TxMetadatumMap");

        /* TO DO: double check about Object.freeze */
        this.map = map
        
        defineReadOnlyProperty(
            this,
            "map",
            Object.freeze( map )
        );
    }

    toCborBytes(): Uint8Array
    {
        if( this.cborRef instanceof SubCborRef ) return this.cborRef.toBuffer();
        return this.toCbor().toBuffer();
    }
    toCbor(): CborString
    {
        if( this.cborRef instanceof SubCborRef )
        {
            // TODO: validate cbor structure
            // we assume correctness here
            return new CborString( this.cborRef.toBuffer() );
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
    readonly list!: TxMetadatum[];

    constructor(
        map: TxMetadatum[],
        readonly cborRef: SubCborRef | undefined = undefined
    )
    {
        assert(
            map.every( isTxMetadatum ),
            "invalid entries for TxMetadatumList"
        );

        defineReadOnlyProperty(
            this,
            "list",
            Object.freeze( map )
        );
    }

    toCborBytes(): Uint8Array
    {
        if( this.cborRef instanceof SubCborRef ) return this.cborRef.toBuffer();
        return this.toCbor().toBuffer();
    }
    toCbor(): CborString
    {
        if( this.cborRef instanceof SubCborRef )
        {
            // TODO: validate cbor structure
            // we assume correctness here
            return new CborString( this.cborRef.toBuffer() );
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
        defineReadOnlyProperty(
            this,
            "n",
            BigInt( n )
        );
    }

    toCborBytes(): Uint8Array
    {
        if( this.cborRef instanceof SubCborRef ) return this.cborRef.toBuffer();
        return this.toCbor().toBuffer();
    }
    toCbor(): CborString
    {
        if( this.cborRef instanceof SubCborRef )
        {
            // TODO: validate cbor structure
            // we assume correctness here
            return new CborString( this.cborRef.toBuffer() );
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
    }

    toCborBytes(): Uint8Array
    {
        if( this.cborRef instanceof SubCborRef ) return this.cborRef.toBuffer();
        return this.toCbor().toBuffer();
    }
    toCbor(): CborString
    {
        if( this.cborRef instanceof SubCborRef )
        {
            // TODO: validate cbor structure
            // we assume correctness here
            return new CborString( this.cborRef.toBuffer() );
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
        assert(
            typeof text === "string",
            "invalid text"
        );

        defineReadOnlyProperty(
            this,
            "text",
            text
        );
    }

    toCborBytes(): Uint8Array
    {
        if( this.cborRef instanceof SubCborRef ) return this.cborRef.toBuffer();
        return this.toCbor().toBuffer();
    }
    toCbor(): CborString
    {
        if( this.cborRef instanceof SubCborRef )
        {
            // TODO: validate cbor structure
            // we assume correctness here
            return new CborString( this.cborRef.toBuffer() );
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