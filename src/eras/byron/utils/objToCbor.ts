import { Attributes } from "./types";
import { CborMap } from "@harmoniclabs/cbor";

export function attributesToCborObj( stuff: Attributes ): CborMap
{
    return new CborMap(
        Array.from(stuff.keys()).map(( key ) => ({
            k: key,
            v: stuff.get( key )
        }))
    );
}