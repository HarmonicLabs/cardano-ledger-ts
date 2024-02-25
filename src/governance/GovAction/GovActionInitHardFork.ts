import { Cbor, CborArray, CborObj, CborSimple, CborString, CborUInt, ToCbor } from "@harmoniclabs/cbor";
import { IGovAction } from "./IGovAction";
import { ITxOutRef, TxOutRef } from "../../tx";
import { IProtocolVerision, IProtocolVerisionObj, protocolVersionAsObj, protocolVersionToCborObj } from "../../ledger/protocol/protocolVersion";
import { GovActionType } from "./GovActionType";
import { roDescr } from "../../utils/roDescr";


export interface IGovActionInitHardFork {
    govActionId?: ITxOutRef | undefined,
    protocolVersion: IProtocolVerision
}

export class GovActionInitHardFork
    implements IGovAction, IGovActionInitHardFork, ToCbor
{
    readonly govActionType: GovActionType.InitHardFork;
    readonly govActionId: TxOutRef | undefined;
    readonly protocolVersion: IProtocolVerisionObj;

    constructor({ govActionId, protocolVersion }: IGovActionInitHardFork)
    {
        Object.defineProperties(
            this, {
                govActionType: { value: GovActionType.InitHardFork, ...roDescr },
                govActionId: { value: govActionId ? new TxOutRef( govActionId ) : undefined, ...roDescr },
                protocolVersion: { value: protocolVersionAsObj( protocolVersion ), ...roDescr }
            }
        );
    }

    toCbor(): CborString
    {
        return Cbor.encode( this.toCborObj() )
    }
    toCborObj(): CborArray
    {
        return new CborArray([
            new CborUInt( this.govActionType ),
            this.govActionId?.toCborObj() ?? new CborSimple( null ),
            protocolVersionToCborObj( this.protocolVersion )
        ]);
    }
}