import { CborArray, CborBytes, CborUInt } from "@harmoniclabs/cbor";
import { CanBeHash28, Hash28, canBeHash28 } from "../hashes";
import { isObject } from "@harmoniclabs/obj-utils";
import { uint8ArrayEq } from "@harmoniclabs/uint8array-utils";
import { DataConstr, ToData } from "@harmoniclabs/plutus-data";
import { Credential } from "../credentials";
import { ToDataVersion } from "../toData/defaultToDataVersion";

export enum VoterKind {
    ConstitutionalCommitteKeyHash = 0,
    ConstitutionalCommitteScript = 1,
    DRepKeyHash = 3,
    DRepScript = 4,
    StakingPoolKeyHash = 5
}

Object.freeze( VoterKind );

export function isVoterKind( stuff: any ): stuff is VoterKind
{
    const n = Number( stuff );
    return (
        typeof stuff === "number" &&
        stuff >= 0 && stuff <= 5 &&
        stuff === Math.round( stuff )
    );
}

export interface IVoter {
    kind: VoterKind;
    hash: CanBeHash28;
}

export function isIVoter( stuff: any ): stuff is IVoter
{
    if( !isObject( stuff ) ) return false;

    return (
        isVoterKind( stuff.kind ) &&
        canBeHash28( stuff.hash )
    );
}

export function eqIVoter( a: IVoter, b: IVoter ): boolean
{
    if( !isObject( a ) ) return false;
    if( !isObject( b ) ) return false;

    try {
        return (
            isVoterKind( a.kind ) && a.kind === b.kind &&
            canBeHash28( a.hash ) &&
            canBeHash28( b.hash ) &&
            uint8ArrayEq(
                new Hash28( a.hash ).toBuffer(),
                new Hash28( b.hash ).toBuffer()
            )
        );
    } catch {
        return false;
    }
}

export class Voter
    implements IVoter, ToData
{
    readonly kind: VoterKind;
    readonly hash: Hash28;

    constructor({ kind, hash }: IVoter)
    {
        Object.defineProperties(
            this, {
                kind: { value: kind, writable: false, enumerable: true, configurable: false },
                hash: { value: new Hash28( hash ), writable: false, enumerable: true, configurable: false },
            }
        );
    }

    static ConstitutionalCommitteKeyHash( hash: CanBeHash28 ): Voter
    {
        return new Voter({ kind: VoterKind.ConstitutionalCommitteKeyHash, hash });
    }
    static ConstitutionalCommitteScript( hash: CanBeHash28 ): Voter
    {
        return new Voter({ kind: VoterKind.ConstitutionalCommitteScript, hash });
    }
    static DRepKeyHash( hash: CanBeHash28 ): Voter
    {
        return new Voter({ kind: VoterKind.DRepKeyHash, hash });
    }
    static DRepScript( hash: CanBeHash28 ): Voter
    {
        return new Voter({ kind: VoterKind.DRepScript, hash });
    }
    static StakingPoolKeyHash( hash: CanBeHash28 ): Voter
    {
        return new Voter({ kind: VoterKind.StakingPoolKeyHash, hash });
    }

    toCborObj(): CborArray
    {
        return new CborArray([
            new CborUInt( this.kind ),
            new CborBytes( this.hash.toBuffer() )
        ]);
    }

    toData( version?: ToDataVersion ): DataConstr
    {
        version = "v3"; // only supported for voter so far

        const idx = (
            (
                this.kind === VoterKind.ConstitutionalCommitteKeyHash ||
                this.kind === VoterKind.ConstitutionalCommitteScript
            ) ? 0 : (
                this.kind === VoterKind.DRepKeyHash ||
                this.kind === VoterKind.DRepScript
                ? 1 : 2
            ) 
        );

        const arg = (
            (
                this.kind === VoterKind.ConstitutionalCommitteKeyHash ||
                this.kind === VoterKind.DRepKeyHash
            ) ? 
            Credential.keyHash( this.hash ).toData( version ) :
            (
                this.kind === VoterKind.ConstitutionalCommitteScript ||
                this.kind === VoterKind.DRepScript ?
                Credential.script( this.hash ).toData( version ) :
                this.hash.toData( version )
            )
        );

        return new DataConstr( idx, [ arg ] );
    }
}