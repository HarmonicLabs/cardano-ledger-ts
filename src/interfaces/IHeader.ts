import { isBoolean } from "../utils/isThat/isBoolean";
import { isSlotNo } from "../eras/byron/utils/isSlotNo";
import { isHash32 } from "../utils/isThat/isHash";
import { SlotNo, U8Arr32 } from "../eras/byron/utils/types";

export function isIHeader( stuff: any ): stuff is IHeader
{
    return(
        isHash32( stuff.hash ) &&
        isSlotNo( stuff.slotNo ) &&
        isBoolean( stuff.isEBB ) &&
        isHash32( stuff.prevBlock )
    );
}

export interface IHeader {
    readonly hash: U8Arr32,
    readonly slotNo: SlotNo,
    // block number is not present on babbage headers
    // readonly blockNo: number,
    readonly isEBB: boolean,

    readonly prevBlock: U8Arr32,

    // ledger has no concept of "point"
    // it is just a consensus / network thing
    // readonly point: RealPoint
    // point?: () => IRealPoint

    // not really a consensus nor ledger thing
    // but turns useful for implementations
    readonly cborBytes?: Uint8Array
}
