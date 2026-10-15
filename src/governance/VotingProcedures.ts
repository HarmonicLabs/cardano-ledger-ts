import { getSubCborRef } from "../utils/getSubCborRef";
import { cborMapEntries } from "../utils/strictCbor";
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
    /**
     * cardano-ledger `DecCBOR VotingProcedures`: `Map Voter (Map GovActionId VotingProcedure)`
     * (protocol version 9+: no duplicate keys), every voter with at least one vote.
     */
    static fromCborObj( cObj: CborObj ): VotingProcedures
    {
        const seenVoters = new Set<string>();
        return new VotingProcedures(
            cborMapEntries( cObj, "VotingProcedures" ).map(({ k, v }) => {
                const voter = Voter.fromCborObj( k );
                const vKey = voter.kind + ":" + voter.hash.toString();
                if( seenVoters.has( vKey ) ) throw new Error("invalid CBOR for voting_procedures: duplicate voter");
                seenVoters.add( vKey );
                const entries = cborMapEntries( v, "VotingProcedures votes" );
                if( entries.length === 0 ) throw new Error("invalid CBOR for voting_procedures: voter without votes");
                const seenIds = new Set<string>();
                return {
                    voter,
                    votes: entries.map(({ k: id, v: proc }) => {
                        const govActionId = TxOutRef.govActionIdFromCborObj( id );
                        const idKey = govActionId.toString();
                        if( seenIds.has( idKey ) ) throw new Error("invalid CBOR for voting_procedures: duplicate gov action id");
                        seenIds.add( idKey );
                        return { govActionId, vote: VotingProcedure.fromCborObj( proc ) };
                    })
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