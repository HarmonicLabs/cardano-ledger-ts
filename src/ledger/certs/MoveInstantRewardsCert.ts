import { CborMap, CborNegInt, CborUInt, CborObj, ToCbor, CborString, Cbor, CborArray } from "@harmoniclabs/cbor";
import { StakeCredentials } from "../../credentials";
import { canBeUInteger, forceBigUInt } from "../../utils/ints";
import { Coin } from "../Coin";
import { assert } from "../../utils/assert";
import { hasOwn, defineReadOnlyProperty } from "@harmoniclabs/obj-utils";


export const enum InstantRewardsSource {
    Reserves = 0,
    Treasurery = 1
}

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
    stakeCredentials: StakeCredentials,
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
            stakeCredentials: StakeCredentials.fromCborObj( k ),
            amount: v.num
        }
    }

    return rewMap;
}

export class MoveInstantRewardsCert
    implements ToCbor
{
    readonly source!: InstantRewardsSource;
    /**
     * If the second field is a map, funds are moved to stake credentials,
     * otherwise the funds are given to the other accounting pot
     * (eg. source is Reserve, hence founds are going to treasurery)
     */
    readonly destintaion!: RewardsMap | Coin

    constructor( source: InstantRewardsSource, destintaion: RewardsMap | Coin )
    {
        assert(
            source === InstantRewardsSource.Reserves ||
            source === InstantRewardsSource.Treasurery,
            "invalid 'source' while constructing 'MoveInstantRewardsCert'"
        );
        assert(
            canBeUInteger( destintaion ) ||
            (
                Array.isArray( destintaion ) &&
                destintaion.every( entry => (
                    hasOwn( entry, "amount" ) &&
                    hasOwn( entry, "stakeCredentials" ) &&
                    (
                        (typeof (entry.amount) === "number" && entry.amount === Math.round( entry.amount )) ||
                        (typeof (entry.amount) === "bigint")
                    )  &&
                    entry.stakeCredentials instanceof StakeCredentials
                ))
            ),
            "invalid 'destintaiton' while constructing 'MoveInstantRewardsCert'"
        );

        defineReadOnlyProperty(
            this,
            "source",
            source
        );
        defineReadOnlyProperty(
            this,
            "destintaion",
            destintaion
        );
    }

    toCbor(): CborString
    {
        return Cbor.encode( this.toCborObj() );
    }

    toCborObj(): CborObj
    {
        return new CborArray([
            new CborUInt( this.source ),
            canBeUInteger( this.destintaion ) ?
                new CborUInt( forceBigUInt( this.destintaion ) ) :
                rewardsMapToCborObj( this.destintaion )
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

        return new MoveInstantRewardsCert(
            Number( _src.num ),
            _dst instanceof CborUInt ?
            _dst.num :
            rewardsMapFromCborObj( _dst )
        )
    }

    toJson()
    {
        return {
            source: rewardSourceToStr( this.source ),
            destination: canBeUInteger( this.destintaion ) ?
                forceBigUInt( this.destintaion ).toString() :
                (this.destintaion as RewardsMap).map( ({ stakeCredentials, amount }) => 
                    ({
                        stakeCreds: stakeCredentials.toJson(),
                        amount: forceBigUInt( amount ).toString()
                    })
                )
        };
    }
}