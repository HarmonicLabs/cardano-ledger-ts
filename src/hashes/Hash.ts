import { ToCbor, CborString, Cbor, CborObj, CborBytes, CanBeCborString, forceCborString, SubCborRef } from "@harmoniclabs/cbor";
import { Cloneable } from "@harmoniclabs/cbor/dist/utils/Cloneable";
import { ToData, Data, DataB } from "@harmoniclabs/plutus-data";
import { fromAscii, fromHex, isUint8Array, toAscii, toHex } from "@harmoniclabs/uint8array-utils";
import { isHex } from "../utils/hex";
import { ToDataVersion } from "../toData/defaultToDataVersion";
import { getSubCborRef } from "../utils/getSubCborRef";
import { isU8Arr, U8Arr } from "../utils/U8Arr";

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

    constructor(
        bs: string | Uint8Array | Hash,
        readonly cborRef: SubCborRef | undefined = undefined
    )
    {
        if(!( bs instanceof Uint8Array))
        {
            bs = bs.toString().trim().split(" ").join("");

            if( !isHex( bs ) )
            throw new Error("Invalid hex input while constructing a Hash: " + bs);

            bs = fromHex(
                (bs.length % 2) === 1 ? "0" + bs : bs
            );
        }

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
        return new CborBytes( this.toBuffer() )
    }

    static fromCbor( cStr: CanBeCborString ): Hash
    {
        return Hash.fromCborObj( Cbor.parse( forceCborString( cStr ), { keepRef: true } ) );
    }
    static fromCborObj( cObj: CborObj ): Hash
    {
        if(!(cObj instanceof CborBytes ))
        throw new Error(`Invalid CBOR format for "Hash"`);

        return new Hash(
            cObj.bytes,
            getSubCborRef( cObj )
        );
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