import { Cbor, CborArray, CborObj, CborString, CborUInt } from "@harmoniclabs/cbor";
import { Credential } from "../../credentials"
import { roDescr } from "../../utils/roDescr";
import { CertificateType, certTypeToString } from "./CertificateType"
import { ICert } from "./ICert"
import { CanBeHash28, Hash28 } from "../../hashes";

export interface ICertStakeDelegation {
    stakeCredential: Credential,
    poolKeyHash: CanBeHash28
}

export class CertStakeDelegation
    implements ICert, ICertStakeDelegation
{
    readonly certType: CertificateType.StakeDelegation;
    readonly stakeCredential: Credential;
    readonly poolKeyHash: Hash28;

    constructor({ stakeCredential, poolKeyHash }: ICertStakeDelegation)
    {
        Object.defineProperties(
            this, {
                certType: { value: CertificateType.StakeDelegation, ...roDescr },
                stakeCredential: { value: stakeCredential, ...roDescr },
                poolKeyHash: { value: new Hash28( poolKeyHash ), ...roDescr }
            }
        );
    }

    getRequiredSigners(): Hash28[]
    {
        return [ this.stakeCredential.hash.clone() ];
    }

    toCbor(): CborString
    {
        return Cbor.encode( this.toCborObj() );
    }
    toCborObj(): CborArray
    {
        return new CborArray([
            new CborUInt( this.certType ),
            this.stakeCredential.toCborObj(),
            this.poolKeyHash.toCborObj()
        ]);
    }

    static fromCborObj( cbor: CborObj ): CertStakeDelegation
    {
        if(!(
            cbor instanceof CborArray &&
            cbor.array.length >= 3 &&
            
            cbor.array[0] instanceof CborUInt &&
            Number( cbor.array[0].num ) === CertificateType.StakeDelegation
        )) throw new Error("Invalid cbor for 'CertStakeDelegation'");

        return new CertStakeDelegation({
            stakeCredential: Credential.fromCborObj( cbor.array[1] ),
            poolKeyHash: Hash28.fromCborObj( cbor.array[2] )
        });
    }

    toJson()
    {
        return {
            certType: certTypeToString( this.certType ),
            stakeCredential: this.stakeCredential.toJson(),
            poolKeyHash: this.poolKeyHash.toString()
        };
    }
}