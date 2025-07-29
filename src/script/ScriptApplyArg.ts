import { Data, isData, ToData } from "@harmoniclabs/plutus-data";
import { isUPLCTerm, UPLCTerm } from "@harmoniclabs/uplc";

export type ScriptApplyArg
    = UPLCTerm
    | Data
    | ToData
    | number
    | bigint
    | Uint8Array
    | string // if hex it is interpreted as bytes, otherwise converted to bytes from utf8
    | ScriptApplyArg[]
    | { k:  ScriptApplyArg, v:  ScriptApplyArg }[]
    | Map<ScriptApplyArg, ScriptApplyArg>
    ;

export function isScriptApplyArg( arg: any ): arg is ScriptApplyArg
{
    return (
        isUPLCTerm( arg )
        || isData( arg )
        || typeof arg === "number"
        || typeof arg === "bigint"
        || arg instanceof Uint8Array
        || typeof arg === "string"
        || (Array.isArray( arg ) && arg.every( isScriptApplyArg ))
        || (arg instanceof Map && Array.from( arg.entries() ).every(
            ([key, value]) => isScriptApplyArg( key ) && isScriptApplyArg( value )
        ))
    );
}