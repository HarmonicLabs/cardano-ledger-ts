import { Cbor, CborArray, CborObj, CborString, CborUInt, SubCborRef } from "@harmoniclabs/cbor";
import { Credential } from "../../credentials"
import { roDescr } from "../../utils/roDescr";
import { CertificateType, certTypeToString } from "./CertificateType"
import { ICert } from "./ICert"
import { Coin } from "../Coin";
import { forceBigUInt } from "../../utils/ints";
import { Hash28 } from "../../hashes";
import { DataConstr, DataI } from "@harmoniclabs/plutus-data";
import { ToDataVersion, definitelyToDataVersion } from "../../toData/defaultToDataVersion";
import { justData, nothingData } from "../../utils/maybeData";
import { getSubCborRef } from "../../utils/getSubCborRef";

export interface ICertRegistrationDeposit {
    stakeCredential: Credential,
    deposit: Coin
}

export class CertRegistrationDeposit
    implements ICert, ICertRegistrationDeposit
{
    readonly certType: CertificateType.RegistrationDeposit;
    readonly stakeCredential: Credential;
    readonly deposit: bigint;

    constructor(
        { stakeCredential, deposit }: ICertRegistrationDeposit,
        readonly cborRef: SubCborRef | undefined = undefined
    )
    {
        Object.defineProperties(
            this, {
                certType: { value: CertificateType.RegistrationDeposit, ...roDescr },
                stakeCredential: { value: stakeCredential, ...roDescr },
                deposit: { value: forceBigUInt( deposit ), ...roDescr }
            }
        );
    }

    toData( version?: ToDataVersion | undefined): DataConstr
    {
        version = definitelyToDataVersion( version );

        if( version === "v1" || version === "v2" )
        return new DataConstr(
            0, [ // PDCert.KeyRegistration
                new DataConstr(
                    0, // StakingCredential.StakingHash
                    // credential
                    [ this.stakeCredential.toData( version ) ]
                )
            ]
        );

        return new DataConstr(
            0, // PCertificate.StakeRegistration
            [
                this.stakeCredential.toData( version ),
                justData(
                    new DataI( this.deposit )
                )
            ]
        );
    }

    getRequiredSigners(): Hash28[]
    {
        return [ this.stakeCredential.hash.clone() ];
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
        return new CborArray([
            new CborUInt( this.certType ),
            this.stakeCredential.toCborObj(),
            new CborUInt( this.deposit )
        ]);
    }

    static fromCborObj( cbor: CborObj ): CertRegistrationDeposit
    {
        if(!(
            cbor instanceof CborArray &&
            cbor.array.length >= 3 &&
            
            cbor.array[0] instanceof CborUInt &&
            Number( cbor.array[0].num ) === CertificateType.RegistrationDeposit &&

            cbor.array[2] instanceof CborUInt
        )) throw new Error("Invalid cbor for 'CertRegistrationDeposit'");

        return new CertRegistrationDeposit({
            stakeCredential: Credential.fromCborObj( cbor.array[1] ),
            deposit: cbor.array[2].num
        }, getSubCborRef( cbor ));
    }

    toJSON() { return this.toJson(); }
    toJson()
    {
        return {
            certType: certTypeToString( this.certType ),
            stakeCredential: this.stakeCredential.toJson(),
            deposit: this.deposit.toString() 
        }
    }
}