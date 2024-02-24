import { Coin, StakeAddress } from "../ledger";
import { IAnchor } from "./Anchor";
import { IGovAction } from "./GovAction/GovAction";

export interface IProposalProcedure {
    deposit: Coin,
    rewardAccount: StakeAddress,
    govAction: IGovAction,
    anchor: IAnchor
}