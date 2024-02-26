import { Cbor, CborArray, CborObj, CborSimple, CborString, CborUInt } from "@harmoniclabs/cbor";
import { Credential } from "../../credentials"
import { roDescr } from "../../utils/roDescr";
import { CertificateType, certTypeToString } from "./CertificateType"
import { ICert } from "./ICert"
import { Anchor, IAnchor, isIAnchor } from "../../governance/Anchor";

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