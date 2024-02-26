import { Cbor, CborArray, CborBytes, CborObj, CborString, CborUInt } from "@harmoniclabs/cbor";
import { PubKeyHash } from "../../credentials";
import { CanBeHash28, Hash28, canBeHash28 } from "../../hashes";
import { roDescr } from "../../utils/roDescr";
import { DRepType, drepTypeToString } from "./DRepType";
import { IDRep } from "./IDRep";
import { isObject } from "@harmoniclabs/obj-utils";

export interface IDRepKeyHash {
    hash: CanBeHash28
}

export function isIDRepKeyHash( stuff: any ): stuff is IDRepKeyHash
{
    return isObject( stuff ) && canBeHash28( stuff.hash );
}

export class DRepKeyHash
    implements IDRep, IDRepKeyHash
{
    readonly drepType: DRepType.KeyHash;
    readonly hash: PubKeyHash;

    constructor({ hash }: IDRepKeyHash)
    {
        Object.defineProperties(
            this, {
                drepType: { value: DRepType.KeyHash, ...roDescr },
                hash: { value: new PubKeyHash( hash ), ...roDescr }
            }
        );
    }

    toCbor(): CborString
    {
        return Cbor.encode( this.toCborObj() );
    }
    toCborObj(): CborArray
    {
        return new CborArray([
            new CborUInt( this.drepType ),
            this.hash.toCborObj()
        ]);
    }

    static fromCborObj( cbor: CborObj ): DRepKeyHash
    {
        if(!(
            cbor instanceof CborArray &&
            cbor.array.length >= 2 &&
            
            cbor.array[0] instanceof CborUInt &&
            Number( cbor.array[0].num ) === DRepType.KeyHash
        )) throw new Error("Invalid cbor for 'DRepKeyHash'");

        return new DRepKeyHash({
            hash: Hash28.fromCborObj( cbor.array[1] )
        });
    }

    toJson()
    {
        return {
            drepType: drepTypeToString( this.drepType ),
            hash: this.hash.toString()
        };
    }
}