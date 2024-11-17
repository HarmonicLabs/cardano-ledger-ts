import { Cbor, CborArray, CborObj, CborString, CborUInt, SubCborRef } from "@harmoniclabs/cbor";
import { Credential } from "../../credentials"
import { roDescr } from "../../utils/roDescr";
import { CertificateType, certTypeToString } from "./CertificateType"
import { ICert } from "./ICert"
import { Hash28 } from "../../hashes";
import { Data, DataConstr } from "@harmoniclabs/plutus-data";
import { ToDataVersion, definitelyToDataVersion } from "../../toData/defaultToDataVersion";
import { nothingData } from "../../utils/maybeData";
import { getSubCborRef } from "../../utils/getSubCborRef";

export interface ICertStakeRegistration {
    stakeCredential: Credential
}

export class CertStakeRegistration
    implements ICert, ICertStakeRegistration
{
    readonly certType: CertificateType.StakeRegistration;
    readonly stakeCredential: Credential;

    constructor(
        { stakeCredential }: ICertStakeRegistration,
        readonly subCborRef?: SubCborRef
    )
    {
        Object.defineProperties(
            this, {
                certType: { value: CertificateType.StakeRegistration, ...roDescr },
                stakeCredential: { value: stakeCredential, ...roDescr }
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
                nothingData()
            ]
        );
    }

    getRequiredSigners(): Hash28[]
    {
        return [ this.stakeCredential.hash.clone() ];
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
        }, getSubCborRef( cbor ));
    }

    toJSON() { return this.toJson(); }
    toJson()
    {
        return {
            certType: certTypeToString( this.certType ),
            stakeCredential: this.stakeCredential.toJson()
        };
    }
}