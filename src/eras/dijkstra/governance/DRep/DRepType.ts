
export enum DRepType {
    KeyHash = 0,
    Script  = 1,
    AlwaysAbstain = 2,
    AlwaysNoConfidence = 3
};

Object.freeze( DRepType );

export function isDRepType( stuff: any ): stuff is DRepType
{
    return typeof stuff === "number" && (
        stuff >= 0 && stuff <= 3 &&
        stuff === Math.round( stuff )
    );
}

export function drepTypeToString( t: DRepType ): string
{
    switch( t )
    {
        case DRepType.KeyHash: return "KeyHash";
        case DRepType.Script: return "Script";
        case DRepType.AlwaysAbstain: return "AlwaysAbstain";
        case DRepType.AlwaysNoConfidence: return "AlwaysNoConfidence";
        default: return "";
    }
}