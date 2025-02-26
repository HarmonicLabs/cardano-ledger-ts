import { CanBeCborString, Cbor, forceCborString, CborObj, CborBytes, SubCborRef } from "@harmoniclabs/cbor";
import { assert } from "../../utils/assert";
import { Hash, canBeHashInstance } from "../Hash";
import { isHex } from "../../utils/hex";
import { toHex } from "@harmoniclabs/uint8array-utils";
import { getSubCborRef, subCborRefOrUndef } from "../../utils/getSubCborRef";

export type CanBeHash28 = string | Uint8Array | Hash28;

export function canBeHash28( stuff: any ): stuff is CanBeHash28
{
    if( stuff instanceof Hash28 ) return true;
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
    constructor(
        bs: CanBeHash28,
        readonly cborRef: SubCborRef | undefined = undefined,
    )
    {
        super( bs instanceof Hash28 ? bs.toBuffer() : bs );

        if(!(
            this._bytes instanceof Uint8Array
        ))throw new Error("'Hash28' must be an hash of length 28");

        /* TO DO: Change the arguments and create an IStakeCredential? */
        this.cborRef = cborRef ?? subCborRefOrUndef( this );
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
        return Hash28.fromCborObj( Cbor.parse( forceCborString( cStr ), { keepRef: true } ) );
    }
    static fromCborObj( cObj: CborObj ): Hash28
    {
        if(!(cObj instanceof CborBytes ))
        throw new Error(`Invalid CBOR format for "Hash"`);

        return new Hash28(
            cObj.bytes,
            getSubCborRef( cObj )
        );
    }
}