import { ByteString } from "@harmoniclabs/bytestring";
import { ToCbor, CborString, Cbor, CborObj, CborArray, CborUInt, CanBeCborString, forceCborString } from "@harmoniclabs/cbor";
import { forceBigUInt } from "@harmoniclabs/cbor/dist/utils/ints";
import { isObject, hasOwn, defineReadOnlyProperty } from "@harmoniclabs/obj-utils";
import { ToData, DataConstr, DataB, DataI } from "@harmoniclabs/plutus-data";
import { Hash32 } from "../../../hashes";
import { BasePlutsError } from "../../../utils/BasePlutsError";
import { InvalidCborFormatError } from "../../../utils/InvalidCborFormatError";
import { ToJson } from "../../../utils/ToJson";
import { assert } from "../../../utils/assert";
import { lexCompare } from "@harmoniclabs/uint8array-utils";
import { ToDataVersion } from "../../../toData/defaultToDataVersion";

export type TxOutRefStr = `${string}#${number}`;

export interface ITxOutRef {
    id: string | Hash32
    index: number
}

export function isITxOutRef( stuff: any ): stuff is ITxOutRef
{
    return (
        isObject( stuff ) &&
        hasOwn( stuff, "id" ) && (
            (typeof stuff.id === "string" && ByteString.isValidHexValue( stuff.id ) && (stuff.id.length === 64)) ||
            (stuff.id instanceof Hash32)
        ) &&
        hasOwn( stuff, "index" ) && (
            typeof stuff.index === "number" &&
            stuff.index === Math.round( Math.abs( stuff.index ) )
        )
    )
}

export function eqITxOutRef( a: ITxOutRef, b: ITxOutRef ): boolean
{
    if( !isObject( a ) ) return false;
    if( !isObject( b ) ) return false;

    try {
        return (
            new Hash32( a.id ).toString() === new Hash32( b.id ).toString() &&
            typeof a.index === "number" &&
            a.index === b.index
        );
    } catch {
        return false;
    }
}

export function ITxOutRefToStr( iRef: ITxOutRef ): TxOutRefStr
{
    if( !isITxOutRef( iRef ) )
    throw new BasePlutsError(
        "'ITxOutRefToStr' works on 'ITxOutRef' like objects"
    );

    return `${iRef.id.toString()}#${iRef.index.toString()}` as any;
}

export type UTxORefJson = {
    id: string;
    index: number;
};

export class TxOutRef
    implements ITxOutRef, ToData, ToCbor, ToJson
{
    readonly id!: Hash32
    readonly index!: number

    constructor({ id, index }: ITxOutRef)
    {
        assert(
            (typeof id === "string" && ByteString.isValidHexValue( id ) && (id.length === 64)) ||
            (id instanceof Hash32),
            "tx output id (tx hash) invalid while constructing a 'UTxO'"
        );

        defineReadOnlyProperty(
            this,
            "id",
            id instanceof Hash32 ? id : new Hash32( id )
        );
        defineReadOnlyProperty(
            this,
            "index",
            Number( forceBigUInt( index ) )
        );
    }

    toString(): TxOutRefStr
    {
        return `${this.id.toString()}#${this.index.toString()}` as any;
    }

    static fromString( str: string ): TxOutRef
    {
        if( typeof str !== "string" )
        throw new Error("TxOutRef.fromString expects a string");
        
        const [id,idx] = str.split('#');
        return new TxOutRef({
            id,
            index: Number( idx )
        });
    }

    toData( version?: ToDataVersion ): DataConstr
    {
        if( version === "v1" || version === "v2" )
        return new DataConstr(
            0, // PTxOutRef only constructor
            [
                new DataConstr(
                    0, // PTxId only constructor
                    [ new DataB( this.id.toBuffer() ) ]
                ),
                new DataI( this.index )
            ]
        );

        return new DataConstr(
            0, // PTxOutRef only constructor
            [
                new DataB( this.id.toBuffer() ), // tx id is only a byte string in v3
                new DataI( this.index )
            ]
        );
    }

    toCbor(): CborString
    {
        return Cbor.encode( this.toCborObj() );
    }
    toCborObj(): CborObj
    {
        return new CborArray([
            this.id.toCborObj(),
            new CborUInt( this.index )
        ])
    }

    static fromCbor( cStr: CanBeCborString ): TxOutRef
    {
        return TxOutRef.fromCborObj( Cbor.parse( forceCborString( cStr ) ) );
    }
    static fromCborObj( cObj: CborObj ): TxOutRef
    {
        if(!(cObj instanceof CborArray ))
        throw new InvalidCborFormatError("TxOutRef");

        const [ _id, _index ] = cObj.array;

        const idRes = Hash32.fromCborObj( _id );

        if(!(_index instanceof CborUInt))
        throw new InvalidCborFormatError("TxOutRef");

        return new TxOutRef({
            id: idRes,
            index: Number( _index.num )
        });
    }

    toJson(): UTxORefJson
    {
        return {
            id: this.id.toString(),
            index: this.index
        };
    }
    
    static get fake(): TxOutRef
    {
        return new TxOutRef({
            id: "ff".repeat(32),
            index: 0
        });
    }

    static eq( a: ITxOutRef, b: ITxOutRef ): boolean
    {
        return eqITxOutRef( a, b );
    }

    eq( other: ITxOutRef ): boolean
    {
        return eqITxOutRef( this, other );
    }

    static sort( a: ITxOutRef, b: ITxOutRef ): number
    {
        const ord = lexCompare(
            new Hash32( a.id ).toBuffer(),
            new Hash32( b.id ).toBuffer()
        );
        // if equal tx id order based on tx output index
        if( ord === 0 ) return a.index - b.index;
        // else order by tx id
        return ord;
    }
}