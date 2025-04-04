import { CanBeCborString, CborObj } from "@harmoniclabs/cbor";
import { deriveEd25519PublicKey, byte, deriveEd25519PublicKey_sync } from "@harmoniclabs/crypto";
import { Hash32 } from "../hashes/Hash32/Hash32";
import { PublicKey } from "./PublicKey";

export class PrivateKey extends Hash32
{
    derivePublicKey(): PublicKey
    {
        return new PublicKey(
            new Uint8Array(
                deriveEd25519PublicKey_sync(
                    this.toBuffer()
                )
            )
        );
    }

    static fromCbor(cStr: CanBeCborString)
    {
        return new PrivateKey( Hash32.fromCbor( cStr ).toBuffer() )
    }
    static fromCborObj( cObj: CborObj )
    {
        return new PrivateKey(
            Hash32.fromCborObj( cObj ).toBuffer()
        )
    }
}