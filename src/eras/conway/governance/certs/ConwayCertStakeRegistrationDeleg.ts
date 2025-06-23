import { CanBeCborString, Cbor, CborArray, CborObj, CborString, CborUInt, forceCborString, SubCborRef } from "@harmoniclabs/cbor";
import { Data, DataConstr, DataI } from "@harmoniclabs/plutus-data";
import { Credential } from "../../../../credentials"
import { roDescr } from "../../../../utils/roDescr";
import { CertificateType, certTypeToString } from "../../../common/ledger/certs/CertificateType"
import { ICert } from "../../../common/ledger/certs/ICert"
import { DRepLike, toRealDRep } from "../DRep/DRepLike";
import { DRep } from "../DRep/DRep";
import { CanBeHash28, Hash28, PoolKeyHash } from "../../../../hashes";
import { Coin } from "../../../common/ledger/Coin";
import { forceBigUInt } from "../../../../utils/ints";
import { ToDataVersion } from "../../../../toData/defaultToDataVersion";
import { getSubCborRef } from "../../../../utils/getSubCborRef";

export interface IConwayCertStakeRegistrationDeleg {
    stakeCredential: Credential,
    poolKeyHash: CanBeHash28,
    coin: Coin,
}

export class ConwayCertStakeRegistrationDeleg
    implements ICert, IConwayCertStakeRegistrationDeleg
{
    readonly certType: CertificateType.StakeRegistrationDeleg;
    readonly stakeCredential: Credential;
    readonly poolKeyHash: Hash28;
    readonly coin: bigint;

    constructor(
        { stakeCredential, poolKeyHash, coin }: IConwayCertStakeRegistrationDeleg,
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
        if( this.cborRef instanceof SubCborRef ) return Cbor.parse( this.cborRef.toBuffer() ) as CborArray;
        
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

    static fromCbor( cbor: CanBeCborString ): ConwayCertStakeRegistrationDeleg
    {
        return ConwayCertStakeRegistrationDeleg.fromCborObj( Cbor.parse( forceCborString( cbor ) ) );
    } 
    static fromCborObj( cbor: CborObj ): ConwayCertStakeRegistrationDeleg
    {
        if(!(
            cbor instanceof CborArray &&
            cbor.array.length >= 4 &&
            cbor.array[0] instanceof CborUInt &&
            Number(cbor.array[0].num) === CertificateType.StakeRegistrationDeleg &&
            cbor.array[3] instanceof CborUInt
        )) throw new Error("invalid cbor for 'ConwayCertStakeRegistrationDeleg'");

        return new ConwayCertStakeRegistrationDeleg({
            stakeCredential: Credential.fromCborObj( cbor.array[1] ),
            poolKeyHash: PoolKeyHash.fromCborObj( cbor.array[2] ),
            coin: cbor.array[3].num
        }, getSubCborRef( cbor ));
    }
}