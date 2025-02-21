import { CanBeCborString, Cbor, CborArray, CborObj, CborString, CborUInt, forceCborString, SubCborRef } from "@harmoniclabs/cbor";
import { Credential } from "../../credentials"
import { roDescr } from "../../utils/roDescr";
import { CertificateType, certTypeToString } from "./CertificateType"
import { ICert } from "./ICert"
import { DRepLike, toRealDRep } from "../../governance/DRep/DRepLike";
import { DRep } from "../../governance/DRep/DRep";
import { CanBeHash28, Hash28, PoolKeyHash } from "../../hashes";
import { Coin } from "../Coin";
import { forceBigUInt } from "../../utils/ints";
import { Data, DataConstr, DataI } from "@harmoniclabs/plutus-data";
import { ToDataVersion } from "../../toData/defaultToDataVersion";
import { getSubCborRef } from "../../utils/getSubCborRef";

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

    constructor(
        { stakeCredential, poolKeyHash, coin }: ICertStakeRegistrationDeleg,
        readonly cborRef: SubCborRef | undefined = undefined
    )
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

    toData( version?: ToDataVersion | undefined): DataConstr
    {
        version = typeof version !== "string" ? "v3" : version;
        
        if( version !== "v3" )
        throw new Error(
            "Stake registration and delegation certificate only allowed in plutus v3"
        );
        
        return new DataConstr(
            3, [
                this.stakeCredential.toData( version ),
                this.poolKeyHash.toData( version ),
                new DataI( this.coin )
            ]
        );
    }

    getRequiredSigners(): Hash28[]
    {
        return [ this.stakeCredential.hash.clone() ]
    }

    toCborBytes(): Uint8Array
    {
        if( this.cborRef instanceof SubCborRef ) return this.cborRef.toBuffer();
        return this.toCbor().toBuffer();
    }
    toCbor(): CborString
    {
        if( this.cborRef instanceof SubCborRef )
        {
            // TODO: validate cbor structure
            // we assume correctness here
            return new CborString( this.cborRef.toBuffer() );
        }
        
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

    toJSON() { return this.toJson(); }
    toJson()
    {
        return {
            certType: certTypeToString( this.certType ),
            stakeCredential: this.stakeCredential.toJson(),
            poolKeyHash: this.poolKeyHash.toString(),
            coin: this.coin.toString() 
        };
    }

    static fromCbor( cbor: CanBeCborString ): CertStakeRegistrationDeleg
    {
        return CertStakeRegistrationDeleg.fromCborObj( Cbor.parse( forceCborString( cbor ) ) );
    } 
    static fromCborObj( cbor: CborObj ): CertStakeRegistrationDeleg
    {
        if(!(
            cbor instanceof CborArray &&
            cbor.array.length >= 4 &&
            cbor.array[0] instanceof CborUInt &&
            Number(cbor.array[0].num) === CertificateType.StakeRegistrationDeleg &&
            cbor.array[3] instanceof CborUInt
        )) throw new Error("invalid cbor for 'CertStakeRegistrationDeleg'");

        return new CertStakeRegistrationDeleg({
            stakeCredential: Credential.fromCborObj( cbor.array[1] ),
            poolKeyHash: PoolKeyHash.fromCborObj( cbor.array[2] ),
            coin: cbor.array[3].num
        }, getSubCborRef( cbor ));
    }
}