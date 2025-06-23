import { NetworkT } from "../ledger/Network";
import { StakeCredentials, StakeCredentialsType, StakeValidatorHash } from "../credentials/StakeCredentials";
import { StakeKeyHash } from "../credentials/StakeKeyHash";
import { Hash28 } from "../hashes/Hash28/Hash28";
import { CredentialType, PublicKey } from "../credentials";
import { encodeBech32, decodeBech32, byte } from "@harmoniclabs/crypto";
import { fromHex } from "@harmoniclabs/uint8array-utils";
import { Credential } from "../credentials";
import { CanBeCborString, Cbor, CborBytes, CborObj, forceCborString, SubCborRef } from "@harmoniclabs/cbor";
import { getSubCborRef, subCborRefOrUndef } from "../utils/getSubCborRef";


export type StakeAddressBech32 = `stake1${string}` | `stake_test1${string}`;

export type StakeAddressType = "stakeKey" | "script";

export type StakeAddressCredentials<T extends StakeAddressType> = T extends "stakeKey"
    ? StakeKeyHash
    : StakeValidatorHash;

export interface IStakeAddress<T extends StakeAddressType = StakeAddressType> {
    network: NetworkT;
    credentials: StakeAddressCredentials<T>;
    type: StakeAddressType;
}
export class StakeAddress<T extends StakeAddressType = StakeAddressType> {
    readonly network!: NetworkT;
    readonly credentials!: StakeAddressCredentials<T>;
    readonly type!: T;

    constructor(
        stakeAddress: IStakeAddress<T>,
        readonly cborRef: SubCborRef | undefined = undefined
    ) 
    {

        const { 
            network,
            credentials,
            type
        } = stakeAddress;

        const t = this.type === undefined ? (credentials instanceof StakeValidatorHash ? "script" : "stakeKey") : this.type;

        if(!(
            t === "script" || 
            t === "stakeKey"
        ))throw new Error("invalid address type");

        this.type = type as T;

        if (!(
            network === "mainnet" || 
            network === "testnet"
        )) throw new Error("invalid network");

        this.network = network;

        if(!(
            credentials instanceof Hash28 &&
            (
                (t === "stakeKey" && !(credentials instanceof StakeValidatorHash)) ||
                (t === "script" && !(credentials instanceof StakeKeyHash))
            )
        )) throw new Error("invalid stake credentials");

        this.credentials = t === "stakeKey" ? new StakeKeyHash(credentials) : new StakeValidatorHash(credentials);

        this.cborRef = cborRef ?? subCborRefOrUndef(stakeAddress);
    }

    clone(): StakeAddress<T> {
        return new StakeAddress({
            network: this.network, 
            credentials: this.credentials,
            type: this.type
        });
    }

    toString(): StakeAddressBech32 {
        return encodeBech32(this.network === "mainnet" ? "stake" : "stake_test", this.toBytes()) as StakeAddressBech32;
    }

    static fromString(str: string): StakeAddress;
    static fromString<T extends StakeAddressType = StakeAddressType>(str: string, type: T): StakeAddress<T>;
    static fromString(str: string, type: StakeAddressType = "stakeKey") {
        const [hrp, creds] = decodeBech32(str);

        if (hrp !== "stake" && hrp !== "stake_test") throw new Error("invalid stake address string");

        return StakeAddress.fromBytes(creds, hrp === "stake" ? "mainnet" : "testnet", type);
    }

    toBuffer(): Uint8Array {
        return new Uint8Array(this.toBytes());
    }

    toBytes(): byte[] {
        return [
            // header byte
            // second nubble = network
            ((this.network === "mainnet" ? 0b0000_0001 : 0b0000_0000) |
                // first nibble infos
                (this.type === "script" ? 0b1111_0000 : 0b1110_0000)) as byte,
        ].concat(Array.from(this.credentials.toBuffer()) as byte[]);
    }

    static fromBytes(
        bs: byte[] | string | Uint8Array,
        netwok: NetworkT = "mainnet",
        type: StakeAddressType = "stakeKey"
    ): StakeAddress {
        bs = Uint8Array.from(typeof bs === "string" ? fromHex(bs) : bs);

        if (bs.length === 29) {
            const header = bs[0];
            bs = bs.slice(1);
            type = Boolean(header & 0b0001_0000) ? "script" : "stakeKey";
            netwok = Boolean(header & 0b1111) ? "mainnet" : "testnet";
        }

        return new StakeAddress({
            network: netwok, 
            credentials: bs.length === 28 ? new Hash28(bs) : new PublicKey(bs).hash, 
            type
        });
    }

    toCborObj(): CborObj {
        return new CborBytes(this.toBuffer());
    }

    static fromCbor(cStr: CanBeCborString): StakeAddress {
        return StakeAddress.fromCborObj(Cbor.parse(forceCborString(cStr)));
    }
    static fromCborObj(cObj: CborObj): StakeAddress {
        if (!(cObj instanceof CborBytes)) throw new Error(`Invalid CBOR format for "Hash"`);

        return StakeAddress.fromBytes(cObj.bytes);
    }

    toCredential() {
        return new Credential({
            type: this.type === "script" ? CredentialType.Script : CredentialType.KeyHash,
            hash: new Hash28(this.credentials)
        });
    }

    toStakeCredentials(): StakeCredentials {
        return new StakeCredentials({
            type: this.type === "script" ? StakeCredentialsType.Script : StakeCredentialsType.KeyHash,
            hash: new Hash28(this.credentials) as any
        });
    }
}
