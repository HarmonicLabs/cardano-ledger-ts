import { Cbor, CborArray, CborString, CborUInt, SubCborRef } from "@harmoniclabs/cbor";
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

    constructor(
        _info?: IDRepAlwaysAbstain,
        readonly cborRef: SubCborRef | undefined = undefined
    )
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