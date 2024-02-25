import { CborString, Cbor, CborObj, CborArray, CborText, CborBytes, CborUInt, CborSimple, CborMap } from "@harmoniclabs/cbor";
import { roDescr } from "../utils/roDescr";
import { Anchor, IAnchor } from "./Anchor";
import { Vote, voteToCborObj } from "./Vote";
import { IVoter, Voter, isIVoter } from "./Voter";
import { IVotingProcedure, VotingProcedure } from "./VotingProcedure";
import { ITxOutRef, TxOutRef, isITxOutRef } from "../tx/body/output/TxOutRef";
import { isObject } from "@harmoniclabs/obj-utils";

export interface IVotingProceduresEntry {
    voter: IVoter,
    votes: {
        govActionId: ITxOutRef,
        vote: IVotingProcedure
    }[]
}

export function isIVotingProceduresEntry( stuff: any ): stuff is IVotingProceduresEntry
{
    if( !isObject( stuff ) ) return false;

    return (
        isIVoter( stuff.voter ) &&
        Array.isArray( stuff.votes ) &&
        (stuff.votes as any[]).every( elem => {
            return (
                isObject( elem ) &&
                isITxOutRef( elem.govActionId ) &&
                IVotingProcedure( elem.vote )
            )
        })
    );
}

export interface ITypedVotingProceduresEntry {
    voter: Voter,
    votes: {
        govActionId: TxOutRef,
        vote: VotingProcedure
    }[]
}

export type IVotingProcedures = IVotingProceduresEntry[]
export type ITypedVotingProcedures = ITypedVotingProceduresEntry[]

export class VotingProcedures
{
    readonly procedures: ITypedVotingProcedures

    constructor( procedures: IVotingProcedures)
    {
        Object.defineProperty(
            this, "procedures", {
                value: procedures.map(({ voter, votes }) => ({
                    voter: new Voter( voter ),
                    votes: votes.map(({ govActionId, vote }) => ({
                        govActionId: new TxOutRef( govActionId ),
                        vote: new VotingProcedure( vote )
                    }))
                })),
                ...roDescr
            }
        );
    }

    toCbor(): CborString
    {
        return Cbor.encode( this.toCborObj() )
    }
    toCborObj(): CborObj
    {
        return new CborMap(
            this.procedures.map(({ voter, votes }) => ({
                k: voter.toCborObj(),
                v: new CborMap(
                    votes.map(({ govActionId, vote }) => ({
                        k: govActionId.toCborObj(),
                        v: new VotingProcedure( vote ).toCborObj()
                    }))
                )
            }))
        );
    }
}