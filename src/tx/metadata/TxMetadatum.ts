import { ByteString } from "@harmoniclabs/bytestring";
import { CborObj, CborMap, CborArray, CborUInt, CborNegInt, CborBytes, CborText, ToCbor, CborString, Cbor } from "@harmoniclabs/cbor";
import { has_n_determined_keys, defineReadOnlyProperty } from "@harmoniclabs/obj-utils";
import { isUint8Array, toHex } from "@harmoniclabs/uint8array-utils";
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

    constructor( map: TxMetadatumMapEntry[] )
    {
        assert(
            map.every( isTxMetadatumMapEntry ),
            "invalid entries for TxMetadatumMap"
        );

        defineReadOnlyProperty(
            this,
            "map",
            Object.freeze( map )
        );
    }

    toCbor(): CborString
    {
        if( this.subCborRef instanceof SubCborRef )
        {
            // TODO: validate cbor structure
            // we assume correctness here
            return new CborString( this.subCborRef.toBuffer() );
        }
        
        return Cbor.encode( this.toCborObj() );
    }
    toCborObj(): CborObj
    {
        if( this.subCborRef instanceof SubCborRef )
        {
            // TODO: validate cbor structure
            // we assume correctness here
            return Cbor.parse( this.subCborRef.toBuffer() );
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

    constructor( map: TxMetadatum[] )
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

    toCbor(): CborString
    {
        if( this.subCborRef instanceof SubCborRef )
        {
            // TODO: validate cbor structure
            // we assume correctness here
            return new CborString( this.subCborRef.toBuffer() );
        }
        
        return Cbor.encode( this.toCborObj() );
    }
    toCborObj(): CborObj
    {
        if( this.subCborRef instanceof SubCborRef )
        {
            // TODO: validate cbor structure
            // we assume correctness here
            return Cbor.parse( this.subCborRef.toBuffer() );
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

    constructor( n: number | bigint )
    {
        defineReadOnlyProperty(
            this,
            "n",
            BigInt( n )
        );
    }

    toCbor(): CborString
    {
        if( this.subCborRef instanceof SubCborRef )
        {
            // TODO: validate cbor structure
            // we assume correctness here
            return new CborString( this.subCborRef.toBuffer() );
        }
        
        return Cbor.encode( this.toCborObj() );
    }
    toCborObj(): CborObj
    {
        if( this.subCborRef instanceof SubCborRef )
        {
            // TODO: validate cbor structure
            // we assume correctness here
            return Cbor.parse( this.subCborRef.toBuffer() );
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

    constructor( bytes: Uint8Array | ByteString )
    {
        defineReadOnlyProperty(
            this,
            "bytes",
            isUint8Array( bytes ) ? bytes : bytes.toBuffer()
        );
    }

    toCbor(): CborString
    {
        if( this.subCborRef instanceof SubCborRef )
        {
            // TODO: validate cbor structure
            // we assume correctness here
            return new CborString( this.subCborRef.toBuffer() );
        }
        
        return Cbor.encode( this.toCborObj() );
    }
    toCborObj(): CborObj
    {
        if( this.subCborRef instanceof SubCborRef )
        {
            // TODO: validate cbor structure
            // we assume correctness here
            return Cbor.parse( this.subCborRef.toBuffer() );
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

    constructor( text: string )
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

    toCbor(): CborString
    {
        if( this.subCborRef instanceof SubCborRef )
        {
            // TODO: validate cbor structure
            // we assume correctness here
            return new CborString( this.subCborRef.toBuffer() );
        }
        
        return Cbor.encode( this.toCborObj() );
    }
    toCborObj(): CborObj
    {
        if( this.subCborRef instanceof SubCborRef )
        {
            // TODO: validate cbor structure
            // we assume correctness here
            return Cbor.parse( this.subCborRef.toBuffer() );
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