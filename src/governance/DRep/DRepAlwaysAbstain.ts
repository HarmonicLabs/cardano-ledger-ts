import { Cbor, CborArray, CborString, CborUInt } from "@harmoniclabs/cbor";
import { roDescr } from "../../utils/roDescr";
import { DRepType, drepTypeToString } from "./DRepType";
import { IDRep } from "./IDRep";

export interface IDRepAlwaysAbstain {
    hash?: undefined // to preserve shape
}

export class DRepAlwaysAbstain
    implements IDRep, IDRepAlwaysAbstain
{
    readonly drepType: DRepType.AlwaysAbstain;
    readonly hash?: undefined;

    constructor( _info?: IDRepAlwaysAbstain )
    {
        Object.defineProperties(
            this, {
                drepType: { value: DRepType.AlwaysAbstain, ...roDescr },
                hash: { value: undefined, ...roDescr } // to preserve shape
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
            new CborUInt( this.drepType )
        ]);
    }

    toJson()
    {
        return {
            drepType: drepTypeToString( this.drepType )
        };
    }
}