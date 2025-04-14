import { CborMap, CborNegInt, CborUInt, CborObj, ToCbor, CborString, Cbor, CborArray, SubCborRef } from "@harmoniclabs/cbor";
import { hasOwn } from "@harmoniclabs/obj-utils";
import { Data, DataConstr } from "@harmoniclabs/plutus-data";
import { canBeUInteger, forceBigUInt } from "../../../../utils/ints";
import { Coin } from "../../../common/ledger/Coin";
import { CertificateType, certTypeToString } from "../../../common/certs/CertificateType";
import { ToJson } from "../../../../utils/ToJson";
import { Credential } from "../../../../credentials";
import { ICert } from "../../../common/certs/ICert";
import { Hash28 } from "../../../../hashes";
import { ToDataVersion, definitelyToDataVersion } from "../../../../toData/defaultToDataVersion";
import { getSubCborRef } from "../../../../utils/getSubCborRef";

export enum InstantRewardsSource {
    Reserves = 0,
    Treasurery = 1
}

Object.freeze( InstantRewardsSource );

export type RewardSourceToStr<S extends InstantRewardsSource> =
    S extends InstantRewardsSource.Reserves   ? "Reserves" :
    S extends InstantRewardsSource.Treasurery ? "Treasurery" :
    never;

export function rewardSourceToStr<S extends InstantRewardsSource>( source: S ): RewardSourceToStr<S>
{
    switch( source )
    {
        case InstantRewardsSource.Reserves: return "Reserves" as any;
        case InstantRewardsSource.Treasurery: return "Treasurery" as any;
        default:
            throw new Error("unknown instant rewards source")
    }
}

export type RewardsMap = {
    stakeCredentials: Credential,
    amount: number | bigint
}[]

function rewardsMapToCborObj( map: RewardsMap ): CborMap
{
    return new CborMap(
        map.map( entry => {
            const amt = entry.amount;
            return {
                k: entry.stakeCredentials.toCborObj(),
                v: amt < 0 ? new CborNegInt( amt ) : new CborUInt( amt )
            }
        })
    )
}

function rewardsMapFromCborObj( cObj: CborObj ): RewardsMap
{
    if(!( cObj instanceof CborMap ))
    throw new Error(`Invalid CBOR fromat for "MoveInstantRewardsCert"`);

    const map = cObj.map;
    const len = map.length;

    const rewMap: RewardsMap = new Array( len );

    for( let i = 0; i < len; i++ )
    {
        const { k, v } = map[i];

        if(!(
            v instanceof CborUInt ||
            v instanceof CborNegInt
        ))
        throw new Error(`Invalid CBOR fromat for "MoveInstantRewardsCert"`);

        rewMap[i] = {
            stakeCredentials: Credential.fromCborObj( k ),
            amount: v.num
        }
    }

    return rewMap;
}

export interface IMoveInstantRewardsCert {
    source: InstantRewardsSource,
    destination: RewardsMap | Coin
}

/** @deprecated */
export class MoveInstantRewardsCert
    implements ToCbor, ToJson, ICert
{
    readonly certType: CertificateType.MoveInstantRewards;
    readonly source!: InstantRewardsSource;
    /**
     * If the second field is a map, funds are moved to stake credentials,
     * otherwise the funds are given to the other accounting pot
     * (eg. source is Reserve, hence founds are going to treasurery)
     */
    readonly destination!: RewardsMap | Coin

    constructor(
        { source, destination }: IMoveInstantRewardsCert,
        readonly cborRef: SubCborRef | undefined = undefined
    )
    {
        if(!(
            source === InstantRewardsSource.Reserves || 
            source === InstantRewardsSource.Treasurery
        )) throw new Error("invalid 'source' while constructing 'MoveInstantRewardsCert'");
        
        if(!(
            canBeUInteger( destination ) ||
            (
                Array.isArray( destination ) &&
                destination.every( entry => (
                    hasOwn( entry, "amount" ) &&
                    hasOwn( entry, "stakeCredentials" ) &&
                    (
                        (typeof (entry.amount) === "number" && entry.amount === Math.round( entry.amount )) ||
                        (typeof (entry.amount) === "bigint")
                    )  &&
                    entry.stakeCredentials instanceof Credential
                ))
            )
        ))throw new Error("invalid 'destintaiton' while constructing 'MoveInstantRewardsCert'");

        this.certType = CertificateType.MoveInstantRewards;

        this.source = source;

        this.destination = destination;

        /* TODO: deprecated */
        // this.cborRef = cborRef ?? getSubCborRef( this );
    }

    toData( version?: ToDataVersion | undefined): DataConstr
    {
        version = definitelyToDataVersion( version );

        if( version !== "v1" && version !== "v2" )
        throw new Error(
            "MIR certificate was deprecated with plutus v3; version:" + version
        );

        return new DataConstr( 6, [] );
    }

    getRequiredSigners(): Hash28[]
    {
        return [];
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

    toCborObj(): CborObj
    {
        if( this.cborRef instanceof SubCborRef )
        {
            // TODO: validate cbor structure
            // we assume correctness here
            return Cbor.parse( this.cborRef.toBuffer() );
        }
        return new CborArray([
            new CborUInt( this.source ),
            canBeUInteger( this.destination ) ?
                new CborUInt( forceBigUInt( this.destination ) ) :
                rewardsMapToCborObj( this.destination )
        ]);
    }

    static fromCborObj( cObj: CborObj ): MoveInstantRewardsCert
    {
        if(!( cObj instanceof CborArray ))
        throw new Error(`Invalid CBOR fromat for "MoveInstantRewardsCert"`);

        const [
            _src,
            _dst
        ] = cObj.array;

        if(!( _src instanceof CborUInt ))
        throw new Error(`Invalid CBOR fromat for "MoveInstantRewardsCert"`);

        return new MoveInstantRewardsCert({
            source: Number( _src.num ),
            destination: _dst instanceof CborUInt ?
                _dst.num :
                rewardsMapFromCborObj( _dst )
        }, getSubCborRef( cObj ));
    }

    toJSON() { return this.toJson(); }
    toJson()
    {
        return {
            certType: certTypeToString( this.certType ), 
            source: rewardSourceToStr( this.source ),
            destination: canBeUInteger( this.destination ) ?
                forceBigUInt( this.destination ).toString() :
                (this.destination as RewardsMap).map( ({ stakeCredentials, amount }) => 
                    ({
                        stakeCreds: stakeCredentials.toJson(),
                        amount: forceBigUInt( amount ).toString()
                    })
                )
        };
    }
}