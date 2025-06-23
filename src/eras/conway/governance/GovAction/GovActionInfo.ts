import { Cbor, CborArray, CborObj, CborSimple, CborString, CborUInt, SubCborRef, ToCbor } from "@harmoniclabs/cbor";
import { isObject } from "@harmoniclabs/obj-utils";
import { IGovAction } from "./IGovAction";
import { GovActionType } from "./GovActionType";
import { roDescr } from "../../../../utils/roDescr";
import { ToDataVersion } from "../../../../toData/defaultToDataVersion";
import { DataConstr } from "@harmoniclabs/plutus-data";

export interface IGovActionInfo {}

export function isIGovActionInfo( stuff: any ): stuff is IGovActionInfo
{
    return isObject( stuff );
}
 
export class GovActionInfo
    implements IGovAction, IGovActionInfo, ToCbor
{
    readonly govActionType: GovActionType.Info

    constructor(
        _info?: IGovActionInfo,
        readonly cborRef: SubCborRef | undefined = undefined
    )
    {
        Object.defineProperties(
            this, {
                govActionType: { value: GovActionType.Info, ...roDescr }
            }
        );
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
        if( this.cborRef instanceof SubCborRef ) return Cbor.parse( this.cborRef.toBuffer() ) as CborArray;
        return new CborArray([
            new CborUInt( this.govActionType )
        ]);
    }

    toData( v?: ToDataVersion ): DataConstr
    {
        return new DataConstr( 6, [] );
    }
}