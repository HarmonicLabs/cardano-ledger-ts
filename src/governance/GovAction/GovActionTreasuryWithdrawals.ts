import { Cbor, CborArray, CborSimple, CborString, CborUInt, ToCbor } from "@harmoniclabs/cbor";
import { CanBeHash28, Hash28, canBeHash28 } from "../../hashes";
import { ITxWithdrawals, TxWithdrawals } from "../../ledger";
import { IGovAction } from "./IGovAction";
import { GovActionType } from "./GovActionType";
import { roDescr } from "../../utils/roDescr";

export interface IGovActionTreasuryWithdrawals {
    withdrawals: ITxWithdrawals | TxWithdrawals,
    policyHash?: CanBeHash28 | undefined
}

export class GovActionTreasuryWithdrawals
    implements IGovAction, IGovActionTreasuryWithdrawals, ToCbor
{
    readonly govActionType: GovActionType.TreasuryWithdrawals;
    readonly withdrawals: TxWithdrawals;
    readonly policyHash: Hash28 | undefined;

    constructor({ withdrawals, policyHash }: IGovActionTreasuryWithdrawals)
    {
        Object.defineProperties(
            this, {
                govActionType: { value: GovActionType.TreasuryWithdrawals, ...roDescr },
                withdrawals: {
                    value: withdrawals instanceof TxWithdrawals ? withdrawals : new TxWithdrawals( withdrawals ),
                    ...roDescr
                },
                policyHash: {
                    value: canBeHash28( policyHash ) ? new Hash28( policyHash ) : undefined,
                    ...roDescr
                }
            }
        );
    }

    toCbor(): CborString
    {
        return Cbor.encode( this.toCborObj() );
    }
    toCborObj(): CborArray
    {
        return new CborArray([
            new CborUInt( this.govActionType ),
            this.withdrawals.toCborObj(),
            this.policyHash?.toCborObj() ?? new CborSimple( null )
        ]);
    }
}