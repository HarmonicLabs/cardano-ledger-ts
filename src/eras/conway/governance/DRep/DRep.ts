import { CborArray, CborObj, CborUInt } from "@harmoniclabs/cbor";
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

export function drepFromCborObj( cbor: CborObj ): DRep
{
    if(!(
        cbor instanceof CborArray &&
        cbor.array.length > 0 &&
        cbor.array[0] instanceof CborUInt
    )) throw new Error("invalid cbor for 'Certificate'");

    const drepType = Number( cbor.array[0].num ) as DRepType;

    if( !isDRepType( drepType ) )
    throw new Error("invalid drepType for 'Certificate'; " + (drepType as number).toString() );

    switch( drepType )
    {
        case DRepType.KeyHash: return DRepKeyHash.fromCborObj( cbor );
        case DRepType.Script: return DRepScript.fromCborObj( cbor );
        case DRepType.AlwaysAbstain: return new DRepAlwaysAbstain();
        case DRepType.AlwaysNoConfidence: return new DRepAlwaysNoConfidence();
        default: throw new Error("unknown drep type");
    }
} 