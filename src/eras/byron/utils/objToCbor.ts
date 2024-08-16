import { CborMap } from "@harmoniclabs/cbor";
import { Attributes } from "./types";

export function attributesToCborObj( stuff: Attributes ): CborMap
{
    return new CborMap(
        Array.from(stuff.keys()).map(( key ) => ({
            k: key,
            v: stuff.get( key )
        }))
    );
}