import { CborArray, CborBytes, CborObj } from "@harmoniclabs/cbor";
import { U8Arr80 } from "../../utils/types";
import { isHash, isHash80 } from "../../utils/isThatType";

export type VrfCert = [
    Uint8Array,
    U8Arr80
];

export function isVrfCert( stuff: any ): stuff is VrfCert
{
    return(
        Array.isArray( stuff ) &&
        stuff.length === 2 &&
        isHash( stuff[0] ) &&
        isHash80( stuff[1] )
    );
}

export function vrfCertToCborObj( vrfCert: VrfCert ): CborArray
{
    return new CborArray([
        new CborBytes( vrfCert[0] ),
        new CborBytes( vrfCert[1] ),
    ]);
}

export function vrfCertFromCborObj( vrfCert: CborObj ): VrfCert
{
    if(!(
        vrfCert instanceof CborArray &&
        vrfCert.array.length >= 2 &&
        vrfCert.array[0] instanceof CborBytes &&
        vrfCert.array[1] instanceof CborBytes &&
        vrfCert.array[1].bytes.length === 80
    )) throw new Error("invalid cbor for 'VrfCert'");

    return [
        vrfCert.array[0].bytes,
        vrfCert.array[1].bytes as U8Arr80,
    ];
}