export enum GovActionType {
    ParameterChange = 0,
    InitHardFork = 1,
    TreasuryWithdrawals = 2,
    NoConfidence = 3,
    UpdateCommitee = 4,
    NewConstitution = 5,
    Info = 6
};

Object.freeze( GovActionType );