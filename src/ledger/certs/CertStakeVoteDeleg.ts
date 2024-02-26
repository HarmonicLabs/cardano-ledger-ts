import { Cbor, CborArray, CborObj, CborString, CborUInt } from "@harmoniclabs/cbor";
import { Credential } from "../../credentials"
import { roDescr } from "../../utils/roDescr";
import { CertificateType, certTypeToString } from "./CertificateType"
import { ICert } from "./ICert"
import { DRepLike, toRealDRep } from "../../governance/DRep/DRepLike";
import { DRep, drepFromCborObj } from "../../governance/DRep/DRep";
import { CanBeHash28, Hash28 } from "../../hashes";

export interface ICertStakeVoteDeleg {
    stakeCredential: Credential,
    poolKeyHash: CanBeHash28,
    drep: DRepLike,
}

export class CertStakeVoteDeleg
    implements ICert, ICertStakeVoteDeleg
{
    readonly certType: CertificateType.StakeVoteDeleg;
    readonly stakeCredential: Credential;
    readonly poolKeyHash: Hash28;
    readonly drep: DRep;

    constructor({ stakeCredential, poolKeyHash, drep }: ICertStakeVoteDeleg)
    {
        Object.defineProperties(
            this, {
                certType: { value: CertificateType.StakeVoteDeleg, ...roDescr },
                stakeCredential: { value: stakeCredential, ...roDescr },
                poolKeyHash: { value: new Hash28( poolKeyHash ), ...roDescr },
                drep: { value: toRealDRep( drep ), ...roDescr }
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
            this.poolKeyHash.toCborObj(),
            this.drep.toCborObj()
        ]);
    }

    static fromCborObj( cbor: CborObj ): CertStakeVoteDeleg
    {
        if(!(
            cbor instanceof CborArray &&
            cbor.array.length >= 4 &&
            
            cbor.array[0] instanceof CborUInt &&
            Number( cbor.array[0].num ) === CertificateType.StakeVoteDeleg
        )) throw new Error("Invalid cbor for 'CertStakeVoteDeleg'");

        return new CertStakeVoteDeleg({
            stakeCredential: Credential.fromCborObj( cbor.array[1] ),
            poolKeyHash: Hash28.fromCborObj( cbor.array[2] ),
            drep: drepFromCborObj( cbor.array[3] )
        });
    }

    toJson()
    {
        return {
            certType: certTypeToString( this.certType ),
            stakeCredential: this.stakeCredential.toJson(),
            poolKeyHash: this.poolKeyHash.toString(),
            drep: this.drep.toJson() 
        };
    }
}