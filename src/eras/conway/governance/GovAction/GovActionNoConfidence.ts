import { Cbor, CborArray, CborSimple, CborString, CborUInt, SubCborRef, ToCbor } from "@harmoniclabs/cbor";
import { DataConstr, ToData } from "@harmoniclabs/plutus-data";
import { ITxOutRef, TxOutRef, isITxOutRef } from "../../../common/TxOutRef";
import { IGovAction } from "./IGovAction";
import { GovActionType } from "./GovActionType";
import { roDescr } from "../../../../utils/roDescr";
import { isObject } from "@harmoniclabs/obj-utils";
import { ToDataVersion } from "../../../../toData/defaultToDataVersion";
import { maybeData } from "../../../../utils/maybeData";

export interface IGovActionNoConfidence {
    govActionId?: ITxOutRef | undefined,
}

export function isIGovActionNoConfidence( stuff: any ): stuff is IGovActionNoConfidence
{
    return isObject( stuff ) && (
        stuff.govActionId === undefined || isITxOutRef( stuff.govActionId )
    );
}

export class GovActionNoConfidence
    implements IGovAction, IGovActionNoConfidence, ToCbor, ToData
{
    readonly govActionType: GovActionType.NoConfidence;
    readonly govActionId: TxOutRef | undefined;
    
    constructor(
        { govActionId }: IGovActionNoConfidence,
        readonly cborRef: SubCborRef | undefined = undefined
    )
    {
        Object.defineProperties(
            this, {
                govActionType: { value: GovActionType.NoConfidence, ...roDescr },
                govActionId: { value: isITxOutRef( govActionId ) ? new TxOutRef( govActionId ) : undefined, ...roDescr }
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
            new CborUInt( this.govActionType ),
            this.govActionId?.toCborObj() ?? new CborSimple( null )
        ]);
    }
    
    toData( v?: ToDataVersion ): DataConstr
    {
        v = "v3"; // only one supported so far
        return new DataConstr(
            3, [
                maybeData( this.govActionId?.toData( v ) )
            ]
        );
    }
}