// number is important as it is included in serialization
export enum CertificateType {
    StakeRegistration           = 0, // to-be-deprecated afte conway
    StakeDeRegistration         = 1, // to-be-deprecated afte conway
    StakeDelegation             = 2,
    PoolRegistration            = 3,
    PoolRetirement              = 4,
    /** @deprecated since conway */
    GenesisKeyDelegation        = 5,
    /** @deprecated since conway */
    MoveInstantRewards          = 6,
    // DELEG 
    RegistrationDeposit         = 7,
    UnRegistrationDeposit       = 8,
    VoteDeleg                   = 9,
    StakeVoteDeleg              = 10,
    StakeRegistrationDeleg      = 11,
    VoteRegistrationDeleg       = 12,
    StakeVoteRegistrationDeleg  = 13,
    // GOVCERT
    AuthCommitteeHot            = 14,
    ResignCommitteeCold          = 15,
    RegistrationDrep            = 16,
    UnRegistrationDrep          = 17,
    UpdateDrep                  = 18
};

Object.freeze( CertificateType );

export function isCertificateType( stuff: any ): stuff is CertificateType
{
    return typeof stuff === "number" && (
        stuff >= 0 && stuff <= 18 &&
        stuff === Math.round( stuff )
    );
}

export type CertTypeToStr<CertT extends CertificateType> =
    CertT extends CertificateType.StakeRegistration     ? "StakeRegistration" :
    CertT extends CertificateType.StakeDeRegistration   ? "StakeDeRegistration" :
    CertT extends CertificateType.StakeDelegation       ? "StakeDelegation" :
    CertT extends CertificateType.PoolRegistration      ? "PoolRegistration" :
    CertT extends CertificateType.PoolRetirement        ? "PoolRetirement" :
    CertT extends CertificateType.GenesisKeyDelegation  ? "GenesisKeyDelegation" :
    CertT extends CertificateType.MoveInstantRewards    ? "MoveInstantRewards" :
    CertT extends CertificateType.RegistrationDeposit ? "RegistrationDeposit" :
    CertT extends CertificateType.UnRegistrationDeposit ? "UnRegistrationDeposit" :
    CertT extends CertificateType.VoteDeleg ? "VoteDeleg" :
    CertT extends CertificateType.StakeVoteDeleg ? "StakeVoteDeleg" :
    CertT extends CertificateType.StakeRegistrationDeleg ? "StakeRegistrationDeleg" :
    CertT extends CertificateType.VoteRegistrationDeleg ? "VoteRegistrationDeleg" :
    CertT extends CertificateType.StakeVoteRegistrationDeleg ? "StakeVoteRegistrationDeleg" :
    CertT extends CertificateType.AuthCommitteeHot ? "AuthCommitteeHot" :
    CertT extends CertificateType.ResignCommitteeCold ? "ResignCommitteeCold" :
    CertT extends CertificateType.RegistrationDrep ? "RegistrationDrep" :
    CertT extends CertificateType.UnRegistrationDrep ? "UnRegistrationDrep" :
    CertT extends CertificateType.UpdateDrep ? "UpdateDrep" :
    "";

export function certTypeToString<CertT extends CertificateType>( certT: CertT ): CertTypeToStr<CertT>
{
    switch( certT )
    {
        case CertificateType.StakeRegistration      :  return "StakeRegistration"       as any;
        case CertificateType.StakeDeRegistration    :  return "StakeDeRegistration"     as any;
        case CertificateType.StakeDelegation        :  return "StakeDelegation"         as any;
        case CertificateType.PoolRegistration       :  return "PoolRegistration"        as any;
        case CertificateType.PoolRetirement         :  return "PoolRetirement"          as any;
        case CertificateType.GenesisKeyDelegation   :  return "GenesisKeyDelegation"    as any;
        case CertificateType.MoveInstantRewards     :  return "MoveInstantRewards"      as any;
        case CertificateType.RegistrationDeposit: return "RegistrationDeposit" as any;
        case CertificateType.UnRegistrationDeposit: return "UnRegistrationDeposit" as any;
        case CertificateType.VoteDeleg: return "VoteDeleg" as any;
        case CertificateType.StakeVoteDeleg: return "StakeVoteDeleg" as any;
        case CertificateType.StakeRegistrationDeleg: return "StakeRegistrationDeleg" as any;
        case CertificateType.VoteRegistrationDeleg: return "VoteRegistrationDeleg" as any;
        case CertificateType.StakeVoteRegistrationDeleg: return "StakeVoteRegistrationDeleg" as any;
        case CertificateType.AuthCommitteeHot: return "AuthCommitteeHot" as any;
        case CertificateType.ResignCommitteeCold: return "ResignCommitteeCold" as any;
        case CertificateType.RegistrationDrep: return "RegistrationDrep" as any;
        case CertificateType.UnRegistrationDrep: return "UnRegistrationDrep" as any;
        case CertificateType.UpdateDrep: return "UpdateDrep" as any;
        default: return "" as any;
    }
} 