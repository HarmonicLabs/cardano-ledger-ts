import { Cbor, CborArray, CborObj, CborString, CborUInt } from "@harmoniclabs/cbor";
import { Credential } from "../../credentials"
import { roDescr } from "../../utils/roDescr";
import { CertificateType, certTypeToString } from "./CertificateType"
import { ICert } from "./ICert"
import { Hash28 } from "../../hashes";

export interface ICertStakeRegistration {
    stakeCredential: Credential
}

export class CertStakeRegistration
    implements ICert, ICertStakeRegistration
{
    readonly certType: CertificateType.StakeRegistration;
    readonly stakeCredential: Credential;

    constructor({ stakeCredential }: ICertStakeRegistration)
    {
        Object.defineProperties(
            this, {
                certType: { value: CertificateType.StakeRegistration, ...roDescr },
                stakeCredential: { value: stakeCredential, ...roDescr }
            }
        );
    }

    getRequiredSigners(): Hash28[]
    {
        return [ this.stakeCredential.hash.clone() ];
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

    static fromCborObj( cbor: CborObj ): CertStakeRegistration
    {
        if(!(
            cbor instanceof CborArray &&
            cbor.array.length >= 2 &&
            
            cbor.array[0] instanceof CborUInt &&
            Number( cbor.array[0].num ) === CertificateType.StakeRegistration
        )) throw new Error("Invalid cbor for 'CertStakeRegistration'");

        return new CertStakeRegistration({
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