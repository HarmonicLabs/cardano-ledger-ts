import { ToCbor, CborString, Cbor, CborMap, CborUInt, CborArray, CborTag, CborBytes, CborMapEntry, CanBeCborString, forceCborString, CborObj, SubCborRef } from "@harmoniclabs/cbor";
import { Cloneable } from "@harmoniclabs/cbor/dist/utils/Cloneable";
import { isObject, hasOwn, defineReadOnlyProperty } from "@harmoniclabs/obj-utils";
import { Address, AddressStr, Value, IValue, isAddressStr, isIValue } from "../../../ledger";
import { InvalidCborFormatError } from "../../../utils/InvalidCborFormatError";
import { ToJson } from "../../../utils/ToJson";
import { BasePlutsError } from "../../../utils/BasePlutsError";
import { getSubCborRef, subCborRefOrUndef } from "../../../utils/getSubCborRef";

export interface IShelleyTxOut {
    address: Address | AddressStr,
    value: Value | IValue
}

export function isIShelleyTxOut( stuff: any ): stuff is IShelleyTxOut
{
    return (
        isObject( stuff ) &&
        hasOwn( stuff, "address" ) && (
            stuff.address instanceof Address || isAddressStr( stuff.address )
        ) &&
        hasOwn( stuff, "value" ) && (
            stuff.value instanceof Value || isIValue( stuff.value )
        )
    );
}

export class ShelleyTxOut
    implements IShelleyTxOut, ToCbor, Cloneable<ShelleyTxOut>, ToJson
{
    readonly address!: Address
    readonly value!: Value

    constructor(
        ShelleyTxOutput: IShelleyTxOut,
        readonly cborRef: SubCborRef | undefined = undefined
    )
    {
        if(!(
            isObject( ShelleyTxOutput ) &&
            hasOwn( ShelleyTxOutput, "address" ) &&
            hasOwn( ShelleyTxOutput, "value" )
        )) throw new Error("ShelleyTxOutput is missing some necessary fields");

        let {
            address,
            value
        } = ShelleyTxOutput;
        
        if (isAddressStr(address))
        {
            address = Address.fromString(address);
        }
        if(!(
            address instanceof Address
        )) throw new Error("invalid 'address' while constructing 'ShelleyTxOut'");
        if(!(
            value instanceof Value
        )) throw new Error("invalid 'value' while constructing 'ShelleyTxOut'");

        this.address = address;
        this.value = value;

        this.cborRef = cborRef ?? subCborRefOrUndef( ShelleyTxOutput );
    }

    clone(): ShelleyTxOut
    {
        return new ShelleyTxOut({
            address: this.address.clone(),
            value: this.value.clone()
        })
    }

    static get fake(): ShelleyTxOut
    {
        return new ShelleyTxOut({
            address: Address.fake,
            value: Value.lovelaces( 0 )
        })
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

        if( this.cborRef instanceof SubCborRef )
        {
            // TODO: validate cbor structure
            // we assume correctness here
            return Cbor.parse( this.cborRef.toBuffer() ) as CborMap;
        }

        if( !Value.isPositive( this.value ) )
        {
            console.error(
                JSON.stringify(
                    this.toJson(),
                    undefined,
                    2
                )
            )
            throw new BasePlutsError("ShelleyTxOut values can only be positive; value was: " + JSON.stringify( this.value.toJson() ));
        }
        return new CborMap([
            {
                k: new CborUInt( 0 ),
                v: this.address.toCborObj()
            },
            {
                k: new CborUInt( 1 ),
                v: this.value.toCborObj()
            }
        ].filter( elem => elem !== undefined ) as CborMapEntry[])
    }

    static fromCbor( cStr: CanBeCborString ): ShelleyTxOut
    {
        return ShelleyTxOut.fromCborObj( Cbor.parse( forceCborString( cStr ), { keepRef: true } ) );
    }
    static fromCborObj( cObj: CborObj ): ShelleyTxOut
    {
        if(!(
            // cObj instanceof CborMap ||
            // cObj instanceof CborArray
            cObj instanceof CborMap && cObj.map.length >= 2 ||
            cObj instanceof CborArray && cObj.array.length >= 2
            
        ))throw new InvalidCborFormatError("ShelleyTxOut");

        // legacy
        if( cObj instanceof CborArray )
        {
            const [ _addr, _val ] = cObj.array;
            
            return new ShelleyTxOut({
                address: Address.fromCborObj( _addr ),
                value: Value.fromCborObj( _val ),
            });
        }

        let fields: (CborObj | undefined )[] = new Array( 2 ).fill( undefined );

        for( let i = 0; i < 2; i++)
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
            _amt
        ] = fields;

        if( _addr === undefined || _amt === undefined )
        throw new InvalidCborFormatError("ShelleyTxOut");

        return new ShelleyTxOut({
            address: Address.fromCborObj( _addr ),
            value:  Value.fromCborObj( _amt )
        }, getSubCborRef( cObj ));
    }

    toJSON() { return this.toJson(); }
    toJson()
    {
        return {
            address: this.address.toString(),
            value: this.value.toJson()
        }
    }
}