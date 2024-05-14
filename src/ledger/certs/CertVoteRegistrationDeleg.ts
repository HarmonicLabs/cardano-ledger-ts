import { Cbor, CborArray, CborObj, CborString, CborUInt } from "@harmoniclabs/cbor";
import { Credential } from "../../credentials"
import { roDescr } from "../../utils/roDescr";
import { CertificateType, certTypeToString } from "./CertificateType"
import { ICert } from "./ICert"
import { DRepLike, toRealDRep } from "../../governance/DRep/DRepLike";
import { DRep, drepFromCborObj } from "../../governance/DRep/DRep";
import { CanBeHash28, Hash28 } from "../../hashes";
import { Coin } from "../Coin";
import { forceBigUInt } from "../../utils/ints";
import { Data, DataConstr } from "@harmoniclabs/plutus-data";
import { ToDataVersion, definitelyToDataVersion } from "../../toData/defaultToDataVersion";

export interface ICertVoteRegistrationDeleg {
    stakeCredential: Credential,
    drep: DRepLike,
    coin: Coin,
}

export class CertVoteRegistrationDeleg
    implements ICert, ICertVoteRegistrationDeleg
{
    readonly certType: CertificateType.VoteRegistrationDeleg;
    readonly stakeCredential: Credential;
    readonly drep: DRep;
    readonly coin: bigint;

    constructor({ stakeCredential, drep, coin }: ICertVoteRegistrationDeleg)
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

    toCbor(): CborString
    {
        return Cbor.encode( this.toCborObj() );
    }
    toCborObj(): CborArray
    {
        return new CborArray([
            new CborUInt( this.certType ),
            this.stakeCredential.toCborObj(),
            this.drep.toCborObj(),
            new CborUInt( this.coin )
        ]);
    }

    static fromCborObj( cbor: CborObj ): CertVoteRegistrationDeleg
    {
        if(!(
            cbor instanceof CborArray &&
            cbor.array.length >= 4 &&
            
            cbor.array[0] instanceof CborUInt &&
            Number( cbor.array[0].num ) === CertificateType.VoteRegistrationDeleg &&

            cbor.array[3] instanceof CborUInt
        )) throw new Error("Invalid cbor for 'CertVoteRegistrationDeleg'");

        return new CertVoteRegistrationDeleg({
            stakeCredential: Credential.fromCborObj( cbor.array[1] ),
            drep: drepFromCborObj( cbor.array[2] ),
            coin: cbor.array[3].num
        });
    }

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