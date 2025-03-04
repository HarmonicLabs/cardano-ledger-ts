import { ToCbor, CborString, Cbor, CborObj, CborArray, CborUInt, CanBeCborString, forceCborString, SubCborRef } from "@harmoniclabs/cbor";
import { Cloneable } from "@harmoniclabs/cbor/dist/utils/Cloneable";
import { ToData, Data, DataConstr, DataB } from "@harmoniclabs/plutus-data";
import { canBeHash28, CanBeHash28, Hash28 } from "../hashes/Hash28/Hash28";
import { PubKeyHash } from "./PubKeyHash";
import { defineReadOnlyProperty } from "@harmoniclabs/obj-utils";
import { assert } from "../utils/assert";
import { getSubCborRef, subCborRefOrUndef } from "../utils/getSubCborRef";

export class ValidatorHash extends Hash28 {}

export enum CredentialType {
    KeyHash = 0,
    Script = 1,
}

Object.freeze(CredentialType);

export interface ICredential<T extends CredentialType = CredentialType> {
    type: T;
    hash: CanBeHash28;
}
export class Credential<T extends CredentialType = CredentialType> 
    implements ToCbor, ToData, Cloneable<Credential<T>> 
{
    readonly type!: T;
    readonly hash!: T extends CredentialType.KeyHash ? PubKeyHash : ValidatorHash;


    constructor(
        credential: ICredential<T>,
        readonly cborRef: SubCborRef | undefined = undefined
    ) 
    {
        const { 
            type, 
            hash 
        } = credential;

        if (!(
            canBeHash28(hash)
        )) throw new Error("can't construct 'Credential'; hash must be instance of an 'Hash28'");

        if (!(
            type === CredentialType.KeyHash || 
            type === CredentialType.Script
        ))throw new Error("can't construct 'Credential'; specified type is nor 'key hash' nor 'script'");

      
        /* TODO: come back to this */
        this.type = type;

        this.hash = type === CredentialType.KeyHash ? 
            ( hash instanceof PubKeyHash ? hash : new PubKeyHash( new Hash28( hash ).toBuffer() ) ) :
            ( hash instanceof ValidatorHash ? hash : new ValidatorHash( new Hash28( hash ).toBuffer() ) )
        
         /* TO DO: this.cboRref params */
         this.cborRef = cborRef ?? subCborRefOrUndef(credential);
    }

    clone(): Credential<T> {
        return new Credential({ 
            type: this.type, 
            hash: this.hash.clone() 
        }, this.cborRef?.clone());
    }

    static get fake(): Credential<CredentialType.KeyHash> {
        return new Credential({ 
            type: CredentialType.KeyHash, 
            hash: new Hash28("ff".repeat(28)) 
        });
    }

    toData(_v?: any): DataConstr {
        return new DataConstr(
            this.type,
            [new DataB(this.hash.toBuffer())]
        ); // PCredential
    }

    static fromData(data: Data): Credential {
        if (!(data instanceof DataConstr)) throw new Error("invalid data for credential");

        const tag = data.constr;
        const hash = data.fields[0];

        if (!(hash instanceof DataB)) throw new Error("invalid data for credential");

        return new Credential({ 
            type: tag <= 0 ? CredentialType.KeyHash : CredentialType.Script, 
            hash: new Hash28(hash.bytes.toBuffer()) 
        });
    }

    /** @deprecated use `keyHash` instead */
    static pubKey(hash: Uint8Array | Hash28 | string): Credential<CredentialType.KeyHash> {
        return Credential.keyHash(hash);
    }

    static keyHash(hash: Uint8Array | Hash28 | string): Credential<CredentialType.KeyHash> {
        return new Credential({ 
            type: CredentialType.KeyHash, 
            hash: hash instanceof PubKeyHash ? hash : new PubKeyHash(hash) 
        });
    }

    static script(hash: Uint8Array | Hash28 | string): Credential<CredentialType.Script> {
        return new Credential({
            type: CredentialType.Script, 
            hash: hash instanceof ValidatorHash ? hash : new ValidatorHash(hash)
    });
    }

    toCborBytes(): Uint8Array {
        if (this.cborRef instanceof SubCborRef) return this.cborRef.toBuffer();
        return this.toCbor().toBuffer();
    }
    toCbor(): CborString {
        if (this.cborRef instanceof SubCborRef) {
            /* TODO: validate cbor structure */
            // we assume correctness here
            return new CborString(this.cborRef.toBuffer());
        }

        return Cbor.encode(this.toCborObj());
    }
    toCborObj(): CborObj {
        if (this.cborRef instanceof SubCborRef) {
            // TODO: validate cbor structure
            // we assume correctness here
            return Cbor.parse(this.cborRef.toBuffer());
        }
        return new CborArray([new CborUInt(this.type), this.hash.toCborObj()]);
    }

    static fromCbor(cStr: CanBeCborString): Credential {
        return Credential.fromCborObj(Cbor.parse(forceCborString(cStr), { keepRef: true }));
    }

    static fromCborObj(cObj: CborObj): Credential {
        if (
            !(
                cObj instanceof CborArray &&
                cObj.array[0] instanceof CborUInt &&
                (cObj.array[0].num === BigInt(0) || cObj.array[0].num === BigInt(1))
            )
        )
            throw new Error(`Invalid CBOR format for "Credential"`);

        return new Credential({ 
                type: Number(cObj.array[0].num) as CredentialType, 
                hash: Hash28.fromCborObj(cObj.array[1]) 
            }, getSubCborRef(cObj)
        );
    }

    toJSON() {
        return this.toJson();
    }
    toJson() {
        return {
            credentialType: this.type === CredentialType.Script ? "Script" : "KeyHash",
            hash: this.hash.toString(),
        };
    }
}
