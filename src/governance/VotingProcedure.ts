import { CborString, Cbor, CborObj, CborArray, CborText, CborBytes, CborUInt, CborSimple } from "@harmoniclabs/cbor";
import { roDescr } from "../utils/roDescr";
import { Anchor, IAnchor, isIAnchor } from "./Anchor";
import { Vote, isVote, voteToCborObj } from "./Vote";
import { isObject } from "@harmoniclabs/obj-utils";

export interface IVotingProcedure {
    vote: Vote,
    anchor?: IAnchor | undefined
}

export function IVotingProcedure( stuff: any ): stuff is IVotingProcedure
{
    return isObject( stuff ) && (
        isVote( stuff.vote ) && (
            stuff.anchor === undefined ||
            isIAnchor( stuff.anchor )
        )
    );
}

export class VotingProcedure
    implements IVotingProcedure
{
    readonly vote: Vote;
    readonly anchor: Anchor | undefined;

    constructor({ vote, anchor }: IVotingProcedure)
    {
        Object.defineProperties(
            this, {
                vote: { value: vote, ...roDescr },
                anchor: { value: anchor ? new Anchor( anchor ) : undefined, ...roDescr }
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
    toCborObj(): CborObj
    {
        if( this.subCborRef instanceof SubCborRef )
        {
            // TODO: validate cbor structure
            // we assume correctness here
            return Cbor.parse( this.subCborRef.toBuffer() );
        }
        return new CborArray([
            voteToCborObj( this.vote ),
            this.anchor?.toCborObj() ?? new CborSimple( null )
        ]);
    }
}