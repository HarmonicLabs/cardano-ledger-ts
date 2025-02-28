import { CanBeCborString, CborObj, SubCborRef } from "@harmoniclabs/cbor";
import { assert } from "../../utils/assert";
import { Hash } from "../Hash";
import { getSubCborRef, subCborRefOrUndef } from "../../utils/getSubCborRef";

export class Signature extends Hash
{
    constructor(
        bs: string | Uint8Array | Signature | Hash,
        readonly cborRef: SubCborRef | undefined = undefined
    )
    {
        super( bs instanceof Hash ? bs.toBuffer() : bs );

        if(!(
            this._bytes.length === 64
        ))throw new Error("'Signature' must be an hash of length 64");

         /* TO DO: this.cboRref params */
        this.cborRef = cborRef ?? subCborRefOrUndef( this );
    }

    clone(): Signature
    {
        return new Signature( this.toBuffer(), this.cborRef?.clone() );
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