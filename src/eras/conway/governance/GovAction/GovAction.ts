import { GovActionUpdateCommittee } from "./GovAcitonUpdateCommittee";
import { GovActionInfo } from "./GovActionInfo";
import { GovActionInitHardFork } from "./GovActionInitHardFork";
import { GovActionNewConstitution } from "./GovActionNewConstitution";
import { GovActionNoConfidence } from "./GovActionNoConfidence";
import { GovActionParameterChange } from "./GovActionParameterChange";
import { GovActionTreasuryWithdrawals } from "./GovActionTreasuryWithdrawals";

export type GovAction
    = GovActionParameterChange
    | GovActionInitHardFork
    | GovActionTreasuryWithdrawals
    | GovActionNoConfidence
    | GovActionUpdateCommittee
    | GovActionNewConstitution
    | GovActionInfo;