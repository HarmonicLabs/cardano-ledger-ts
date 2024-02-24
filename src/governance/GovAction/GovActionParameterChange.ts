import { CanBeHash28 } from "../../hashes";
import { ProtocolParameters } from "../../ledger";
import { ITxOutRef } from "../../tx";
import { IGovAction } from "./IGovAction";

export interface IGovActionParameterChange extends IGovAction {
    govActionId?: ITxOutRef | undefined,
    protocolParamsUpdate: Partial<ProtocolParameters>,
    policyHash: CanBeHash28
}