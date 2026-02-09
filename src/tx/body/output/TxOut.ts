import { ToCbor, CborString, Cbor, CborMap, CborUInt, CborArray, CborTag, CborBytes, CborMapEntry, CanBeCborString, forceCborString, CborObj, SubCborRef } from "@harmoniclabs/cbor";
import { Cloneable } from "@harmoniclabs/cbor/dist/utils/Cloneable";
import { isObject, hasOwn } from "@harmoniclabs/obj-utils";
import { Data, isData, ToData, DataConstr, dataToCbor, dataFromCborObj, DataB } from "@harmoniclabs/plutus-data";
import { Hash28, Hash32 } from "../../../hashes";
import { Script } from "../../../script";
import { InvalidCborFormatError } from "../../../utils/InvalidCborFormatError";
import { ToJson } from "../../../utils/ToJson";
import { maybeData } from "../../../utils/maybeData";
import { BasePlutsError } from "../../../utils/BasePlutsError";
import { ToDataVersion } from "../../../toData/defaultToDataVersion";
import { getSubCborRef, subCborRefOrUndef } from "../../../utils/getSubCborRef";
import { Address, AddressStr, isAddressStr } from "../../../eras/common/ledger/Address";
import { isIValue, IValue } from "../../../eras/common/ledger/Value/IValue";
import { Value } from "../../../eras/common/ledger/Value/Value";


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
        if(!(
            isObject( txOutput ) &&
            hasOwn( txOutput, "address" ) &&
            hasOwn( txOutput, "value" )
        )) throw new Error("txOutput is missing some necessary fields");

        let {
            address,
            value,
            datum,
            refScript
        } = txOutput;
        
        if (isAddressStr(address))
        {
            address = Address.fromString(address);
        }
        if(!(
            address instanceof Address
        )) throw new Error("invalid 'address' while constructing 'TxOut'");

        if(!(
            value instanceof Value
        )) throw new Error("invalid 'value' while constructing 'TxOut'");

        this.address = address;

        this.value = value;

        if( datum !== undefined )
            if(!(
                datum instanceof Hash32 || isData( datum )
            ))throw new Error("invalid 'datum' field")
        
        this.datum = datum;

        if( refScript !== undefined )
            if(!(
                refScript instanceof Script
            )) throw new Error("invalid 'refScript' field");
        
        this.refScript = refScript;

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

    static fromData( data: Data, version: ToDataVersion = "v3" ): TxOut
    {
        if( version === "v1" )
        {
            if(!(
                data instanceof DataConstr
                && Number( data.constr ) === 0
                && data.fields.length === 3
            )) throw new BasePlutsError("invalid TxOut data");

            const [
                data_address,
                data_value,
                data_datum
            ] = data.fields;

            if(!(
                data_address instanceof DataConstr
            )) throw new BasePlutsError("invalid TxOut data: invalid address field");

            if(!(
                data_datum instanceof DataConstr
            )) throw new BasePlutsError("invalid TxOut data: invalid datum field");

            const maybeIdx = Number( data_datum.constr );
            let datum: Hash32 | Data | undefined = undefined;

            if( maybeIdx === 0 ) datum = undefined;
            else if( maybeIdx === 1 )
            {
                if(!(
                    data_datum.fields.length === 1
                    && data_datum.fields[0] instanceof DataB
                )) throw new BasePlutsError("invalid TxOut data: invalid datum field");

                datum = new Hash32( data_datum.fields[0].bytes.toBuffer() );
            }
            // else if( maybeIdx === 2 ) // not supported for tx out v1
            // {
            //     if(!(
            //         data_datum.fields.length === 1
            //     )) throw new BasePlutsError("invalid TxOut data: invalid datum field");
            //     datum = data_datum.fields[0];
            // }
            else throw new BasePlutsError("invalid TxOut data: invalid datum field");

            return new TxOut({
                address: Address.fromData( data_address ),
                value: Value.fromData( data_value, version ),
                datum
            });
        }

        // v2 and later
        if(!(
            data instanceof DataConstr
            && Number( data.constr ) === 0
            && data.fields.length >= 3
        )) throw new BasePlutsError("invalid TxOut data");

        const [
            data_address,
            data_value,
            data_datum,
            data_refScriptHash
        ] = data.fields;

        if(!(
            data_address instanceof DataConstr
        )) throw new BasePlutsError("invalid TxOut data: invalid address field");

        if(!(
            data_datum instanceof DataConstr
        )) throw new BasePlutsError("invalid TxOut data: invalid datum field");

        const maybeIdx = Number( data_datum.constr );
        let datum: Hash32 | Data | undefined = undefined;

        if( maybeIdx === 0 ) datum = undefined;
        else if( maybeIdx === 1 )
        {
            if(!(
                data_datum.fields.length === 1
                && data_datum.fields[0] instanceof DataB
            )) throw new BasePlutsError("invalid TxOut data: invalid datum field");

            datum = new Hash32( data_datum.fields[0].bytes.toBuffer() );
        }
        else if( maybeIdx === 2 )
        {
            if(!(
                data_datum.fields.length === 1
            )) throw new BasePlutsError("invalid TxOut data: invalid datum field");
            datum = data_datum.fields[0];
        }
        else throw new BasePlutsError("invalid TxOut data: invalid datum field");

        if(!( data_refScriptHash instanceof DataConstr ))
        throw new BasePlutsError("invalid TxOut data: invalid refScriptHash field");

        const maybeRefScriptHashIdx = Number( data_refScriptHash.constr );
        let refScriptHash: Hash28 | undefined = undefined;

        if( maybeRefScriptHashIdx === 1 ) refScriptHash = undefined;
        else if( maybeRefScriptHashIdx === 0 )
        {
            if(!(
                data_refScriptHash.fields.length === 1
                && data_refScriptHash.fields[0] instanceof DataB
            )) throw new BasePlutsError("invalid TxOut data: invalid refScriptHash field");
            refScriptHash = new Hash28( data_refScriptHash.fields[0].bytes.toBuffer() );
        }
        
        return new TxOut({
            address: Address.fromData( data_address ),
            value: Value.fromData( data_value, version ),
            datum,
            refScript: undefined // we can't get the script from the hash, so we set it to undefined
        });
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
            console.error(
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

            refScript = Script.fromCbor( _refScript.data.bytes );
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