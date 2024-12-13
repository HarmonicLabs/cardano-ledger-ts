import { Cbor, CborArray, CborObj, CborSimple, CborString, CborUInt, SubCborRef, ToCbor } from "@harmoniclabs/cbor";
import { IGovAction } from "./IGovAction";
import { ITxOutRef, TxOutRef, isITxOutRef } from "../../tx";
import { Constitution, IConstitution } from "../Constitution";
import { GovActionType } from "./GovActionType";
import { roDescr } from "../../utils/roDescr";
import { isObject } from "@harmoniclabs/obj-utils";
import { ToDataVersion } from "../../toData/defaultToDataVersion";
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
        readonly subCborRef?: SubCborRef
    )
    {
        Object.defineProperties(
            this, {
                govActionType: { value: GovActionType.Info, ...roDescr }
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
            new CborUInt( this.govActionType )
        ]);
    }

    toData( v?: ToDataVersion ): DataConstr
    {
        return new DataConstr( 6, [] );
    }
}