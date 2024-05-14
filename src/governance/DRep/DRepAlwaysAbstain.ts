import { Cbor, CborArray, CborString, CborUInt } from "@harmoniclabs/cbor";
import { roDescr } from "../../utils/roDescr";
import { DRepType, drepTypeToString } from "./DRepType";
import { IDRep } from "./IDRep";
import { Data, DataConstr } from "@harmoniclabs/plutus-data";
import { ToDataVersion, definitelyToDataVersion } from "../../toData/defaultToDataVersion";

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

    toData( version?: ToDataVersion | undefined): DataConstr
    {
        version = definitelyToDataVersion( version );

        if( version === "v1" || version === "v2" )
        throw new Error("DRep not supported before v3");

        return new DataConstr(
            1, // PDrep.AlwaysAbstain
            []
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