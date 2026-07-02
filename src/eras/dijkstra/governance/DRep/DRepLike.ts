import { isObject } from "@harmoniclabs/obj-utils";
import { DRepAlwaysAbstain, IDRepAlwaysAbstain } from "./DRepAlwaysAbstain";
import { DRepAlwaysNoConfidence, IDRepAlwaysNoConfidence } from "./DRepAlwaysNoConfidence";
import { DRepKeyHash, IDRepKeyHash, isIDRepKeyHash } from "./DRepKeyHash";
import { DRepScript, IDRepScript, isIDRepScript } from "./DRepScript";
import { DRepType, isDRepType } from "./DRepType";
import { DRep } from "./DRep";

export type DRepLike
    = { drepType: DRepType.KeyHash } & IDRepKeyHash
    | { drepType: DRepType.Script  } & IDRepScript
    | { drepType: DRepType.AlwaysAbstain        } & IDRepAlwaysAbstain
    | { drepType: DRepType.AlwaysNoConfidence   } & IDRepAlwaysNoConfidence;

export function isDRepLike( stuff: any ): stuff is DRepLike
{
    if(!(
        isObject( stuff ) &&
        isDRepType( stuff.drepType )
    )) return false
    
    switch( stuff.drepType as DRepType )
    {
        case DRepType.KeyHash: return isIDRepKeyHash( stuff );
        case DRepType.Script : return isIDRepScript( stuff );
        case DRepType.AlwaysAbstain: return true;
        case DRepType.AlwaysNoConfidence:  return true;
        default: return false;
    }
}

export function toRealDRep( like: DRepLike ): DRep
{
    switch( like.drepType )
    {
        case DRepType.KeyHash: return new DRepKeyHash( like );
        case DRepType.Script : return new DRepScript( like );
        case DRepType.AlwaysAbstain: return new DRepAlwaysAbstain( like );
        case DRepType.AlwaysNoConfidence:  return new DRepAlwaysNoConfidence( like );
        default: throw new Error("invalid 'DRepLike'");
    }
}