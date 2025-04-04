import { CanBeCborString, CborObj } from "@harmoniclabs/cbor";
import { Hash28 } from "../hashes/Hash28/Hash28";

export class PubKeyHash extends Hash28
{
    static fromCbor(cStr: CanBeCborString)
    {
        return new PubKeyHash( Hash28.fromCbor( cStr ).toBuffer() )
    }
    static fromCborObj( cObj: CborObj )
    {
        return new PubKeyHash( Hash28.fromCborObj( cObj ).toBuffer() )
    }
}