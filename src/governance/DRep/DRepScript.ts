import { Cbor, CborArray, CborObj, CborString, CborUInt } from "@harmoniclabs/cbor";
import { CanBeHash28, Hash28, canBeHash28 } from "../../hashes";
import { roDescr } from "../../utils/roDescr";
import { DRepType, drepTypeToString } from "./DRepType";
import { IDRep } from "./IDRep";
import { ValidatorHash } from "../../credentials";
import { isObject } from "@harmoniclabs/obj-utils";

export interface IDRepScript {
    hash: CanBeHash28
}

export function isIDRepScript( stuff: any ): stuff is IDRepScript
{
    return isObject( stuff ) && canBeHash28( stuff.hash );
}

export class DRepScript
    implements IDRep, IDRepScript
{
    readonly drepType: DRepType.Script;
    readonly hash: ValidatorHash;

    constructor({ hash }: IDRepScript)
    {
        Object.defineProperties(
            this, {
                drepType: { value: DRepType.Script, ...roDescr },
                hash: { value: new ValidatorHash( hash ), ...roDescr }
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

    static fromCborObj( cbor: CborObj ): DRepScript
    {
        if(!(
            cbor instanceof CborArray &&
            cbor.array.length >= 2 &&
            
            cbor.array[0] instanceof CborUInt &&
            Number( cbor.array[0].num ) === DRepType.Script
        )) throw new Error("Invalid cbor for 'DRepScript'");

        return new DRepScript({
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