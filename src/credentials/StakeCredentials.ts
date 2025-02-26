import { ToCbor, CborString, Cbor, CborObj, CborArray, CborUInt, CanBeCborString, forceCborString, CborBytes, SubCborRef } from "@harmoniclabs/cbor";
import { ToData, DataConstr, DataI, Data } from "@harmoniclabs/plutus-data";
import { Hash28 } from "../hashes/Hash28/Hash28";
import { CanBeUInteger, canBeUInteger, forceBigUInt } from "../utils/ints";
import { Credential, CredentialType, ValidatorHash } from "./Credential";
import { StakeKeyHash } from "./StakeKeyHash";
import { defineReadOnlyProperty } from "@harmoniclabs/obj-utils"
import { assert } from "../utils/assert";
import { ToDataVersion, definitelyToDataVersion } from "../toData/defaultToDataVersion";
import { getSubCborRef, subCborRefOrUndef } from "../utils/getSubCborRef";
import { PubKeyHash } from "./PubKeyHash";


export class StakeValidatorHash extends Hash28 {}

export enum StakeCredentialsType {
    /** @deprecated use `KeyHash` instead */
    StakeKey = "stakeKey",
    KeyHash  = "stakeKey",
    Script = "script",
    Pointer = "pointer"
}

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

    /** @deprecated use `keyHash` instead */
    static pubKey( hash: Uint8Array | Hash28 | string ): StakeCredentials<StakeCredentialsType.KeyHash>
    {
        return StakeCredentials.keyHash( hash )
    }

    /** @deprecated use `keyHash` instead */
    static stakeKey( hash: Uint8Array | Hash28 | string ): StakeCredentials<StakeCredentialsType.KeyHash>
    {
        return StakeCredentials.keyHash( hash )
    }

    static keyHash( hash: Uint8Array | Hash28 | string ): StakeCredentials<StakeCredentialsType.KeyHash>
    {
        return new StakeCredentials(
            StakeCredentialsType.KeyHash,
            hash instanceof PubKeyHash ?
                hash :
                new PubKeyHash( hash )
        );
    }

    static script( hash: Uint8Array | Hash28 | string ): StakeCredentials<StakeCredentialsType.Script>
    {
        return new StakeCredentials(
            StakeCredentialsType.Script,
            hash instanceof ValidatorHash ?
                hash :
                new ValidatorHash( hash )
        );
    }

    /** @deprecated pointer credentials are deprecated since conway */
    static pointer( hash: [ CanBeUInteger, CanBeUInteger, CanBeUInteger ] ): StakeCredentials<StakeCredentialsType.Pointer>
    {
        return new StakeCredentials(
            StakeCredentialsType.Pointer,
            hash
        );
    }

    constructor(
        type: T,
        hash: StakeHash<T>,
        readonly cborRef: SubCborRef | undefined = undefined
    )
    {
        if(!(
            hash instanceof Hash28
        )) throw new Error("can't construct 'StakeCredentials'; hash must be instance of an 'Hash28'");
    
        if(!(
            type === "stakeKey" || type ==="script" || type === "pointer"
        )) throw new Error("can't construct 'Credential'; specified type is nor 'addres' nor 'script'");

        defineReadOnlyProperty( this, "type", type );

        if( type === "pointer" )
        {
            if(!(
                Array.isArray( hash ) &&
                hash.length === 3 &&
                hash.every( canBeUInteger )
            )) throw new Error( "invalid argument for stake credentials of type " + type );

            this.hash = hash.map( forceBigUInt ) as StakeHash<T>;
        } else {
            if(!( 
                hash instanceof Hash28 
            ))throw new Error("invalid argument for stake credentials of type " + type);

            /* TO DO: change this.hash = type === "stakeKey" ? */
            defineReadOnlyProperty(
                this,
                "hash",
                type === "stakeKey" ? 
                    ( hash instanceof StakeKeyHash ? hash : new StakeKeyHash( hash.toBuffer() ) ) :
                    ( hash instanceof StakeValidatorHash ? hash : new StakeValidatorHash( hash.toBuffer() ) )
            )
        }
        /* TO DO: Change the arguments and create an IStakeCredential? */
        this.cborRef = cborRef ?? subCborRefOrUndef( this );
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
        const isOldVersion = version !== "v1" && version !== "v2";

        if( this.type === "pointer" )
        {
            if( isOldVersion )
            throw new Error("staking pointer was deprecated in conway, can't convert to data");

            return new DataConstr(
                1, // PStakingPtr
                ( this.hash as StakeHash<StakeCredentialsType.Pointer> )
                .map( n => new DataI( forceBigUInt( n ) ) )
            );
        }

        const credData = new Credential(
            this.type === "stakeKey" ? CredentialType.KeyHash : CredentialType.Script,
            (this.hash as StakeHash<StakeCredentialsType.KeyHash | StakeCredentialsType.Script>)
        ).toData( version );

        if( isOldVersion )
        return new DataConstr(
            0, // PStakingHash
            [ credData ]
        );

        return credData;
    }

    static fromData( data: Data ): StakeCredentials
    {
        if(!(data instanceof DataConstr))
        throw new Error("invalid data for stake credential");
        
        if( data.constr === BigInt(1) )
        return new StakeCredentials(
            StakeCredentialsType.Pointer,
            data.fields.map( d => {
                if(!(d instanceof DataI))
                throw new Error("invalid data for stake credential");
                return d.int;
            }) as any,
        );
        
        const creds = Credential.fromData( data.fields[0] );
        
        return new StakeCredentials(
            creds.type === CredentialType.KeyHash ? StakeCredentialsType.KeyHash : StakeCredentialsType.Script,
            creds.hash
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
                StakeCredentialsType.Pointer,
                _creds.array.map( n => (n as CborUInt).num ) as any
            );
        }

        return new StakeCredentials(
            _type.num === BigInt(0) ? StakeCredentialsType.KeyHash : StakeCredentialsType.Script,
            Hash28.fromCborObj( _creds ),
            getSubCborRef( cObj )
        );
    }

    toJSON() { return this.toJson(); }
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