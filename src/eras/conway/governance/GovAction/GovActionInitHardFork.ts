import { Cbor, CborArray, CborObj, CborSimple, CborString, CborUInt, SubCborRef, ToCbor } from "@harmoniclabs/cbor";
import { isObject } from "@harmoniclabs/obj-utils";
import { DataConstr, DataI, ToData } from "@harmoniclabs/plutus-data";
import { IGovAction } from "./IGovAction";
import { ITxOutRef, TxOutRef, isITxOutRef } from "../../../common/tx/TxOutRef";
import { GovActionType } from "./GovActionType";
import { IProtocolVersion, isIProtocolVersion, ProtocolVersion } from "../../../common/ledger/protocol/protocolVersion";
import { ToDataVersion } from "../../../../toData/defaultToDataVersion";
import { maybeData } from "../../../../utils/maybeData";
import { subCborRefOrUndef } from "../../../../utils/getSubCborRef";


export interface IGovActionInitHardFork {
    govActionId?: ITxOutRef | undefined,
    protocolVersion: IProtocolVersion
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
    readonly protocolVersion: IProtocolVersion;

    constructor(
        init: IGovActionInitHardFork,
        readonly cborRef: SubCborRef | undefined = undefined
    )
    {
        const { govActionId, protocolVersion } = init;
        this.govActionType = GovActionType.InitHardFork;
        this.govActionId = govActionId ? new TxOutRef( govActionId ) : undefined;
        this.protocolVersion = protocolVersion;
        this.cborRef = cborRef ?? subCborRefOrUndef( init );
    }

    toCborBytes(): Uint8Array
    {
        if( this.cborRef instanceof SubCborRef ) return this.cborRef.toBuffer();
        return this.toCbor().toBuffer();
    }
    toCbor(): CborString
    {
        if( this.cborRef instanceof SubCborRef )
        {
            // TODO: validate cbor structure
            // we assume correctness here
            return new CborString( this.cborRef.toBuffer() );
        }
        
        return Cbor.encode( this.toCborObj() )
    }
    toCborObj(): CborArray
    {
        return new CborArray([
            new CborUInt( this.govActionType ),
            this.govActionId?.toCborObj() ?? new CborSimple( null ),
            new ProtocolVersion( this.protocolVersion ).toCborObj()
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