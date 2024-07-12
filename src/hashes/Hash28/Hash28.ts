import { CanBeCborString, Cbor, forceCborString, CborObj, CborBytes } from "@harmoniclabs/cbor";
import { assert } from "../../utils/assert";
import { Hash, canBeHashInstance } from "../Hash";
import { isHex } from "../../utils/hex";
import { toHex } from "@harmoniclabs/uint8array-utils";

export type CanBeHash28 = string | Uint8Array | Hash28;

export function canBeHash28( stuff: any ): stuff is CanBeHash28
{
    if( typeof stuff === "string" )
    {
        return stuff.length === 56 && isHex( stuff )
    }

    if( stuff instanceof Uint8Array )
    {
        return stuff.length === 28;
    }

    return canBeHashInstance( stuff ) && canBeHash28( stuff.toBuffer() )
}

export class Hash28 extends Hash
{
    constructor( bs: CanBeHash28 , className: string = "Hash28" )
    {
        super( bs instanceof Hash28 ? bs.toBuffer() : bs );

        assert(
            this._bytes.length === 28,
            "'" + className + "' must be an hash of length 28"
        );
    }

    valueOf(): string
    {
        return this.toString();
    }

    clone(): Hash28
    {
        return new Hash28( this.toBuffer() );
    }

    static fromCbor( cStr: CanBeCborString ): Hash28
    {
        return Hash28.fromCborObj( Cbor.parse( forceCborString( cStr ) ) );
    }
    static fromCborObj( cObj: CborObj ): Hash28
    {
        if(!(cObj instanceof CborBytes ))
        throw new Error(`Invalid CBOR format for "Hash"`);

        console.log( toHex( cObj.bytes ), cObj.bytes.length );

        return new Hash28( cObj.bytes )
    }
}