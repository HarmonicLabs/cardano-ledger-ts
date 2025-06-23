import { isObject } from "@harmoniclabs/obj-utils";
import { Rational, canBeCborPostiveRational, cborFromRational, isRational } from "../../common/ledger/protocol/Rational";
import { CborArray, CborObj, CborPositiveRational, CborTag, CborUInt } from "@harmoniclabs/cbor";

export interface ConwayPParamsDrepVotingThresholds {
    motionNoConfidence: Rational,
    committeeNormal: Rational,
    committeeNoConfidence: Rational,
    updateConstitution: Rational,
    hardForkInitiation: Rational,
    ppNetworkGroup: Rational,
    ppEconomicGroup: Rational,
    ppTechnicalGroup: Rational,
    ppGovGroup: Rational,
    treasuryWithdrawal: Rational
}

export function isConwayPParamsDrepVotingThresholds( stuff: any ): stuff is ConwayPParamsDrepVotingThresholds
{
    return isObject( stuff ) && (
        isRational( stuff.motionNoConfidence ) &&
        isRational( stuff.committeeNormal ) &&
        isRational( stuff.committeeNoConfidence ) &&
        isRational( stuff.updateConstitution ) &&
        isRational( stuff.hardForkInitiation ) &&
        isRational( stuff.ppNetworkGroup ) &&
        isRational( stuff.ppEconomicGroup ) &&
        isRational( stuff.ppTechnicalGroup ) &&
        isRational( stuff.ppGovGroup ) &&
        isRational( stuff.treasuryWithdrawal )
    );
}

export function conwayDrepVotingThresholdsToCborObj( drepVotingThresholds: ConwayPParamsDrepVotingThresholds ): CborArray
{
    return new CborArray([
        cborFromRational( drepVotingThresholds.motionNoConfidence ),
        cborFromRational( drepVotingThresholds.committeeNormal ),
        cborFromRational( drepVotingThresholds.committeeNoConfidence ),
        cborFromRational( drepVotingThresholds.updateConstitution ),
        cborFromRational( drepVotingThresholds.hardForkInitiation ),
        cborFromRational( drepVotingThresholds.ppNetworkGroup ),
        cborFromRational( drepVotingThresholds.ppEconomicGroup ),
        cborFromRational( drepVotingThresholds.ppTechnicalGroup ),
        cborFromRational( drepVotingThresholds.ppGovGroup ),
        cborFromRational( drepVotingThresholds.treasuryWithdrawal ),
    ]);
}

export function tryGetConwayPParamsDrepVotingThresholdsFromCborObj( cbor: CborObj | undefined ): ConwayPParamsDrepVotingThresholds | undefined
{
    if(!(
        cbor instanceof CborArray &&
        cbor.array.length >= 10 &&
        cbor.array.every( canBeCborPostiveRational )
    )) return undefined;

    const [
        motionNoConfidence,
        committeeNormal,
        committeeNoConfidence,
        updateConstitution,
        hardForkInitiation,
        ppNetworkGroup,
        ppEconomicGroup,
        ppTechnicalGroup,
        ppGovGroup,
        treasuryWithdrawal
    ] = (cbor.array as (CborPositiveRational | CborTag)[])
    .map( thing => {
        const [ num, den ] = (thing.data as CborArray).array as CborUInt[];
        return new CborPositiveRational( num.num, den.num );
    });

    return {
        motionNoConfidence,
        committeeNormal,
        committeeNoConfidence,
        updateConstitution,
        hardForkInitiation,
        ppNetworkGroup,
        ppEconomicGroup,
        ppTechnicalGroup,
        ppGovGroup,
        treasuryWithdrawal
    };
}