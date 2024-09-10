import { isBoolean, isSlotNo } from "../utils/isThatType";
import { canBeHash32, Hash, Hash32 } from "../hashes";
import { SlotNo } from "../utils/types";

export function isIHeader( stuff: any ): stuff is IHeader
{
    return(
        canBeHash32( stuff.hash ) &&
        isSlotNo( stuff.slotNo ) &&
        isBoolean( stuff.isEBB ) &&
        canBeHash32( stuff.prevBlock )
    );
}

export interface IHeader {
    readonly hash: Hash,
    readonly slotNo: SlotNo,
    // block number is not present on babbage headers
    readonly blockNo?: number,

    readonly prevBlock: Hash32,

    // ledger has no concept of "point"
    // it is just a consensus / network thing
    // readonly point: RealPoint
    // point?: () => IRealPoint

    // not really a consensus nor ledger thing
    // but turns useful for implementations
    readonly cborBytes?: Uint8Array
}
