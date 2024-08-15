import { CborMap } from "@harmoniclabs/cbor";
import { Attributes } from "./types";

export function cborMapToAttributes( stuff: CborMap ): Attributes
{
    const cborMap = stuff.map;

    return new Map<any, any>( cborMap.map(( entry ) => ([ entry.k, entry.v ])) );
}