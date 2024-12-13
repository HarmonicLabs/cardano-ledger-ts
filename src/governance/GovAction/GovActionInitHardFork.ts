import { Cbor, CborArray, CborObj, CborSimple, CborString, CborUInt, SubCborRef, ToCbor } from "@harmoniclabs/cbor";
import { IGovAction } from "./IGovAction";
import { ITxOutRef, TxOutRef, isITxOutRef } from "../../tx";
import { IProtocolVerision, IProtocolVerisionObj, isIProtocolVersion, protocolVersionAsObj, protocolVersionToCborObj } from "../../ledger/protocol/protocolVersion";
import { GovActionType } from "./GovActionType";
import { roDescr } from "../../utils/roDescr";
import { isObject } from "@harmoniclabs/obj-utils";
import { DataConstr, DataI, ToData } from "@harmoniclabs/plutus-data";
import { partialProtocolParametersToData } from "../../ledger";
import { ToDataVersion } from "../../toData/defaultToDataVersion";
import { maybeData } from "../../utils/maybeData";


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
    implements IGovAction, IGovActionInitHardFork, ToCbor, ToData
{
    readonly govActionType: GovActionType.InitHardFork;
    readonly govActionId: TxOutRef | undefined;
    readonly protocolVersion: IProtocolVerisionObj;

    constructor(
        { govActionId, protocolVersion }: IGovActionInitHardFork,
        readonly subCborRef?: SubCborRef
    )
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
        if( this.subCborRef instanceof SubCborRef )
        {
            // TODO: validate cbor structure
            // we assume correctness here
            return new CborString( this.subCborRef.toBuffer() );
        }
        
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

    toData( v?: ToDataVersion ): DataConstr
    {
        v = "v3"; // only one supported so far
        return new DataConstr(
            1, [
                maybeData( this.govActionId?.toData( v ) ),
                new DataConstr(
                    0, [
                        new DataI( this.protocolVersion.major ),
                        new DataI( this.protocolVersion.minor )
                    ]
                )
            ]
        );
    }
}