import { Cbor, CborArray, CborBytes, CborObj, CborString, CborText } from "@harmoniclabs/cbor";
import { CanBeHash32, Hash32, canBeHash32 } from "../hashes";
import { roDescr } from "../utils/roDescr";
import { isObject } from "@harmoniclabs/obj-utils";

export interface IAnchor {
    url: string,
    anchorDataHash: CanBeHash32
}

export function isIAnchor( stuff: any ): stuff is IAnchor
{
    return isObject( stuff ) && (
        typeof stuff.url === "string" &&
        (stuff.url as string).length <= 128 &&
        canBeHash32( stuff.anchorDataHash )
    );
}

export class Anchor
    implements IAnchor
{
    readonly url: string;
    readonly anchorDataHash: Hash32;

    constructor({ url, anchorDataHash }: IAnchor)
    {
        Object.defineProperties(
            this, {
                url: { value: String( url ), ...roDescr },
                anchorDataHash: { value: new Hash32( anchorDataHash ), ...roDescr }
            }
        );
    }

    toCbor(): CborString
    {
        return Cbor.encode( this.toCborObj() )
    }
    toCborObj(): CborObj
    {
        return new CborArray([
            new CborText( this.url ),
            new CborBytes( this.anchorDataHash.toBuffer() )
        ]);
    }
}