import { Cbor, CborArray, CborSimple, CborString, CborUInt, ToCbor } from "@harmoniclabs/cbor";
import { CanBeHash28, Hash28, canBeHash28, canBeHash32 } from "../../hashes";
import { ProtocolParameters, partialProtocolParametersToCborObj } from "../../ledger";
import { ITxOutRef, TxOutRef } from "../../tx";
import { roDescr } from "../../utils/roDescr";
import { GovActionType } from "./GovActionType";
import { IGovAction } from "./IGovAction";

export interface IGovActionParameterChange {
    govActionId?: ITxOutRef | undefined,
    protocolParamsUpdate: Partial<ProtocolParameters>,
    policyHash?: CanBeHash28 | undefined
}

export class GovActionParameterChange
    implements IGovAction, IGovActionParameterChange, ToCbor
{
    readonly govActionType: GovActionType.ParameterChange;
    readonly govActionId: TxOutRef | undefined;
    readonly protocolParamsUpdate: Partial<ProtocolParameters>;
    readonly policyHash: Hash28 | undefined;

    constructor({ govActionId, protocolParamsUpdate, policyHash }: IGovActionParameterChange )
    {
        Object.defineProperties(
            this, {
                govActionType: { value: GovActionType.ParameterChange, ...roDescr },
                govActionId: { value: govActionId ? new TxOutRef( govActionId ) : undefined , ...roDescr },
                protocolParamsUpdate: { value: protocolParamsUpdate, ...roDescr },
                policyHash: { value: canBeHash28( policyHash ) ? new Hash28( policyHash ) : undefined, ...roDescr },
            }
        )
    }

    toCbor(): CborString
    {
        return Cbor.encode( this.toCborObj() );
    }
    toCborObj(): CborArray
    {
        return new CborArray([
            new CborUInt( this.govActionType ),
            this.govActionId?.toCborObj() ?? new CborSimple( null ),
            partialProtocolParametersToCborObj( this.protocolParamsUpdate ),
            this.policyHash?.toCborObj() ?? new CborSimple( null )
        ]);
    }
}