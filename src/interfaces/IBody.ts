import { isBoolean, isHash } from "../utils/isThatType";
import { isObject } from "@harmoniclabs/obj-utils";
import { U8Arr32 } from "../utils/types";

export function isIBody( stuff: any ): stuff is IBody
{
    return isObject( stuff ) && (
        isHash( stuff.hash, 32 ) &&        
        isBoolean( stuff.isEBB )
    );
}

export interface IBody {
    readonly hash: U8Arr32,
    readonly isEBB: boolean,

    readonly cborBytes?: Uint8Array
}
