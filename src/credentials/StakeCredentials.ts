import { ToCbor, CborString, Cbor, CborObj, CborArray, CborUInt, CanBeCborString, forceCborString, CborBytes } from "@harmoniclabs/cbor";
import { ToData, DataConstr, DataI } from "@harmoniclabs/plutus-data";
import { Hash28 } from "../hashes/Hash28/Hash28";
import { CanBeUInteger, canBeUInteger, forceBigUInt } from "../utils/ints";
import { Credential, CredentialType } from "./Credential";
import { StakeKeyHash } from "./StakeKeyHash";
import { defineReadOnlyProperty } from "@harmoniclabs/obj-utils"
import { assert } from "../utils/assert";
import { ToDataVersion, definitelyToDataVersion } from "../toData/defaultToDataVersion";

export class StakeValidatorHash extends Hash28 {}

export type StakeCredentialsType = "stakeKey" | "script" | "pointer" ;

export type StakeHash<T extends StakeCredentialsType> =
    T extends "stakeKey" ? StakeKeyHash :
    T extends "script" ? StakeValidatorHash :
    T extends "pointer" ? [ CanBeUInteger, CanBeUInteger, CanBeUInteger ] :
    never;

export class StakeCredentials<T extends StakeCredentialsType = StakeCredentialsType>
    implements ToCbor, ToData
{
    readonly type!: T;
    readonly hash!: StakeHash<T>

    constructor( type: T, hash: StakeHash<T> )
    {
        assert(
            hash instanceof Hash28,
            "can't construct 'StakeCredentials'; hash must be instance of an 'Hash28'"
        );
        assert(
            type === "stakeKey" || type ==="script" || type === "pointer",
            "can't construct 'Credential'; specified type is nor 'addres' nor 'script'"
        );

        defineReadOnlyProperty( this, "type", type );

        if( type === "pointer" )
        {
            if(!(
                Array.isArray( hash ) &&
                hash.length === 3 &&
                hash.every( canBeUInteger )
            ))
            throw new Error(
                "invalid argument for stake credentials of type " + type
            );

            defineReadOnlyProperty(
                this,
                "hash",
                hash.map( forceBigUInt )
            );
        }
        else
        {
            if( !( hash instanceof Hash28 ) )
            throw new Error(
                "invalid argument for stake credentials of type " + type
            );

            defineReadOnlyProperty(
                this,
                "hash",
                type === "stakeKey" ? 
                    ( hash instanceof StakeKeyHash ? hash : new StakeKeyHash( hash.toBuffer() ) ) :
                    ( hash instanceof StakeValidatorHash ? hash : new StakeValidatorHash( hash.toBuffer() ) )
            );
        }
    }

    clone(): StakeCredentials<T>
    {
        return new StakeCredentials(
            this.type,
            this.hash
        );
    }

    toData( version?: ToDataVersion ): DataConstr
    {
        if( this.type === "pointer" )
        {
            return new DataConstr(
                1, // PStakingPtr
                ( this.hash as StakeHash<"pointer"> )
                .map( n => new DataI( forceBigUInt( n ) ) )
            );
        }
        return new DataConstr(
            0, // PStakingHash
            [
                new Credential(
                    this.type === "stakeKey" ? CredentialType.KeyHash : CredentialType.Script,
                    (this.hash as StakeHash<"script" | "stakeKey">)
                ).toData( version )
            ]
        );
    }

    toCbor(): CborString
    {
        return Cbor.encode( this.toCborObj() );
    }

    toCborObj(): CborObj
    {
        return new CborArray([
            new CborUInt( this.type === "stakeKey" ? 0 : 1 ),
            Array.isArray( this.hash ) ?
                new CborArray(
                    this.hash
                    .map( n => new CborUInt( forceBigUInt( n ) ) )
                ) :
                this.hash.toCborObj()
        ])
    }

    static fromCbor( cObj: CanBeCborString ): StakeCredentials
    {
        return StakeCredentials.fromCborObj( Cbor.parse( forceCborString( cObj ) ) )
    }
    static fromCborObj( cObj: CborObj ): StakeCredentials
    {
        if(!( cObj instanceof CborArray ))
        throw new Error(`Invalid CBOR fromat for "StakeCredentials"`);

        const [ _type, _creds ] = cObj.array;

        if(!( _type instanceof CborUInt ))
        throw new Error(`Invalid CBOR fromat for "StakeCredentials"`);

        if(!( _creds instanceof CborArray || _creds instanceof CborBytes ))
        throw new Error(`Invalid CBOR fromat for "StakeCredentials"`);

        if( _creds instanceof CborArray )
        {
            if(!_creds.array.every( n => n instanceof CborUInt ))
            throw new Error(`Invalid CBOR fromat for "StakeCredentials"`);

            return new StakeCredentials(
                "pointer",
                _creds.array.map( n => (n as CborUInt).num ) as any
            );
        }

        return new StakeCredentials(
            _type.num === BigInt(0) ? "stakeKey" : "script",
            Hash28.fromCborObj( _creds ) 
        );
    }

    toJson()
    {
        switch( this.type )
        {
            case "script":
                return {
                    type: "script",
                    hash: this.hash.toString()
                }
            case "stakeKey":
                return {
                    type: "stakeKey",
                    hash: this.hash.toString()
                }
            case "pointer":
                return {
                    type: "pointer",
                    pointer: (this.hash as [CanBeUInteger, CanBeUInteger, CanBeUInteger])
                        .map( n => forceBigUInt( n ).toString() )
                }
            default:
                throw new Error("unknown stake credentials type")
        }
    }
}