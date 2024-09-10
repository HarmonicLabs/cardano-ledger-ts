import { CborArray, CborObj, CborUInt } from "@harmoniclabs/cbor";
import { isObject } from "@harmoniclabs/obj-utils";
import { canBeUInteger } from "../../utils/ints";

export interface IProtocolVersion {
    major: number,
    minor: number
}

export function isIProtocolVersion( ppv: any ): ppv is IProtocolVersion
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

/**
 * **ONLY BABBAGE AND ABOVE**  
**/
export function protocolVersionToCborObj({ major, minor }: IProtocolVersion )
{
    return new CborArray([
        new CborUInt( major ),
        new CborUInt( minor )
    ]);
}

/**
 * **ONLY BABBAGE AND ABOVE**  
**/
export function protocolVersionFromCborObj( cbor: CborObj ): IProtocolVersion
{
    if(!(
        cbor instanceof CborArray &&
        cbor.array.length >= 2 &&
        cbor.array[0] instanceof CborUInt &&
        cbor.array[1] instanceof CborUInt
    )) throw new Error("invalid cbor for IPRotocolVersion");

    return {
        major: Number( cbor.array[0].num ),
        minor: Number( cbor.array[1].num ),
    };
}