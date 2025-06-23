import { Cbor, CborArray, CborMap, CborPositiveRational, CborSimple, CborString, CborUInt, SubCborRef, ToCbor } from "@harmoniclabs/cbor";
import { isObject } from "@harmoniclabs/obj-utils";
import { DataConstr, DataI, DataList, DataMap, DataPair, ToData } from "@harmoniclabs/plutus-data";
import { Epoch } from "../../ledger/Epoch";
import { Rational, cborFromRational, isRational } from "../../ledger/protocol/Rational";
import { IGovAction } from "./IGovAction";
import { GovActionType } from "./GovActionType";
import { Credential } from "../../credentials";import { roDescr } from "../../utils/roDescr";
import { canBeUInteger, forceBigUInt } from "../../utils/ints";
import { ToDataVersion } from "../../toData/defaultToDataVersion";
import { maybeData } from "../../utils/maybeData";
import { isITxOutRef, ITxOutRef, TxOutRef } from "../../eras/common/tx/TxOutRef";

export interface INewCommitteeEntry {
    coldCredential: Credential,
    epoch: Epoch,
}

export function isINewCommitteeEntry( stuff: any ): stuff is INewCommitteeEntry
{
    return isObject( stuff ) && (
        stuff.coldCredential instanceof Credential &&
        canBeUInteger( stuff.epoch )
    );
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

export function isIGovActionUpdateCommittee( stuff: any ): stuff is IGovActionUpdateCommittee
{
    return isObject( stuff ) && (
        stuff.govActionId === undefined || isITxOutRef( stuff.govActionId ) &&
        
        Array.isArray( stuff.toRemove ) &&
        (stuff.toRemove as any[]).length > 0 &&
        (stuff.toRemove as any[]).every( elem => elem instanceof Credential ) &&

        Array.isArray( stuff.toAdd ) &&
        (stuff.toAdd as any[]).length > 0 &&
        (stuff.toAdd as any[]).every( isINewCommitteeEntry ) &&
        isRational( stuff.threshold )
    );
}

export class GovActionUpdateCommittee
    implements IGovAction, IGovActionUpdateCommittee, ToCbor, ToData
{
    readonly govActionType: GovActionType.UpdateCommittee;
    readonly govActionId: TxOutRef | undefined;
    readonly toRemove: Credential[];
    readonly toAdd: INewCommitteeEntryBI[];
    readonly threshold: CborPositiveRational;

    constructor(
        { govActionId, toRemove, toAdd, threshold }: IGovActionUpdateCommittee,
        readonly cborRef: SubCborRef | undefined = undefined
    )
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
    
    toData( v?: ToDataVersion ): DataConstr
    {
        v = "v3"; // only one supported so far
        return new DataConstr(
            4, [
                maybeData( this.govActionId?.toData( v ) ),
                new DataList( this.toRemove.map( cred => cred.toData( v ) ) ),
                new DataMap( this.toAdd.map(({ coldCredential, epoch }) =>
                        new DataPair(
                            coldCredential.toData( v ),
                            new DataI( epoch )
                        )
                    )
                ),
                new DataConstr(
                    0, [
                        new DataI( this.threshold.num ),
                        new DataI( this.threshold.den ),
                    ]
                )
            ] 
        );
    }
}