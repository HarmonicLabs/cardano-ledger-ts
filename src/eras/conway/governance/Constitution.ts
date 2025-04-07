import { Cbor, CborArray, CborSimple, CborString, SubCborRef, ToCbor } from "@harmoniclabs/cbor";
import { CanBeHash28, Hash28, canBeHash28 } from "../hashes";
import { Anchor, IAnchor, isIAnchor } from "./Anchor";
import { GovActionType } from "./GovAction/GovActionType";
import { roDescr } from "../utils/roDescr";
import { isObject } from "@harmoniclabs/obj-utils";
import { DataConstr } from "@harmoniclabs/plutus-data";
import { ToDataVersion } from "../toData/defaultToDataVersion";
import { maybeData } from "../utils/maybeData";
import { subCborRefOrUndef } from "../utils/getSubCborRef";

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
        consti: IConstitution,
        readonly cborRef: SubCborRef | undefined = undefined
    )
    {
        const { anchor, scriptHash } = consti;
        this.anchor = new Anchor( anchor );
        this.scriptHash = canBeHash28( scriptHash ) ? new Hash28( scriptHash ) : undefined;
        
        this.cborRef = cborRef ?? subCborRefOrUndef( consti );
    }

    toCborBytes(): Uint8Array
    {
        if( this.cborRef instanceof SubCborRef ) return this.cborRef.toBuffer();
        return this.toCbor().toBuffer();
    }
    toCbor(): CborString
    {
        if( this.cborRef instanceof SubCborRef )
        {
            // TODO: validate cbor structure
            // we assume correctness here
            return new CborString( this.cborRef.toBuffer() );
        }
        
        return Cbor.encode( this.toCborObj() );
    }
    toCborObj(): CborArray
    {

        /* if( this.cborRef instanceof SubCborRef )
        {
            // keeps cbor ref
            return Cbor.parse( this.cborRef.toBuffer() );
        }
        */

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