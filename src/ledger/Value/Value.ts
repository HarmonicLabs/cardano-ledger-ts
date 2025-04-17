import { ToCbor, CborString, Cbor, CborObj, CborUInt, CborMap, CborBytes, CborNegInt, CborArray, CanBeCborString, forceCborString, CborMapEntry, SubCborRef } from "@harmoniclabs/cbor";
import { ToData, DataMap, DataB, DataI, DataPair } from "@harmoniclabs/plutus-data";
import { lexCompare, toHex, fromHex } from "@harmoniclabs/uint8array-utils";
import { Hash28 } from "../../hashes";
import { forceBigUInt, CanBeUInteger } from "../../utils/ints";
import { IValue, isIValue, getEmptyNameQty, getNameQty, IValueAdaEntry, IValueAsset, IValuePolicyEntry, addIValues, subIValues, cloneIValue, IValueToJson, ValueJson, NormalizedIValuePolicyEntry, IValueAssetBI, NormalizedIValueAdaEntry, normalizeIValueAsset, NormalizedIValue, normalizeIValue } from "./IValue";
import { assert } from "../../utils/assert";
import { defineReadOnlyProperty } from "@harmoniclabs/obj-utils";
import { ToDataVersion } from "../../toData/defaultToDataVersion";
import { getSubCborRef, subCborRefOrUndef } from "../../utils/getSubCborRef";

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
            if( a.policy === "" )
            {
                if( b.policy === "" ) return Ord.EQ;
                return Ord.LT;
            };
            if( b.policy === "" )
            {
                return Ord.GT;
            }
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
        policy: Hash28,
        name: Uint8Array,
        qty: number | bigint
    ): NormalizedIValuePolicyEntry
    {
        return {
            policy,
            assets: [ Value.assetEntry( name, qty ) ]
        };
    }

    static singleAsset(
        policy: Hash28,
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
        policy: Hash28,
        assets: IValueAsset[]
    ): NormalizedIValuePolicyEntry
    {
        return { policy, assets: assets.map( normalizeIValueAsset ) };
    }

    static add( a: Value, b: Value ): Value
    {
        return new Value( addIValues( a.map as IValue, b.map as IValue ) );
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
        if( Value.isAdaOnly( this ) ) return new CborUInt( this.lovelaces );

        const multiasset = new CborMap(
            this.map
            // only keep hash28
            .filter(({ policy }) => policy.toString().length === 56 )
            .map( entry => {
                const assets = entry.assets;
                const policy = entry.policy;
                return {
                    k: policy === "" ? new CborBytes( new Uint8Array(0) ) : policy.toCborObj(),
                    v: new CborMap(
                        assets.map( ({ name: assetName, quantity: amt }) => {
                            return {
                                k: new CborBytes( assetName.slice() ),
                                v: amt < 0 ? new CborNegInt( amt ) : new CborUInt( amt )
                            };
                        })
                    )
                };
            })
        );

        if( this.lovelaces === BigInt(0) ) return multiasset;

        return new CborArray([
            new CborUInt( this.lovelaces ),
            multiasset
        ]);
    }

    static fromCbor( cStr: CanBeCborString ): Value
    {
        return Value.fromCborObj( Cbor.parse( forceCborString( cStr ), { keepRef: true } ) )
    }
    static fromCborObj( cObj: CborObj ): Value
    {
        if(!(
            cObj instanceof CborArray   ||  // ada and assets
            cObj instanceof CborMap     ||  // only assets
            cObj instanceof CborUInt        // only ada
        ))
        throw new Error(`Invalid CBOR format for "Value"`);

        if( cObj instanceof CborUInt )
        return Value.lovelaces( cObj.num );

        let cborMap: CborMapEntry[];
        let valueMap: IValue;

        if( cObj instanceof CborArray )
        {
            if(!(
                cObj.array[0] instanceof CborUInt &&
                cObj.array[1] instanceof CborMap
            ))
            throw new Error(`Invalid CBOR format for "Value"`);

            cborMap = cObj.array[1].map;
            valueMap = new Array( cborMap.length + 1 );

            valueMap[0] = {
                policy: "",
                assets: [
                    {
                        name: new Uint8Array([]),
                        quantity: cObj.array[0].num
                    }
                ]
            };
        }
        else
        {
            cborMap = cObj.map;
            valueMap = new Array( cborMap.length + 1 );

            valueMap[0] = {
                policy: "",
                assets: [
                    {
                        name: new Uint8Array([]),
                        quantity: BigInt( 0 )
                    }
                ]
            };
        }
        
        const n = cborMap.length;

        for( let i = 0; i < n; i++ )
        {
            const { k , v } = cborMap[i];

            if(!( k instanceof CborBytes ))
            throw new Error(`Invalid CBOR format for "Value"`);

            const policy = k.bytes.length === 0 ? "" : new Hash28( k.bytes )

            if(!( v instanceof CborMap ))
            throw new Error(`Invalid CBOR format for "Value"`);

            const assetsMap = v.map;
            const assetsMapLen = v.map.length;

            const assets: IValueAssetBI[] = [];

            for( let j = 0 ; j < assetsMapLen; j++ )
            {
                const { k, v } = assetsMap[j];
                if(!( k instanceof CborBytes ))
                throw new Error(`Invalid CBOR format for "Value"`);

                if(!( v instanceof CborNegInt || v instanceof CborUInt ))
                throw new Error(`Invalid CBOR format for "Value"`);

                assets.push({
                    name: k.bytes,
                    quantity: v.num
                });
            }

            valueMap[i + 1] = {
                policy: policy,
                assets
            } as NormalizedIValuePolicyEntry | NormalizedIValueAdaEntry;
        }

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