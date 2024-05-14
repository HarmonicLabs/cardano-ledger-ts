import { isObject } from "@harmoniclabs/obj-utils";
import { DRepType, isDRepType } from "./DRepType";
import { ToData } from "@harmoniclabs/plutus-data";

export interface IDRep extends ToData {
    drepType: DRepType
};

export function isIDRep( stuff: any ): stuff is IDRep
{
    return isObject( stuff ) && isDRepType( stuff.drepType );
}