import { isObject } from "@harmoniclabs/obj-utils";
import { Rational, canBeCborPostiveRational, cborFromRational, isRational } from "../../common/ledger/protocol/Rational";
import { CborArray, CborObj, CborPositiveRational, CborTag, CborUInt } from "@harmoniclabs/cbor";

export interface ConwayPParamsPoolVotingThresholds {
    motionNoConfidence: Rational,
    committeeNormal: Rational,
    committeeNoConfidence: Rational,
    hardForkInitiation: Rational,
    securityRelevantVotingThresholds: Rational
}

export function isConwayPParamsPoolVotingThresholds( stuff: any ): stuff is ConwayPParamsPoolVotingThresholds
{
    return isObject( stuff ) && (
        isRational( stuff.motionNoConfidence ) &&
        isRational( stuff.committeeNormal ) &&
        isRational( stuff.committeeNoConfidence ) &&
        isRational( stuff.hardForkInitiation ) &&
        isRational( stuff.securityRelevantVotingThresholds )
    );
}

export function conwayPoolVotingThresholdsToCborObj( poolVotingThresholds: ConwayPParamsPoolVotingThresholds ): CborArray
{
    return new CborArray([
        cborFromRational( poolVotingThresholds.motionNoConfidence ),
        cborFromRational( poolVotingThresholds.committeeNormal ),
        cborFromRational( poolVotingThresholds.committeeNoConfidence ),
        cborFromRational( poolVotingThresholds.hardForkInitiation ),
        cborFromRational( poolVotingThresholds.securityRelevantVotingThresholds ),
    ]);
}

export function tryGetConwayPParamsPoolVotingThresholdsFromCborObj( cbor: CborObj | undefined ): ConwayPParamsPoolVotingThresholds | undefined
{
    if(!(
        cbor instanceof CborArray &&
        cbor.array.length >= 5 &&
        cbor.array.every( canBeCborPostiveRational )
    )) return undefined;

    const [
        motionNoConfidence,
        committeeNormal,
        committeeNoConfidence,
        hardForkInitiation,
        securityRelevantVotingThresholds
    ] = (cbor.array as (CborPositiveRational | CborTag)[])
    .map( thing => {
        const [ num, den ] = (thing.data as CborArray).array as CborUInt[];
        return new CborPositiveRational( num.num, den.num );
    });

    return {
        motionNoConfidence,
        committeeNormal,
        committeeNoConfidence,
        hardForkInitiation,
        securityRelevantVotingThresholds
    };
}