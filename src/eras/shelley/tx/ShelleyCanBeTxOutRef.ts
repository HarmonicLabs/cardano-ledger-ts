import { ITxOutRef, ITxOutRefToStr, TxOutRef, TxOutRefStr } from "../../common/TxOutRef";
import { IShelleyUTxO, isIShelleyUTxO } from "./ShelleyUTxO";


export type CanBeTxOutRef = ITxOutRef | IShelleyUTxO | TxOutRefStr;

export function forceTxOutRefStr( canBe: CanBeTxOutRef ): TxOutRefStr
{
    return typeof canBe === "string" ? canBe : ITxOutRefToStr( isIShelleyUTxO( canBe ) ? canBe.utxoRef : canBe )
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
    else _interface = isIShelleyUTxO( canBe ) ? canBe.utxoRef : canBe;

    return new TxOutRef( _interface );
}