import { getSubCborRef } from "../utils/getSubCborRef";
import { CborString, Cbor, CborObj, CborMap, SubCborRef } from "@harmoniclabs/cbor";
import { roDescr } from "../utils/roDescr";
import { IVoter, Voter, isIVoter } from "./Voter";
import { IVotingProcedure, VotingProcedure } from "./VotingProcedure";
import { isObject } from "@harmoniclabs/obj-utils";
import { isITxOutRef, ITxOutRef, TxOutRef } from "../eras/common/tx/TxOutRef";

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
        return this.toCbor();
    }
    toCbor(): CborString
    {
        if( this.cborRef instanceof SubCborRef )
        {
            // TODO: validate cbor structure
            // we assume correctness here
            return this.cborRef.toBuffer();
        }
        
        return Cbor.encode( this.toCborObj() )
    }
    /** `{ voter => { gov_action_id => voting_procedure } }`. */
    static fromCborObj( cObj: CborObj ): VotingProcedures
    {
        if(!( cObj instanceof CborMap )) throw new Error("invalid CBOR for voting_procedures");
        return new VotingProcedures(
            cObj.map.map(({ k, v }) => {
                if(!( v instanceof CborMap )) throw new Error("invalid CBOR for voting_procedures entry");
                return {
                    voter: Voter.fromCborObj( k ),
                    votes: v.map.map(({ k: id, v: proc }) => ({ govActionId: TxOutRef.fromCborObj( id ), vote: VotingProcedure.fromCborObj( proc ) }))
                };
            }),
            getSubCborRef( cObj )
        );
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