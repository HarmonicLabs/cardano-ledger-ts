import { isSlotNo } from "../eras/byron/utils/isThatType";      // to fix bc it using byron stuff and not generic stuff
import { SlotNo } from "../eras/byron/utils/types";             // to fix bc it using byron stuff and not generic stuff
import { isBoolean } from "../utils/isThatType";
import { isHash32 } from "../utils/isThatType";
import { U8Arr32 } from "../utils/types";

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
