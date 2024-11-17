import { CanBeCborString, CborObj, SubCborRef } from "@harmoniclabs/cbor";
import { assert } from "../../utils/assert";
import { Hash } from "../Hash";
import { getSubCborRef } from "../../utils/getSubCborRef";

export class Signature extends Hash
{
    constructor(
        bs: string | Uint8Array | Signature | Hash,
        readonly subCborRef?: SubCborRef
    )
    {
        super( bs instanceof Hash ? bs.toBuffer() : bs );

        assert(
            this._bytes.length === 64,
            "'Signature' must be an hash of length 64"
        );
    }

    clone(): Signature
    {
        return new Signature( this.toBuffer(), this.subCborRef?.clone() );
    }

    valueOf(): string
    {
        return this.toString();
    }

    static fromCbor(cStr: CanBeCborString): Signature
    {
        return new Signature( Hash.fromCbor( cStr ).toBuffer() );
    }
    static fromCborObj( cObj: CborObj ): Signature
    {
        return new Signature(
            Hash.fromCborObj( cObj ).toBuffer(),
            getSubCborRef( cObj )
        )
    }
}