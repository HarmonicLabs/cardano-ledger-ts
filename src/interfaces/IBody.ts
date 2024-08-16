import { U8Arr32 } from "../eras/byron/utils/types";
import { isObject } from "@harmoniclabs/obj-utils";
import { isBoolean } from "../utils/isThatType";
import { isHash32 } from "../utils/isThatType";

export function isIBody( stuff: any ): stuff is IBody
{
    return isObject( stuff ) && (
        isHash32( stuff.hash ) &&        
        isBoolean( stuff.isEBB )
    );
}

export interface IBody {
    readonly hash: U8Arr32,
    readonly isEBB: boolean,

    readonly cborBytes?: Uint8Array
}
