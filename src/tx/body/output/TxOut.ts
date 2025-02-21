import { ToCbor, CborString, Cbor, CborMap, CborUInt, CborArray, CborTag, CborBytes, CborMapEntry, CanBeCborString, forceCborString, CborObj, SubCborRef } from "@harmoniclabs/cbor";
import { Cloneable } from "@harmoniclabs/cbor/dist/utils/Cloneable";
import { isObject, hasOwn, defineReadOnlyProperty } from "@harmoniclabs/obj-utils";
import { Data, isData, ToData, DataConstr, dataToCbor, dataFromCborObj } from "@harmoniclabs/plutus-data";
import { Hash32 } from "../../../hashes";
import { Address, AddressStr, Value, IValue, isAddressStr, isIValue } from "../../../ledger";
import { Script, ScriptType } from "../../../script";
import { InvalidCborFormatError } from "../../../utils/InvalidCborFormatError";
import { ToJson } from "../../../utils/ToJson";
import { assert } from "../../../utils/assert";
import { maybeData } from "../../../utils/maybeData";
import { BasePlutsError } from "../../../utils/BasePlutsError";
import { ToDataVersion } from "../../../toData/defaultToDataVersion";
import { getSubCborRef, subCborRefOrUndef } from "../../../utils/getSubCborRef";


export interface ITxOut {
    address: Address | AddressStr,
    value: Value | IValue,
    datum?: Hash32 | Data,
    refScript?: Script
}

export function isITxOut( stuff: any ): stuff is ITxOut
{
    return (
        isObject( stuff ) &&
        hasOwn( stuff, "address" ) && (
            stuff.address instanceof Address || isAddressStr( stuff.address )
        ) &&
        hasOwn( stuff, "value" ) && (
            stuff.value instanceof Value || isIValue( stuff.value )
        ) &&
        ( stuff.datum === undefined || stuff.datum instanceof Hash32 || isData( stuff.datum ) ) &&
        ( stuff.refScript === undefined || stuff.refScript instanceof Script )
    );
}

export class TxOut
    implements ITxOut, ToCbor, Cloneable<TxOut>, ToData, ToJson
{
    readonly address!: Address
    readonly value!: Value
    readonly datum?: Hash32 | Data
    readonly refScript?: Script

    constructor(
        txOutput: ITxOut,
        readonly cborRef: SubCborRef | undefined = undefined
    )
    {
        assert(
            isObject( txOutput ) &&
            hasOwn( txOutput, "address" ) &&
            hasOwn( txOutput, "value" ),
            "txOutput is missing some necessary fields"
        );

        let {
            address,
            value,
            datum,
            refScript
        } = txOutput;

        if( typeof address === "string" )
        {
            address = Address.fromString(address);
        }
        assert(
            address instanceof Address,
            "invlaid 'address' while constructing 'TxOut'" 
        );
        assert(
            value instanceof Value,
            "invlaid 'value' while constructing 'TxOut'" 
        );

        defineReadOnlyProperty(
            this,
            "address",
            address
        );
        defineReadOnlyProperty(
            this,
            "value",
            value
        );

        if( datum !== undefined )
            assert(
                datum instanceof Hash32 || isData( datum ),
                "invalid 'datum' field"
            );
        defineReadOnlyProperty(
            this,
            "datum",
            datum
        );

        if( refScript !== undefined )
            assert(
                refScript instanceof Script,
                "invalid 'refScript' field"
            );
        defineReadOnlyProperty(
            this,
            "refScript",
            refScript
        );

        this.cborRef = cborRef ?? subCborRefOrUndef( txOutput );
    }

    clone(): TxOut
    {
        return new TxOut({
            address: this.address.clone(),
            value: this.value.clone(),
            datum: this.datum?.clone(),
            refScript: this.refScript?.clone() 
        })
    }

    static get fake(): TxOut
    {
        return new TxOut({
            address: Address.fake,
            value: Value.lovelaces( 0 ),
            datum: undefined,
            refScript: undefined
        })
    }

    toData( version: ToDataVersion = "v2" ): Data
    {
        if( version === "v1" )
        {
            if( isData( this.datum ) )
            throw new BasePlutsError(
                "trying to convert v2 utxo to v1"
            );

            return new DataConstr(
                0,
                [
                    this.address.toData( version),
                    this.value.toData( version),
                    maybeData( this.datum?.toData( version ) )
                ]
            )
        }

        const datumData =
            this.datum === undefined ?
                new DataConstr( 0, [] ) : 
            this.datum instanceof Hash32 ?
                new DataConstr( 1, [ this.datum.toData( version ) ]) :
            new DataConstr( // inline
                2, [ this.datum.clone() ]
            );

        return new DataConstr(
            0,
            [
                this.address.toData( version ),
                this.value.toData( version ),
                datumData,
                maybeData( this.refScript?.hash.toData( version ) )
            ]
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
    toCborObj(): CborMap
    {
        const datum = this.datum;

        if( !Value.isPositive( this.value ) )
        {
            console.log(
                JSON.stringify(
                    this.toJson(),
                    undefined,
                    2
                )
            )
            throw new BasePlutsError("TxOut values can only be positive; value was: " + JSON.stringify( this.value.toJson() ));
        }

        return new CborMap([
            {
                k: new CborUInt( 0 ),
                v: this.address.toCborObj()
            },
            {
                k: new CborUInt( 1 ),
                v: this.value.toCborObj()
            },
            datum === undefined ? undefined :
            {
                k: new CborUInt( 2 ),
                v: datum instanceof Hash32 ? 
                    new CborArray([
                        new CborUInt( 0 ),
                        datum.toCborObj()
                    ]) :
                    new CborArray([
                        new CborUInt( 1 ),
                        new CborTag(
                            24,
                            new CborBytes(
                                dataToCbor( datum ).toBuffer()
                            )
                        )
                    ])
            },
            this.refScript === undefined ? undefined :
            {
                k: new CborUInt( 3 ),
                v: new CborTag( 24, new CborBytes( this.refScript.toCbor().toBuffer() ) )
            }
        ].filter( elem => elem !== undefined ) as CborMapEntry[])
    }

    static fromCbor( cStr: CanBeCborString ): TxOut
    {
        return TxOut.fromCborObj( Cbor.parse( forceCborString( cStr ), { keepRef: true } ) );
    }
    static fromCborObj( cObj: CborObj ): TxOut
    {
        if(!(
            cObj instanceof CborMap ||
            cObj instanceof CborArray
        ))
        throw new InvalidCborFormatError("TxOut");

        // legacy
        if( cObj instanceof CborArray )
        {
            const [ _addr, _val, _dat ] = cObj.array;
            return new TxOut({
                address: Address.fromCborObj( _addr ),
                value: Value.fromCborObj( _val ),
                datum: _dat === undefined ? undefined : Hash32.fromCborObj( _dat ),
            });
        }

        let fields: (CborObj | undefined )[] = new Array( 4 ).fill( undefined );

        for( let i = 0; i < 4; i++)
        {
            const { v } = (cObj as CborMap).map.find(
                ({ k }) => {
                    if(!( k instanceof CborUInt ))
                    throw new InvalidCborFormatError("TxBody");

                    return Number( k.num ) === i
                }
            ) ?? { v: undefined };

            if( v === undefined ) continue;

            fields[i] = v;
        }

        const [
            _addr,
            _amt,
            _dat,
            _refScript
        ] = fields;

        let datum: Hash32 | Data | undefined = undefined;

        if( _dat !== undefined )
        {
            if(!(_dat instanceof CborArray))
            throw new InvalidCborFormatError("TxOut");
            
            const [ _0, _1 ] = _dat.array;

            if(!(_0 instanceof CborUInt))
            throw new InvalidCborFormatError("TxOut");

            const opt = Number( _0.num );

            if( opt === 0 )
            {
                if(!(
                    _1 instanceof CborBytes
                ))
                throw new InvalidCborFormatError("TxOut");

                datum = new Hash32( _1.buffer );
            }
            else if( opt === 1 )
            {
                if(!(
                    _1 instanceof CborTag &&
                    _1.data instanceof CborBytes
                ))
                {
                    throw new InvalidCborFormatError("TxOut");
                }

                datum = dataFromCborObj( Cbor.parse( _1.data.buffer ) )
            }
            else throw new InvalidCborFormatError("TxOut");

        }

        let refScript: Script | undefined = undefined;
        if( _refScript !== undefined )
        {
            if(!(
                _refScript instanceof CborTag &&
                _refScript.data instanceof CborBytes
            ))
            throw new InvalidCborFormatError("TxOut");

            refScript = new Script( ScriptType.PlutusV2, _refScript.data.buffer );
        }

        if( _addr === undefined || _amt === undefined )
        throw new InvalidCborFormatError("TxOut");

        return new TxOut({
            address: Address.fromCborObj( _addr ),
            value:  Value.fromCborObj( _amt ),
            datum,
            refScript
        }, getSubCborRef( cObj ));
    }

    toJSON() { return this.toJson(); }
    toJson()
    {
        return {
            address: this.address.toString(),
            value: this.value.toJson(),
            datum: this.datum === undefined ? undefined :
            this.datum instanceof Hash32 ?
                this.datum.toString() :
                this.datum.toJson(),
            refScript: this.refScript?.toJson()
        }
    }

}