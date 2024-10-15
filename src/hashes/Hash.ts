import { ToCbor, CborString, Cbor, CborObj, CborBytes, CanBeCborString, forceCborString } from "@harmoniclabs/cbor";
import { Cloneable } from "@harmoniclabs/cbor/dist/utils/Cloneable";
import { ToData, Data, DataB } from "@harmoniclabs/plutus-data";
import { fromAscii, fromHex, isUint8Array, toAscii, toHex } from "@harmoniclabs/uint8array-utils";
import { assert } from "../utils/assert";
import { defineReadOnlyProperty } from "@harmoniclabs/obj-utils";
import { isHex } from "../utils/hex";
import { ToDataVersion } from "../toData/defaultToDataVersion";

export function canBeHashInstance( obj: any ): boolean
{
    if(typeof obj !== "object" ) return false;

    const ks = Object.keys( obj );

    if( !ks.includes("toBuffer") ) return false;

    const toBuff = obj["toBuffer"];

    if( typeof toBuff !== "function" ) return false;
    if( toBuff.length !== 0 ) return false;

    if( ks.includes("__str") )
    {
        const str = (obj as any)["__str"];
        if( typeof str === "string" && isHex( str ) ) return true;
    }
    if( ks.includes("__bytes") )
    {
        const bytes = (obj as any)["__bytes"];
        if( bytes instanceof Uint8Array ) return true;
    }

    return false;
}

export class Hash
    implements Cloneable<Hash>, ToCbor, ToData
{
    static isStrictInstance( bs: any ): bs is Hash
    {
        return Object.getPrototypeOf( bs ) === Hash.prototype
    }

    protected _bytes: Uint8Array

    /** @deprecated */
    protected get _str(): string
    {
        return this.toString();
    }

    constructor( bs: string | Uint8Array )
    {
        if( typeof bs == "string" )
        {
            // remove spaces
            bs = bs.trim().split(" ").join("");
            
            assert(
                isHex( bs ),
                "invalid hex input while constructing a Hash: " + bs
            );

            // even length
            bs = fromHex(
                (bs.length % 2) === 1 ? "0" + bs : bs
            );
        }

        assert(
            isUint8Array( bs ),
            "invalid Uint8Array input while constructing a Hash"
        );

        this._bytes = bs;
    }

    /**
     * @deprecated use `toString()` instead
     */
    get asString(): string
    {
        return this.toString();
    }

    toString(): string
    {
        return toHex( this._bytes);
    }

    /**
     * @deprecated use `toBuffer()` instead
     */
    get asBytes(): Uint8Array
    {
        return this._bytes;
    }

    toBuffer(): Uint8Array
    {
        return this._bytes;
    }

    /**
     * @deprecated use `toBuffer()` instead
     */
    toBytes(): Uint8Array
    {
        return this._bytes;
    }

    clone(): Hash
    {
        return new Hash( Uint8Array.prototype.slice.call( this._bytes ) );
    }

    toCbor(): CborString
    {
        return Cbor.encode( this.toCborObj() );
    }
    toCborObj(): CborObj
    {
        return new CborBytes( this.toBuffer() )
    }

    static fromCbor( cStr: CanBeCborString ): Hash
    {
        return Hash.fromCborObj( Cbor.parse( forceCborString( cStr ) ) );
    }
    static fromCborObj( cObj: CborObj ): Hash
    {
        if(!(cObj instanceof CborBytes ))
        throw new Error(`Invalid CBOR format for "Hash"`);

        return new Hash( cObj.bytes );
    }

    toData(_version?: ToDataVersion | undefined): Data
    {
        return new DataB( this.toBuffer() );
    }

    public static fromAscii( asciiStr: string ): Hash
    {
        return new Hash( fromAscii( asciiStr ) );
    }

    public static toAscii( bStr: Hash ): string
    {
        return toAscii( bStr.toBuffer() )
    }

    public static isValidHexValue( str: string ): boolean
    {
        return (
            isHex( str ) &&
            str.length % 2 === 0
        );
    }
}