import { Cbor, CborArray, CborString, CborUInt, ToCbor } from "@harmoniclabs/cbor";
import { Coin, StakeAddress } from "../ledger";
import { Anchor, IAnchor } from "./Anchor";
import { GovActionLike, toRealGovAction } from "./GovAction/GovActionLike";
import { forceBigUInt } from "@harmoniclabs/cbor/dist/utils/ints";
import { roDescr } from "../utils/roDescr";
import { GovAction } from "./GovAction";

export interface IProposalProcedure {
    deposit: Coin,
    rewardAccount: StakeAddress,
    govAction: GovActionLike,
    anchor: IAnchor
}

export class ProposalProcedure
    implements IProposalProcedure, ToCbor
{
    readonly deposit: bigint;
    readonly rewardAccount: StakeAddress;
    readonly govAction: GovAction;
    readonly anchor: Anchor;

    constructor({ deposit, rewardAccount, govAction, anchor }: IProposalProcedure)
    {
        Object.defineProperties(
            this, {
                deposit: { value: forceBigUInt( deposit ), ...roDescr },
                rewardAccount: { value: StakeAddress.fromString( rewardAccount.toString() ), ...roDescr },
                govAction: { value: toRealGovAction( govAction ), ...roDescr },
                anchor: { value: new Anchor( anchor ), ...roDescr }
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
            new CborUInt( this.deposit ),
            this.rewardAccount.toCredential().toCborObj(),
            this.govAction.toCborObj(),
            this.anchor.toCborObj()
        ]);
    }
}