import { blake2b_224 } from "@harmoniclabs/crypto";
import { PubKeyHash } from "../../../credentials/PubKeyHash";
import { Hash32 } from "../../../hashes/Hash32/Hash32";

export class VKey extends Hash32
{
    /**
     * getter
     */
    
    // --------- hash ---- //
    private _hash!: PubKeyHash;

    get hash(): PubKeyHash
    {
        if( this._hash instanceof PubKeyHash ) return this._hash;

        this._hash = new PubKeyHash(
            Uint8Array.from(
                blake2b_224( this.toBuffer() )
            )
        );

        return this._hash;
    }
    
    constructor( bs: string | Uint8Array | Hash32 )
    {
        super( bs );
    }
};