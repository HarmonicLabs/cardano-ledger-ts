import { Cbor, CborArray, CborString, CborUInt } from "@harmoniclabs/cbor";
import { Credential } from "../../credentials"
import { roDescr } from "../../utils/roDescr";
import { CertificateType, certTypeToString } from "./CertificateType"
import { ICert } from "./ICert"
import { DRepLike, toRealDRep } from "../../governance/DRep/DRepLike";
import { DRep } from "../../governance/DRep/DRep";
import { CanBeHash28, Hash28 } from "../../hashes";
import { Coin } from "../Coin";
import { forceBigUInt } from "../../utils/ints";

export interface ICertStakeRegistrationDeleg {
    stakeCredential: Credential,
    poolKeyHash: CanBeHash28,
    coin: Coin,
}

export class CertStakeRegistrationDeleg
    implements ICert, ICertStakeRegistrationDeleg
{
    readonly certType: CertificateType.StakeRegistrationDeleg;
    readonly stakeCredential: Credential;
    readonly poolKeyHash: Hash28;
    readonly coin: bigint;

    constructor({ stakeCredential, poolKeyHash, coin }: ICertStakeRegistrationDeleg)
    {
        Object.defineProperties(
            this, {
                certType: { value: CertificateType.StakeRegistrationDeleg, ...roDescr },
                stakeCredential: { value: stakeCredential, ...roDescr },
                poolKeyHash: { value: new Hash28( poolKeyHash ), ...roDescr },
                coin: { value: forceBigUInt( coin ), ...roDescr }
            }
        );
    }

    getRequiredSigners(): Hash28[]
    {
        return [ this.stakeCredential.hash.clone() ]
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
            new CborUInt( this.coin )
        ]);
    }

    toJson()
    {
        return {
            certType: certTypeToString( this.certType ),
            stakeCredential: this.stakeCredential.toJson(),
            poolKeyHash: this.poolKeyHash.toString(),
            coin: this.coin.toString() 
        };
    }
}