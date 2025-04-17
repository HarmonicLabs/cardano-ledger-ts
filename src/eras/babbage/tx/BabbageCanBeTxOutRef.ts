import { ITxOutRef, ITxOutRefToStr, TxOutRef, TxOutRefStr } from "../../common/TxOutRef";
import { IBabbageUTxO, isIBabbageUTxO } from "./BabbageUTxO";


export type CanBeTxOutRef = ITxOutRef | IBabbageUTxO | TxOutRefStr;

export function forceTxOutRefStr( canBe: CanBeTxOutRef ): TxOutRefStr
{
    return typeof canBe === "string" ? canBe : ITxOutRefToStr( isIBabbageUTxO( canBe ) ? canBe.utxoRef : canBe )
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
    else _interface = isIBabbageUTxO( canBe ) ? canBe.utxoRef : canBe;

    return new TxOutRef( _interface );
}