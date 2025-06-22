import { CborString, Cbor, CborObj, CborArray, CborText, CborBytes, CborUInt, CborSimple, CborMap, SubCborRef } from "@harmoniclabs/cbor";
import { isObject } from "@harmoniclabs/obj-utils";
import { roDescr } from "../../../utils/roDescr";
import { Anchor, IAnchor } from "./Anchor";
import { Vote, voteToCborObj } from "./Vote";
import { IVoter, Voter, isIVoter } from "./Voter";
import { IVotingProcedure, VotingProcedure } from "./VotingProcedure";
import { ITxOutRef, TxOutRef, isITxOutRef } from "../../common/tx/TxOutRef";

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

//** TO DO: add fromCborObj and toJson */

export class VotingProcedures
{
    readonly procedures: ITypedVotingProcedures

    constructor(
        procedures: IVotingProcedures,
        readonly cborRef: SubCborRef | undefined = undefined
    )
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
    toCborObj(): CborObj
    {
        if( this.cborRef instanceof SubCborRef )
        {
            // TODO: validate cbor structure
            // we assume correctness here
            return Cbor.parse( this.cborRef.toBuffer() );
        }
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