import { CanBeCborString, Cbor, CborArray, CborBytes, CborObj, CborSimple, CborString, CborText, CborUInt, forceCborString } from "@harmoniclabs/cbor";
import { toHex } from "@harmoniclabs/uint8array-utils";
import { Hash32 } from "../../../hashes";
import { ByronAttributes } from "../common/ByronAttributes";
import { ByronBlockVersion } from "./ByronBlockVersion";
import { ByronBlockVersionMod } from "./ByronBlockVersion";

export interface IByronUpdateProposal {
    blockVersion: ByronBlockVersion;
    blockVersionMod: ByronBlockVersionMod;
    softwareVersion: [string, number];
    data: CborObj;              // {* systemTag => updata}; preserved verbatim
    attributes: ByronAttributes;
    from: Uint8Array;           // proposer pubkey
    signature: Uint8Array;
}

/**
 * Byron `upprop` (update proposal), 7 fields:
 * `[ bver, bvermod, [text, u32], data, attributes, from: pubkey, signature ]`.
 *
 * The `data` field is a map of `systemTag => [installer hashes]` and is preserved
 * as raw CBOR; everything else is modelled.
 */
export class ByronUpdateProposal implements IByronUpdateProposal
{
    readonly blockVersion: ByronBlockVersion;
    readonly blockVersionMod: ByronBlockVersionMod;
    readonly softwareVersion: [string, number];
    readonly data: CborObj;
    readonly attributes: ByronAttributes;
    readonly from: Uint8Array;
    readonly signature: Uint8Array;

    constructor( p: IByronUpdateProposal )
    {
        this.blockVersion = p.blockVersion;
        this.blockVersionMod = p.blockVersionMod;
        this.softwareVersion = [ p.softwareVersion[0], Number( p.softwareVersion[1] ) ];
        this.data = p.data;
        this.attributes = p.attributes ?? new ByronAttributes();
        this.from = p.from;
        this.signature = p.signature;
    }

    clone(): ByronUpdateProposal
    {
        return new ByronUpdateProposal({
            blockVersion: this.blockVersion.clone(),
            blockVersionMod: this.blockVersionMod.clone(),
            softwareVersion: [ this.softwareVersion[0], this.softwareVersion[1] ],
            data: this.data.clone(),
            attributes: this.attributes.clone(),
            from: this.from.slice(),
            signature: this.signature.slice()
        });
    }

    toCborObj(): CborArray
    {
        return new CborArray([
            this.blockVersion.toCborObj(),
            this.blockVersionMod.toCborObj(),
            new CborArray([ new CborText( this.softwareVersion[0] ), new CborUInt( this.softwareVersion[1] ) ]),
            this.data,
            this.attributes.toCborObj(),
            new CborBytes( this.from ),
            new CborBytes( this.signature )
        ]);
    }
    toCbor(): CborString { return Cbor.encode( this.toCborObj() ) as any as CborString; }
    toCborBytes(): Uint8Array { return Cbor.encode( this.toCborObj() ); }

    static fromCborObj( cObj: CborObj ): ByronUpdateProposal
    {
        if(!(
            cObj instanceof CborArray && cObj.array.length === 7 &&
            cObj.array[2] instanceof CborArray &&
            cObj.array[2].array[0] instanceof CborText &&
            cObj.array[2].array[1] instanceof CborUInt &&
            cObj.array[5] instanceof CborBytes &&
            cObj.array[6] instanceof CborBytes
        )) throw new Error("invalid CBOR for Byron upprop");
        return new ByronUpdateProposal({
            blockVersion: ByronBlockVersion.fromCborObj( cObj.array[0] ),
            blockVersionMod: ByronBlockVersionMod.fromCborObj( cObj.array[1] ),
            softwareVersion: [ cObj.array[2].array[0].text, Number( cObj.array[2].array[1].num ) ],
            data: cObj.array[3],
            attributes: ByronAttributes.fromCborObj( cObj.array[4] ),
            from: cObj.array[5].bytes,
            signature: cObj.array[6].bytes
        });
    }
    static fromCbor( cStr: CanBeCborString ): ByronUpdateProposal
    {
        return ByronUpdateProposal.fromCborObj( Cbor.parse( forceCborString( cStr ) ) );
    }

    toJSON() { return this.toJson(); }
    toJson()
    {
        return {
            blockVersion: this.blockVersion.toJson(),
            blockVersionMod: this.blockVersionMod.toJson(),
            softwareVersion: this.softwareVersion,
            attributes: this.attributes.toJson(),
            from: toHex( this.from ),
            signature: toHex( this.signature )
        };
    }
}

/**
 * Byron `upvote = [ voter: pubkey, proposalId: updid, vote: bool, signature ]`.
 */
export class ByronUpdateVote
{
    readonly voter: Uint8Array;
    readonly proposalId: Hash32;
    readonly vote: boolean;
    readonly signature: Uint8Array;

    constructor( v: { voter: Uint8Array; proposalId: Hash32; vote: boolean; signature: Uint8Array } )
    {
        this.voter = v.voter;
        this.proposalId = v.proposalId;
        this.vote = !!v.vote;
        this.signature = v.signature;
    }

    clone(): ByronUpdateVote
    {
        return new ByronUpdateVote({ voter: this.voter.slice(), proposalId: this.proposalId.clone(), vote: this.vote, signature: this.signature.slice() });
    }

    toCborObj(): CborArray
    {
        return new CborArray([
            new CborBytes( this.voter ),
            this.proposalId.toCborObj(),
            new CborSimple( this.vote ),
            new CborBytes( this.signature )
        ]);
    }
    toCbor(): CborString { return Cbor.encode( this.toCborObj() ) as any as CborString; }
    toCborBytes(): Uint8Array { return Cbor.encode( this.toCborObj() ); }

    static fromCborObj( cObj: CborObj ): ByronUpdateVote
    {
        if(!(
            cObj instanceof CborArray && cObj.array.length === 4 &&
            cObj.array[0] instanceof CborBytes &&
            cObj.array[2] instanceof CborSimple &&
            cObj.array[3] instanceof CborBytes
        )) throw new Error("invalid CBOR for Byron upvote");
        return new ByronUpdateVote({
            voter: cObj.array[0].bytes,
            proposalId: Hash32.fromCborObj( cObj.array[1] ),
            vote: !!cObj.array[2].simple,
            signature: cObj.array[3].bytes
        });
    }
    static fromCbor( cStr: CanBeCborString ): ByronUpdateVote
    {
        return ByronUpdateVote.fromCborObj( Cbor.parse( forceCborString( cStr ) ) );
    }

    toJSON() { return this.toJson(); }
    toJson() { return { voter: toHex(this.voter), proposalId: this.proposalId.toString(), vote: this.vote, signature: toHex(this.signature) }; }
}

export interface IByronUpdate {
    proposal?: ByronUpdateProposal;
    votes: ByronUpdateVote[];
}

/**
 * Byron `up = [ [? upprop], [* upvote] ]` — the block's update payload.
 * The proposal slot is a definite 0-or-1 array; the votes list is indefinite-length.
 */
export class ByronUpdate implements IByronUpdate
{
    readonly proposal?: ByronUpdateProposal;
    readonly votes: ByronUpdateVote[];

    constructor( up: IByronUpdate )
    {
        this.proposal = up.proposal;
        this.votes = ( up.votes ?? [] ).slice();
    }

    clone(): ByronUpdate
    {
        return new ByronUpdate({ proposal: this.proposal?.clone(), votes: this.votes.map( v => v.clone() ) });
    }

    toCborObj(): CborArray
    {
        return new CborArray([
            new CborArray( this.proposal ? [ this.proposal.toCborObj() ] : [] ),
            new CborArray( this.votes.map( v => v.toCborObj() ), { indefinite: true } )
        ]);
    }
    toCbor(): CborString { return Cbor.encode( this.toCborObj() ) as any as CborString; }
    toCborBytes(): Uint8Array { return Cbor.encode( this.toCborObj() ); }

    static fromCborObj( cObj: CborObj ): ByronUpdate
    {
        if(!(
            cObj instanceof CborArray && cObj.array.length === 2 &&
            cObj.array[0] instanceof CborArray &&
            cObj.array[1] instanceof CborArray
        )) throw new Error("invalid CBOR for Byron up (update payload)");
        return new ByronUpdate({
            proposal: cObj.array[0].array.length > 0 ? ByronUpdateProposal.fromCborObj( cObj.array[0].array[0] ) : undefined,
            votes: cObj.array[1].array.map( ByronUpdateVote.fromCborObj )
        });
    }
    static fromCbor( cStr: CanBeCborString ): ByronUpdate
    {
        return ByronUpdate.fromCborObj( Cbor.parse( forceCborString( cStr ) ) );
    }

    toJSON() { return this.toJson(); }
    toJson()
    {
        return { proposal: this.proposal?.toJson() ?? null, votes: this.votes.map( v => v.toJson() ) };
    }
}
