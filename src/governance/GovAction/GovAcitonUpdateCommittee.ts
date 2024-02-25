import { Cbor, CborArray, CborMap, CborPositiveRational, CborSimple, CborString, CborUInt, ToCbor } from "@harmoniclabs/cbor";
import { Epoch } from "../../ledger";
import { Rational, cborFromRational } from "../../ledger/protocol/Rational";
import { ITxOutRef, TxOutRef, isITxOutRef } from "../../tx";
import { IGovAction } from "./IGovAction";
import { GovActionType } from "./GovActionType";
import { Credential } from "../../credentials";import { roDescr } from "../../utils/roDescr";
import { forceBigUInt } from "../../utils/ints";

export interface INewCommitteeEntry {
    coldCredential: Credential,
    epoch: Epoch,
}

export interface INewCommitteeEntryBI {
    coldCredential: Credential,
    epoch: bigint,
}

export interface IGovActionUpdateCommittee {
    govActionId?: ITxOutRef | undefined,
    toRemove: Credential[],
    toAdd: INewCommitteeEntry[],
    threshold: Rational
}

export class GovActionUpdateCommittee
    implements IGovAction, IGovActionUpdateCommittee, ToCbor
{
    readonly govActionType: GovActionType.UpdateCommittee;
    readonly govActionId: TxOutRef | undefined;
    readonly toRemove: Credential[];
    readonly toAdd: INewCommitteeEntryBI[];
    readonly threshold: CborPositiveRational;

    constructor({ govActionId, toRemove, toAdd, threshold }: IGovActionUpdateCommittee)
    {
        Object.defineProperties(
            this, {
                govActionType: { value: GovActionType.UpdateCommittee, ...roDescr },
                govActionId: { value: isITxOutRef( govActionId ) ? new TxOutRef( govActionId ): undefined, ...roDescr },
                toRemove: { value: toRemove.slice(), ...roDescr },
                toAdd: {
                    value: toAdd.map(({ coldCredential, epoch }) => ({ coldCredential, epoch: forceBigUInt( epoch ) }) ),
                    ...roDescr
                },
                threshold: { value: cborFromRational( threshold ).clone(), ...roDescr }
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
            new CborArray( this.toRemove.map( cred => cred.toCborObj() )),
            new CborMap(
                this.toAdd
                .map(({ coldCredential, epoch }) => 
                    ({
                        k: coldCredential.toCborObj(),
                        v: new CborUInt( epoch )
                    })
                )
            ),
            this.threshold.clone()
        ]);
    }
}