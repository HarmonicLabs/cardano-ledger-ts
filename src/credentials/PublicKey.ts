import { CanBeCborString, CborObj, SubCborRef } from "@harmoniclabs/cbor";
import { blake2b_224 } from "@harmoniclabs/crypto";
import { Hash32 } from "../hashes/Hash32/Hash32";
import { PubKeyHash } from "./PubKeyHash";
import { definePropertyIfNotPresent } from "@harmoniclabs/obj-utils";

export class PublicKey extends Hash32
{
    readonly hash!: PubKeyHash;

    constructor(
        pubKey: string | Uint8Array | Hash32,
        readonly cborRef: SubCborRef | undefined = undefined
    )
    {
        super( pubKey);

        let _hash: PubKeyHash | undefined = undefined;
        definePropertyIfNotPresent(
            this, "hash",
            {
                get: () => {
                    if( _hash !== undefined && _hash instanceof PubKeyHash ) return _hash.clone();

                    _hash = new PubKeyHash(
                        new Uint8Array(
                            blake2b_224(
                                this.toBuffer()
                            )
                        )
                    );

                    return _hash.clone();
                },
                set: () => {},
                configurable: false,
                enumerable: true
            }
        );
        
    }

    static fromCbor(cStr: CanBeCborString)
    {
        return new PublicKey( Hash32.fromCbor( cStr ).toBuffer() )
    }
    static fromCborObj( cObj: CborObj )
    {
        return new PublicKey( Hash32.fromCborObj( cObj ).toBuffer() )
    }
}