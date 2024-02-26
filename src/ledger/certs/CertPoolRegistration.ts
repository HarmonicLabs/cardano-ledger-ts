import { Cbor, CborArray, CborObj, CborString, CborUInt } from "@harmoniclabs/cbor";
import { Credential } from "../../credentials"
import { roDescr } from "../../utils/roDescr";
import { CertificateType, certTypeToString } from "./CertificateType"
import { ICert } from "./ICert"
import { IPoolParams, PoolParams } from "../PoolParams";

export interface ICertPoolRegistration {
    poolParams: IPoolParams
}

export class CertPoolRegistration
    implements ICert, ICertPoolRegistration
{
    readonly certType: CertificateType.PoolRegistration;
    readonly poolParams: PoolParams;

    constructor({ poolParams }: ICertPoolRegistration)
    {
        Object.defineProperties(
            this, {
                certType: { value: CertificateType.PoolRegistration, ...roDescr },
                poolParams: { value: new PoolParams( poolParams ), ...roDescr }
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
            new CborUInt( this.certType ),
            ...this.poolParams.toCborObjArray()
        ]);
    }

    static fromCborObj( cbor: CborObj ): CertPoolRegistration
    {
        if(!(
            cbor instanceof CborArray &&
            cbor.array.length >= 10 &&
            
            cbor.array[0] instanceof CborUInt &&
            Number( cbor.array[0].num ) === CertificateType.PoolRegistration
        )) throw new Error("Invalid cbor for 'CertPoolRegistration'");

        return new CertPoolRegistration({
            poolParams: PoolParams.fromCborObjArray( cbor.array.slice( 1 ) )
        });
    }

    toJson()
    {
        return {
            certType: certTypeToString( this.certType ),
            poolParams: this.poolParams.toJson(),
        }
    }
}