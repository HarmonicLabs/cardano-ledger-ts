import { CanBeCborString, CborObj } from "@harmoniclabs/cbor";
import { assert } from "../../utils/assert";
import { Hash } from "../Hash";

export class Signature extends Hash
{
    constructor( bs: string | Uint8Array | Signature  )
    {
        super( bs instanceof Signature ? bs.toBuffer() : bs );

        assert(
            this._bytes.length === 64,
            "'Signature' must be an hash of length 64"
        );
    }

    clone(): Signature
    {
        return new Signature( this.toBuffer() )
    }

    valueOf(): string
    {
        return this.toString();
    }

    static fromCbor(cStr: CanBeCborString): Signature
    {
        return new Signature( Hash.fromCbor( cStr ).toBuffer() )
    }
    static fromCborObj( cObj: CborObj ): Signature
    {
        return new Signature( Hash.fromCborObj( cObj ).toBuffer() )
    }
}