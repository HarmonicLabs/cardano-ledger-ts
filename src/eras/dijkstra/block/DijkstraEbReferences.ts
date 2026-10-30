import { ToCbor, Cbor, CborArray, CborBytes, CborMap, CborObj, CborString, CborUInt, CanBeCborString, forceCborString, SubCborRef } from "@harmoniclabs/cbor";
import { canBeUInteger, CanBeUInteger } from "@harmoniclabs/cbor/dist/utils/ints";
import { blake2b_256 } from "@harmoniclabs/crypto";
import { canBeHash32, CanBeHash32, hash32bytes } from "../../../hashes";
import { U8Arr, U8Arr32 } from "../../../utils/U8Arr";
import { u32 } from "../../../utils/ints";
import { getSubCborRef } from "../../../utils/getSubCborRef";
import { InvalidCborFormatError } from "../../../utils/InvalidCborFormatError";
import { parseCborFull } from "../../../utils/strictCbor";
import { ToJson } from "../../../utils/ToJson";

/**
 * Dijkstra CDDL, Leios:
 *
 *   eb_references = nonempty_omap<from_index, to_index>
 *   from_index    = hash32                        -- hash of the complete block-format transaction
 *   to_index      = transaction_size : uint32    -- its size in bytes
 *
 * The map is ordered (CBOR map keys here are byte strings, so canonical
 * ordering is not guaranteed); cardano-ledger decodes it into `Map TxId
 * (Maybe SizeTx)` and /re-encodes/ sorted. Entries: 1..17142; no duplicate
 * hashes, no zero sizes. The announcement hash is blake2b-256 of the
 * canonical map encoding, and its size is the byte length of that encoding.
 *
 * Reference hashes are the "hash of complete transaction" (full block
 * `[body, witness_set, auxiliary_data, is_valid]` bytes), not the component
 * `hashTx` exposed on DijkstraTx; see `DijkstraTx.blockTransactionHash()`
 * (gouroboros `TransactionReferences` in ledger/common/leios.go).
 */
export const LEIOS_MAX_ENDORSER_BLOCK_REFS = 17142;

export interface IEbReference
{
    /** hash of the complete block-format transaction bytes */
    hash: CanBeHash32;
    /** its byte length (uint32, non-zero) */
    size: CanBeUInteger;
}

export interface IEbReferences
{
    references: IEbReference[];
}

export class DijkstraEbReferences implements ToCbor, ToJson
{
    readonly references: Array<{ hash: U8Arr32, size: number }>;
    readonly cborRef: SubCborRef | undefined;

    constructor( refs: IEbReferences | DijkstraEbReferences, cborRef?: SubCborRef )
    {
        const input = refs instanceof DijkstraEbReferences ? refs.references : refs.references;
        if( !Array.isArray( input ) )
            throw new Error("EbReferences: references must be an array");
        if( input.length === 0 || input.length > LEIOS_MAX_ENDORSER_BLOCK_REFS )
            throw new Error(
                "EbReferences: expected 1.." + LEIOS_MAX_ENDORSER_BLOCK_REFS +
                " references, got " + input.length
            );
        const seen = new Set<string>();
        const out: Array<{ hash: U8Arr32, size: number }> = [];
        for( const ref of input )
        {
            if( !canBeHash32( ref.hash ) )
                throw new InvalidCborFormatError("EbReferences: each reference hash must be hash32");
            if( !canBeUInteger( ref.size ) )
                throw new InvalidCborFormatError("EbReferences: each reference size must be uint32");
            const size = u32( ref.size );
            if( size === 0 )
                throw new InvalidCborFormatError("EbReferences: reference size must be non-zero");
            const hash = hash32bytes( ref.hash );
            const hex = Buffer.from( hash ).toString("hex");
            if( seen.has( hex ) )
                throw new InvalidCborFormatError("EbReferences: duplicate reference hash " + hex);
            seen.add( hex );
            out.push({ hash, size });
        }
        this.references = out;
        this.cborRef = cborRef;
    }

    get count(): number
    {
        return this.references.length;
    }

    /** `toCbor` of the references map, with canonical byte-string widths */
    toCborObj(): CborMap
    {
        return new CborMap( this.references.map( ({ hash, size }) => ({
            k: new CborBytes( hash ),
            v: new CborUInt( size )
        })));
    }

    /** the canonical map bytes: what the header's announcement hash is over */
    get canonicalBytes(): Uint8Array
    {
        return Cbor.encode( this.toCborObj() );
    }

    /** announcement hash: blake2b-256 of the canonical map encoding */
    get hash(): Uint8Array
    {
        return blake2b_256( this.canonicalBytes );
    }

    /** announcement size: byte length of the canonical map encoding */
    get size(): number
    {
        return this.canonicalBytes.length;
    }

    get announcement(): { hash: Uint8Array, size: number }
    {
        const bytes = this.canonicalBytes;
        return { hash: blake2b_256( bytes ), size: bytes.length };
    }

    toJson()
    {
        return {
            references: this.references.map( ({ hash, size }) => ({
                hash: Buffer.from( hash ).toString("hex"),
                size
            }) ),
            count: this.count,
            hash: Buffer.from( this.hash ).toString("hex"),
            size: this.size
        };
    }

    toJSON() { return this.toJson(); }

    toCborBytes(): Uint8Array
    {
        if( this.cborRef instanceof SubCborRef ) return this.cborRef.toBuffer();
        return this.toCbor();
    }

    toCbor(): CborString
    {
        if( this.cborRef instanceof SubCborRef ) return this.cborRef.toBuffer();
        return Cbor.encode( this.toCborObj() );
    }

    static fromCbor( cStr: CanBeCborString ): DijkstraEbReferences
    {
        const bytes = cStr instanceof Uint8Array ? cStr : forceCborString( cStr );
        return DijkstraEbReferences.fromCborObj(
            parseCborFull( bytes, "DijkstraEbReferences" ),
            bytes
        );
    }

    static fromCborObj( cObj: CborObj, _originalBytes?: Uint8Array ): DijkstraEbReferences
    {
        if( !( cObj instanceof CborMap ) )
            throw new InvalidCborFormatError("eb_references must be an ordered map");
        if( cObj.indefinite )
            throw new InvalidCborFormatError("eb_references must be a definite map");
        if( cObj.map.length === 0 || cObj.map.length > LEIOS_MAX_ENDORSER_BLOCK_REFS )
            throw new InvalidCborFormatError(
                "eb_references: expected 1.." + LEIOS_MAX_ENDORSER_BLOCK_REFS +
                " entries, got " + cObj.map.length
            );
        const references: IEbReference[] = cObj.map.map( entry => {
            if( !( entry.k instanceof CborBytes ) || entry.k.bytes.length !== 32 )
                throw new InvalidCborFormatError("eb_references: key must be hash32");
            const chunks = ( entry.k as any ).chunks;
            const keyRef = ( entry.k as any ).cborRef;
            if( keyRef instanceof SubCborRef && keyRef.toBuffer()[0] === 0x5f )
                throw new InvalidCborFormatError("eb_references: key must be a definite byte string");
            if( chunks instanceof Array && chunks.length !== entry.k.bytes.length )
                throw new InvalidCborFormatError("eb_references: key must be a definite byte string");
            const v = entry.v;
            if( !( v instanceof CborUInt ) )
                throw new InvalidCborFormatError("eb_references: value must be uint32");
            if( ( v as any ).bigNumEncoding !== undefined )
                throw new InvalidCborFormatError("eb_references: value must be uint32, not a bignum");
            const num = Number( v.num );
            if( !Number.isSafeInteger( num ) || num <= 0 || num > 0xffffffff )
                throw new InvalidCborFormatError("eb_references: value must be uint32 (non-zero)");
            return { hash: entry.k.bytes, size: num };
        });
        return new DijkstraEbReferences(
            { references },
            getSubCborRef( cObj, _originalBytes )
        );
    }
}
