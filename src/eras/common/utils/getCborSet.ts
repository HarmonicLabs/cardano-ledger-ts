import { CborArray, CborObj, CborTag } from "@harmoniclabs/cbor";

export function getCborSet( obj: CborObj ): CborObj[]
{
    if( obj instanceof CborArray ) return obj.array;
    if(!(
        obj instanceof CborTag &&
        Number( obj.tag ) === 258 &&
        obj.data instanceof CborArray
    )) throw new Error("Invalid CBOR format for Set");

    return obj.data.array;
}

export function isCborSet( arr: any ): boolean
{
    return (
        arr instanceof CborArray ||
        (
            arr instanceof CborTag &&
            Number( arr.tag ) === 258 &&
            arr.data instanceof CborArray
        )
    );
}