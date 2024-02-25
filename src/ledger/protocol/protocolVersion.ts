import { isObject } from "@harmoniclabs/obj-utils";
import { CanBeUInteger, canBeUInteger, forceBigUInt } from "../../utils/ints";
import { CborArray, CborObj, CborUInt } from "@harmoniclabs/cbor";

export interface IProtocolVerisionObj {
    major: number,
    minor: number
}

export type IProtocolVersionArr = [ major: CanBeUInteger, minor: CanBeUInteger ]; 

export type IProtocolVerision
    = IProtocolVersionArr
    | IProtocolVerisionObj;

export function protocolVersionAsArray( ppv: IProtocolVerision ): IProtocolVersionArr
{
    return Array.isArray( ppv ) ? ppv : [ ppv.major, ppv.minor ];
}

export function protocolVersionAsObj( ppv: IProtocolVerision ): IProtocolVerisionObj
{
    return Array.isArray( ppv ) ?
    {
        major: Number( forceBigUInt( ppv[0] ) ),
        minor: Number( forceBigUInt( ppv[1] ) )
    } : ppv;
}

export function isIProtocolVersion( ppv: any ): ppv is IProtocolVerision
{
    return (
        Array.isArray( ppv ) &&
        ppv.length >= 2 &&
        canBeUInteger( ppv[0] ) && canBeUInteger( ppv[1] )
    ) || (
        isObject( ppv ) &&
        typeof (ppv as any).major === "number" &&
        typeof (ppv as any).minor === "number"
    );
} 

export function protocolVersionToCborObj( ppv: IProtocolVerision ): CborArray
{
    const isArray = Array.isArray( ppv );
    return new CborArray([
        new CborUInt( forceBigUInt( isArray ? ppv[0] : ppv.major ) ),
        new CborUInt( forceBigUInt( isArray ? ppv[1] : ppv.minor ) )
    ]);
}

export function tryIProtocolVersionFromCborObj( cbor: CborObj | undefined ): [ major: bigint, minor: bigint ] | undefined
{
    return (
        cbor instanceof CborArray &&
        cbor.array[0] instanceof CborUInt &&
        cbor.array[1] instanceof CborUInt
    ) ? 
    [ cbor.array[0].num, cbor.array[1].num ]
    : undefined;
}