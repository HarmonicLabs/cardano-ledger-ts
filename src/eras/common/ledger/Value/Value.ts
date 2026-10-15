import { ToCbor, CborString, Cbor, CborObj, CborUInt, CborMap, CborBytes, CborNegInt, CborArray, CanBeCborString, forceCborString, CborMapEntry, SubCborRef } from "@harmoniclabs/cbor";
import { cborArray, cborInt, cborMapEntries, cborUInt, decodeVersionAtLeast, definiteBytes, parseCborFull } from "../../../../utils/strictCbor";
import { ToData, DataMap, DataB, DataI, DataPair, Data } from "@harmoniclabs/plutus-data";
import { lexCompare, toHex, fromHex } from "@harmoniclabs/uint8array-utils";
import { Hash28 } from "../../../../hashes";
import { forceBigUInt, CanBeUInteger } from "../../../../utils/ints";
import { IValue, isIValue, getEmptyNameQty, getNameQty, IValueAdaEntry, IValueAsset, IValuePolicyEntry, addIValues, subIValues, cloneIValue, IValueToJson, ValueJson, NormalizedIValuePolicyEntry, IValueAssetBI, NormalizedIValueAdaEntry, normalizeIValueAsset, NormalizedIValue, normalizeIValue } from "./IValue";
import { ToDataVersion } from "../../../../toData/defaultToDataVersion";
import { getSubCborRef, subCborRefOrUndef } from "../../../../utils/getSubCborRef";

const enum Ord {
    LT = -1,
    EQ = 0,
    GT = 1
}

export type ValueUnitEntry = {
    unit: string;
    quantity: bigint | number | string ;
};

export type ValueUnits = ValueUnitEntry[]

export type ValueUnitEntryBI = {
    unit: string;
    quantity: bigint;
};

export type ValueUnitsBI = ValueUnitEntryBI[]

const _0n = BigInt( 0 );

export class Value
    implements ToCbor, ToData
{
    readonly map!: Readonly<NormalizedIValue>

    *[Symbol.iterator]()
    {
        for( const { policy, assets } of this.map )
        {
            yield { policy: policy.toString(), assets: assets as IValueAssetBI[] };
        }
        return;
    }

    constructor(
        map: IValue,
        readonly cborRef: SubCborRef | undefined = undefined
    )
    {
        if(!(
            isIValue( map )
        ))throw new Error("invalid value interface passed to contruct a 'value' instance");

        const _map = normalizeIValue( map );

        _map.forEach( (entry, i) => {

            const assets = entry.assets;

            assets.forEach( a => Object.freeze( a ) );
            Object.freeze( entry.policy );
        });

        // value MUST have an ada entry
        if( !_map.some( entry => entry.policy === "" ) )
        {
            _map.unshift({
                policy: "",
                assets: [
                    {
                        name: new Uint8Array([]),
                        quantity: _0n
                    }
                ]
            });
        }

        _map.sort((a,b) => {
            if( a.policy === "" ) return Ord.LT;
            if( b.policy === "" ) return Ord.GT;
            return lexCompare( a.policy.toBuffer(), b.policy.toBuffer() );
        });

        this.map = Object.freeze( _map );

        
        /* DONE: this.cborRef */
        this.cborRef = cborRef ?? subCborRefOrUndef( map );        
    }

    get lovelaces(): bigint
    {
        return BigInt(
            getEmptyNameQty(
                this.map
                .find( ({ policy }) => policy === "" )
                ?.assets
            ) ?? 0 
        );
    }

    get( policy: Hash28 | Uint8Array | string , assetName: Uint8Array ): bigint
    {
        if( typeof policy === "string" )
        {
            if( policy === "" ) return this.lovelaces;
            policy = new Hash28( policy );
        }

        const policyStr = policy instanceof Hash28 ? policy.toString() : toHex( policy );

        return BigInt(
            getNameQty(
                this.map.find( ({ policy }) => policy.toString() === policyStr )?.assets,
                assetName
            )
            ?? 0 
        );
    }

    toUnits(): ValueUnitsBI
    {
        return this.map.flatMap(({ policy, assets }) => {
            if( policy === "" )
            {
                return { unit: 'lovelace', quantity: BigInt( getEmptyNameQty( assets ) ?? 0 ) }
            }
            return assets.map(({ name: assetName }) => ({
                    unit: `${policy.toString()}${toHex( assetName )}`,
                    quantity: BigInt( getNameQty( assets, assetName ) ?? 0 )
                })
            );
        });
    }

    static fromUnits( units: ValueUnits ): Value
    {
        return units.map(({ unit, quantity }): Value => {

            if( unit.length === 0 || unit === "lovelace" )
            {
                return Value.lovelaces( BigInt( quantity ) );
            }

            const policy = new Hash28( unit.slice( 0, 56 ) );

            const assetName = fromHex( unit.slice( 56 ) );

            return new Value([
                {
                    policy,
                    assets: [
                        {
                            name: assetName,
                            quantity: BigInt(quantity)
                        }
                    ]
                }
            ]);
        })
        .reduce( (a, b) => Value.add( a, b ) );
    }

    static get zero(): Value
    {
        return Value.lovelaces( 0 )
    }

    static isZero( v: Value ): boolean
    {
        return (
            v.map.length === 0 ||
            v.map.every(({ assets }) =>
                assets.every( ({ quantity }) =>
                    forceBigUInt( quantity ) === BigInt(0) 
                ) 
            )
        )
    }

    static isPositive( v: Value ): boolean
    {
        return v.map.every( ({ assets }) =>
            assets.every( ({ quantity }) => 
                quantity >= 0 
            )
        )
    }

    static isAdaOnly( v: Value ): boolean
    {
        return v.map.length === 1;
    }

    static lovelaceEntry( n: CanBeUInteger ): NormalizedIValueAdaEntry
    {
        return {
            policy: "",
            assets: [
                {
                    name: new Uint8Array([]),
                    quantity: typeof n === "number" ? BigInt( Math.round( n ) ) : BigInt( n ) 
                }
            ]
        };
    }

    static lovelaces( n: number | bigint ): Value
    {
        return new Value([ Value.lovelaceEntry(n) ]);
    }

    static assetEntry(
        name: Uint8Array,
        qty: number | bigint
    ): IValueAssetBI
    {
        if(!(
            name instanceof Uint8Array &&
            name.length <= 32
        )) throw new Error("invalid asset name; must be Uint8Array of length <= 32");
        return {
            name: name.slice(),
            quantity: typeof qty === "number" ? BigInt( Math.round( qty ) ) : BigInt( qty ) 
        };
    }

    static singleAssetEntry(
        policy: Hash28 | Uint8Array | string,
        name: Uint8Array,
        qty: number | bigint
    ): NormalizedIValuePolicyEntry
    {
        return {
            policy: new Hash28( policy ),
            assets: [ Value.assetEntry( name, qty ) ]
        };
    }

    static singleAsset(
        policy: Hash28 | Uint8Array | string,
        name: Uint8Array,
        qty: number | bigint
    ): Value
    {
        return new Value([
            Value.singleAssetEntry(
                policy,
                name,
                qty
            )
        ]);
    }

    static entry(
        policy: Hash28 | Uint8Array | string,
        assets: IValueAsset[]
    ): NormalizedIValuePolicyEntry
    {
        return {
            policy: new Hash28( policy ),
            assets: assets.map( normalizeIValueAsset )
        };
    }

    static add( a: Value, b: Value, ...rest: Value[] ): Value
    {
        a = new Value( addIValues( a.map as IValue, b.map as IValue ) );
        while( b = rest.shift()! ) {
            if( !(b instanceof Value) ) break;
            a = new Value( addIValues( a.map as IValue, b.map as IValue ) );
        }
        return a;
    }

    static sub( a: Value, b: Value ): Value
    {
        return new Value( subIValues( a.map as IValue, b.map as IValue ) );
    }

    clone(): Value
    {
        return new Value( cloneIValue(this.map as IValue) )
    }

    toData( version?: ToDataVersion ): DataMap<DataB,DataMap<DataB,DataI>>
    {
        return new DataMap<DataB,DataMap<DataB,DataI>>(
            this.map.map( ({ policy, assets }) =>
                new DataPair(
                    new DataB( policy === "" ? "" : policy.toBuffer() ),
                    new DataMap(
                        assets.map( ({ name: assetName }) =>
                            new DataPair(
                                new DataB( assetName ), 
                                new DataI( getNameQty( assets, assetName ) ?? 0 )
                            )
                        )
                    )
                )
            )
        )
    }

    static fromData( data: Data, version: ToDataVersion = "v3" ): Value
    {
        if(!(
            data instanceof DataMap
        )) throw new Error("invalid Value data");

        const dataEntries = data.map;
        const valueMap: IValue = new Array( dataEntries.length );
        for( let i = 0; i < dataEntries.length; i++ )
        {
            const data_policy = dataEntries[i].fst;
            const data_assets = dataEntries[i].snd;

            if(!( data_policy instanceof DataB ))
            throw new Error("invalid Value data: policy keys must be bytes");

            if(!( data_assets instanceof DataMap ))
            throw new Error("invalid Value data: assets must be maps");

            const policy = data_policy.bytes.length === 0 ? "" : new Hash28( data_policy.bytes );
            const assetEntries = data_assets.map;
            const assets: IValueAssetBI[] = new Array( assetEntries.length );
            for( let j = 0; j < assetEntries.length; j++ )
            {
                const data_assetName = assetEntries[j].fst;
                const data_quantity = assetEntries[j].snd;

                if(!( data_assetName instanceof DataB ))
                throw new Error("invalid Value data: asset name keys must be bytes");

                if(!( data_quantity instanceof DataI ))
                throw new Error("invalid Value data: asset quantity values must be integers");

                assets[j] = {
                    name: data_assetName.bytes,
                    quantity: BigInt( data_quantity.int )
                };
            }

            valueMap[i] = {
                policy,
                assets
            };
        }

        return new Value( valueMap );
    }
    
    // A value is not a hash preimage and cardano-ledger does not keep its bytes: it is
    // always re-encoded from its contents (`[coin, {}]` becomes the plain coin), so the
    // decoded `cborRef` is not re-emitted (586). Memoized containers (outputs in a
    // decoded transaction body) still re-emit their own bytes.
    toCborBytes(): Uint8Array
    {
        return this.toCbor();
    }
    toCbor(): CborString
    {
        return Cbor.encode( this.toCborObj() );
    }
    toCborObj(): CborObj
    {
        if( Value.isAdaOnly( this ) ) return new CborUInt( this.lovelaces );

        const multiasset = new CborMap(
            this.map
            // only keep hash28
            .filter(({ policy }) => policy.toString().length === 56 )
            .map( entry => {
                const assets = entry.assets;
                const policy = entry.policy;
                const valueMap = assets
                .map( ({ name: assetName, quantity: amt }) => {
                    if( amt === BigInt(0) ) return undefined;
                    return {
                        k: new CborBytes( assetName.slice() ),
                        v: amt < 0 ? new CborNegInt( amt ) : new CborUInt( amt )
                    };
                })
                .filter( assetEntry => assetEntry !== undefined ) as CborMapEntry[];
                if( valueMap.length === 0 ) return undefined;
                return {
                    k: policy === "" ? new CborBytes( new Uint8Array(0) ) : policy.toCborObj(),
                    v: new CborMap( valueMap )
                };
            })
            .filter( entry => entry !== undefined ) as CborMapEntry[]
        );

        if( this.lovelaces === BigInt(0) ) return multiasset;

        return new CborArray([
            new CborUInt( this.lovelaces ),
            multiasset
        ]);
    }

    static fromCbor( cStr: CanBeCborString ): Value
    {
        return Value.fromCborObj( parseCborFull( cStr, "Value" ) )
    }
    /**
     * cardano-ledger `decodeMaryValue` (outputs) and `decodeMultiAsset` (mint):
     *
     * - a value is a Word64 coin or `[coin, multiasset]`, the latter a `RecD` record
     *   (below protocol version 12: definite array of exactly two); a bare map is not
     *   a value;
     * - `opts.mint`: the mint field, a multiasset map whose amounts are Int64s
     *   (`decodeIntegerBounded64`: no bignum);
     * - a multiasset maps 28-byte policy ids to maps from asset names (at most 32
     *   bytes) to amounts (Word64 in outputs); all byte strings definite;
     * - from protocol version 9 a repeated policy or asset name fails (`decodeMap`),
     *   an asset map may not be empty and an amount may not be zero; before 9 a
     *   repeated key replaces the earlier one (`Map.fromList`).
     */
    static fromCborObj( cObj: CborObj, opts: { mint?: boolean } = {} ): Value
    {
        const what = opts.mint ? "Mint" : "Value";
        const v9 = decodeVersionAtLeast( 9 );

        let cborMap: CborMapEntry[];
        let valueMap: IValue;

        if( opts.mint )
        {
            cborMap = cborMapEntries( cObj, what );
            valueMap = new Array( cborMap.length + 1 );
            valueMap[0] = { policy: "", assets: [ { name: new Uint8Array([]), quantity: BigInt( 0 ) } ] };
        }
        else if( cObj instanceof CborUInt )
        {
            return Value.lovelaces( cborUInt( cObj, "Value coin" ) );
        }
        else
        {
            const [ coin, ma ] = cborArray( cObj, what, { len: 2, definite: true } );
            cborMap = cborMapEntries( ma, "MultiAsset" );
            valueMap = new Array( cborMap.length + 1 );
            valueMap[0] = { policy: "", assets: [ { name: new Uint8Array([]), quantity: cborUInt( coin, "Value coin" ) } ] };
        }

        const n = cborMap.length;

        // Duplicate keys below protocol version 9: the Haskell decoder builds `Map`s, so
        // a repeated policy replaces the earlier entry wholesale and a repeated asset
        // name within a policy replaces the earlier quantity.
        // Preview slot 51361220 (Babbage) carries a mint with every policy twice.
        const seenPolicies = new Map<string, number>(); // policy hex → index in valueMap
        let next = 1;
        for( let i = 0; i < n; i++ )
        {
            const { k, v } = cborMap[i];

            const policy = Hash28.fromCborObj( k );
            const policyHex = policy.toString();

            const assetsMap = cborMapEntries( v, "MultiAsset assets" );
            if( v9 && assetsMap.length === 0 ) throw new Error(`Invalid CBOR format for "${what}"; empty assets are not allowed`);

            const assets: IValueAssetBI[] = [];
            const seenNames = new Map<string, number>(); // asset name hex → index in assets

            for( let j = 0 ; j < assetsMap.length; j++ )
            {
                const { k, v } = assetsMap[j];
                const name = definiteBytes( k, "Value asset name" );
                if( name.length > 32 ) throw new Error(`Invalid CBOR format for "${what}"; asset name exceeds 32 bytes`);

                const quantity = opts.mint ? cborInt( v, "Mint amount" ) : cborUInt( v, "Value amount" );
                if( v9 && quantity === BigInt( 0 ) ) throw new Error(`Invalid CBOR format for "${what}"; zero amounts are not allowed`);

                const nameHex = toHex( name );
                const at = seenNames.get( nameHex );
                if( at !== undefined )
                {
                    if( v9 ) throw new Error(`Invalid CBOR format for "${what}"; repeated asset name`);
                    assets[at] = { name, quantity };
                }
                else
                {
                    seenNames.set( nameHex, assets.length );
                    assets.push({ name, quantity });
                }
            }

            const entry = {
                policy: policy,
                assets
            } as NormalizedIValuePolicyEntry | NormalizedIValueAdaEntry;
            const dup = seenPolicies.get( policyHex );
            if( dup !== undefined )
            {
                if( v9 ) throw new Error(`Invalid CBOR format for "${what}"; repeated policy`);
                valueMap[dup] = entry;
            }
            else
            {
                seenPolicies.set( policyHex, next );
                valueMap[next++] = entry;
            }
        }
        valueMap.length = next;

        return new Value(valueMap, getSubCborRef( cObj ));
    }

    toJSON() { return this.toJson(); }
    toJson(): ValueJson
    {
        return IValueToJson( this.map as IValue  );
    }

    /**
     * cardano-cli format
     */
    toString( includeLovelaces = true ): string
    {
        let valueStr = "";
        const valueMap = this.map;
    
        if( includeLovelaces )
        valueStr +=`+${this.lovelaces.toString()}`;
    
        if( Value.isAdaOnly( this ) ) return valueStr;
    
        valueStr += includeLovelaces ? '+"' : '"' ;
    
        for(const { policy, assets } of valueMap)
        {
            if( policy === "" ) continue;
    
            for(const { name, quantity } of assets)
            {
                valueStr += `${
                    quantity
                    .toString()
                } ${
                    policy.toString()
                }.${
                    toHex( name )
                }+`;
            }
        }
    
        valueStr = valueStr.slice( 0, valueStr.length - 1 ) + '"';
    
        return valueStr;
    }
}