import { ITxOutRef, ITxOutRefToStr, TxOutRef, TxOutRefStr } from "../../common/TxOutRef";
import { IMaryUTxO, isIMaryUTxO } from "./MaryUTxO";


export type CanBeTxOutRef = ITxOutRef | IMaryUTxO | TxOutRefStr;

export function forceTxOutRefStr( canBe: CanBeTxOutRef ): TxOutRefStr
{
    return typeof canBe === "string" ? canBe : ITxOutRefToStr( isIMaryUTxO( canBe ) ? canBe.utxoRef : canBe )
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
    else _interface = isIMaryUTxO( canBe ) ? canBe.utxoRef : canBe;

    return new TxOutRef( _interface );
}