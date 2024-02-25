import { Cbor, CborArray, CborSimple, CborString, CborUInt, ToCbor } from "@harmoniclabs/cbor";
import { ITxOutRef, TxOutRef, isITxOutRef } from "../../tx";
import { IGovAction } from "./IGovAction";
import { GovActionType } from "./GovActionType";
import { roDescr } from "../../utils/roDescr";
import { isObject } from "@harmoniclabs/obj-utils";

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
    implements IGovAction, IGovActionNoConfidence, ToCbor
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
        return Cbor.encode( this.toCborObj() );
    }
    toCborObj(): CborArray
    {
        return new CborArray([
            new CborUInt( this.govActionType ),
            this.govActionId?.toCborObj() ?? new CborSimple( null )
        ]);
    }
}