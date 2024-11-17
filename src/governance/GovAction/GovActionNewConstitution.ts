import { Cbor, CborArray, CborObj, CborSimple, CborString, CborUInt, ToCbor } from "@harmoniclabs/cbor";
import { IGovAction } from "./IGovAction";
import { ITxOutRef, TxOutRef, isITxOutRef } from "../../tx";
import { Constitution, IConstitution, isIConstitution } from "../Constitution";
import { GovActionType } from "./GovActionType";
import { roDescr } from "../../utils/roDescr";
import { isObject } from "@harmoniclabs/obj-utils";
import { DataConstr, DataI, ToData } from "@harmoniclabs/plutus-data";
import { ToDataVersion } from "../../toData/defaultToDataVersion";
import { maybeData } from "../../utils/maybeData";

export interface IGovActionNewConstitution {
    govActionId?: ITxOutRef | undefined,
    constitution: IConstitution
}

export function isIGovActionNewConstitution( stuff: any ): stuff is IGovActionNewConstitution
{
    return isObject( stuff ) && (
        stuff.govActionId === undefined || isITxOutRef( stuff.govActionId ) &&
        isIConstitution( stuff.constitution )
    );
}

export class GovActionNewConstitution
    implements IGovAction, IGovActionNewConstitution, ToCbor, ToData
{
    readonly govActionType: GovActionType.NewConstitution
    readonly govActionId: TxOutRef | undefined;
    readonly constitution: Constitution;

    constructor({ govActionId, constitution }: IGovActionNewConstitution)
    {
        Object.defineProperties(
            this, {
                govActionType: { value: GovActionType.NewConstitution, ...roDescr },
                govActionId: { value: isITxOutRef( govActionId ) ? new TxOutRef( govActionId ) : undefined, ...roDescr },
                constitution: { value: new Constitution( constitution ), ...roDescr }
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
        
        return Cbor.encode( this.toCborObj() );
    }
    toCborObj(): CborArray
    {
        return new CborArray([
            new CborUInt( this.govActionType ),
            this.govActionId?.toCborObj() ?? new CborSimple( null ),
            this.constitution.toCborObj()
        ]);
    }

    toData( v?: ToDataVersion ): DataConstr
    {
        v = "v3"; // only one supported so far
        return new DataConstr(
            5, [
                maybeData( this.govActionId?.toData( v ) ),
                this.constitution.toData( v )
            ]
        );
    }
}