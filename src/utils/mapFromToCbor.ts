import { CborMap } from "@harmoniclabs/cbor";
import { isObject } from "@harmoniclabs/obj-utils";

export function mapToCborObj( stuff: any ): CborMap
{
    if( !( stuff instanceof Map ) ) throw new Error( "invalid `Map` data provided" );

    return new CborMap(
        Array.from( stuff.keys() ).map(( key ) => {
            var value = stuff.get( key );
            if( isObject( value ) ) value = value.toCborObj();

            return {
                k: key,
                v: value
            };
        })
    );
}

export function mapFromCborObj( stuff: CborMap ): Map<any, any>
{
    const cborMap = stuff.map;

    return new Map<any, any>( cborMap.map(( entry ) => ([ entry.k, entry.v ])) );
}
