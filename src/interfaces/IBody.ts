import { isBoolean } from "../utils/isThat/isBoolean";
import { isObject } from "@harmoniclabs/obj-utils";
import { isHash32 } from "../utils/isThat/isHash";
import { U8Arr32 } from "../eras/byron/utils/types";

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
