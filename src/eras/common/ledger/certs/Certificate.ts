import { CborArray, CborObj, CborUInt } from "@harmoniclabs/cbor";
import { CertAuthCommitteeHot, ICertAuthCommitteeHot } from "./CertAuthCommitteeHot";
import { CertGenesisKeyDelegation, ICertGenesisKeyDelegation } from "./CertGenesisKeyDelegation";
import { CertPoolRegistration, ICertPoolRegistration } from "./CertPoolRegistration";
import { CertPoolRetirement, ICertPoolRetirement } from "./CertPoolRetirement";
import { CertRegistrationDeposit, ICertRegistrationDeposit } from "./CertRegistrationDeposit";
import { CertRegistrationDrep, ICertRegistrationDrep } from "./CertRegistrationDrep";
import { CertResignCommitteeCold, ICertResignCommitteeCold } from "./CertResignCommitteeCold";
import { CertStakeDeRegistration, ICertStakeDeRegistration } from "./CertStakeDeRegistration";
import { CertStakeDelegation, ICertStakeDelegation } from "./CertStakeDelegation";
import { CertStakeRegistration, ICertStakeRegistration } from "./CertStakeRegistration";
import { CertStakeVoteDeleg, ICertStakeVoteDeleg } from "./CertStakeVoteDeleg";
import { CertStakeVoteRegistrationDeleg, ICertStakeVoteRegistrationDeleg } from "./CertStakeVoteRegistrationDeleg";
import { CertUnRegistrationDeposit, ICertUnRegistrationDeposit } from "./CertUnRegistrationDeposit";
import { CertUnRegistrationDrep, ICertUnRegistrationDrep } from "./CertUnRegistrationDrep";
import { CertUpdateDrep, ICertUpdateDrep } from "./CertUpdateDrep";
import { CertVoteDeleg, ICertVoteDeleg } from "./CertVoteDeleg";
import { CertVoteRegistrationDeleg, ICertVoteRegistrationDeleg } from "./CertVoteRegistrationDeleg";
import { CertificateType, isCertificateType } from "./CertificateType";
import { IMoveInstantRewardsCert, MoveInstantRewardsCert } from "./MoveInstantRewardsCert";
import { CertStakeRegistrationDeleg, ICertStakeRegistrationDeleg } from "./CertStakeRegistrationDeleg";

export type Certificate
    = CertStakeRegistration
    | CertStakeDeRegistration
    | CertStakeDelegation
    | CertPoolRegistration
    | CertPoolRetirement
    | CertGenesisKeyDelegation
    | MoveInstantRewardsCert
    | CertRegistrationDeposit
    | CertUnRegistrationDeposit
    | CertVoteDeleg
    | CertStakeVoteDeleg
    | CertStakeRegistrationDeleg
    | CertVoteRegistrationDeleg
    | CertStakeVoteRegistrationDeleg
    | CertAuthCommitteeHot
    | CertResignCommitteeCold
    | CertRegistrationDrep
    | CertUnRegistrationDrep
    | CertUpdateDrep;

export function isCertificate( stuff: any ): stuff is Certificate
{
    return (
        stuff instanceof CertStakeRegistration ||
        stuff instanceof CertStakeDeRegistration ||
        stuff instanceof CertStakeDelegation ||
        stuff instanceof CertPoolRegistration ||
        stuff instanceof CertPoolRetirement ||
        stuff instanceof CertGenesisKeyDelegation ||
        stuff instanceof MoveInstantRewardsCert ||
        stuff instanceof CertRegistrationDeposit ||
        stuff instanceof CertUnRegistrationDeposit ||
        stuff instanceof CertVoteDeleg ||
        stuff instanceof CertStakeVoteDeleg ||
        stuff instanceof CertStakeRegistrationDeleg ||
        stuff instanceof CertVoteRegistrationDeleg ||
        stuff instanceof CertStakeVoteRegistrationDeleg ||
        stuff instanceof CertAuthCommitteeHot ||
        stuff instanceof CertResignCommitteeCold ||
        stuff instanceof CertRegistrationDrep ||
        stuff instanceof CertUnRegistrationDrep ||
        stuff instanceof CertUpdateDrep
    );
}

export function certificateFromCborObj( cbor: CborObj ): Certificate
{
    if(!(
        cbor instanceof CborArray &&
        cbor.array.length > 0 &&
        cbor.array[0] instanceof CborUInt
    )) throw new Error("invalid cbor for 'Certificate'");

    const certType = Number( cbor.array[0].num ) as CertificateType;

    if( !isCertificateType( certType ) )
    throw new Error("invalid certType for 'Certificate'; " + (certType as number).toString() );

    switch( certType )
    {
        case CertificateType.StakeRegistration: return CertStakeRegistration.fromCborObj( cbor );
        case CertificateType.StakeDeRegistration: return CertStakeDeRegistration.fromCborObj( cbor );
        case CertificateType.StakeDelegation: return CertStakeDelegation.fromCborObj( cbor );
        case CertificateType.PoolRegistration: return CertPoolRegistration.fromCborObj( cbor );
        case CertificateType.PoolRetirement: return CertPoolRetirement.fromCborObj( cbor );
        case CertificateType.RegistrationDeposit: return CertRegistrationDeposit.fromCborObj( cbor );
        case CertificateType.UnRegistrationDeposit: return CertUnRegistrationDeposit.fromCborObj( cbor );
        case CertificateType.VoteDeleg: return CertVoteDeleg.fromCborObj( cbor );
        case CertificateType.StakeVoteDeleg: return CertStakeVoteDeleg.fromCborObj( cbor );
        case CertificateType.StakeRegistrationDeleg: return CertStakeRegistrationDeleg.fromCborObj( cbor );
        case CertificateType.VoteRegistrationDeleg: return CertVoteRegistrationDeleg.fromCborObj( cbor );
        case CertificateType.StakeVoteRegistrationDeleg: return CertStakeVoteRegistrationDeleg.fromCborObj( cbor );
        case CertificateType.AuthCommitteeHot: return CertAuthCommitteeHot.fromCborObj( cbor );
        case CertificateType.ResignCommitteeCold: return CertResignCommitteeCold.fromCborObj( cbor );
        case CertificateType.RegistrationDrep: return CertRegistrationDrep.fromCborObj( cbor );
        case CertificateType.UnRegistrationDrep: return CertUnRegistrationDrep.fromCborObj( cbor );
        case CertificateType.UpdateDrep: return CertUpdateDrep.fromCborObj( cbor );
        case CertificateType.GenesisKeyDelegation: return CertGenesisKeyDelegation.fromCborObj( cbor );
        case CertificateType.MoveInstantRewards: return MoveInstantRewardsCert.fromCborObj( cbor );
        default: throw new Error("unknown cert type");
    }
}

export type CertificateLike
    = { certType: CertificateType.StakeRegistration } & ICertStakeRegistration
    | { certType: CertificateType.StakeDeRegistration } & ICertStakeDeRegistration
    | { certType: CertificateType.StakeDelegation } & ICertStakeDelegation
    | { certType: CertificateType.PoolRegistration } & ICertPoolRegistration
    | { certType: CertificateType.PoolRetirement } & ICertPoolRetirement
    | { certType: CertificateType.RegistrationDeposit } & ICertRegistrationDeposit
    | { certType: CertificateType.UnRegistrationDeposit } & ICertUnRegistrationDeposit
    | { certType: CertificateType.VoteDeleg } & ICertVoteDeleg
    | { certType: CertificateType.StakeVoteDeleg } & ICertStakeVoteDeleg
    | { certType: CertificateType.StakeRegistrationDeleg } & ICertStakeRegistrationDeleg
    | { certType: CertificateType.StakeRegistration } & ICertStakeRegistration
    | { certType: CertificateType.VoteRegistrationDeleg } & ICertVoteRegistrationDeleg
    | { certType: CertificateType.StakeVoteRegistrationDeleg } & ICertStakeVoteRegistrationDeleg
    | { certType: CertificateType.AuthCommitteeHot } & ICertAuthCommitteeHot
    | { certType: CertificateType.ResignCommitteeCold } & ICertResignCommitteeCold
    | { certType: CertificateType.RegistrationDrep } & ICertRegistrationDrep
    | { certType: CertificateType.UnRegistrationDrep } & ICertUnRegistrationDrep
    | { certType: CertificateType.UpdateDrep } & ICertUpdateDrep
    | { certType: CertificateType.GenesisKeyDelegation } & ICertGenesisKeyDelegation
    | { certType: CertificateType.MoveInstantRewards } & IMoveInstantRewardsCert;

export function certificateFromCertificateLike( like: CertificateLike ): Certificate
{
    switch( like.certType as CertificateType )
    {
        case CertificateType.StakeRegistration: return new CertStakeRegistration( like as ICertStakeRegistration );
        case CertificateType.StakeDeRegistration: return new CertStakeDeRegistration( like as ICertStakeDeRegistration );
        case CertificateType.StakeDelegation: return new CertStakeDelegation( like as ICertStakeDelegation );
        case CertificateType.PoolRegistration: return new CertPoolRegistration( like as ICertPoolRegistration );
        case CertificateType.PoolRetirement: return new CertPoolRetirement( like as ICertPoolRetirement );
        case CertificateType.RegistrationDeposit: return new CertRegistrationDeposit( like as ICertRegistrationDeposit );
        case CertificateType.UnRegistrationDeposit: return new CertUnRegistrationDeposit( like as ICertUnRegistrationDeposit );
        case CertificateType.VoteDeleg: return new CertVoteDeleg( like as ICertVoteDeleg );
        case CertificateType.StakeVoteDeleg: return new CertStakeVoteDeleg( like as ICertStakeVoteDeleg );
        case CertificateType.StakeRegistrationDeleg: return new CertStakeRegistrationDeleg( like as ICertStakeRegistrationDeleg )
        case CertificateType.StakeRegistration: return new CertStakeRegistration( like as ICertStakeRegistration );
        case CertificateType.VoteRegistrationDeleg: return new CertVoteRegistrationDeleg( like as ICertVoteRegistrationDeleg );
        case CertificateType.StakeVoteRegistrationDeleg: return new CertStakeVoteRegistrationDeleg( like as ICertStakeVoteRegistrationDeleg );
        case CertificateType.AuthCommitteeHot: return new CertAuthCommitteeHot( like as ICertAuthCommitteeHot );
        case CertificateType.ResignCommitteeCold: return new CertResignCommitteeCold( like as ICertResignCommitteeCold );
        case CertificateType.RegistrationDrep: return new CertRegistrationDrep( like as ICertRegistrationDrep );
        case CertificateType.UnRegistrationDrep: return new CertUnRegistrationDrep( like as ICertUnRegistrationDrep );
        case CertificateType.UpdateDrep: return new CertUpdateDrep( like as ICertUpdateDrep );
        case CertificateType.GenesisKeyDelegation: return new CertGenesisKeyDelegation( like as ICertGenesisKeyDelegation );
        case CertificateType.MoveInstantRewards: return new MoveInstantRewardsCert( like as IMoveInstantRewardsCert );
    }
}