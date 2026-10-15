import { CborArray, CborBytes, CborMap, CborObj, CborPositiveRational, CborSimple, CborUInt } from "@harmoniclabs/cbor";
import { definiteBytes } from "../utils/strictCbor";
import { Credential } from "../credentials";
import { Hash28 } from "../hashes";
import { TxWithdrawals } from "../ledger/TxWithdrawals";
import { ProtocolVersion } from "../ledger/protocol/protocolVersion";
import { partialConwayProtocolParametersFromCborObj } from "../eras/conway/protocol/ConwayProtocolParameters";
import { TxOutRef } from "../eras/common/tx/TxOutRef";
import { getCborSet } from "../utils/getCborSet";
import { Anchor } from "./Anchor";
import { GovAction } from "./GovAction/GovAction";
import { GovActionType } from "./GovAction/GovActionType";
import { toRealGovAction, GovActionLike } from "./GovAction/GovActionLike";

const isNull = ( c: CborObj | undefined ): boolean => c === undefined || ( c instanceof CborSimple && c.simple === null );

function govActionIdOf( c: CborObj | undefined ): TxOutRef | undefined
{
    return isNull( c ) ? undefined : TxOutRef.fromCborObj( c! );
}

function hash28OrUndef( c: CborObj | undefined ): Hash28 | undefined
{
    if( isNull( c ) ) return undefined;
    if(!( c instanceof CborBytes )) throw new Error("invalid CBOR for policy / script hash in gov action");
    return new Hash28( definiteBytes( c, "gov action script hash" ) );
}

/**
 * Decode a Conway `gov_action` (CDDL: `[type, …]`, types 0–6).
 * Added 2026-09-06 (Gerolamo): the body decoder dropped proposals, votes, treasury
 * value and donations, so deposits never reached value conservation (preview 55835715).
 */
export function govActionFromCborObj( cObj: CborObj ): GovAction
{
    if(!( cObj instanceof CborArray && cObj.array.length >= 1 && cObj.array[0] instanceof CborUInt ))
    throw new Error("invalid CBOR for gov_action");
    const a = cObj.array;
    const type = Number( ( a[0] as CborUInt ).num );
    let like: GovActionLike;
    switch( type )
    {
        case GovActionType.ParameterChange:
            like = {
                govActionType: GovActionType.ParameterChange,
                govActionId: govActionIdOf( a[1] ),
                protocolParamsUpdate: partialConwayProtocolParametersFromCborObj( a[2]! ) as any,
                policyHash: hash28OrUndef( a[3] )
            };
            break;
        case GovActionType.InitHardFork:
            like = {
                govActionType: GovActionType.InitHardFork,
                govActionId: govActionIdOf( a[1] ),
                protocolVersion: ProtocolVersion.fromCborObj( a[2]! )
            };
            break;
        case GovActionType.TreasuryWithdrawals:
            like = {
                govActionType: GovActionType.TreasuryWithdrawals,
                withdrawals: TxWithdrawals.fromCborObj( a[1]! ),
                policyHash: hash28OrUndef( a[2] )
            };
            break;
        case GovActionType.NoConfidence:
            like = { govActionType: GovActionType.NoConfidence, govActionId: govActionIdOf( a[1] ) };
            break;
        case GovActionType.UpdateCommittee: {
            const toAddMap = a[3];
            if(!( toAddMap instanceof CborMap )) throw new Error("invalid CBOR for update_committee: to-add is not a map");
            // unit_interval = #6.30([uint, uint]); the parser yields a plain CborTag(30), not a
            // CborPositiveRational instance (preview slot 64848165, threshold 6/19).
            const threshold = CborPositiveRational.fromCborObjOrUndef( a[4] );
            if( threshold === undefined ) throw new Error("invalid CBOR for update_committee: threshold is not a rational");
            like = {
                govActionType: GovActionType.UpdateCommittee,
                govActionId: govActionIdOf( a[1] ),
                toRemove: getCborSet( a[2]! ).map( Credential.fromCborObj ),
                toAdd: toAddMap.map.map(({ k, v }) => {
                    if(!( v instanceof CborUInt )) throw new Error("invalid CBOR for update_committee: epoch");
                    return { coldCredential: Credential.fromCborObj( k ), epoch: v.num };
                }),
                threshold
            } as any;
            break;
        }
        case GovActionType.NewConstitution: {
            const c = a[2];
            if(!( c instanceof CborArray && c.array.length >= 1 )) throw new Error("invalid CBOR for constitution");
            like = {
                govActionType: GovActionType.NewConstitution,
                govActionId: govActionIdOf( a[1] ),
                constitution: { anchor: Anchor.fromCborObj( c.array[0]! ), scriptHash: hash28OrUndef( c.array[1] ) }
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
