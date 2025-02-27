import { StakeAddress, StakeAddressBech32 } from "./StakeAddress";
import { NetworkT } from "./Network";
import { Address } from "./Address";
import { ToCbor, CborString, Cbor, CborObj, CborMap, CborUInt, CanBeCborString, forceCborString, SubCborRef } from "@harmoniclabs/cbor";
import { ToData, DataMap, DataConstr, DataI, DataPair } from "@harmoniclabs/plutus-data";
import { CanBeHash28, Hash28, canBeHash28 } from "../hashes";
import { canBeUInteger, forceBigUInt } from "../utils/ints";
import { Coin } from "./Coin";
import { Value } from "./Value";
import { assert } from "../utils/assert";
import { defineReadOnlyProperty } from "@harmoniclabs/obj-utils";
import { ToDataVersion } from "../toData/defaultToDataVersion";
import { getSubCborRef } from "../utils/getSubCborRef";

export type ITxWithdrawalsEntryBigInt = {
    rewardAccount: StakeAddress,
    amount: bigint
}

export type TxWithdrawalsMapBigInt = ITxWithdrawalsEntryBigInt[];

export type ITxWithdrawalsEntry = {
    rewardAccount: CanBeHash28 | StakeAddress,
    amount: Coin
}

export type ITxWithdrawalsMap = ITxWithdrawalsEntry[];

export type ITxWithdrawals
    = { [rewardAccount: StakeAddressBech32]: Coin }
    | ITxWithdrawalsMap;

export function isTxWithdrawalsMap( stuff: any ): stuff is ITxWithdrawalsMap
{
    if( !Array.isArray( stuff ) ) return false;

    return stuff.every( ({ rewardAccount, amount }) => 
        (
            canBeHash28( rewardAccount ) ||
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
            void StakeAddress.fromString( k );

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
    readonly map!: Readonly<TxWithdrawalsMapBigInt>

    constructor(
        map: ITxWithdrawals,
        readonly cborRef: SubCborRef | undefined = undefined,
        network: NetworkT = "mainnet"
    )
    {
        if(!(
            isITxWithdrawals( map )
        ))throw new Error("invalid 'ITxWithdrawalsMap' passed to construct a 'TxWithdrawals'")

        if( Array.isArray( map ) )
        {
            const _map = map.map( entry => ({
                rewardAccount:
                    entry.rewardAccount instanceof StakeAddress ?
                        entry.rewardAccount.clone() :
                        new StakeAddress(
                            network,
                            new Hash28( entry.rewardAccount )
                        ),
                amount: forceBigUInt( entry.amount )
            }));
            this.map =  Object.freeze(_map)

        }
        else
        {
            if(!(
                typeof map === "object"
            ))throw new Error("invalid object passed as 'ITxWithdrawalsMap' to construct a 'TxWithdrawals'")

            this.map = Object.keys( map )
            .map( rewAccount => Object.freeze({
                rewardAccount: StakeAddress.fromString( rewAccount ),
                amount: forceBigUInt( (map as any)[rewAccount] )
            }))
        }
    }

    toTotalWitdrawn(): Value
    {
        return Value.lovelaces(
            this.map
            .reduce( (a,b) => a + b.amount , BigInt(0) )
        )
    }

    toData( version?: ToDataVersion | undefined): DataMap<DataConstr,DataI>
    {
        return new DataMap(
            this.map
            .map( ({ rewardAccount, amount }) =>
                new DataPair(
                    rewardAccount.toStakeCredentials().toData( version ),
                    new DataI( amount )
                )
            )
        );
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
        return new CborMap(
            this.map.map( entry => {
                return {
                    k: entry.rewardAccount.toCborObj(),
                    v: new CborUInt( entry.amount )
                }
            })
        )
    }

    static fromCbor( cStr: CanBeCborString ): TxWithdrawals
    {
        return TxWithdrawals.fromCborObj( Cbor.parse( forceCborString( cStr ), { keepRef: true } ) );
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
                    rewardAccount: StakeAddress.fromCborObj( k ),
                    amount: v.num
                }
            }),
            getSubCborRef( cObj )
        );
    }

    toJSON() { return this.toJson(); }
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
            })),
            undefined,
            network
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