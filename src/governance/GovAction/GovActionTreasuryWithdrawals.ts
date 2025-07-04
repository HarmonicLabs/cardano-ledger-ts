import { Cbor, CborArray, CborSimple, CborString, CborUInt, SubCborRef, ToCbor } from "@harmoniclabs/cbor";
import { isObject } from "@harmoniclabs/obj-utils";
import { DataConstr, DataI, ToData } from "@harmoniclabs/plutus-data";
import { CanBeHash28, Hash28, canBeHash28 } from "../../hashes";
import { ITxWithdrawals, TxWithdrawals, isITxWithdrawals } from "../../ledger/TxWithdrawals";
import { GovActionType } from "./GovActionType";
import { roDescr } from "../../utils/roDescr";
import { ToDataVersion } from "../../toData/defaultToDataVersion";
import { maybeData } from "../../utils/maybeData";
import { IGovAction } from "./IGovAction";
export interface IGovActionTreasuryWithdrawals {
    withdrawals: ITxWithdrawals | TxWithdrawals,
    policyHash?: CanBeHash28 | undefined
}

export function isIGovActionTreasuryWithdrawals( stuff: any ): stuff is IGovActionTreasuryWithdrawals
{
    return isObject( stuff ) && (
        ( stuff.withdrawals instanceof TxWithdrawals || isITxWithdrawals( stuff.withdrawals ) ) &&
        ( stuff.policyHash === undefined || canBeHash28( stuff.policyHash ) )
    );
}

export class GovActionTreasuryWithdrawals
    implements IGovAction, IGovActionTreasuryWithdrawals, ToCbor, ToData
{
    readonly govActionType: GovActionType.TreasuryWithdrawals;
    readonly withdrawals: TxWithdrawals;
    readonly policyHash: Hash28 | undefined;

    constructor(
        { withdrawals, policyHash }: IGovActionTreasuryWithdrawals,
        readonly cborRef: SubCborRef | undefined = undefined
    )
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

    toCborBytes(): Uint8Array
    {
        if( this.cborRef instanceof SubCborRef ) return this.cborRef.toBuffer();
        return this.toCbor().toBuffer();
    }
    toCbor(): CborString
    {
        if( this.cborRef instanceof SubCborRef )
        {
            // TODO: validate cbor structure
            // we assume correctness here
            return new CborString( this.cborRef.toBuffer() );
        }
        
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

    toData( v?: ToDataVersion ): DataConstr
    {
        v = "v3"; // only one supported so far
        return new DataConstr(
            2, [
                this.withdrawals.toData( v ),
                maybeData( this.policyHash?.toData( v ) )
            ]
        );
    }
}