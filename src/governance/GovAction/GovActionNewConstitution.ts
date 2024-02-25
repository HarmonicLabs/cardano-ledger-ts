import { Cbor, CborArray, CborObj, CborSimple, CborString, CborUInt, ToCbor } from "@harmoniclabs/cbor";
import { IGovAction } from "./IGovAction";
import { ITxOutRef, TxOutRef, isITxOutRef } from "../../tx";
import { Constitution, IConstitution } from "../Constitution";
import { GovActionType } from "./GovActionType";
import { roDescr } from "../../utils/roDescr";

export interface IGovActionNewConstitution {
    govActionId?: ITxOutRef | undefined,
    constitution: IConstitution
}

export class GovActionNewConstitution
    implements IGovAction, IGovActionNewConstitution, ToCbor
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
}