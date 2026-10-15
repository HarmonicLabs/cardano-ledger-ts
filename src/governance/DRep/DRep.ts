import { CborArray, CborObj, CborUInt } from "@harmoniclabs/cbor";
import { expectSize, recordSum } from "../../utils/strictCbor";
import { DRepAlwaysAbstain } from "./DRepAlwaysAbstain";
import { DRepAlwaysNoConfidence } from "./DRepAlwaysNoConfidence";
import { DRepKeyHash } from "./DRepKeyHash";
import { DRepScript } from "./DRepScript";
import { DRepType, isDRepType } from "./DRepType";

export type DRep
    = DRepKeyHash
    | DRepScript
    | DRepAlwaysAbstain
    | DRepAlwaysNoConfidence;

/**
 * cardano-ledger `DecCBOR DRep` (`Summands` / `decodeRecordSum`): `[0, keyhash]`,
 * `[1, scripthash]`, `[2]`, `[3]`; definite arrays have exactly that size.
 */
export function drepFromCborObj( cbor: CborObj ): DRep
{
    const { tag, size } = recordSum( cbor, "DRep" );
    const drepType = tag as DRepType;

    if( !isDRepType( drepType ) )
    throw new Error("invalid drepType for 'Certificate'; " + tag.toString() );

    expectSize( size, drepType === DRepType.KeyHash || drepType === DRepType.Script ? 2 : 1, "DRep" );

    switch( drepType )

    {
        case DRepType.KeyHash: return DRepKeyHash.fromCborObj( cbor );
        case DRepType.Script: return DRepScript.fromCborObj( cbor );
        case DRepType.AlwaysAbstain: return new DRepAlwaysAbstain();
        case DRepType.AlwaysNoConfidence: return new DRepAlwaysNoConfidence();
        default: throw new Error("unknown drep type");
    }
} 