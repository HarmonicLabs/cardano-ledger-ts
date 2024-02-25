import { Cbor, CborArray, CborObj, CborSimple, CborString, CborUInt, ToCbor } from "@harmoniclabs/cbor";
import { IGovAction } from "./IGovAction";
import { ITxOutRef, TxOutRef, isITxOutRef } from "../../tx";
import { IProtocolVerision, IProtocolVerisionObj, isIProtocolVersion, protocolVersionAsObj, protocolVersionToCborObj } from "../../ledger/protocol/protocolVersion";
import { GovActionType } from "./GovActionType";
import { roDescr } from "../../utils/roDescr";
import { isObject } from "@harmoniclabs/obj-utils";


export interface IGovActionInitHardFork {
    govActionId?: ITxOutRef | undefined,
    protocolVersion: IProtocolVerision
}

export function isIGovActionInitHardFork( stuff: any ): stuff is IGovActionInitHardFork
{
    return isObject( stuff ) && (
        ( stuff.govActionId === undefined || isITxOutRef( stuff.govActionId ) ) &&
        isIProtocolVersion( stuff.protocolVersion )
    );
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