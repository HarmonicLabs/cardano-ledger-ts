import { StakeAddress, StakeAddressBech32 } from "./StakeAddress";
import { NetworkT } from "./Network";
import { Address } from "./Address";
import { ToCbor, CborString, Cbor, CborObj, CborMap, CborUInt, CanBeCborString, forceCborString } from "@harmoniclabs/cbor";
import { ToData, DataMap, DataConstr, DataI, DataPair } from "@harmoniclabs/plutus-data";
import { Hash28 } from "../hashes";
import { canBeUInteger, forceBigUInt } from "../utils/ints";
import { Coin } from "./Coin";
import { Value } from "./Value";
import { assert } from "../utils/assert";
import { defineReadOnlyProperty } from "@harmoniclabs/obj-utils";

export type TxWithdrawalsEntryBigInt = {
    rewardAccount: StakeAddress,
    amount: bigint
}

export type TxWithdrawalsMapBigInt = TxWithdrawalsEntryBigInt[];

export type TxWithdrawalsEntry = {
    rewardAccount: Hash28 | StakeAddress,
    amount: Coin
}

export type TxWithdrawalsMap = TxWithdrawalsEntry[];

export type ITxWithdrawals
    = { [rewardAccount: StakeAddressBech32]: Coin }
    | TxWithdrawalsMap;

export function isTxWithdrawalsMap( stuff: any ): stuff is TxWithdrawalsMap
{
    if( !Array.isArray( stuff ) ) return false;

    return stuff.every( ({ rewardAccount, amount }) => 
        (
            rewardAccount instanceof Hash28 ||
            rewardAccount instanceof StakeAddress
        ) &&
        canBeUInteger( amount )
    );
}

export function isITxWithdrawals( stuff: any ): stuff is ITxWithdrawals
{
    if( typeof stuff !== "object" ) return false;

    if( Array.isArray( stuff ) ) return isTxWithdrawalsMap( stuff );

    const ks = Object.keys( stuff );

    return ks.every( k => {
        try {
            Address.fromString( k );

            return canBeUInteger( stuff[k] )
        }
        catch {
            return false;
        }
    })
}

export class TxWithdrawals
    implements ToCbor, ToData
{
    readonly map!: TxWithdrawalsMapBigInt

    constructor( map: ITxWithdrawals, network: NetworkT = "mainnet" )
    {
        if( Array.isArray( map ) )
        {
            assert(
                map.every( ({ rewardAccount, amount }) => (
                    rewardAccount !== undefined &&
                    amount !== undefined &&
                    (
                        rewardAccount instanceof Hash28 ||
                        rewardAccount instanceof StakeAddress
                    ) &&
                    (
                        (typeof amount === "bigint" && amount >= BigInt( 0 )) ||
                        (typeof amount === "number" && amount === Math.round( Math.abs( amount ) ) )
                    )
                
                )),
                "invalid 'TxWithdrawalsMap' passed to construct a 'TxWithdrawals'"
            );

            const _map = map.map ( entry => ({
                rewardAccount:
                    entry.rewardAccount instanceof StakeAddress ?
                    entry.rewardAccount.clone() :
                    new StakeAddress(
                        network,
                        entry.rewardAccount
                    ),
                amount: forceBigUInt( entry.amount )
            }));

            defineReadOnlyProperty(
                this,
                "map",
                Object.freeze( _map )
            );
        }
        else
        {
            assert(
                typeof map === "object",
                "invalid object passed as 'TxWithdrawalsMap' to construct a 'TxWithdrawals'"
            );

            defineReadOnlyProperty(
                this,
                "map",
                Object.freeze(
                    Object.keys( map )
                    .map( rewAccount => Object.freeze({
                        rewardAccount: StakeAddress.fromString( rewAccount ),
                        amount: forceBigUInt( (map as any)[rewAccount] )
                    }))
                )
            );
        }
    }

    toTotalWitdrawn(): Value
    {
        return Value.lovelaces(
            this.map
            .reduce( (a,b) => a + b.amount , BigInt(0) )
        )
    }

    toData(version?: "v1" | "v2" | undefined): DataMap<DataConstr,DataI>
    {
        return new DataMap(
            this.map
            .map( ({ rewardAccount, amount }) =>
                new DataPair(
                    rewardAccount.toStakeCredentials().toData(),
                    new DataI( amount )
                )
            )
        );
    }

    toCbor(): CborString
    {
        return Cbor.encode( this.toCborObj() );
    }
    toCborObj(): CborObj
    {
        return new CborMap(
            this.map.map( entry => {
                return {
                    k: entry.rewardAccount.credentials.toCborObj(),
                    v: new CborUInt( entry.amount )
                }
            })
        )
    }

    static fromCbor( cStr: CanBeCborString ): TxWithdrawals
    {
        return TxWithdrawals.fromCborObj( Cbor.parse( forceCborString( cStr ) ) );
    }
    static fromCborObj( cObj: CborObj ): TxWithdrawals
    {
        if(!( cObj instanceof CborMap ))
        throw new Error(`Invalid CBOR fromat for "TxWithdrawals"`);

        return new TxWithdrawals(
            cObj.map.map( ({ k, v }) => {

                if(!( v instanceof CborUInt ))
                throw new Error(`Invalid CBOR fromat for "TxWithdrawals"`);

                return {
                    rewardAccount: Hash28.fromCborObj( k ) ,
                    amount: v.num
                }
            })
        )
    }

    toJson(): { [rewardAccount: string]: string }
    {
        const json = {};

        for( const { rewardAccount, amount } of this.map )
        {
            defineReadOnlyProperty(
                json, rewardAccount.toString(), amount.toString()
            );
        }

        return json as any;
    }

    static fromJson( json: any ): TxWithdrawals
    {
        const keys = Object.keys( json );
        
        if( keys.length === 0 ) return new TxWithdrawals({});

        const network = StakeAddress.fromString( keys[0] ).network;

        return new TxWithdrawals(
            keys.map( k => ({
                rewardAccount: StakeAddress.fromString( k ),
                amount: BigInt( json[k] )
            }))
        );
    }
}

export function canBeTxWithdrawals( stuff: any ): stuff is (ITxWithdrawals | TxWithdrawals)
{
    return (stuff instanceof TxWithdrawals) || isITxWithdrawals( stuff );
}

export function forceTxWithdrawals( stuff: TxWithdrawals | ITxWithdrawals ): TxWithdrawals
{
    if( stuff instanceof TxWithdrawals ) return stuff;

    return new TxWithdrawals( stuff );
}