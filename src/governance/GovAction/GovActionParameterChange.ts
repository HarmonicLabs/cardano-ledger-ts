import { Cbor, CborArray, CborSimple, CborString, CborUInt, ToCbor } from "@harmoniclabs/cbor";
import { CanBeHash28, Hash28, canBeHash28, canBeHash32 } from "../../hashes";
import { ITxOutRef, TxOutRef, isITxOutRef } from "../../tx";
import { roDescr } from "../../utils/roDescr";
import { GovActionType } from "./GovActionType";
import { IGovAction } from "./IGovAction";
import { isObject } from "@harmoniclabs/obj-utils";
import { Data, DataConstr, ToData } from "@harmoniclabs/plutus-data";
import { ToDataVersion } from "../../toData/defaultToDataVersion";
import { maybeData } from "../../utils/maybeData";
import { isPartialProtocolParameters, partialProtocolParametersToCborObj, partialProtocolParametersToData, ProtocolParameters } from "../../ledger/protocol/ProtocolParameters";

export interface IGovActionParameterChange {
    govActionId?: ITxOutRef | undefined,
    protocolParamsUpdate: Partial<ProtocolParameters>,
    policyHash?: CanBeHash28 | undefined
}

export function isIGovActionParameterChange( stuff: any ): stuff is IGovActionParameterChange
{
    return isObject( stuff ) && (
        ( stuff.govActionId === undefined || isITxOutRef( stuff.govActionId ) ) &&
        isPartialProtocolParameters( stuff.protocolParamsUpdate ) &&
        ( stuff.policyHash === undefined || canBeHash28( stuff.policyHash ) )
    );
}

export class GovActionParameterChange
    implements IGovAction, IGovActionParameterChange, ToCbor, ToData
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

    toData( v?: ToDataVersion ): DataConstr
    {
        v = "v3"; // only one supported so far
        return new DataConstr(
            0, [
                maybeData( this.govActionId?.toData( v ) ),
                partialProtocolParametersToData( this.protocolParamsUpdate ),
                maybeData( this.policyHash?.toData( v ) )
            ]
        );
    }
}