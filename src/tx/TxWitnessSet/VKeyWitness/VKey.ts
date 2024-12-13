import { blake2b_224 } from "@harmoniclabs/crypto";
import { definePropertyIfNotPresent } from "@harmoniclabs/obj-utils";
import { PubKeyHash } from "../../../credentials/PubKeyHash";
import { Hash32 } from "../../../hashes/Hash32/Hash32";

export class VKey extends Hash32
{
    /**
     * getter
     */
    readonly hash!: PubKeyHash

    constructor( bs: string | Uint8Array | Hash32 )
    {
        super( bs );

        let _hash: PubKeyHash = undefined as any;
        definePropertyIfNotPresent(
            this, "hash",
            {
                get: () => {
                    if( _hash instanceof PubKeyHash ) return _hash.clone();

                    _hash = new PubKeyHash(
                        Uint8Array.from(
                            blake2b_224( this.toBuffer() )
                        )
                    );

                    return _hash.clone();
                },
                set: () => {},
                enumerable: true,
                configurable: false
            }
        );
        
    }
};