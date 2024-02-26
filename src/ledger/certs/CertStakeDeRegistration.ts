import { Cbor, CborArray, CborObj, CborString, CborUInt } from "@harmoniclabs/cbor";
import { Credential } from "../../credentials"
import { roDescr } from "../../utils/roDescr";
import { CertificateType, certTypeToString } from "./CertificateType"
import { ICert } from "./ICert"

export interface ICertStakeDeRegistration {
    stakeCredential: Credential
}

export class CertStakeDeRegistration
    implements ICert, ICertStakeDeRegistration
{
    readonly certType: CertificateType.StakeDeRegistration;
    readonly stakeCredential: Credential;

    constructor({ stakeCredential }: ICertStakeDeRegistration)
    {
        Object.defineProperties(
            this, {
                certType: { value: CertificateType.StakeDeRegistration, ...roDescr },
                stakeCredential: { value: stakeCredential, ...roDescr }
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
            this.stakeCredential.toCborObj()
        ]);
    }

    static fromCborObj( cbor: CborObj ): CertStakeDeRegistration
    {
        if(!(
            cbor instanceof CborArray &&
            cbor.array.length >= 2 &&
            
            cbor.array[0] instanceof CborUInt &&
            Number( cbor.array[0].num ) === CertificateType.StakeDeRegistration
        )) throw new Error("Invalid cbor for 'CertStakeDeRegistration'");

        return new CertStakeDeRegistration({
            stakeCredential: Credential.fromCborObj( cbor.array[1] )
        });
    }

    toJson()
    {
        return {
            certType: certTypeToString( this.certType ),
            stakeCredential: this.stakeCredential.toJson()
        };
    }
}