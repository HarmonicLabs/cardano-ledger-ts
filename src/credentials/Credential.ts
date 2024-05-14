import { ToCbor, CborString, Cbor, CborObj, CborArray, CborUInt, CanBeCborString, forceCborString } from "@harmoniclabs/cbor";
import { Cloneable } from "@harmoniclabs/cbor/dist/utils/Cloneable";
import { ToData, Data, DataConstr, DataB } from "@harmoniclabs/plutus-data";
import { Hash28 } from "../hashes/Hash28/Hash28";
import { PubKeyHash } from "./PubKeyHash";
import { defineReadOnlyProperty } from "@harmoniclabs/obj-utils"
import { assert } from "../utils/assert";

export class ValidatorHash extends Hash28 {}

export enum CredentialType {
    KeyHash = 0,
    Script  = 1
};

Object.freeze( CredentialType );

export class Credential<T extends CredentialType = CredentialType>
    implements ToCbor, ToData, Cloneable<Credential<T>>
{
    readonly type!: T;
    readonly hash!: T extends CredentialType.KeyHash ? PubKeyHash : ValidatorHash

    constructor( type: T, hash: Hash28 )
    {
        assert(
            hash instanceof Hash28,
            "can't construct 'Credential'; hash must be instance of an 'Hash28'"
        );
        assert(
            type === CredentialType.KeyHash || type === CredentialType.Script,
            "can't construct 'Credential'; specified type is nor 'key hash' nor 'script'"
        );

        defineReadOnlyProperty(
            this,
            "type",
            type
        );

        defineReadOnlyProperty(
            this,
            "hash",
            type === CredentialType.KeyHash ? 
                ( hash instanceof PubKeyHash ? hash : new PubKeyHash( hash.toBuffer() ) ) :
                ( hash instanceof ValidatorHash ? hash : new ValidatorHash( hash.toBuffer() ) )
        );
    }

    clone(): Credential<T>
    {
        return new Credential(
            this.type,
            this.hash.clone()
        );
    }

    static get fake(): Credential<CredentialType.KeyHash>
    {
        return new Credential(
            CredentialType.KeyHash,
            new Hash28("ff".repeat(28))
        );
    }

    toData( _v?: any ): Data
    {
        return new DataConstr( // PCredential
            this.type,
            [
                // both bytestring alias as argument
                new DataB( this.hash.toBuffer() )
            ]
        )
    }

    /** @deprecated use `keyHash` instead */
    static pubKey( hash: Uint8Array | Hash28 | string ): Credential<CredentialType.KeyHash>
    {
        return Credential.keyHash( hash )
    }

    static keyHash( hash: Uint8Array | Hash28 | string ): Credential<CredentialType.KeyHash>
    {
        return new Credential(
            CredentialType.KeyHash,
            hash instanceof PubKeyHash ?
                hash :
                new PubKeyHash( hash )
        );
    }

    static script( hash: Uint8Array | Hash28 | string ): Credential<CredentialType.Script>
    {
        return new Credential(
            CredentialType.Script,
            hash instanceof ValidatorHash ?
                hash :
                new ValidatorHash( hash )
        );
    }

    toCbor(): CborString
    {
        return Cbor.encode( this.toCborObj() );
    }
    toCborObj(): CborObj
    {
        return new CborArray([
            new CborUInt( this.type ),
            this.hash.toCborObj()
        ])
    }

    static fromCbor( cStr: CanBeCborString ): Credential
    {
        return Credential.fromCborObj( Cbor.parse( forceCborString( cStr ) ) );
    }
    static fromCborObj( cObj: CborObj ): Credential
    {
        if(!(
            cObj instanceof CborArray &&
            cObj.array[0] instanceof CborUInt &&
            (cObj.array[0].num === BigInt( 0 ) || cObj.array[0].num === BigInt( 1 ))
        ))
        throw new Error(`Invalid CBOR format for "Credential"`);

        return new Credential(
            Number( cObj.array[0].num ),
            Hash28.fromCborObj( cObj.array[1] )
        );
    }

    toJson()
    {
        return {
            credentialType: this.type === CredentialType.Script ? "Script" : "KeyHash",
            hash: this.hash.toString()
        }
    }
}