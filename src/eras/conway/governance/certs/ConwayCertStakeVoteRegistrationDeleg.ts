import { Cbor, CborArray, CborObj, CborString, CborUInt, SubCborRef } from "@harmoniclabs/cbor";
import { DataConstr, DataI, DataList } from "@harmoniclabs/plutus-data";
import { Credential } from "../../../../credentials"
import { roDescr } from "../../../../utils/roDescr";
import { CertificateType, certTypeToString } from "../../../common/ledger/certs/CertificateType"
import { ICert } from "../../../common/ledger/certs/ICert"
import { DRepLike, toRealDRep } from "../DRep/DRepLike";
import { DRep, drepFromCborObj } from "../DRep/DRep";
import { CanBeHash28, Hash28 } from "../../../../hashes";
import { Coin } from "../../../common/ledger/Coin";
import { forceBigUInt } from "../../../../utils/ints";
import { ToDataVersion, definitelyToDataVersion } from "../../../../toData/defaultToDataVersion";
import { justData, nothingData } from "../../../../utils/maybeData";
import { getSubCborRef } from "../../../../utils/getSubCborRef";

export interface IConwayCertStakeVoteRegistrationDeleg {
    stakeCredential: Credential,
    poolKeyHash: CanBeHash28,
    drep: DRepLike,
    coin: Coin,
}

export class ConwayCertStakeVoteRegistrationDeleg
    implements ICert, IConwayCertStakeVoteRegistrationDeleg
{
    readonly certType: CertificateType.StakeVoteRegistrationDeleg;
    readonly stakeCredential: Credential;
    readonly poolKeyHash: Hash28;
    readonly drep: DRep;
    readonly coin: bigint;

    constructor(
        { stakeCredential, poolKeyHash, drep, coin }: IConwayCertStakeVoteRegistrationDeleg,
        readonly cborRef: SubCborRef | undefined = undefined
    )
    {
        Object.defineProperties(
            this, {
                certType: { value: CertificateType.StakeVoteRegistrationDeleg, ...roDescr },
                stakeCredential: { value: stakeCredential, ...roDescr },
                poolKeyHash: { value: new Hash28( poolKeyHash ), ...roDescr },
                drep: { value: toRealDRep( drep ), ...roDescr },
                coin: { value: forceBigUInt( coin ), ...roDescr }
            }
        );
    }

    toData( version?: ToDataVersion | undefined): DataList
    {
        version = definitelyToDataVersion( version );

        return new DataList([
            // stake registration
            new DataConstr(
                0, // PCertificate.StakeRegistration
                [
                    this.stakeCredential.toData( version ),
                    justData( new DataI( this.coin ) )
                ]
            ),
            // stake delegation
            new DataConstr(
                2, // PCertificate.Delegation
                [
                    // delegator (PCredential)
                    this.stakeCredential.toData( version ),
                    // delegatee
                    new DataConstr(
                        0, // PDelegatee.DelegStake
                        [ this.poolKeyHash.toData( version ) ]
                    )
                ]
            ),
            // vote delegation
            new DataConstr(
                2, // PCertificate.Delegation
                [
                    // delegator (PCredential)
                    this.stakeCredential.toData( version ),
                    // delegatee
                    new DataConstr(
                        1, // PDelegatee.DelegVote
                        [ this.drep.toData( version ) ]
                    )
                ]
            )
        ]);
    }
    
    getRequiredSigners(): Hash28[]
    {
        return [ this.stakeCredential.hash.clone() ];
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
            this.drep.toCborObj(),
            new CborUInt( this.coin )
        ]);
    }

    static fromCborObj( cbor: CborObj ): ConwayCertStakeVoteRegistrationDeleg
    {
        if(!(
            cbor instanceof CborArray &&
            cbor.array.length >= 5 &&
            
            cbor.array[0] instanceof CborUInt &&
            Number( cbor.array[0].num ) === CertificateType.StakeVoteRegistrationDeleg &&

            cbor.array[4] instanceof CborUInt
        )) throw new Error("Invalid cbor for 'ConwayCertStakeVoteRegistrationDeleg'");

        return new ConwayCertStakeVoteRegistrationDeleg({
            stakeCredential: Credential.fromCborObj( cbor.array[1] ),
            poolKeyHash: Hash28.fromCborObj( cbor.array[2] ),
            drep: drepFromCborObj( cbor.array[3] ),
            coin: cbor.array[4].num
        }, getSubCborRef( cbor ));
    }
    
    toJSON() { return this.toJson(); }
    toJson()
    {
        return {
            certType: certTypeToString( this.certType ),
            stakeCredential: this.stakeCredential.toJson(),
            poolKeyHash: this.poolKeyHash.toString(),
            drep: this.drep.toJson(),
            coin: this.coin.toString()
        };
    }
}