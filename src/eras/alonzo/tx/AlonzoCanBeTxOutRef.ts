import { ITxOutRef, ITxOutRefToStr, TxOutRef, TxOutRefStr } from "../../common/TxOutRef";
import { IAlonzoUTxO, isIAlonzoUTxO } from "./AlonzoUTxO";


export type CanBeTxOutRef = ITxOutRef | IAlonzoUTxO | TxOutRefStr;

export function forceTxOutRefStr( canBe: CanBeTxOutRef ): TxOutRefStr
{
    return typeof canBe === "string" ? canBe : ITxOutRefToStr( isIAlonzoUTxO( canBe ) ? canBe.utxoRef : canBe )
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
    else _interface = isIAlonzoUTxO( canBe ) ? canBe.utxoRef : canBe;

    return new TxOutRef( _interface );
}