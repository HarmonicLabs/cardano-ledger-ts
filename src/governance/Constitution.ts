import { Cbor, CborArray, CborSimple, CborString, ToCbor } from "@harmoniclabs/cbor";
import { CanBeHash28, Hash28, canBeHash28 } from "../hashes";
import { Anchor, IAnchor, isIAnchor } from "./Anchor";
import { GovActionType } from "./GovAction/GovActionType";
import { roDescr } from "../utils/roDescr";
import { isObject } from "@harmoniclabs/obj-utils";

export interface IConstitution {
    anchor: IAnchor,
    scriptHash?: CanBeHash28 | undefined
}

export function isIConstitution( stuff: any ): stuff is IConstitution
{
    return isObject( stuff ) && (
        isIAnchor( stuff.anchor ) &&
        ( stuff.scriptHash === undefined || canBeHash28( stuff.scriptHash ) )
    );
}

export class Constitution
    implements IConstitution, ToCbor
{
    readonly anchor: Anchor;
    readonly scriptHash: Hash28 | undefined;

    constructor({ anchor, scriptHash }: IConstitution)
    {
        Object.defineProperties(
            this, {
                anchor: { value: new Anchor( anchor ), ...roDescr },
                scriptHash: { value: canBeHash28( scriptHash ) ? new Hash28( scriptHash ) : undefined, ...roDescr }
            }
        );
    }

    toCbor(): CborString
    {
        return Cbor.encode( this.toCborObj() );
    }
    toCborObj(): CborArray
    {
        return new CborArray([
            this.anchor.toCborObj(),
            this.scriptHash?.toCborObj() ?? new CborSimple( null )
        ]);
    }
}