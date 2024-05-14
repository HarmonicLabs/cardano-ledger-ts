import { Cbor, CborArray, CborObj, CborString, CborUInt } from "@harmoniclabs/cbor";
import { CanBeHash28, Hash28, canBeHash28 } from "../../hashes";
import { roDescr } from "../../utils/roDescr";
import { DRepType, drepTypeToString } from "./DRepType";
import { IDRep } from "./IDRep";
import { Credential, ValidatorHash } from "../../credentials";
import { isObject } from "@harmoniclabs/obj-utils";
import { DataConstr } from "@harmoniclabs/plutus-data";
import { definitelyToDataVersion } from "../../toData/defaultToDataVersion";

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

    toData(version?: "v1" | "v2" | "v3" | undefined): DataConstr
    {
        version = definitelyToDataVersion( version );

        if( version === "v1" || version === "v2" )
        throw new Error("DRep only supported after v3");

        return new DataConstr(
            0, // PDRep.DRep
            [ Credential.script( this.hash ).toData( version ) ]
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