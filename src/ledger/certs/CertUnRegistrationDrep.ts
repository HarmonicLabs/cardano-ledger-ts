import { Cbor, CborArray, CborObj, CborSimple, CborString, CborUInt } from "@harmoniclabs/cbor";
import { Credential } from "../../credentials"
import { roDescr } from "../../utils/roDescr";
import { CertificateType, certTypeToString } from "./CertificateType"
import { ICert } from "./ICert"
import { Anchor, IAnchor, isIAnchor } from "../../governance/Anchor";
import { Coin } from "../Coin";
import { forceBigUInt } from "../../utils/ints";
import { Hash28 } from "../../hashes";
import { DataConstr, DataI } from "@harmoniclabs/plutus-data";
import { ToDataVersion } from "../../toData/defaultToDataVersion";

export interface ICertUnRegistrationDrep {
    drepCredential: Credential,
    coin: Coin
}

export class CertUnRegistrationDrep
    implements ICert, ICertUnRegistrationDrep
{
    readonly certType: CertificateType.UnRegistrationDrep;
    readonly drepCredential: Credential;
    /** refound */
    readonly coin: bigint;

    constructor({ drepCredential, coin }: ICertUnRegistrationDrep)
    {
        Object.defineProperties(
            this, {
                certType: { value: CertificateType.UnRegistrationDrep, ...roDescr },
                drepCredential: { value: drepCredential, ...roDescr },
                coin: { value: forceBigUInt( coin ), ...roDescr },
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
            6, [
                this.drepCredential.toData(),
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
        return Cbor.encode( this.toCborObj() );
    }
    toCborObj(): CborArray
    {
        return new CborArray([
            new CborUInt( this.certType ),
            this.drepCredential.toCborObj(),
            new CborUInt( this.coin )
        ]);
    }

    static fromCborObj( cbor: CborObj ): CertUnRegistrationDrep
    {
        if(!(
            cbor instanceof CborArray &&
            cbor.array.length >= 3 &&
            
            cbor.array[0] instanceof CborUInt &&
            Number( cbor.array[0].num ) === CertificateType.UnRegistrationDrep &&

            cbor.array[2] instanceof CborUInt
        )) throw new Error("Invalid cbor for 'CertUnRegistrationDrep'");

        return new CertUnRegistrationDrep({
            drepCredential: Credential.fromCborObj( cbor.array[1] ),
            coin: cbor.array[2].num
        });
    }

    toJson()
    {
        return {
            certType: certTypeToString( this.certType ),
            drepCredential: this.drepCredential.toJson(),
            coin: this.coin.toString() 
        };
    }
}