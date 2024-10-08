import { Cbor, CborArray, CborObj, CborSimple, CborString, CborUInt } from "@harmoniclabs/cbor";
import { Credential } from "../../credentials"
import { roDescr } from "../../utils/roDescr";
import { CertificateType, certTypeToString } from "./CertificateType"
import { ICert } from "./ICert"
import { Anchor, IAnchor, isIAnchor } from "../../governance/Anchor";
import { Hash28 } from "../../hashes";
import { DataConstr } from "@harmoniclabs/plutus-data";
import { ToDataVersion } from "../../toData/defaultToDataVersion";

export interface ICertUpdateDrep {
    drepCredential: Credential,
    anchor?: IAnchor | undefined,
}

export class CertUpdateDrep
    implements ICert, ICertUpdateDrep
{
    readonly certType: CertificateType.UpdateDrep;
    readonly drepCredential: Credential;
    readonly anchor: Anchor | undefined;

    constructor({ drepCredential, anchor }: ICertUpdateDrep)
    {
        Object.defineProperties(
            this, {
                certType: { value: CertificateType.UpdateDrep, ...roDescr },
                drepCredential: { value: drepCredential, ...roDescr },
                anchor : { value: isIAnchor( anchor ) ? new Anchor( anchor ) : undefined , ...roDescr },
            }
        );
    }

    toData( version?: ToDataVersion | undefined): DataConstr
    {
        version = typeof version !== "string" ? "v3" : version;
        
        if( version !== "v3" )
        throw new Error(
            "DRep registration certificate only allowed in plutus v3"
        );
        
        return new DataConstr(
            5, [
                this.drepCredential.toData( version)
            ]
        );
    }

    getRequiredSigners(): Hash28[]
    {
        return [ this.drepCredential.hash.clone() ];
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
            this.anchor?.toCborObj() ?? new CborSimple( null )
        ]);
    }

    static fromCborObj( cbor: CborObj ): CertUpdateDrep
    {
        if(!(
            cbor instanceof CborArray &&
            cbor.array.length >= 3 &&
            
            cbor.array[0] instanceof CborUInt &&
            Number( cbor.array[0].num ) === CertificateType.UpdateDrep
        )) throw new Error("Invalid cbor for 'CertUpdateDrep'");

        return new CertUpdateDrep({
            drepCredential: Credential.fromCborObj( cbor.array[1] ),
            anchor: cbor.array[2] instanceof CborSimple ? undefined : Anchor.fromCborObj( cbor.array[2] )
        });
    }

    toJson()
    {
        return {
            certType: certTypeToString( this.certType ),
            drepCredential: this.drepCredential.toJson(),
            anchor: this.anchor?.toJson() ?? null 
        };
    }
}