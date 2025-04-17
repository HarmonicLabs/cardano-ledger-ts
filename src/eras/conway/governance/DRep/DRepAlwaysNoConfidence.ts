import { Cbor, CborArray, CborString, CborUInt, SubCborRef } from "@harmoniclabs/cbor";
import { DataConstr } from "@harmoniclabs/plutus-data";
import { roDescr } from "../../../../utils/roDescr";
import { DRepType, drepTypeToString } from "./DRepType";
import { IDRep } from "./IDRep";
import { ToDataVersion, definitelyToDataVersion } from "../../../../toData/defaultToDataVersion";
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
        readonly cborRef: SubCborRef | undefined = undefined
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

    toCborBytes(): Uint8Array
    {
        if( this.cborRef instanceof SubCborRef ) return this.cborRef.toBuffer();
        return this.toCbor().toBuffer();
    }
    toCbor(): CborString
    {
        if( this.cborRef instanceof SubCborRef )
        {
            // TODO: validate cbor structure
            // we assume correctness here
            return new CborString( this.cborRef.toBuffer() );
        }
        
        return Cbor.encode( this.toCborObj() );
    }
    toCborObj(): CborArray
    {
        if( this.cborRef instanceof SubCborRef ) return Cbor.parse( this.cborRef.toBuffer() ) as CborArray;
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