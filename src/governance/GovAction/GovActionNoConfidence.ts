import { Cbor, CborArray, CborSimple, CborString, CborUInt, ToCbor } from "@harmoniclabs/cbor";
import { ITxOutRef, TxOutRef, isITxOutRef } from "../../tx";
import { IGovAction } from "./IGovAction";
import { GovActionType } from "./GovActionType";
import { roDescr } from "../../utils/roDescr";
import { isObject } from "@harmoniclabs/obj-utils";
import { DataConstr, ToData } from "@harmoniclabs/plutus-data";
import { ToDataVersion } from "../../toData/defaultToDataVersion";
import { maybeData } from "../../utils/maybeData";

export interface IGovActionNoConfidence {
    govActionId?: ITxOutRef | undefined,
}

export function isIGovActionNoConfidence( stuff: any ): stuff is IGovActionNoConfidence
{
    return isObject( stuff ) && (
        stuff.govActionId === undefined || isITxOutRef( stuff.govActionId )
    );
}

export class GovActionNoConfidence
    implements IGovAction, IGovActionNoConfidence, ToCbor, ToData
{
    readonly govActionType: GovActionType.NoConfidence;
    readonly govActionId: TxOutRef | undefined;
    
    constructor({ govActionId }: IGovActionNoConfidence)
    {
        Object.defineProperties(
            this, {
                govActionType: { value: GovActionType.NoConfidence, ...roDescr },
                govActionId: { value: isITxOutRef( govActionId ) ? new TxOutRef( govActionId ) : undefined, ...roDescr }
            }
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
            new CborUInt( this.govActionType ),
            this.govActionId?.toCborObj() ?? new CborSimple( null )
        ]);
    }
    
    toData( v?: ToDataVersion ): DataConstr
    {
        v = "v3"; // only one supported so far
        return new DataConstr(
            3, [
                maybeData( this.govActionId?.toData( v ) )
            ]
        );
    }
}