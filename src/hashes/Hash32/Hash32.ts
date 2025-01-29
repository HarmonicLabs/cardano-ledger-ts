import { CanBeCborString, Cbor, forceCborString, CborObj, CborBytes, SubCborRef } from "@harmoniclabs/cbor";
import { assert } from "../../utils/assert";
import { isHex } from "../../utils/hex";
import { canBeHashInstance, Hash } from "../Hash";
import { getSubCborRef } from "../../utils/getSubCborRef";

export type CanBeHash32 = string | Uint8Array | Hash32;

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
        readonly subCborRef?: SubCborRef
    )
    {
        super( bs instanceof Hash32 ? bs.toBuffer() : bs );

        assert(
            this._bytes.length === 32,
            "'Hash32' must be an hash of length 32; length was: " + this._bytes.length
        );
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