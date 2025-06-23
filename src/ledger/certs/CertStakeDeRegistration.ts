import { Cbor, CborArray, CborObj, CborString, CborUInt, SubCborRef } from "@harmoniclabs/cbor";
import { Credential } from "../../credentials"
import { roDescr } from "../../utils/roDescr";
import { CertificateType, certTypeToString } from "./CertificateType"
import { ICert } from "./ICert"
import { Hash28 } from "../../hashes/Hash28/Hash28";
import { DataConstr } from "@harmoniclabs/plutus-data";
import { nothingData } from "../../utils/maybeData";
import { ToDataVersion, definitelyToDataVersion } from "../../toData/defaultToDataVersion";
import { getSubCborRef } from "../../utils/getSubCborRef";

export interface ICertStakeDeRegistration {
    stakeCredential: Credential
}

export class CertStakeDeRegistration
    implements ICert, ICertStakeDeRegistration
{
    readonly certType: CertificateType.StakeDeRegistration;
    readonly stakeCredential: Credential;

    constructor(
        { stakeCredential }: ICertStakeDeRegistration,
        readonly cborRef: SubCborRef | undefined = undefined
    )
    {
        Object.defineProperties(
            this, {
                certType: { value: CertificateType.StakeDeRegistration, ...roDescr },
                stakeCredential: { value: stakeCredential, ...roDescr }
            }
        );
    }

    toData( version?: ToDataVersion | undefined): DataConstr
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
                nothingData() // refound
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
        if( this.cborRef instanceof SubCborRef ) return Cbor.parse( this.cborRef.toBuffer() ) as CborArray;
        
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