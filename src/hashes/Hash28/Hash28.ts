import { CanBeCborString, Cbor, forceCborString, CborObj, CborBytes } from "@harmoniclabs/cbor";
import { assert } from "../../utils/assert";
import { Hash } from "../Hash";

export type CanBeHash28 = string | Uint8Array | Hash28;

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

        return new Hash28( cObj.buffer )
    }
}