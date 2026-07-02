import { ToCbor, CborObj, CborString, Cbor, CborArray, CborBytes, CborUInt, CborTag, CborMap, CanBeCborString, forceCborString, SubCborRef } from "@harmoniclabs/cbor";
import { fromHex, toHex } from "@harmoniclabs/uint8array-utils";
import { NetworkT } from "../common/ledger/Network";
import { base58Decode, base58Encode } from "../../utils/base58";
import { crc32 } from "../../utils/crc32";

/**
 * mainnet protocol magic; Byron mainnet addresses omit the network-magic attribute entirely.
 */
export const BYRON_MAINNET_PROTOCOL_MAGIC = 764824073;

/**
 * on-wire Byron address type.
 *
 * - `0` public key (spending) address  -- the only type present on mainnet
 * - `1` script address                 -- defined in the enum but never used on-chain
 * - `2` redemption (AVVM) address
 */
export type ByronAddressType = 0 | 1 | 2;

export interface ByronAddressAttributes {
    /**
     * attribute key `1`: encrypted HD derivation-path payload.
     *
     * only present on legacy Byron "random"/Daedalus wallet addresses;
     * Icarus/Yoroi addresses omit it.
     *
     * stored as the raw attribute-value bytes.
     */
    derivationPath?: Uint8Array;
    /**
     * attribute key `2`: network magic (protocol magic).
     *
     * absent on mainnet; present carrying the protocol magic on testnets.
     */
    networkMagic?: number;
}

export interface IByronAddress {
    /** 28-byte address root: `blake2b_224( sha3_256( [addrType, spendingData, attributes] ) )` */
    rootHash: Uint8Array;
    attributes: ByronAddressAttributes;
    type: ByronAddressType;
}

function cloneAttrs( attrs: ByronAddressAttributes ): ByronAddressAttributes
{
    const out: ByronAddressAttributes = {};
    if( attrs.derivationPath !== undefined ) out.derivationPath = attrs.derivationPath.slice();
    if( attrs.networkMagic !== undefined ) out.networkMagic = attrs.networkMagic;
    return out;
}

/**
 * Byron-era (bootstrap) Cardano address.
 *
 * wire format (base58 of):
 * ```cddl
 * BYRON_ADDRESS = ( #6.24(<<[ rootHash, attributes, addrType ]>>), crc32 )
 * ```
 *
 * Byron addresses are structurally unrelated to Shelley addresses (no header byte),
 * so they are represented by this dedicated class rather than by `Address`.
 *
 * This class covers decoding + round-trip re-serialization. Constructing a fresh
 * Byron address from a public key is intentionally out of scope (the era is closed).
 */
export class ByronAddress
    implements ToCbor
{
    readonly rootHash: Uint8Array;
    readonly attributes: ByronAddressAttributes;
    readonly type: ByronAddressType;

    /** present only to satisfy the `ToCbor` interface; Byron addresses do not cache a sub-ref */
    readonly cborRef: SubCborRef | undefined = undefined;

    /** original decoded bytes, kept so `toBytes`/`toBase58` round-trip byte-exactly */
    private readonly _originalBytes?: Uint8Array;

    constructor( address: IByronAddress, originalBytes?: Uint8Array )
    {
        const { rootHash, attributes, type } = address;

        if(!(
            rootHash instanceof Uint8Array &&
            rootHash.length === 28
        )) throw new Error("invalid Byron address root hash; expected 28 bytes");

        if(!(
            type === 0 || type === 1 || type === 2
        )) throw new Error("invalid Byron address type: " + String( type ));

        this.rootHash = rootHash.slice();
        this.attributes = cloneAttrs( attributes ?? {} );
        this.type = type;
        this._originalBytes = originalBytes?.slice();
    }

    /**
     * `"mainnet"` when no network-magic attribute is present, `"testnet"` otherwise.
     */
    get network(): NetworkT
    {
        return this.attributes.networkMagic === undefined ? "mainnet" : "testnet";
    }

    /**
     * the embedded protocol magic, or the mainnet magic (`764824073`) when absent.
     */
    protocolMagic(): number
    {
        return this.attributes.networkMagic ?? BYRON_MAINNET_PROTOCOL_MAGIC;
    }

    clone(): ByronAddress
    {
        return new ByronAddress({
            rootHash: this.rootHash,
            attributes: this.attributes,
            type: this.type
        }, this._originalBytes );
    }

    static isValid( str: string ): boolean
    {
        try {
            ByronAddress.fromBase58( str );
            return true;
        } catch {
            return false;
        }
    }

    static fromBase58( str: string ): ByronAddress
    {
        return ByronAddress.fromBytes( base58Decode( str ) );
    }

    toBase58(): string
    {
        return base58Encode( this.toBytes() );
    }

    static fromBytes( bytes: Uint8Array | string ): ByronAddress
    {
        const bs = typeof bytes === "string" ? fromHex( bytes ) : bytes;

        const outer = Cbor.parse( bs );
        if(!(
            outer instanceof CborArray &&
            outer.array.length === 2
        )) throw new Error("invalid Byron address; expected a 2-element CBOR array");

        const [ tagItem, crcItem ] = outer.array;
        if(!(
            tagItem instanceof CborTag &&
            Number( tagItem.tag ) === 24 &&
            tagItem.data instanceof CborBytes
        )) throw new Error("invalid Byron address; expected tag-24 wrapped payload");
        if(!(
            crcItem instanceof CborUInt
        )) throw new Error("invalid Byron address; missing CRC32 checksum");

        const payloadBytes = tagItem.data.bytes;

        if( crc32( payloadBytes ) !== Number( crcItem.num ) )
        throw new Error("Byron address CRC32 mismatch");

        const payload = Cbor.parse( payloadBytes );
        if(!(
            payload instanceof CborArray &&
            payload.array.length === 3 &&
            payload.array[0] instanceof CborBytes &&
            payload.array[1] instanceof CborMap &&
            payload.array[2] instanceof CborUInt
        )) throw new Error("invalid Byron address payload structure");

        const root = payload.array[0].bytes;
        if( root.length !== 28 )
        throw new Error("invalid Byron address root hash length: " + root.length.toString());

        const type = Number( payload.array[2].num );
        if(!( type === 0 || type === 1 || type === 2 ))
        throw new Error("invalid Byron address type: " + type.toString());

        const attributes: ByronAddressAttributes = {};
        for( const { k, v } of payload.array[1].map )
        {
            if(!( k instanceof CborUInt )) continue;
            const key = Number( k.num );
            if( key === 1 && v instanceof CborBytes )
            {
                attributes.derivationPath = v.bytes;
            }
            else if( key === 2 && v instanceof CborBytes )
            {
                // the network magic is a CBOR-encoded uint32 wrapped in a byte string
                const magic = Cbor.parse( v.bytes );
                if( magic instanceof CborUInt ) attributes.networkMagic = Number( magic.num );
            }
        }

        return new ByronAddress(
            { rootHash: root, attributes, type: type as ByronAddressType },
            bs
        );
    }

    toBytes(): Uint8Array
    {
        if( this._originalBytes instanceof Uint8Array ) return this._originalBytes.slice();

        // re-encode from fields
        const attrEntries = [];
        if( this.attributes.derivationPath !== undefined )
            attrEntries.push({ k: new CborUInt( 1 ), v: new CborBytes( this.attributes.derivationPath ) });
        if( this.attributes.networkMagic !== undefined )
            attrEntries.push({ k: new CborUInt( 2 ), v: new CborBytes( Cbor.encode( new CborUInt( this.attributes.networkMagic ) ) ) });

        const payloadBytes = Cbor.encode(
            new CborArray([
                new CborBytes( this.rootHash ),
                new CborMap( attrEntries ),
                new CborUInt( this.type )
            ])
        );

        return Cbor.encode(
            new CborArray([
                new CborTag( 24, new CborBytes( payloadBytes ) ),
                new CborUInt( crc32( payloadBytes ) )
            ])
        );
    }

    /**
     * in the binary ledger format a Byron address is embedded verbatim as a CBOR byte string
     * (its first byte `0x82` has high nibble `0b1000`, matching the Shelley "bootstrap" header),
     * mirroring how `Address` serializes.
     */
    toCborObj(): CborBytes
    {
        return new CborBytes( this.toBytes() );
    }
    toCbor(): CborString
    {
        return Cbor.encode( this.toCborObj() ) as any as CborString;
    }
    toCborBytes(): Uint8Array
    {
        return this.toBytes();
    }

    static fromCborObj( cObj: CborObj ): ByronAddress
    {
        if(!( cObj instanceof CborBytes ))
        throw new Error(`invalid CBOR format for "ByronAddress"`);
        return ByronAddress.fromBytes( cObj.bytes );
    }
    static fromCbor( cbor: CanBeCborString ): ByronAddress
    {
        return ByronAddress.fromCborObj( Cbor.parse( forceCborString( cbor ) ) );
    }

    toJSON() { return this.toJson(); }
    toJson()
    {
        return {
            type: this.type,
            network: this.network,
            protocolMagic: this.protocolMagic(),
            rootHash: toHex( this.rootHash ),
            attributes: {
                derivationPath: this.attributes.derivationPath === undefined ?
                    undefined : toHex( this.attributes.derivationPath ),
                networkMagic: this.attributes.networkMagic
            },
            base58: this.toBase58()
        };
    }
}

export function isByronAddress( thing: any ): thing is ByronAddress
{
    return thing instanceof ByronAddress;
}
