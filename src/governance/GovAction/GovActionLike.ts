import { isObject } from "@harmoniclabs/obj-utils";
import { GovActionUpdateCommittee, IGovActionUpdateCommittee, isIGovActionUpdateCommittee } from "./GovAcitonUpdateCommittee";
import { GovAction } from "./GovAction";
import { GovActionInfo, IGovActionInfo, isIGovActionInfo } from "./GovActionInfo";
import { GovActionInitHardFork, IGovActionInitHardFork, isIGovActionInitHardFork } from "./GovActionInitHardFork";
import { GovActionNewConstitution, IGovActionNewConstitution, isIGovActionNewConstitution } from "./GovActionNewConstitution";
import { GovActionNoConfidence, IGovActionNoConfidence, isIGovActionNoConfidence } from "./GovActionNoConfidence";
import { GovActionParameterChange, IGovActionParameterChange, isIGovActionParameterChange } from "./GovActionParameterChange";
import { GovActionTreasuryWithdrawals, IGovActionTreasuryWithdrawals, isIGovActionTreasuryWithdrawals } from "./GovActionTreasuryWithdrawals";
import { GovActionType, isGovActionType } from "./GovActionType";

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

export function isGovActionLike( stuff: any ): stuff is GovActionLike
{
    if(!(
        isObject( stuff ) &&
        isGovActionType( stuff.govActionType )
    )) return false;

    const govActionType = stuff.govActionType;

    if( govActionType === GovActionType.ParameterChange )       return isIGovActionParameterChange( stuff );
    if( govActionType === GovActionType.InitHardFork )          return isIGovActionInitHardFork( stuff );
    if( govActionType === GovActionType.TreasuryWithdrawals )   return isIGovActionTreasuryWithdrawals( stuff );
    if( govActionType === GovActionType.NoConfidence )          return isIGovActionNoConfidence( stuff );
    if( govActionType === GovActionType.UpdateCommittee )       return isIGovActionUpdateCommittee( stuff );
    if( govActionType === GovActionType.NewConstitution )       return isIGovActionNewConstitution( stuff );
    if( govActionType === GovActionType.Info )                  return isIGovActionInfo( stuff );

    throw new Error("unknown govAcitonType: " + stuff.govActionType)
}