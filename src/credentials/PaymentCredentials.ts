import { ToCbor, CborString, Cbor, CborObj, CborArray, CborUInt, CanBeCborString, forceCborString } from "@harmoniclabs/cbor";
import { Cloneable } from "@harmoniclabs/cbor/dist/utils/Cloneable";
import { ToData, Data, DataConstr, DataB } from "@harmoniclabs/plutus-data";
import { Hash28 } from "../hashes/Hash28/Hash28";
import { PubKeyHash } from "./PubKeyHash";
import { defineReadOnlyProperty } from "@harmoniclabs/obj-utils"
import { assert } from "../utils/assert";

export class ValidatorHash extends Hash28 {}

export type PaymentCredentialsType = "pubKey" | "script";

export class PaymentCredentials<T extends PaymentCredentialsType = PaymentCredentialsType>
    implements ToCbor, ToData, Cloneable<PaymentCredentials<T>>
{
    readonly type!: T;
    readonly hash!: T extends "pubKey" ? PubKeyHash : ValidatorHash

    constructor( type: T, hash: Hash28 )
    {
        assert(
            hash instanceof Hash28,
            "can't construct 'PaymentCredentials'; hash must be instance of an 'Hash28'"
        );
        assert(
            type === "pubKey" || type ==="script",
            "can't construct 'PaymentCredentials'; specified type is nor 'addres' nor 'script'"
        );

        defineReadOnlyProperty(
            this,
            "type",
            type
        );

        defineReadOnlyProperty(
            this,
            "hash",
            type === "pubKey" ? 
                ( hash instanceof PubKeyHash ? hash : new PubKeyHash( hash.asBytes ) ) :
                ( hash instanceof ValidatorHash ? hash : new ValidatorHash( hash.asBytes ) )
        );
    }

    clone(): PaymentCredentials<T>
    {
        return new PaymentCredentials(
            this.type,
            this.hash.clone()
        );
    }

    static get fake(): PaymentCredentials
    {
        return new PaymentCredentials(
            "pubKey",
            new Hash28("ff".repeat(28))
        );
    }

    toData(): Data
    {
        return new DataConstr( // PCredential
            this.type === "pubKey" ?
                0 : // PPubKeyCredential
                1,  // PScriptCredential
            [
                // both bytestring alias as argument
                new DataB( this.hash.asBytes )
            ]
        )
    }

    static pubKey( hash: Uint8Array | Hash28 | string ): PaymentCredentials<"pubKey">
    {
        return new PaymentCredentials(
            "pubKey",
            hash instanceof PubKeyHash ?
                hash :
                new PubKeyHash( hash )
        );
    }

    static script( hash: Uint8Array | Hash28 | string ): PaymentCredentials<"script">
    {
        return new PaymentCredentials(
            "script",
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
            new CborUInt( this.type === "pubKey" ? 0 : 1 ),
            this.hash.toCborObj()
        ])
    }

    static fromCbor( cStr: CanBeCborString ): PaymentCredentials
    {
        return PaymentCredentials.fromCborObj( Cbor.parse( forceCborString( cStr ) ) );
    }
    static fromCborObj( cObj: CborObj ): PaymentCredentials
    {
        if(!(
            cObj instanceof CborArray &&
            cObj.array[0] instanceof CborUInt
        ))
        throw new Error(`Invalid CBOR format for "PaymentCredentials"`);

        return new PaymentCredentials(
            Number( cObj.array[0].num ) === 0 ? "pubKey" : "script",
            Hash28.fromCborObj( cObj.array[1] )
        );
    }
}