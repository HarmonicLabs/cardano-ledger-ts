import { ToCbor, CborObj, CborBytes, CborString, Cbor, CanBeCborString, forceCborString, SubCborRef } from "@harmoniclabs/cbor";
import { byte, encodeBech32, decodeBech32 } from "@harmoniclabs/crypto";
import { ToData, Data, DataConstr } from "@harmoniclabs/plutus-data";
import { Credential, StakeCredentials, StakeCredentialsType, CredentialType, PublicKey } from "../credentials";
import { Hash28 } from "../hashes";
import { forceBigUInt } from "../utils/ints";
import { NetworkT } from "./Network";
import { defineReadOnlyProperty } from "@harmoniclabs/obj-utils";
import { assert } from "../utils/assert";
import { nothingData, justData } from "../utils/maybeData";
import UPLCFlatUtils from "../utils/UPLCFlatUtils";
import { fromHex, toHex } from "@harmoniclabs/uint8array-utils";
import { harden, XPrv } from "@harmoniclabs/bip32_ed25519";
import { ToDataVersion } from "../toData/defaultToDataVersion";
import { getSubCborRef } from "../utils/getSubCborRef";

export type AddressStr = `${"addr1"|"addr_test1"}${string}`;

export function isAddressStr( stuff: any ): stuff is AddressStr
{
    if( typeof stuff !== "string" ) return false;
    
    try {
        Address.fromString( stuff );
        return true;
    } catch {
        return false;
    }
}

export type AddressType
    = "base"
    | "pointer"
    | "enterprise"
    | "bootstrap"
    | "unknown"

/**
 * shelley specification in cardano-ledger; page 113
 */
export class Address
    implements ToData, ToCbor
{
    readonly network!: NetworkT
    readonly paymentCreds!: Credential
    readonly stakeCreds?: StakeCredentials
    readonly type!: AddressType;

    static mainnet(
        paymentCreds: Credential,
        stakeCreds?: StakeCredentials,
        type?: AddressType
    ): Address
    {
        return new Address(
            "mainnet",
            paymentCreds,
            stakeCreds,
            type
        );
    }

    static testnet(
        paymentCreds: Credential,
        stakeCreds?: StakeCredentials,
        type?: AddressType
    ): Address
    {
        return new Address(
            "testnet",
            paymentCreds,
            stakeCreds,
            type
        );
    }

    constructor(
        network: NetworkT,
        paymentCreds: Credential,
        stakeCreds?: StakeCredentials,
        type?: AddressType,
        readonly subCborRef?: SubCborRef
    )
    {
        type = type === undefined ? 
            (stakeCreds === undefined ? "enterprise" : "base")
            : type;
        assert(
            type === "base"         ||
            type === "enterprise"   ||
            type === "bootstrap"    ||
            type === "pointer",
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
            paymentCreds instanceof Credential,
            "invalid payment credentials"
        );
        defineReadOnlyProperty(
            this, "paymentCreds", paymentCreds.clone()
        );

        assert(
            stakeCreds === undefined || stakeCreds instanceof StakeCredentials,
            "invalid stake credentials"
        );
        defineReadOnlyProperty(
            this, "stakeCreds", stakeCreds?.clone()
        );

    }

    clone(): Address
    {
        return new Address(
            this.network,
            this.paymentCreds, // cloned in constructor
            this.stakeCreds,   // cloned in constructor
            this.type
        );
    }

    static get fake(): Address
    {
        return new Address(
            "mainnet",
            Credential.fake
        );
    }

    toData( version?: ToDataVersion ): Data
    {
        return new DataConstr(
            0, // export has only 1 constructor,
            [
                this.paymentCreds.toData( version ),
                this.stakeCreds === undefined ?
                    nothingData() :
                    justData( this.stakeCreds.toData( version ) )
            ]
        )
    }

    static fromData( data: Data, network: NetworkT = "mainnet" ): Address
    {
        if(!(data instanceof DataConstr))
        throw new Error("invalid data for address");

        const [ creds, maybeStakeCreds ] = data.fields;
      
        if(!(
          maybeStakeCreds instanceof DataConstr
        )) throw new Error("invalid data for address");
      
        return new Address(
            network,
            Credential.fromData( creds ),
            maybeStakeCreds.constr >= 1 ? undefined : // nothing
            StakeCredentials.fromData( maybeStakeCreds.fields[0] )
        );
    }

    toBytes(): byte[]
    {
        return [(
            // header byte
            // second nubble = network
            ( this.network === "mainnet" ? 0b0000_0001 : 0b0000_0000 ) |
            // first nibble infos  
            (
                this.type === "base" ?       0b0000_0000 :
                this.type === "pointer" ?    0b0100_0000 :
                this.type === "enterprise" ? 0b0110_0000 :
                0b1000 // bootstrap
            ) |
            ( this.stakeCreds?.type === "script"  ? 0b10_0000 : 0b00_0000 ) |
            ( this.paymentCreds.type === CredentialType.Script ? 0b01_0000 : 0b00_0000 )
        ) as byte]
        .concat(
            Array.from( this.paymentCreds.hash.toBuffer() ) as byte[]
        )
        .concat(
            this.stakeCreds === (void 0) ? [] : // add nothing

            Array.isArray( this.stakeCreds.hash ) ? // pointer 
                this.stakeCreds.hash
                .reduce( ( acc, n ) =>
                    acc.concat(
                        Array.from(
                            UPLCFlatUtils.encodeBigIntAsVariableLengthBitStream(
                                forceBigUInt( n )
                            ).toBuffer().buffer
                        ) as byte[]
                    ),
                    [] as byte[]
                ) :
            // hash (script or key)
            Array.from( this.stakeCreds?.hash.toBuffer() ?? [] ) as byte[]
        );
    }

    static fromBytes(
        bs: byte[] | string | Uint8Array,
        subCborRef?: SubCborRef
    ): Address
    {
        bs = Array.from(
            typeof bs === "string" ? fromHex( bs ) : bs
        ) as byte[];

        const [ header, ...payload ] = bs;

        const addrType = (header & 0b1111_0000) >> 4;
        const network: NetworkT = ( (header & 0b0000_1111) ) === 1 ? "mainnet" : "testnet" ;

        const type: AddressType =
            addrType <= 0b0011  ? "base" :
            addrType <= 0b0101  ? "pointer" :
            addrType <= 0b0111  ? "enterprise" :
            addrType === 0b1000 ? "bootstrap" :
            // addrType === 0b1110 || addrType === 0b1111 ? "stake" :
            "unknown";

        let payment: byte[];
        let stake: byte[];

        const paymentType: CredentialType = (addrType & 0b0001) === 1 ? CredentialType.Script: CredentialType.KeyHash; 
        const   stakeType: StakeCredentialsType   = (addrType & 0b0010) === 1 ? StakeCredentialsType.Script: StakeCredentialsType.KeyHash;

        switch( type )
        {
            case "base":
                if( payload.length !== (28 * 2) )
                throw new Error(
                    "address' header specifies a base adress but the payload is incorrect"
                );

                payment = payload.slice( 0, 28 ),
                stake = payload.slice( 28 );
            break;
            case "bootstrap":
            case "enterprise":
            case "pointer":
                if( payload.length < 28 )
                {
                    console.log( toHex( new Uint8Array( payload ) ) )
                    throw new Error(
                        "address' payload is incorrect; payload.length: " + payload.length.toString()
                    );
                }

                payment = payload.slice(0,28),
                stake = []; // ignore pointer; might change in future version
            break;
            default:
                throw new Error("unknown addres type; can't extract payload") 
        }

        if( payment.length !== 28 )
        {
            throw new Error(
                "missing payment credentials"
            )
        }
        
        return new Address(
            network,
            new Credential(
                paymentType,
                new Hash28( new Uint8Array( payment ) )
            ),
            stake.length === 28 ?
                new StakeCredentials(
                    stakeType,
                    new Hash28( new Uint8Array( stake ) )
                ):
                undefined,
            type,
            subCborRef
        );
    };

    toBuffer(): Uint8Array
    {
        return new Uint8Array( this.toBytes() )
    }

    static fromBuffer(
        buff: Uint8Array | string,
        subCborRef?: SubCborRef
    ): Address
    {
        return Address.fromBytes(
            typeof buff === "string" ?
            buff : 
            Array.from( buff ) as byte[],
            subCborRef
        )
    }

    /**
     * gets the standard address for single address wallets
     * 
     * payment key at path "m/1852'/1815'/0'/0/0"
     * stake key at path   "m/1852'/1815'/0'/2/0"
    */
    static fromXPrv( xprv: XPrv, network: NetworkT = "mainnet" ): Address
    {
        const account = xprv
        .derive( harden(1852) )
        .derive( harden(1815) )
        .derive( harden(0) );

        const prv = account.derive( 0 ).derive( 0 );
        const pub = new PublicKey( prv.public().toPubKeyBytes() );
        const pkh = pub.hash;

        const stake_prv = account.derive( 2 ).derive( 0 );
        const stake_pub = new PublicKey( stake_prv.public().toPubKeyBytes() );
        const stake_pkh = stake_pub.hash;

        return new Address(
            network,
            Credential.keyHash( pkh ),
            StakeCredentials.keyHash(stake_pkh)
        );
    }

    /**
     * generates an `XPrv` from entropy and calls `Addres.fromXPrv`
     * 
     * gets the standard address for single address wallets
     * 
     * payment key at path "m/1852'/1815'/0'/0/0"
     * stake key at path   "m/1852'/1815'/0'/2/0"
    */
    static fromEntropy( entropy: Uint8Array | string, network: NetworkT = "mainnet" ): Address
    {
        return Address.fromXPrv( XPrv.fromEntropy( entropy ), network );
    }

    toCborObj(): CborObj
    {
        if( this.subCborRef instanceof SubCborRef )
        {
            // TODO: validate cbor structure
            // we assume correctness here
            return Cbor.parse( this.subCborRef.toBuffer() );
        }
        return new CborBytes( this.toBuffer() );
    }

    static fromCborObj( buff: CborObj ): Address
    {
        if(!( buff instanceof CborBytes ))
        throw new Error(`Invalid CBOR format for "Address"`);

        return Address.fromBuffer(
            buff.bytes,
            getSubCborRef( buff )
        );
    }

    toCbor(): CborString
    {
        if( this.subCborRef instanceof SubCborRef )
        {
            // TODO: validate cbor structure
            // we assume correctness here
            return new CborString( this.subCborRef.toBuffer() );
        }
        
        return Cbor.encode( this.toCborObj() );
    }

    static fromCbor( cbor: CanBeCborString ): Address
    {
        return Address.fromCborObj( Cbor.parse( forceCborString( cbor ) ) );
    }

    toString(): AddressStr
    {
        return encodeBech32(
            this.network === "mainnet" ? "addr" : "addr_test",
            this.toBytes()
        ) as AddressStr;
    }

    static fromBech32( addr: AddressStr ): Address
    {
        return Address.fromString( addr );
    }
    static fromString( addr: string ): Address
    {
        const [ hrp, bytes ] = decodeBech32( addr );

        let hrpNetwork: NetworkT;
        switch( hrp )
        {
            case "addr_test": 
                hrpNetwork = "testnet";
            break;
            case "addr":
                hrpNetwork = "mainnet";
            break;
            default:
                throw new Error(
                    "string passed is not a Cardano address"
                );
        }

        const _addr = Address.fromBytes( bytes );

        if( hrpNetwork !== _addr.network )
        throw new Error(
            "ill formed address; human readable part netwok missmatches header byte network"
        );

        return _addr;
    }

    toJSON() { return this.toJson(); }
    toJson()
    {
        return this.toString();
    }
}