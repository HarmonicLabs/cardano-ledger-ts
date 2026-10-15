import { Cbor, CborArray, CborBytes, CborMap, CborSimple, CborString, CborUInt, SubCborRef, ToCbor } from "@harmoniclabs/cbor";
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

    // cardano-ledger keeps `Map AccountAddress Coin` and writes it in key order; the
    // action is not a hash preimage, so it is always re-encoded that way (586)
    toCborBytes(): Uint8Array
    {
        return this.toCbor();
    }
    toCbor(): CborString
    {
        return Cbor.encode( this.toCborObj() );
    }
    toCborObj(): CborArray
    {
        return new CborArray([
            new CborUInt( this.govActionType ),
            canonicalWithdrawalsCborObj( this.withdrawals ),
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
/**
 * `Map AccountAddress Coin` in cardano-ledger's `Ord` order: network (testnet before
 * mainnet), then the credential (script hashes before key hashes), then the hash
 */
function canonicalWithdrawalsCborObj( withdrawals: TxWithdrawals ): CborMap
{
    const entries = withdrawals.map.map( ({ rewardAccount, amount }) => {
        const k = rewardAccount.toCborObj();
        const bytes = ( k as CborBytes ).bytes;
        const header = bytes[0] ?? 0;
        const sortKey = [ header & 1, ( header >> 4 ) & 1 ? 0 : 1 ];
        return { k, v: new CborUInt( amount ), sortKey, hash: bytes.subarray( 1 ) };
    });
    entries.sort( ( a, b ) => {
        for( let i = 0; i < 2; i++ ) if( a.sortKey[i] !== b.sortKey[i] ) return a.sortKey[i] - b.sortKey[i];
        const n = Math.min( a.hash.length, b.hash.length );
        for( let i = 0; i < n; i++ ) if( a.hash[i] !== b.hash[i] ) return a.hash[i] - b.hash[i];
        return a.hash.length - b.hash.length;
    });
    return new CborMap( entries.map( ({ k, v }) => ({ k, v }) ) );
}
