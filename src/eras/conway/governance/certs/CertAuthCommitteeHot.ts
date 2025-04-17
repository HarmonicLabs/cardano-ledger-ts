import { Cbor, CborArray, CborObj, CborString, CborUInt, SubCborRef, ToCbor } from "@harmoniclabs/cbor";
import { Credential } from "../../../../credentials"
import { roDescr } from "../../../../utils/roDescr";
import { CertificateType, certTypeToString } from "../../../common/certs/CertificateType"
import { ICert } from "../../../common/certs/ICert"
import { ToJson } from "../../../../utils/ToJson";
import { Hash28 } from "../../../../hashes";
import { Data, DataConstr } from "@harmoniclabs/plutus-data";
import { ToDataVersion, definitelyToDataVersion } from "../../../../toData/defaultToDataVersion";
import { getSubCborRef } from "../../../../utils/getSubCborRef";

export interface ICertAuthCommitteeHot {
    coldCredential: Credential,
    hotCredential : Credential,
}

export class CertAuthCommitteeHot
    implements ICert, ICertAuthCommitteeHot, ToCbor, ToJson
{
    readonly certType: CertificateType.AuthCommitteeHot;
    readonly coldCredential: Credential;
    readonly hotCredential : Credential;

    constructor(
        { coldCredential, hotCredential }: ICertAuthCommitteeHot,
        readonly cborRef: SubCborRef | undefined = undefined
    )
    {
        Object.defineProperties(
            this, {
                certType: { value: CertificateType.AuthCommitteeHot, ...roDescr },
                coldCredential: { value: coldCredential, ...roDescr },
                hotCredential : { value: hotCredential , ...roDescr },
            }
        );
    }

    toData( version?: ToDataVersion | undefined): DataConstr
    {
        version = definitelyToDataVersion( version );

        if( version === "v1" || version === "v2" )
        throw new Error("CertAuthCommiteeHot only allowed after v3");

        return new DataConstr(
            9, // PCertificate.CommitteeHotAuthorization
            [
                // cold
                this.coldCredential.toData( version ),
                // hot
                this.hotCredential.toData( version )
            ]
        );
    }

    getRequiredSigners(): Hash28[]
    {
        return [ this.coldCredential.hash.clone() ];
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
            this.coldCredential.toCborObj(),
            this.hotCredential.toCborObj()
        ]);
    }
    
    static fromCborObj( cbor: CborObj ): CertAuthCommitteeHot
    {
        if(!(
            cbor instanceof CborArray &&
            cbor.array.length >= 3 &&
            
            cbor.array[0] instanceof CborUInt &&
            Number( cbor.array[0].num ) === CertificateType.AuthCommitteeHot
        )) throw new Error("Invalid cbor for 'CertAuthCommitteeHot'");

        return new CertAuthCommitteeHot({
            coldCredential: Credential.fromCborObj( cbor.array[1] ),
            hotCredential: Credential.fromCborObj( cbor.array[2] )
        }, getSubCborRef( cbor ));
    }

    toJSON() { return this.toJson(); }
    toJson()
    {
        return {
            certType: certTypeToString( this.certType ),
            coldCredential: this.coldCredential. toJson(),
            hotCredential: this.hotCredential. toJson()
        }
    }
}