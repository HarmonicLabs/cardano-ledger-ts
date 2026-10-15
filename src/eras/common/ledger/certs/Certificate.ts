import { CborArray, CborObj, CborUInt } from "@harmoniclabs/cbor";
import { cborUInt, decodeVersionAtLeast, expectSize, recordSum } from "../../../../utils/strictCbor";
import { ConwayCertAuthCommitteeHot, IConwayCertAuthCommitteeHot } from "../../../conway/governance/certs/ConwayCertAuthCommitteeHot";
import { CertGenesisKeyDelegation, ICertGenesisKeyDelegation } from "./CertGenesisKeyDelegation";
import { CertPoolRegistration, ICertPoolRegistration } from "./CertPoolRegistration";
import { CertPoolRetirement, ICertPoolRetirement } from "./CertPoolRetirement";
import { ConwayCertRegistrationDeposit, IConwayCertRegistrationDeposit } from "../../../conway/governance/certs/ConwayCertRegistrationDeposit";
import { ConwayCertRegistrationDrep, IConwayCertRegistrationDrep } from "../../../conway/governance/certs/ConwayCertRegistrationDrep";
import { ConwayCertResignCommitteeCold, IConwayCertResignCommitteeCold } from "../../../conway/governance/certs/ConwayCertResignCommitteeCold";
import { CertStakeDeRegistration, ICertStakeDeRegistration } from "./CertStakeDeRegistration";
import { CertStakeDelegation, ICertStakeDelegation } from "./CertStakeDelegation";
import { CertStakeRegistration, ICertStakeRegistration } from "./CertStakeRegistration";
import { ConwayCertStakeVoteDeleg, IConwayCertStakeVoteDeleg } from "../../../conway/governance/certs/ConwayCertStakeVoteDeleg";
import { ConwayCertStakeVoteRegistrationDeleg, IConwayCertStakeVoteRegistrationDeleg } from "../../../conway/governance/certs/ConwayCertStakeVoteRegistrationDeleg";
import { ConwayCertUnRegistrationDeposit, IConwayCertUnRegistrationDeposit } from "../../../conway/governance/certs/ConwayCertUnRegistrationDeposit";
import { ConwayCertUnRegistrationDrep, IConwayCertUnRegistrationDrep } from "../../../conway/governance/certs/ConwayCertUnRegistrationDrep";
import { ConwayCertUpdateDrep, IConwayCertUpdateDrep } from "../../../conway/governance/certs/ConwayCertUpdateDrep";
import { ConwayCertVoteDeleg, IConwayCertVoteDeleg } from "../../../conway/governance/certs/ConwayCertVoteDeleg";
import { ConwayCertVoteRegistrationDeleg, IConwayCertVoteRegistrationDeleg } from "../../../conway/governance/certs/ConwayCertVoteRegistrationDeleg";
import { CertificateType, isCertificateType } from "./CertificateType";
import { IConwayMoveInstantRewardsCert, ConwayMoveInstantRewardsCert } from "../../../conway/governance/certs/ConwayMoveInstantRewardsCert";
import { ConwayCertStakeRegistrationDeleg, IConwayCertStakeRegistrationDeleg } from "../../../conway/governance/certs/ConwayCertStakeRegistrationDeleg";

export type Certificate
    = CertStakeRegistration
    | CertStakeDeRegistration
    | CertStakeDelegation
    | CertPoolRegistration
    | CertPoolRetirement
    | CertGenesisKeyDelegation
    | ConwayMoveInstantRewardsCert
    | ConwayCertRegistrationDeposit
    | ConwayCertUnRegistrationDeposit
    | ConwayCertVoteDeleg
    | ConwayCertStakeVoteDeleg
    | ConwayCertStakeRegistrationDeleg
    | ConwayCertVoteRegistrationDeleg
    | ConwayCertStakeVoteRegistrationDeleg
    | ConwayCertAuthCommitteeHot
    | ConwayCertResignCommitteeCold
    | ConwayCertRegistrationDrep
    | ConwayCertUnRegistrationDrep
    | ConwayCertUpdateDrep;

export function isCertificate( stuff: any ): stuff is Certificate
{
    return (
        stuff instanceof CertStakeRegistration ||
        stuff instanceof CertStakeDeRegistration ||
        stuff instanceof CertStakeDelegation ||
        stuff instanceof CertPoolRegistration ||
        stuff instanceof CertPoolRetirement ||
        stuff instanceof CertGenesisKeyDelegation ||
        stuff instanceof ConwayMoveInstantRewardsCert ||
        stuff instanceof ConwayCertRegistrationDeposit ||
        stuff instanceof ConwayCertUnRegistrationDeposit ||
        stuff instanceof ConwayCertVoteDeleg ||
        stuff instanceof ConwayCertStakeVoteDeleg ||
        stuff instanceof ConwayCertStakeRegistrationDeleg ||
        stuff instanceof ConwayCertVoteRegistrationDeleg ||
        stuff instanceof ConwayCertStakeVoteRegistrationDeleg ||
        stuff instanceof ConwayCertAuthCommitteeHot ||
        stuff instanceof ConwayCertResignCommitteeCold ||
        stuff instanceof ConwayCertRegistrationDrep ||
        stuff instanceof ConwayCertUnRegistrationDrep ||
        stuff instanceof ConwayCertUpdateDrep
    );
}

/** number of array elements of each certificate (tag included), cardano-ledger `TxCert` decoders */
const certSizes: { [tag: number]: number } = {
    0: 2, 1: 2, 2: 3, 3: 10, 4: 3, 5: 4, 6: 2,
    7: 3, 8: 3, 9: 3, 10: 4, 11: 4, 12: 4, 13: 5, 14: 3, 15: 3, 16: 4, 17: 3, 18: 3
};
/** Word64 fields (index in the array) of each certificate: epoch and deposits */
const certWord64Fields: { [tag: number]: number } = {
    4: 2, 7: 2, 8: 2, 11: 3, 12: 3, 13: 4, 16: 2, 17: 2
};

/**
 * cardano-ledger `DecCBOR TxCert` (`decodeRecordSum`): an array (definite or
 * indefinite) whose first element is the certificate tag; a definite array has
 * exactly the certificate's size. From protocol version 9 (Conway) genesis
 * delegation (5) and MIR (6) certificates are rejected; below 9 only tags 0-6 exist.
 */
export function certificateFromCborObj( cbor: CborObj ): Certificate
{
    const { tag, size, fields } = recordSum( cbor, "Certificate" );
    const certType = tag as CertificateType;

    if( !isCertificateType( certType ) || certSizes[tag] === undefined )
    throw new Error("invalid certType for 'Certificate'; " + tag.toString() );

    if( decodeVersionAtLeast( 9 ) && ( tag === 5 || tag === 6 ) )
    throw new Error("genesis delegation and MIR certificates are no longer supported");
    if( !decodeVersionAtLeast( 9 ) && tag >= 7 )
    throw new Error("invalid certType for 'Certificate' before Conway; " + tag.toString() );

    expectSize( size, certSizes[tag], "Certificate" );
    const w64 = certWord64Fields[tag];
    if( w64 !== undefined ) cborUInt( fields[ w64 - 1 ], "Certificate" );

    switch( certType )
    {
        case CertificateType.StakeRegistration: return CertStakeRegistration.fromCborObj( cbor );
        case CertificateType.StakeDeRegistration: return CertStakeDeRegistration.fromCborObj( cbor );
        case CertificateType.StakeDelegation: return CertStakeDelegation.fromCborObj( cbor );
        case CertificateType.PoolRegistration: return CertPoolRegistration.fromCborObj( cbor );
        case CertificateType.PoolRetirement: return CertPoolRetirement.fromCborObj( cbor );
        case CertificateType.RegistrationDeposit: return ConwayCertRegistrationDeposit.fromCborObj( cbor );
        case CertificateType.UnRegistrationDeposit: return ConwayCertUnRegistrationDeposit.fromCborObj( cbor );
        case CertificateType.VoteDeleg: return ConwayCertVoteDeleg.fromCborObj( cbor );
        case CertificateType.StakeVoteDeleg: return ConwayCertStakeVoteDeleg.fromCborObj( cbor );
        case CertificateType.StakeRegistrationDeleg: return ConwayCertStakeRegistrationDeleg.fromCborObj( cbor );
        case CertificateType.VoteRegistrationDeleg: return ConwayCertVoteRegistrationDeleg.fromCborObj( cbor );
        case CertificateType.StakeVoteRegistrationDeleg: return ConwayCertStakeVoteRegistrationDeleg.fromCborObj( cbor );
        case CertificateType.AuthCommitteeHot: return ConwayCertAuthCommitteeHot.fromCborObj( cbor );
        case CertificateType.ResignCommitteeCold: return ConwayCertResignCommitteeCold.fromCborObj( cbor );
        case CertificateType.RegistrationDrep: return ConwayCertRegistrationDrep.fromCborObj( cbor );
        case CertificateType.UnRegistrationDrep: return ConwayCertUnRegistrationDrep.fromCborObj( cbor );
        case CertificateType.UpdateDrep: return ConwayCertUpdateDrep.fromCborObj( cbor );
        case CertificateType.GenesisKeyDelegation: return CertGenesisKeyDelegation.fromCborObj( cbor );
        case CertificateType.MoveInstantRewards: return ConwayMoveInstantRewardsCert.fromCborObj( cbor );
        default: throw new Error("unknown cert type");
    }
}

export type CertificateLike
    = { certType: CertificateType.StakeRegistration } & ICertStakeRegistration
    | { certType: CertificateType.StakeDeRegistration } & ICertStakeDeRegistration
    | { certType: CertificateType.StakeDelegation } & ICertStakeDelegation
    | { certType: CertificateType.PoolRegistration } & ICertPoolRegistration
    | { certType: CertificateType.PoolRetirement } & ICertPoolRetirement
    | { certType: CertificateType.RegistrationDeposit } & IConwayCertRegistrationDeposit
    | { certType: CertificateType.UnRegistrationDeposit } & IConwayCertUnRegistrationDeposit
    | { certType: CertificateType.VoteDeleg } & IConwayCertVoteDeleg
    | { certType: CertificateType.StakeVoteDeleg } & IConwayCertStakeVoteDeleg
    | { certType: CertificateType.StakeRegistrationDeleg } & IConwayCertStakeRegistrationDeleg
    | { certType: CertificateType.StakeRegistration } & ICertStakeRegistration
    | { certType: CertificateType.VoteRegistrationDeleg } & IConwayCertVoteRegistrationDeleg
    | { certType: CertificateType.StakeVoteRegistrationDeleg } & IConwayCertStakeVoteRegistrationDeleg
    | { certType: CertificateType.AuthCommitteeHot } & IConwayCertAuthCommitteeHot
    | { certType: CertificateType.ResignCommitteeCold } & IConwayCertResignCommitteeCold
    | { certType: CertificateType.RegistrationDrep } & IConwayCertRegistrationDrep
    | { certType: CertificateType.UnRegistrationDrep } & IConwayCertUnRegistrationDrep
    | { certType: CertificateType.UpdateDrep } & IConwayCertUpdateDrep
    | { certType: CertificateType.GenesisKeyDelegation } & ICertGenesisKeyDelegation
    | { certType: CertificateType.MoveInstantRewards } & IConwayMoveInstantRewardsCert;

export function certificateFromCertificateLike( like: CertificateLike ): Certificate
{
    switch( like.certType as CertificateType )
    {
        case CertificateType.StakeRegistration: return new CertStakeRegistration( like as ICertStakeRegistration );
        case CertificateType.StakeDeRegistration: return new CertStakeDeRegistration( like as ICertStakeDeRegistration );
        case CertificateType.StakeDelegation: return new CertStakeDelegation( like as ICertStakeDelegation );
        case CertificateType.PoolRegistration: return new CertPoolRegistration( like as ICertPoolRegistration );
        case CertificateType.PoolRetirement: return new CertPoolRetirement( like as ICertPoolRetirement );
        case CertificateType.RegistrationDeposit: return new ConwayCertRegistrationDeposit( like as IConwayCertRegistrationDeposit );
        case CertificateType.UnRegistrationDeposit: return new ConwayCertUnRegistrationDeposit( like as IConwayCertUnRegistrationDeposit );
        case CertificateType.VoteDeleg: return new ConwayCertVoteDeleg( like as IConwayCertVoteDeleg );
        case CertificateType.StakeVoteDeleg: return new ConwayCertStakeVoteDeleg( like as IConwayCertStakeVoteDeleg );
        case CertificateType.StakeRegistrationDeleg: return new ConwayCertStakeRegistrationDeleg( like as IConwayCertStakeRegistrationDeleg )
        case CertificateType.StakeRegistration: return new CertStakeRegistration( like as ICertStakeRegistration );
        case CertificateType.VoteRegistrationDeleg: return new ConwayCertVoteRegistrationDeleg( like as IConwayCertVoteRegistrationDeleg );
        case CertificateType.StakeVoteRegistrationDeleg: return new ConwayCertStakeVoteRegistrationDeleg( like as IConwayCertStakeVoteRegistrationDeleg );
        case CertificateType.AuthCommitteeHot: return new ConwayCertAuthCommitteeHot( like as IConwayCertAuthCommitteeHot );
        case CertificateType.ResignCommitteeCold: return new ConwayCertResignCommitteeCold( like as IConwayCertResignCommitteeCold );
        case CertificateType.RegistrationDrep: return new ConwayCertRegistrationDrep( like as IConwayCertRegistrationDrep );
        case CertificateType.UnRegistrationDrep: return new ConwayCertUnRegistrationDrep( like as IConwayCertUnRegistrationDrep );
        case CertificateType.UpdateDrep: return new ConwayCertUpdateDrep( like as IConwayCertUpdateDrep );
        case CertificateType.GenesisKeyDelegation: return new CertGenesisKeyDelegation( like as ICertGenesisKeyDelegation );
        case CertificateType.MoveInstantRewards: return new ConwayMoveInstantRewardsCert( like as IConwayMoveInstantRewardsCert );
    }
}