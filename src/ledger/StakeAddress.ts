import { NetworkT } from "./Network";
import { StakeCredentials, StakeCredentialsType, StakeValidatorHash } from "../credentials/StakeCredentials";
import { StakeKeyHash } from "../credentials/StakeKeyHash";
import { Hash28 } from "../hashes/Hash28/Hash28";
import { CredentialType, PublicKey } from "../credentials";
import { encodeBech32, decodeBech32, byte } from "@harmoniclabs/crypto";
import { defineReadOnlyProperty } from "@harmoniclabs/obj-utils";
import { assert } from "../utils/assert";
import { fromHex } from "@harmoniclabs/uint8array-utils";
import { Credential } from "../credentials";
import { CanBeCborString, Cbor, CborBytes, CborObj, forceCborString, SubCborRef } from "@harmoniclabs/cbor";
import { getSubCborRef } from "../utils/getSubCborRef";


export type StakeAddressBech32 = `stake1${string}` | `stake_test1${string}`;

export type StakeAddressType = "stakeKey" | "script";

export type StakeAddressCredentials<T extends StakeAddressType> = T extends "stakeKey" ? StakeKeyHash : StakeValidatorHash;

export class StakeAddress<T extends StakeAddressType = StakeAddressType>
{
    readonly network!: NetworkT
    readonly type!: T;
    readonly credentials!: StakeAddressCredentials<T>

    constructor(
        network: NetworkT,
        credentials: Hash28,
        type?: T,
        readonly subCborRef?: SubCborRef
    )
    {
        const t = type === undefined ? 
            (credentials instanceof StakeValidatorHash ? "script" : "stakeKey")
            : type;

        assert(
            t === "script" || t === "stakeKey",
            "invalid address type"
        );
        defineReadOnlyProperty(
            this, "type", type
        );

        assert(
            network === "mainnet" || network === "testnet",
            "invalid network"
        );
        defineReadOnlyProperty(
            this, "network", network
        );

        assert(
            credentials instanceof Hash28 &&
            (
                ( t === "stakeKey" && !(credentials instanceof StakeValidatorHash) ) ||
                ( t === "script" && !(credentials instanceof StakeKeyHash) )
            ),
            "invalid stake credentials"
        );
        defineReadOnlyProperty(
            this, "credentials",
            t === "stakeKey" ? new StakeKeyHash( credentials ) : new StakeValidatorHash( credentials )
        );
    }

    clone(): StakeAddress<T>
    {
        return new StakeAddress(
            this.network,
            this.credentials,
            this.type
        );
    }

    toString(): StakeAddressBech32
    {
        return encodeBech32(
            this.network === "mainnet" ? "stake" : "stake_test",
            this.credentials.toBuffer()
        ) as any;
    }

    static fromString( str: string ): StakeAddress
    static fromString<T extends StakeAddressType = StakeAddressType>( str: string, type: T ): StakeAddress<T>
    static fromString( str: string, type: StakeAddressType = "stakeKey" )
    {
        const [ hrp, creds ] = decodeBech32( str );

        if( hrp !== "stake" && hrp !== "stake_test" )
        throw new Error(
            "invalid stake address string"
        );

        return StakeAddress.fromBytes(
            creds,
            undefined,
            hrp === "stake" ? "mainnet" : "testnet",
            type
        )
    }

    toBytes(): Uint8Array
    {
        return this.credentials.toBuffer();
    }

    static fromBytes(
        bs: byte[] | string | Uint8Array,
        subCborRef?: SubCborRef,
        netwok: NetworkT = "mainnet",
        type: StakeAddressType = "stakeKey",
    ): StakeAddress
    {
        bs = Uint8Array.from( typeof bs === "string" ? fromHex( bs ) : bs );

        if( bs.length === 29 )
        {
            const header = bs[0];
            bs = bs.slice(1);
            type = Boolean(header & 0b0001_0000) ? "script" : "stakeKey";
            netwok = Boolean(header & 0b1111) ? "mainnet" : "testnet";
        }

        return new StakeAddress(
            netwok,
            bs.length === 28 ? new Hash28( bs ) : new PublicKey( bs ).hash,
            type,
            subCborRef
        );
    }

    toCborObj(): CborObj
    {
        if( this.subCborRef instanceof SubCborRef )
        {
            // TODO: validate cbor structure
            // we assume correctness here
            return Cbor.parse( this.subCborRef.toBuffer() );
        }
        return new CborBytes( this.toBytes() )
    }

    static fromCbor( cStr: CanBeCborString ): StakeAddress
    {
        return StakeAddress.fromCborObj( Cbor.parse( forceCborString( cStr ), { keepRef: true } ) );
    }
    static fromCborObj( cObj: CborObj ): StakeAddress
    {
        if(!(cObj instanceof CborBytes ))
        throw new Error(`Invalid CBOR format for "Hash"`);

        return StakeAddress.fromBytes(
            cObj.bytes,
            getSubCborRef( cObj )
        );
    }

    toCredential()
    {
        return new Credential(
            this.type === "script" ? CredentialType.Script : CredentialType.KeyHash,
            new Hash28( this.credentials )
        );
    }
    
    toStakeCredentials(): StakeCredentials
    {
        return new StakeCredentials(
            this.type === "script" ? StakeCredentialsType.Script : StakeCredentialsType.KeyHash,
            new Hash28( this.credentials ) as any,
            undefined
        );
    }
}