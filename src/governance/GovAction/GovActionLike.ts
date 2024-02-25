import { GovActionUpdateCommittee, IGovActionUpdateCommittee } from "./GovAcitonUpdateCommittee";
import { GovAction } from "./GovAction";
import { GovActionInfo, IGovActionInfo } from "./GovActionInfo";
import { GovActionInitHardFork, IGovActionInitHardFork } from "./GovActionInitHardFork";
import { GovActionNewConstitution, IGovActionNewConstitution } from "./GovActionNewConstitution";
import { GovActionNoConfidence, IGovActionNoConfidence } from "./GovActionNoConfidence";
import { GovActionParameterChange, IGovActionParameterChange } from "./GovActionParameterChange";
import { GovActionTreasuryWithdrawals, IGovActionTreasuryWithdrawals } from "./GovActionTreasuryWithdrawals";
import { GovActionType } from "./GovActionType";

export type GovActionLike
    = IGovActionParameterChange     & { govActionType: GovActionType.ParameterChange }
    | IGovActionInitHardFork        & { govActionType: GovActionType.InitHardFork }
    | IGovActionTreasuryWithdrawals & { govActionType: GovActionType.TreasuryWithdrawals }
    | IGovActionNoConfidence        & { govActionType: GovActionType.NoConfidence }
    | IGovActionUpdateCommittee     & { govActionType: GovActionType.UpdateCommittee }
    | IGovActionNewConstitution     & { govActionType: GovActionType.NewConstitution }
    | IGovActionInfo                & { govActionType: GovActionType.Info };

export function toRealGovAction( govActionLike: GovActionLike ): GovAction
{
    switch( govActionLike.govActionType )
    {
        case GovActionType.ParameterChange:     return new GovActionParameterChange( govActionLike );
        case GovActionType.InitHardFork:        return new GovActionInitHardFork( govActionLike );
        case GovActionType.TreasuryWithdrawals: return new GovActionTreasuryWithdrawals( govActionLike );
        case GovActionType.NoConfidence:        return new GovActionNoConfidence( govActionLike );
        case GovActionType.UpdateCommittee:     return new GovActionUpdateCommittee( govActionLike );
        case GovActionType.NewConstitution:     return new GovActionNewConstitution( govActionLike );
        case GovActionType.Info:                return new GovActionInfo( govActionLike );
        default: throw new Error("unknown govAcitonType")
    }
}