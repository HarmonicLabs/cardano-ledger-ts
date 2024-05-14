import { Cbor, CborArray, CborString, CborUInt } from "@harmoniclabs/cbor";
import { roDescr } from "../../utils/roDescr";
import { DRepType, drepTypeToString } from "./DRepType";
import { IDRep } from "./IDRep";
import { ToDataVersion, definitelyToDataVersion } from "../../toData/defaultToDataVersion";
import { DataConstr } from "@harmoniclabs/plutus-data";

export interface IDRepAlwaysNoConfidence {
    hash?: undefined // to preserve shape
}

export class DRepAlwaysNoConfidence
    implements IDRep, IDRepAlwaysNoConfidence
{
    readonly drepType: DRepType.AlwaysNoConfidence;
    readonly hash?: undefined;

    constructor( _info?: IDRepAlwaysNoConfidence)
    {
        Object.defineProperties(
            this, {
                drepType: { value: DRepType.AlwaysNoConfidence, ...roDescr },
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
            2, // PDrep.AlwaysNoConfidence
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