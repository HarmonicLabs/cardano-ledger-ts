import { Cbor, CborArray, CborObj, CborSimple, CborString, CborUInt } from "@harmoniclabs/cbor";
import { Credential } from "../../credentials"
import { roDescr } from "../../utils/roDescr";
import { CertificateType, certTypeToString } from "./CertificateType"
import { ICert } from "./ICert"
import { Anchor, IAnchor, isIAnchor } from "../../governance/Anchor";
import { Hash28 } from "../../hashes";
import { DataConstr } from "@harmoniclabs/plutus-data";
import { definitelyToDataVersion } from "../../toData/defaultToDataVersion";

export interface ICertResignCommitteeCold {
    coldCredential: Credential,
    anchor?: IAnchor | undefined,
}

export class CertResignCommitteeCold
    implements ICert, ICertResignCommitteeCold
{
    readonly certType: CertificateType.ResignCommitteeCold;
    readonly coldCredential: Credential;
    readonly anchor: Anchor | undefined;

    constructor({ coldCredential, anchor }: ICertResignCommitteeCold)
    {
        Object.defineProperties(
            this, {
                certType: { value: CertificateType.ResignCommitteeCold, ...roDescr },
                coldCredential: { value: coldCredential, ...roDescr },
                anchor : { value: isIAnchor( anchor ) ? new Anchor( anchor ) : undefined , ...roDescr },
            }
        );
    }

    toData(version?: "v1" | "v2" | "v3" | undefined): DataConstr
    {
        version = definitelyToDataVersion( version );

        if( version === "v1" || version === "v2" )
        throw new Error("CertAuthCommiteeHot only allowed after v3");

        return new DataConstr(
            10, // PCertificate.CommitteeResignation
            [
                // cold
                this.coldCredential.toData( version )
            ]
        );
    }

    getRequiredSigners(): Hash28[]
    {
        return [ this.coldCredential.hash.clone() ];
    }

    toCbor(): CborString
    {
        return Cbor.encode( this.toCborObj() );
    }
    toCborObj(): CborArray
    {
        return new CborArray([
            new CborUInt( this.certType ),
            this.coldCredential.toCborObj(),
            this.anchor?.toCborObj() ?? new CborSimple( null )
        ]);
    }

    static fromCborObj( cbor: CborObj ): CertResignCommitteeCold
    {
        if(!(
            cbor instanceof CborArray &&
            cbor.array.length >= 3 &&
            
            cbor.array[0] instanceof CborUInt &&
            Number( cbor.array[0].num ) === CertificateType.ResignCommitteeCold
        )) throw new Error("Invalid cbor for 'CertResignCommitteeCold'");

        return new CertResignCommitteeCold({
            coldCredential: Credential.fromCborObj( cbor.array[1] ),
            anchor: cbor.array[2] instanceof CborSimple ? undefined : Anchor.fromCborObj( cbor.array[2] )
        });
    }

    toJson()
    {
        return {
            certType: certTypeToString( this.certType ),
            coldCredential: this.coldCredential.toJson(),
            anchor: this.anchor?.toJson() ?? null
        };
    }
}