import { CborMap } from "@harmoniclabs/cbor";
import { Attributes } from "./types";

// TO FIX: return Cbormap but not cbor keys and values

export function attributesMapToCborObj( stuff: Attributes ): CborMap
{
    return new CborMap(
        Array.from(stuff.keys()).map(( key ) => ({
            k: key,
            v: stuff.get( key )
        }))
    );
}