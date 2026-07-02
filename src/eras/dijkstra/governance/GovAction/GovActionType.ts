export enum GovActionType {
    ParameterChange = 0,
    InitHardFork = 1,
    TreasuryWithdrawals = 2,
    NoConfidence = 3,
    UpdateCommittee = 4,
    NewConstitution = 5,
    Info = 6
};

Object.freeze( GovActionType );

export function isGovActionType( stuff: any ): stuff is GovActionType
{
    return typeof stuff === "number" && (
        stuff >= 0 && stuff <= 6 &&
        stuff === Math.round( stuff )
    );
}