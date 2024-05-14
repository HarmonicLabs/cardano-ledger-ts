import { Cbor, CborArray, CborObj, CborString, CborUInt } from "@harmoniclabs/cbor";
import { Credential } from "../../credentials"
import { roDescr } from "../../utils/roDescr";
import { CertificateType, certTypeToString } from "./CertificateType"
import { ICert } from "./ICert"
import { Epoch } from "../Epoch";
import { CanBeHash28, Hash28 } from "../../hashes";
import { forceBigUInt } from "../../utils/ints";
import { Data, DataConstr, DataI } from "@harmoniclabs/plutus-data";
import { ToDataVersion, definitelyToDataVersion } from "../../toData/defaultToDataVersion";

export interface ICertPoolRetirement {
    poolHash: CanBeHash28,
    epoch: Epoch
}

export class CertPoolRetirement
    implements ICert, ICertPoolRetirement
{
    readonly certType: CertificateType.PoolRetirement;
    readonly poolHash: Hash28;
    readonly epoch: Epoch;

    constructor({ poolHash, epoch }: ICertPoolRetirement)
    {
        Object.defineProperties(
            this, {
                certType: { value: CertificateType.PoolRetirement, ...roDescr },
                poolHash: { value: new Hash28( poolHash ), ...roDescr },
                epoch: { value: forceBigUInt( epoch ), ...roDescr }
            }
        );
    }

    toData( version?: ToDataVersion | undefined): DataConstr
    {
        version = definitelyToDataVersion( version );

        const fields: Data[] = [
            this.poolHash.toData(),
            new DataI( this.epoch )
        ];
        
        if( version === "v1" || version === "v2" )
        return new DataConstr(
            4, // PDCert.PoolRetire
            fields
        );

        return new DataConstr(
            8, // PCertificate.PoolRetire
            fields
        );
    }

    getRequiredSigners()
    {
        return [ this.poolHash.clone() ];
    }

    toCbor(): CborString
    {
        return Cbor.encode( this.toCborObj() );
    }
    toCborObj(): CborArray
    {
        return new CborArray([
            new CborUInt( this.certType ),
            this.poolHash.toCborObj(),
            new CborUInt( this.epoch )
        ]);
    }

    static fromCborObj( cbor: CborObj ): CertPoolRetirement
    {
        if(!(
            cbor instanceof CborArray &&
            cbor.array.length >= 3 &&
            
            cbor.array[0] instanceof CborUInt &&
            Number( cbor.array[0].num ) === CertificateType.PoolRetirement &&

            cbor.array[2] instanceof CborUInt
        )) throw new Error("Invalid cbor for 'CertPoolRetirement'");

        return new CertPoolRetirement({
            poolHash: Hash28.fromCborObj( cbor.array[1] ),
            epoch: cbor.array[2].num
        });
    }

    toJson()
    {
        return {
            certType: certTypeToString( this.certType ),
            poolHash: this.poolHash.toString(),
            epoch: this.epoch.toString()
        }
    }
}