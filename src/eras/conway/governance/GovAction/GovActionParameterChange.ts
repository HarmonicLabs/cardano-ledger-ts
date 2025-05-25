import { Cbor, CborArray, CborSimple, CborString, CborUInt, SubCborRef, ToCbor } from "@harmoniclabs/cbor";
import { isObject } from "@harmoniclabs/obj-utils";
import { Data, DataConstr, ToData } from "@harmoniclabs/plutus-data";
import { CanBeHash28, Hash28, canBeHash28, canBeHash32 } from "../../../../hashes";
import { ITxOutRef, TxOutRef, isITxOutRef } from "../../../common/TxOutRef";
import { roDescr } from "../../../../utils/roDescr";
import { GovActionType } from "./GovActionType";
import { IGovAction } from "./IGovAction";
import { ToDataVersion } from "../../../../toData/defaultToDataVersion";
import { maybeData } from "../../../../utils/maybeData";
import { isPartialConwayProtocolParameters, partialConwayProtocolParametersToCborObj, partialConwayProtocolParametersToData, ConwayProtocolParameters } from "../../protocol";
export interface IGovActionParameterChange {
    govActionId?: ITxOutRef | undefined,
    protocolParamsUpdate: Partial<ConwayProtocolParameters>,
    policyHash?: CanBeHash28 | undefined
}

export function isIGovActionParameterChange( stuff: any ): stuff is IGovActionParameterChange
{
    return isObject( stuff ) && (
        ( stuff.govActionId === undefined || isITxOutRef( stuff.govActionId ) ) &&
        isPartialConwayProtocolParameters( stuff.protocolParamsUpdate ) &&
        ( stuff.policyHash === undefined || canBeHash28( stuff.policyHash ) )
    );
}

export class GovActionParameterChange
    implements IGovAction, IGovActionParameterChange, ToCbor, ToData
{
    readonly govActionType: GovActionType.ParameterChange;
    readonly govActionId: TxOutRef | undefined;
    readonly protocolParamsUpdate: Partial<ConwayProtocolParameters>;
    readonly policyHash: Hash28 | undefined;

    constructor(
        { govActionId, protocolParamsUpdate, policyHash }: IGovActionParameterChange,
        readonly cborRef: SubCborRef | undefined = undefined
    )
    {
        Object.defineProperties(
            this, {
                govActionType: { value: GovActionType.ParameterChange, ...roDescr },
                govActionId: { value: govActionId ? new TxOutRef( govActionId ) : undefined , ...roDescr },
                protocolParamsUpdate: { value: protocolParamsUpdate, ...roDescr },
                policyHash: { value: canBeHash28( policyHash ) ? new Hash28( policyHash ) : undefined, ...roDescr },
            }
        )
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
            this.govActionId?.toCborObj() ?? new CborSimple( null ),
            partialConwayProtocolParametersToCborObj( this.protocolParamsUpdate ),
            this.policyHash?.toCborObj() ?? new CborSimple( null )
        ]);
    }

    toData( v?: ToDataVersion ): DataConstr
    {
        v = "v3"; // only one supported so far
        return new DataConstr(
            0, [
                maybeData( this.govActionId?.toData( v ) ),
                partialConwayProtocolParametersToData( this.protocolParamsUpdate ),
                maybeData( this.policyHash?.toData( v ) )
            ]
        );
    }
}