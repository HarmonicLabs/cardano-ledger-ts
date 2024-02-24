import { CborString, Cbor, CborObj, CborArray, CborText, CborBytes, CborUInt, CborSimple } from "@harmoniclabs/cbor";
import { roDescr } from "../utils/roDescr";
import { Anchor, IAnchor } from "./Anchor";
import { Vote, voteToCborObj } from "./Vote";

export interface IVotingProcedure {
    vote: Vote,
    anchor?: IAnchor | undefined
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
        return Cbor.encode( this.toCborObj() )
    }
    toCborObj(): CborObj
    {
        return new CborArray([
            voteToCborObj( this.vote ),
            this.anchor?.toCborObj() ?? new CborSimple( null )
        ]);
    }
}