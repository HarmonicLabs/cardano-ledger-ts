import { CborObj, CborPositiveRational } from "@harmoniclabs/cbor";
import { boundedRational, cborArray, cborMapEntries, cborSet, cborUInt, decodeVersionAtLeast, expectSize, noDuplicates, nullOr, recordSum } from "../utils/strictCbor";
import { Credential } from "../credentials";
import { Hash28 } from "../hashes";
import { TxWithdrawals } from "../ledger/TxWithdrawals";
import { ProtocolVersion } from "../ledger/protocol/protocolVersion";
import { partialConwayProtocolParametersFromCborObj } from "../eras/conway/protocol/ConwayProtocolParameters";
import { TxOutRef } from "../eras/common/tx/TxOutRef";
import { Anchor } from "./Anchor";
import { GovAction } from "./GovAction/GovAction";
import { GovActionType } from "./GovAction/GovActionType";
import { toRealGovAction, GovActionLike } from "./GovAction/GovActionLike";

/** `decodeNullStrictMaybe decCBOR` for the previous gov action id (a `RecD` record) */
function govActionIdOf( c: CborObj | undefined ): TxOutRef | undefined
{
    return nullOr( c, TxOutRef.govActionIdFromCborObj );
}

/** `decodeNullStrictMaybe decCBOR` for a guardrail / constitution script hash */
function hash28OrUndef( c: CborObj | undefined ): Hash28 | undefined
{
    return nullOr( c, Hash28.fromCborObj );
}

/** element count of each gov action, tag included (cardano-ledger `DecCBOR GovAction`) */
const govActionSizes: { [type: number]: number } = { 0: 4, 1: 3, 2: 3, 3: 2, 4: 5, 5: 3, 6: 1 };

/**
 * Decode a Conway `gov_action` (CDDL: `[type, …]`, types 0–6) as cardano-ledger's
 * `DecCBOR GovAction` does (`Summands`: definite with the exact size, or indefinite):
 *
 * - 0 `[0, prev / null, pparams_update, policy_hash / null]`
 * - 1 `[1, prev / null, protocol_version]`, the major at most the era's `ProtVerHigh + 1`
 * - 2 `[2, {reward_account => coin}, policy_hash / null]`
 * - 3 `[3, prev / null]`
 * - 4 `[4, prev / null, set<committee_cold_credential>, {committee_cold_credential => epoch}, unit_interval]`
 * - 5 `[5, prev / null, constitution]`, the constitution a `RecD` record `[anchor, script_hash / null]`
 * - 6 `[6]`
 *
 * The previous action ids (`GovActionId`) are `RecD` records: definite arrays.
 *
 * Added 2026-09-06 (Gerolamo): the body decoder dropped proposals, votes, treasury
 * value and donations, so deposits never reached value conservation (preview 55835715).
 */
export function govActionFromCborObj( cObj: CborObj ): GovAction
{
    const { tag: type, fields: a, size } = recordSum( cObj, "gov_action" );
    const expected = govActionSizes[type];
    if( expected === undefined ) throw new Error("unknown gov_action type " + type);
    expectSize( size, expected, "gov_action" );

    let like: GovActionLike;
    switch( type )
    {
        case GovActionType.ParameterChange:
            like = {
                govActionType: GovActionType.ParameterChange,
                govActionId: govActionIdOf( a[0] ),
                protocolParamsUpdate: partialConwayProtocolParametersFromCborObj( a[1]! ) as any,
                policyHash: hash28OrUndef( a[2] )
            };
            break;
        case GovActionType.InitHardFork: {
            const protocolVersion = ProtocolVersion.fromCborObj( a[1]! );
            // decodeProtVer @era: major <= succ (ProtVerHigh era); Conway 11, Dijkstra 12
            const maxMajor = decodeVersionAtLeast( 12 ) ? 13 : 12;
            if( BigInt( protocolVersion.major ) > BigInt( maxMajor ) )
            throw new Error("invalid CBOR for hard_fork_initiation_action: protocol version " + protocolVersion.major + " exceeds " + maxMajor );
            like = {
                govActionType: GovActionType.InitHardFork,
                govActionId: govActionIdOf( a[0] ),
                protocolVersion
            };
            break;
        }
        case GovActionType.TreasuryWithdrawals:
            like = {
                govActionType: GovActionType.TreasuryWithdrawals,
                withdrawals: TxWithdrawals.fromCborObj( a[0]! ),
                policyHash: hash28OrUndef( a[1] )
            };
            break;
        case GovActionType.NoConfidence:
            like = { govActionType: GovActionType.NoConfidence, govActionId: govActionIdOf( a[0] ) };
            break;
        case GovActionType.UpdateCommittee: {
            const toRemove = noDuplicates(
                cborSet( a[1], "update_committee to-remove" ),
                cborKeyOfCredential,
                "update_committee to-remove"
            ).map( Credential.fromCborObj );
            const toAddEntries = noDuplicates(
                cborMapEntries( a[2], "update_committee to-add" ),
                ({ k }) => cborKeyOfCredential( k ),
                "update_committee to-add"
            );
            // unit_interval = #6.30([uint, uint])
            const t = boundedRational( a[3], "unit", "update_committee threshold" );
            like = {
                govActionType: GovActionType.UpdateCommittee,
                govActionId: govActionIdOf( a[0] ),
                toRemove,
                toAdd: toAddEntries.map(({ k, v }) => ({
                    coldCredential: Credential.fromCborObj( k ),
                    epoch: cborUInt( v, "update_committee epoch" )
                })),
                threshold: new CborPositiveRational( t.num, t.den )
            } as any;
            break;
        }
        case GovActionType.NewConstitution: {
            const [ anchor, scriptHash ] = cborArray( a[1], "Constitution", { len: 2, definite: true } );
            like = {
                govActionType: GovActionType.NewConstitution,
                govActionId: govActionIdOf( a[0] ),
                constitution: { anchor: Anchor.fromCborObj( anchor ), scriptHash: hash28OrUndef( scriptHash ) }
            };
            break;
        }
        case GovActionType.Info:
            like = { govActionType: GovActionType.Info };
            break;
        default:
            throw new Error("unknown gov_action type " + type);
    }
    return toRealGovAction( like );
}

/** identity of a credential for duplicate checks: its decoded value */
function cborKeyOfCredential( c: CborObj ): string
{
    const cred = Credential.fromCborObj( c );
    return cred.type + ":" + cred.hash.toString();
}

