import { CborUInt } from "@harmoniclabs/cbor";

export enum Vote {
    No = 0,
    Yes = 1,
    Abstain = 2
}

Object.freeze( Vote );

export function isVote( stuff: any ): stuff is Vote
{
    return typeof stuff === "number" && (
        stuff >= 0 && stuff <= 2 &&
        stuff === Math.round( stuff )
    );
}

export function voteToCborObj( vote: Vote ): CborUInt
{
    return new CborUInt( vote );
}