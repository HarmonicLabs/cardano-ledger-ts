import { Cbor, CborArray, CborObj, CborString, CborUInt, SubCborRef } from "@harmoniclabs/cbor";
import { DataConstr } from "@harmoniclabs/plutus-data";
import { Credential } from "../../../../credentials"
import { roDescr } from "../../../../utils/roDescr";
import { CertificateType, certTypeToString } from "../../../common/ledger/certs/CertificateType"
import { ICert } from "../../../common/ledger/certs/ICert"
import { DRepLike, toRealDRep } from "../DRep/DRepLike";
import { DRep, drepFromCborObj } from "../DRep/DRep";
import { CanBeHash28, Hash28 } from "../../../../hashes";
import { ToDataVersion, definitelyToDataVersion } from "../../../../toData/defaultToDataVersion";
import { getSubCborRef } from "../../../../utils/getSubCborRef";

export interface IConwayCertStakeVoteDeleg {
    stakeCredential: Credential,
    poolKeyHash: CanBeHash28,
    drep: DRepLike,
}

export class ConwayCertStakeVoteDeleg
    implements ICert, IConwayCertStakeVoteDeleg
{
    readonly certType: CertificateType.StakeVoteDeleg;
    readonly stakeCredential: Credential;
    readonly poolKeyHash: Hash28;
    readonly drep: DRep;

    constructor(
        { stakeCredential, poolKeyHash, drep }: IConwayCertStakeVoteDeleg,
        readonly cborRef: SubCborRef | undefined = undefined
    )
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

    toData( version?: ToDataVersion | undefined): DataConstr
    {
        version = definitelyToDataVersion( version );

        if( version === "v1" || version === "v2" )
        return new DataConstr(
            2, [ // PDCert.KeyDelegation
                new DataConstr( // delegator (PStakingCredential)
                    0, // PStakingCredential.StakingHash
                    // credential
                    [ this.stakeCredential.toData( version ) ]
                ),
                // poolKeyHash
                this.poolKeyHash.toData( version )
            ]
        );

        return new DataConstr(
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
        );
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
            this.drep.toCborObj()
        ]);
    }

    static fromCborObj( cbor: CborObj ): ConwayCertStakeVoteDeleg
    {
        if(!(
            cbor instanceof CborArray &&
            cbor.array.length >= 4 &&
            
            cbor.array[0] instanceof CborUInt &&
            Number( cbor.array[0].num ) === CertificateType.StakeVoteDeleg
        )) throw new Error("Invalid cbor for 'ConwayCertStakeVoteDeleg'");

        return new ConwayCertStakeVoteDeleg({
            stakeCredential: Credential.fromCborObj( cbor.array[1] ),
            poolKeyHash: Hash28.fromCborObj( cbor.array[2] ),
            drep: drepFromCborObj( cbor.array[3] )
        }, getSubCborRef( cbor ));
    }

    toJSON() { return this.toJson(); }
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