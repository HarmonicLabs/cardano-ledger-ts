import { Cbor, CborArray, CborObj, CborSimple, CborString, CborUInt } from "@harmoniclabs/cbor";
import { Credential } from "../../credentials"
import { roDescr } from "../../utils/roDescr";
import { CertificateType, certTypeToString } from "./CertificateType"
import { ICert } from "./ICert"
import { Anchor, IAnchor, isIAnchor } from "../../governance/Anchor";
import { Coin } from "../Coin";
import { forceBigUInt } from "../../utils/ints";

export interface ICertUnRegistrationDrep {
    drepCredential: Credential,
    coin: Coin
}

export class CertUnRegistrationDrep
    implements ICert, ICertUnRegistrationDrep
{
    readonly certType: CertificateType.UnRegistrationDrep;
    readonly drepCredential: Credential;
    readonly coin: bigint;

    constructor({ drepCredential, coin }: ICertUnRegistrationDrep)
    {
        Object.defineProperties(
            this, {
                certType: { value: CertificateType.UnRegistrationDrep, ...roDescr },
                drepCredential: { value: drepCredential, ...roDescr },
                coin: { value: forceBigUInt( coin ), ...roDescr },
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
            this.drepCredential.toCborObj(),
            new CborUInt( this.coin )
        ]);
    }

    static fromCborObj( cbor: CborObj ): CertUnRegistrationDrep
    {
        if(!(
            cbor instanceof CborArray &&
            cbor.array.length >= 3 &&
            
            cbor.array[0] instanceof CborUInt &&
            Number( cbor.array[0].num ) === CertificateType.UnRegistrationDrep &&

            cbor.array[2] instanceof CborUInt
        )) throw new Error("Invalid cbor for 'CertUnRegistrationDrep'");

        return new CertUnRegistrationDrep({
            drepCredential: Credential.fromCborObj( cbor.array[1] ),
            coin: cbor.array[2].num
        });
    }

    toJson()
    {
        return {
            certType: certTypeToString( this.certType ),
            drepCredential: this.drepCredential.toJson(),
            coin: this.coin.toString() 
        };
    }
}