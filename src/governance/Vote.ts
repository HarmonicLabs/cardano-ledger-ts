import { CborUInt } from "@harmoniclabs/cbor";

export enum Vote {
    No = 0,
    Yes = 1,
    Abstain = 2
}

Object.freeze( Vote );

export function voteToCborObj( vote: Vote ): CborUInt
{
    return new CborUInt( vote );
}