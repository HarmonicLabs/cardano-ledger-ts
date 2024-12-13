import { Cbor, CborArray, CborString, CborUInt, SubCborRef } from "@harmoniclabs/cbor";
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

    constructor(
        _info?: IDRepAlwaysNoConfidence,
        readonly subCborRef?: SubCborRef
    )
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
        if( this.subCborRef instanceof SubCborRef )
        {
            // TODO: validate cbor structure
            // we assume correctness here
            return new CborString( this.subCborRef.toBuffer() );
        }
        
        return Cbor.encode( this.toCborObj() );
    }
    toCborObj(): CborArray
    {
        return new CborArray([
            new CborUInt( this.drepType )
        ]);
    }

    toJSON() { return this.toJson(); }
    toJson()
    {
        return {
            drepType: drepTypeToString( this.drepType )
        };
    }
}