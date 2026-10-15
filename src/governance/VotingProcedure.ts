import { getSubCborRef } from "../utils/getSubCborRef";
import { cborArray, cborInt, nullOr } from "../utils/strictCbor";
import { Cbor, CborArray, CborBytes, CborObj, CborSimple, CborString, CborText, CborUInt, SubCborRef } from "@harmoniclabs/cbor";
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

    constructor(
        { vote, anchor }: IVotingProcedure,
        readonly cborRef: SubCborRef | undefined = undefined
    )
    {
        Object.defineProperties(
            this, {
                vote: { value: vote, ...roDescr },
                anchor: { value: anchor ? new Anchor( anchor ) : undefined, ...roDescr }
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
    toCborObj(): CborObj
    {
        if( this.cborRef instanceof SubCborRef )
        {
            // TODO: validate cbor structure
            // we assume correctness here
            return Cbor.parse( this.cborRef.toBuffer() );
        }
        return new CborArray([
            voteToCborObj( this.vote ),
            this.anchor?.toCborObj() ?? new CborSimple( null )
        ]);
    }

    /** `[vote, anchor / null]`. */
    /**
     * cardano-ledger `DecCBOR VotingProcedure`: below protocol version 12 a `RecD`
     * record (definite array of exactly two): the vote (`decodeEnumBounded`, an `Int`
     * in 0..2) and an anchor or null.
     */
    static fromCborObj( cObj: CborObj ): VotingProcedure
    {
        const [ vote, anchorObj ] = cborArray( cObj, "VotingProcedure", { len: 2, definite: true } );
        const v = cborInt( vote, "VotingProcedure vote", BigInt( 0 ), BigInt( 2 ) );
        const anchor = nullOr( anchorObj, Anchor.fromCborObj );
        return new VotingProcedure({ vote: Number( v ) as Vote, anchor }, getSubCborRef( cObj ));
    }
}