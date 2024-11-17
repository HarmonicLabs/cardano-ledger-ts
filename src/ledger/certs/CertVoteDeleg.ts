import { Cbor, CborArray, CborObj, CborString, CborUInt, SubCborRef } from "@harmoniclabs/cbor";
import { Credential } from "../../credentials"
import { roDescr } from "../../utils/roDescr";
import { CertificateType, certTypeToString } from "./CertificateType"
import { ICert } from "./ICert"
import { DRepLike, toRealDRep } from "../../governance/DRep/DRepLike";
import { DRep, drepFromCborObj } from "../../governance/DRep/DRep";
import { Hash28 } from "../../hashes";
import { DataConstr } from "@harmoniclabs/plutus-data";
import { ToDataVersion, definitelyToDataVersion } from "../../toData/defaultToDataVersion";
import { getSubCborRef } from "../../utils/getSubCborRef";

export interface ICertVoteDeleg {
    stakeCredential: Credential,
    drep: DRepLike
}

export class CertVoteDeleg
    implements ICert, ICertVoteDeleg
{
    readonly certType: CertificateType.VoteDeleg;
    readonly stakeCredential: Credential;
    readonly drep: DRep;

    constructor(
        { stakeCredential,drep }: ICertVoteDeleg,
        readonly subCborRef?: SubCborRef
    )
    {
        Object.defineProperties(
            this, {
                certType: { value: CertificateType.VoteDeleg, ...roDescr },
                stakeCredential: { value: stakeCredential, ...roDescr },
                drep: { value: toRealDRep( drep ), ...roDescr }
            }
        );
    }

    toData( version?: ToDataVersion | undefined): DataConstr
    {
        version = definitelyToDataVersion( version );

        return new DataConstr(
            2, // PCertificate.Delegation
            [
                // delegator (PCredential)
                this.stakeCredential.toData( version ),
                // delegatee
                new DataConstr(
                    1, // PDelegatee.DelegVote
                    [ this.drep.toData( version ) ]
                )
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
            this.stakeCredential.toCborObj(),
            this.drep.toCborObj()
        ]);
    }

    static fromCborObj( cbor: CborObj ): CertVoteDeleg
    {
        if(!(
            cbor instanceof CborArray &&
            cbor.array.length >= 3 &&
            
            cbor.array[0] instanceof CborUInt &&
            Number( cbor.array[0].num ) === CertificateType.VoteDeleg
        )) throw new Error("Invalid cbor for 'CertVoteDeleg'");

        return new CertVoteDeleg({
            stakeCredential: Credential.fromCborObj( cbor.array[1] ),
            drep: drepFromCborObj( cbor.array[2] )
        }, getSubCborRef( cbor ));
    }

    toJSON() { return this.toJson(); }
    toJson()
    {
        return {
            certType: certTypeToString( this.certType ),
            stakeCredential: this.stakeCredential.toJson(),
            drep: this.drep.toJson()
        };
    }
}