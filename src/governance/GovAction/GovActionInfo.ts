import { Cbor, CborArray, CborObj, CborSimple, CborString, CborUInt, ToCbor } from "@harmoniclabs/cbor";
import { IGovAction } from "./IGovAction";
import { ITxOutRef, TxOutRef, isITxOutRef } from "../../tx";
import { Constitution, IConstitution } from "../Constitution";
import { GovActionType } from "./GovActionType";
import { roDescr } from "../../utils/roDescr";
import { isObject } from "@harmoniclabs/obj-utils";

export interface IGovActionInfo {}

export const isIGovActionInfo = isObject as ( stuff: any ) => stuff is IGovActionInfo;
 
export class GovActionInfo
    implements IGovAction, IGovActionInfo, ToCbor
{
    readonly govActionType: GovActionType.Info

    constructor( _info?: IGovActionInfo )
    {
        Object.defineProperties(
            this, {
                govActionType: { value: GovActionType.Info, ...roDescr }
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
            new CborUInt( this.govActionType )
        ]);
    }
}