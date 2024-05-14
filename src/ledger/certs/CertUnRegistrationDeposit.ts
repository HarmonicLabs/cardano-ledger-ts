import { Cbor, CborArray, CborObj, CborString, CborUInt } from "@harmoniclabs/cbor";
import { Credential } from "../../credentials"
import { roDescr } from "../../utils/roDescr";
import { CertificateType, certTypeToString } from "./CertificateType"
import { ICert } from "./ICert"
import { Coin } from "../Coin";
import { forceBigUInt } from "../../utils/ints";
import { Hash28 } from "../../hashes";
import { justData } from "../../utils/maybeData";
import { DataConstr, DataI } from "@harmoniclabs/plutus-data";
import { definitelyToDataVersion } from "../../toData/defaultToDataVersion";

export interface ICertUnRegistrationDeposit {
    stakeCredential: Credential,
    deposit: Coin
}

export class CertUnRegistrationDeposit
    implements ICert, ICertUnRegistrationDeposit
{
    readonly certType: CertificateType.UnRegistrationDeposit;
    readonly stakeCredential: Credential;
    readonly deposit: bigint;

    constructor({ stakeCredential, deposit }: ICertUnRegistrationDeposit)
    {
        Object.defineProperties(
            this, {
                certType: { value: CertificateType.UnRegistrationDeposit, ...roDescr },
                stakeCredential: { value: stakeCredential, ...roDescr },
                deposit: { value: forceBigUInt( deposit ), ...roDescr }
            }
        );
    }

    toData(version?: "v1" | "v2" | "v3" | undefined): DataConstr
    {
        version = definitelyToDataVersion( version );

        if( version === "v1" || version === "v2" )
        return new DataConstr(
            1, [ // PDCert.KeyDeRegistration
                new DataConstr(
                    0, // StakingCredential.StakingHash
                    // credential
                    [ this.stakeCredential.toData( version ) ]
                )
            ]
        );

        return new DataConstr(
            1, // PCertificate.StakeDeRegistration
            [
                this.stakeCredential.toData( version ),
                justData( new DataI( this.deposit ) ) // refound
            ]
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
            this.stakeCredential.toCborObj(),
            new CborUInt( this.deposit )
        ]);
    }

    static fromCborObj( cbor: CborObj ): CertUnRegistrationDeposit
    {
        if(!(
            cbor instanceof CborArray &&
            cbor.array.length >= 3 &&
            
            cbor.array[0] instanceof CborUInt &&
            Number( cbor.array[0].num ) === CertificateType.UnRegistrationDeposit &&

            cbor.array[2] instanceof CborUInt
        )) throw new Error("Invalid cbor for 'CertUnRegistrationDeposit'");

        return new CertUnRegistrationDeposit({
            stakeCredential: Credential.fromCborObj( cbor.array[1] ),
            deposit: cbor.array[2].num
        });
    }

    toJson()
    {
        return {
            certType: certTypeToString( this.certType ),
            stakeCredential: this.stakeCredential.toJson(),
            deposit: this.deposit.toString() 
        };
    }
}