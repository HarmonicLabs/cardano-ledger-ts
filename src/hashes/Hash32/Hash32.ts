import { CanBeCborString, Cbor, forceCborString, CborObj, CborBytes, SubCborRef } from "@harmoniclabs/cbor";
import { assert } from "../../utils/assert";
import { isHex } from "../../utils/hex";
import { canBeHashInstance, Hash } from "../Hash";
import { getSubCborRef, subCborRefOrUndef } from "../../utils/getSubCborRef";
import { U8Arr } from "../../utils/U8Arr";
import { fromHex } from "@harmoniclabs/uint8array-utils";

export type CanBeHash32 = string | Uint8Array | Hash32;

export function hash32bytes( hash: CanBeHash32 ): U8Arr<32>
{
    if( typeof hash === "string" && hash.length === 64 ) return fromHex( hash ) as U8Arr<32>;
    if( hash instanceof Hash32 ) return hash.toBuffer() as U8Arr<32>;
    if( hash instanceof Uint8Array && hash.length >= 32 )
        return (
            hash.length === 32 ? hash :
            Uint8Array.prototype.slice.call( hash, 0, 32 )
        ) as U8Arr<32>;

    throw new Error(`Invalid hash32: ${hash}`);
}

export function canBeHash32( stuff: any ): stuff is CanBeHash32
{
    if( stuff instanceof Hash32 ) return true;
    
    if( typeof stuff === "string" )
    {
        return stuff.length === 64 && isHex( stuff )
    }

    if( stuff instanceof Uint8Array )
    {
        return stuff.length === 32;
    }

    return canBeHashInstance( stuff ) && canBeHash32( stuff.toBuffer() )
}

export class Hash32 extends Hash
{
    constructor(
        bs: string | Uint8Array | Hash32,
        readonly cborRef: SubCborRef | undefined = undefined
    )
    {
        super( bs instanceof Hash32 ? bs.toBuffer() : bs );
        if(!(
            this._bytes.length === 32
        ))throw new Error("'Hash32' must be an hash of length 32; length was: " + this._bytes.length);
        
        /* TO DO: this.cboRref params */
        this.cborRef = cborRef ?? subCborRefOrUndef( bs );
    }

    static fromCbor( cStr: CanBeCborString ): Hash32
    {
        return Hash32.fromCborObj( Cbor.parse( forceCborString( cStr ), { keepRef: true } ) );
    }
    static fromCborObj( cObj: CborObj ): Hash32
    {
        if(!( cObj instanceof CborBytes ))
        throw new Error(`Invalid CBOR fromat for "Hash"`);

        return new Hash32(
            cObj.bytes,
            getSubCborRef( cObj )
        );
    }
    
}