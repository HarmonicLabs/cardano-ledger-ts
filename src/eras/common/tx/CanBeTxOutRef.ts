import { ITxOutRef, ITxOutRefToStr, TxOutRef, TxOutRefStr } from "./TxOutRef";
import { hasUtxoRef, HasUtxoRef } from "./HasUtxoRef";


export type CanBeTxOutRef = ITxOutRef | HasUtxoRef | TxOutRefStr;

export function forceTxOutRefStr( canBe: CanBeTxOutRef ): TxOutRefStr
{
    return typeof canBe === "string" ? canBe : ITxOutRefToStr( hasUtxoRef( canBe ) ? canBe.utxoRef : canBe )
}

export function forceTxOutRef( canBe: CanBeTxOutRef ): TxOutRef
{
    let _interface: ITxOutRef
    if( typeof canBe === "string" )
    {
        const [id,idx] = canBe.split('#');
        _interface = {
            id,
            index: Number( idx )
        } as any;
    }
    else _interface = hasUtxoRef( canBe ) ? canBe.utxoRef : canBe;

    return new TxOutRef( _interface );
}