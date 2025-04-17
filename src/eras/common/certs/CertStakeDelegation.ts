import { Cbor, CborArray, CborObj, CborString, CborUInt, SubCborRef } from "@harmoniclabs/cbor";
import { Credential } from "../../../credentials"
import { roDescr } from "../../../utils/roDescr";
import { CertificateType, certTypeToString } from "./CertificateType"
import { ICert } from "../../common/certs/ICert"
import { CanBeHash28, Hash28 } from "../../../hashes";
import { DataB, DataConstr } from "@harmoniclabs/plutus-data";
import { ToDataVersion, definitelyToDataVersion } from "../../../toData/defaultToDataVersion";
import { nothingData } from "../../../utils/maybeData";
import { getSubCborRef } from "../../../utils/getSubCborRef";

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

    constructor(
        { stakeCredential, poolKeyHash }: ICertStakeDelegation,
        readonly cborRef: SubCborRef | undefined = undefined
    )
    {
        Object.defineProperties(
            this, {
                certType: { value: CertificateType.StakeDelegation, ...roDescr },
                stakeCredential: { value: stakeCredential, ...roDescr },
                poolKeyHash: { value: new Hash28( poolKeyHash ), ...roDescr }
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
        }, getSubCborRef( cbor ));
    }

    toJSON() { return this.toJson(); }
    toJson()
    {
        return {
            certType: certTypeToString( this.certType ),
            stakeCredential: this.stakeCredential.toJson(),
            poolKeyHash: this.poolKeyHash.toString()
        };
    }
}