import { CanBeCborString, Cbor, forceCborString, CborObj, CborBytes, SubCborRef } from "@harmoniclabs/cbor";
import { fixedBytes, parseCborFull } from "../../utils/strictCbor";
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

        // the length is checked where a hash is decoded (`Hash28.fromCborObj`), as
        // cardano-ledger does; the constructor stays lenient because callers build
        // `Hash28`s from other values (Gerolamo: `new PoolKeyHash( issuerVkey )`)
        if(!(
            this._bytes instanceof Uint8Array
        ))throw new Error("'Hash28' must be an hash of length 28");

         /* Done: this.cboRref params */
        this.cborRef = cborRef ?? subCborRefOrUndef( bs );
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
        return Hash28.fromCborObj( parseCborFull( cStr, "Hash28" ) );
    }
    /** cardano-ledger `decodeHash`: a definite byte string of exactly 28 bytes */
    static fromCborObj( cObj: CborObj ): Hash28
    {
        return new Hash28(
            fixedBytes( cObj, 28, "Hash28" ),
            getSubCborRef( cObj )
        );
    }
}