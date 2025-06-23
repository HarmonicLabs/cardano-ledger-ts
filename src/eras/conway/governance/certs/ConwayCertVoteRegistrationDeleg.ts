import { Cbor, CborArray, CborObj, CborString, CborUInt, SubCborRef } from "@harmoniclabs/cbor";
import { Data, DataConstr } from "@harmoniclabs/plutus-data";
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
import { getSubCborRef } from "../../../../utils/getSubCborRef";

export interface IConwayCertVoteRegistrationDeleg {
    stakeCredential: Credential,
    drep: DRepLike,
    coin: Coin,
}

export class ConwayCertVoteRegistrationDeleg
    implements ICert, IConwayCertVoteRegistrationDeleg
{
    readonly certType: CertificateType.VoteRegistrationDeleg;
    readonly stakeCredential: Credential;
    readonly drep: DRep;
    readonly coin: bigint;

    constructor(
        { stakeCredential, drep, coin }: IConwayCertVoteRegistrationDeleg,
        readonly cborRef: SubCborRef | undefined = undefined
    )
    {
        Object.defineProperties(
            this, {
                certType: { value: CertificateType.VoteRegistrationDeleg, ...roDescr },
                stakeCredential: { value: stakeCredential, ...roDescr },
                drep: { value: toRealDRep( drep ), ...roDescr },
                coin: { value: forceBigUInt( coin ), ...roDescr }
            }
        );
    }

    toData( version?: ToDataVersion | undefined): DataConstr
    {
        version = definitelyToDataVersion( version );

        return new DataConstr(
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
            this.drep.toCborObj(),
            new CborUInt( this.coin )
        ]);
    }

    static fromCborObj( cbor: CborObj ): ConwayCertVoteRegistrationDeleg
    {
        if(!(
            cbor instanceof CborArray &&
            cbor.array.length >= 4 &&
            
            cbor.array[0] instanceof CborUInt &&
            Number( cbor.array[0].num ) === CertificateType.VoteRegistrationDeleg &&

            cbor.array[3] instanceof CborUInt
        )) throw new Error("Invalid cbor for 'ConwayCertVoteRegistrationDeleg'");

        return new ConwayCertVoteRegistrationDeleg({
            stakeCredential: Credential.fromCborObj( cbor.array[1] ),
            drep: drepFromCborObj( cbor.array[2] ),
            coin: cbor.array[3].num
        }, getSubCborRef( cbor ));
    }

    toJSON() { return this.toJson(); }
    toJson()
    {
        return {
            certType: certTypeToString( this.certType ),
            stakeCredential: this.stakeCredential.toJson(),
            drep: this.drep.toJson(),
            coin: this.coin.toString()
        };
    }
}