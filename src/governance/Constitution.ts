import { Cbor, CborArray, CborSimple, CborString, SubCborRef, ToCbor } from "@harmoniclabs/cbor";
import { CanBeHash28, Hash28, canBeHash28 } from "../hashes";
import { Anchor, IAnchor, isIAnchor } from "./Anchor";
import { GovActionType } from "./GovAction/GovActionType";
import { roDescr } from "../utils/roDescr";
import { isObject } from "@harmoniclabs/obj-utils";
import { DataConstr } from "@harmoniclabs/plutus-data";
import { ToDataVersion } from "../toData/defaultToDataVersion";
import { maybeData } from "../utils/maybeData";

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

    constructor(
        { anchor, scriptHash }: IConstitution,
        readonly subCborRef?: SubCborRef
    )
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
        if( this.subCborRef instanceof SubCborRef )
        {
            // TODO: validate cbor structure
            // we assume correctness here
            return new CborString( this.subCborRef.toBuffer() );
        }
        
        return Cbor.encode( this.toCborObj() );
    }
    toCborObj(): CborArray
    {
        return new CborArray([
            this.anchor.toCborObj(),
            this.scriptHash?.toCborObj() ?? new CborSimple( null )
        ]);
    }

    toData( v?: ToDataVersion ): DataConstr
    {
        v = "v3"; // only one for constitution so far
        return  new DataConstr(
            0, [
                maybeData( this.scriptHash?.toData( v ) )
            ]
        )
    }
}