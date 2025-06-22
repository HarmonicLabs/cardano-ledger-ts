import { hasOwn, isObject } from "@harmoniclabs/obj-utils";
import { isITxOutRef, ITxOutRef } from "./TxOutRef";

export interface HasUtxoRef {
    utxoRef: ITxOutRef
}

export function hasUtxoRef( thing: any ): thing is HasUtxoRef
{
    return isObject( thing ) && (
        hasOwn( thing, "utxoRef" ) && isITxOutRef( thing.utxoRef )
    );
}

export const isHasUtxoRef = hasUtxoRef;