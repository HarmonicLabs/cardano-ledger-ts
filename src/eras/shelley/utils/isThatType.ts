import { isBigInt, isWord64 } from "../../../utils/isThatType";
import { SlotNo, BlockNo, BlockBodySize, TransactionIndexN } from "./types";

export function isSlotNo( stuff: SlotNo ): stuff is SlotNo 
{
    return isBigInt( stuff )? isWord64( stuff ) : false;
}

export function isBlockNo( stuff: BlockNo ): stuff is BlockNo 
{
    return isBigInt( stuff )? isWord64( stuff ) : false;
}

export function isBlockBodySize( stuff: BlockBodySize ): stuff is BlockBodySize 
{
    return isBigInt( stuff )? isWord64( stuff ) : false;
}

function isValidTransactionIndexN(value: number): value is TransactionIndexN {
    return(
        Number.isInteger(value) && 
        ( value >= 0 && value <= 65535 )
    ); 
}
