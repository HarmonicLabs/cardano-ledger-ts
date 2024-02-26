import { isObject } from "@harmoniclabs/obj-utils";
import { DRepType, isDRepType } from "./DRepType";

export interface IDRep {
    drepType: DRepType
};

export function isIDRep( stuff: any ): stuff is IDRep
{
    return isObject( stuff ) && isDRepType( stuff.drepType );
}