import { Cbor, CborArray, CborObj, CborSimple, CborString, CborUInt, SubCborRef } from "@harmoniclabs/cbor";
import { Credential } from "../../credentials"
import { roDescr } from "../../utils/roDescr";
import { CertificateType, certTypeToString } from "./CertificateType"
import { ICert } from "./ICert"
import { Anchor, IAnchor, isIAnchor } from "../../governance/Anchor";
import { Coin } from "../Coin";
import { forceBigUInt } from "../../utils/ints";
import { Hash28 } from "../../hashes";
import { Data, DataConstr, DataI } from "@harmoniclabs/plutus-data";
import { ToDataVersion } from "../../toData/defaultToDataVersion";
import { getSubCborRef } from "../../utils/getSubCborRef";

export interface ICertRegistrationDrep {
    drepCredential: Credential,
    coin: Coin
    anchor?: IAnchor | undefined,
}

export class CertRegistrationDrep
    implements ICert, ICertRegistrationDrep
{
    readonly certType: CertificateType.RegistrationDrep;
    readonly drepCredential: Credential;
    readonly coin: bigint;
    readonly anchor: Anchor | undefined;

    constructor(
        { drepCredential, coin, anchor }: ICertRegistrationDrep,
        readonly subCborRef?: SubCborRef
    )
    {
        Object.defineProperties(
            this, {
                certType: { value: CertificateType.RegistrationDrep, ...roDescr },
                drepCredential: { value: drepCredential, ...roDescr },
                coin: { value: forceBigUInt( coin ), ...roDescr },
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
            4, [
                this.drepCredential.toData( version ),
                new DataI( this.coin )
            ]
        );
    }

    getRequiredSigners(): Hash28[]
    {
        return [ this.drepCredential.hash.clone() ];
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
            this.drepCredential.toCborObj(),
            new CborUInt( this.coin ),
            this.anchor?.toCborObj() ?? new CborSimple( null )
        ]);
    }

    static fromCborObj( cbor: CborObj ): CertRegistrationDrep
    {
        if(!(
            cbor instanceof CborArray &&
            cbor.array.length >= 4 &&
            
            cbor.array[0] instanceof CborUInt &&
            Number( cbor.array[0].num ) === CertificateType.RegistrationDrep &&

            cbor.array[2] instanceof CborUInt
        )) throw new Error("Invalid cbor for 'CertRegistrationDrep'");

        return new CertRegistrationDrep({
            drepCredential: Credential.fromCborObj( cbor.array[1] ),
            coin: cbor.array[2].num,
            anchor: cbor.array[3] instanceof CborSimple ? undefined : Anchor.fromCborObj( cbor.array[3] )
        }, getSubCborRef( cbor ));
    }

    toJSON() { return this.toJson(); }
    toJson()
    {
        return {
            certType: certTypeToString( this.certType ),
            stakeCredential: this.drepCredential.toJson(),
            coin: this.coin.toString(),
            anchor: this.anchor?.toJson() ?? null
        };
    }
}