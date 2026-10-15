import { CborArray, CborUInt, CborNegInt, CborBytes, CborString, Cbor, CborObj } from "@harmoniclabs/cbor";
import { cborArray, cborInt, cborUInt, decodeVersionAtLeast, expectSize, parseCborFull, recordSum } from "../utils/strictCbor";
import { Hash28 } from "../hashes/Hash28/Hash28";
import { toHex } from "@harmoniclabs/uint8array-utils";
import { CanBeUInteger, forceBigUInt } from "../utils/ints";
import { Credential } from "../credentials/Credential";

export type NativeScript
    = ScriptSignature
    | ScriptAll
    | ScriptAny
    | ScriptAtLeast
    | ScriptAfter
    | ScriptBefore
    | ScriptRequireGuard

export interface ScriptSignature {
    type: "sig",
    keyHash: Hash28 | string
}

export interface ScriptAll {
    type: "all",
    scripts: NativeScript[]
}

export interface ScriptAny {
    type: "any",
    scripts: NativeScript[]
}

export interface ScriptAtLeast {
    type: "atLeast",
    /** an Int64; values <= 0 are always satisfied */
    required: number | bigint,
    scripts: NativeScript[]
}

export interface ScriptAfter {
    type: "after",
    slot: CanBeUInteger
}

export interface ScriptBefore {
    type: "before",
    slot: CanBeUInteger
}

/**
 * Dijkstra (CIP guard scripts): `script_require_guard = (6, credential)`.
 * A guard script requires the given credential to authorize execution.
 */
export interface ScriptRequireGuard {
    type: "requireGuard",
    credential: Credential
}

export function nativeScriptToCborObj( nativeScript: NativeScript ): CborArray
{
    const type = nativeScript.type;

    if( type === "sig" )
    {
        const keyHash = nativeScript.keyHash;

        return new CborArray([
            new CborUInt( 0 ),
            new CborBytes(
                (
                    keyHash instanceof Hash28 ?
                        keyHash :
                        new Hash28( keyHash )
                ).toBuffer()
            )
        ]);
    }
    if( type === "all" || type === "any" )
        return new CborArray([
            new CborUInt( type === "all" ? 1 : 2 ),
            new CborArray(
                nativeScript.scripts.map( nativeScriptToCborObj )
            )
        ]);
    if( type === "atLeast" )
        return new CborArray([
            new CborUInt( 3 ),
            BigInt( nativeScript.required ) < BigInt( 0 ) ?
                new CborNegInt( BigInt( nativeScript.required ) ) :
                new CborUInt( BigInt( nativeScript.required ) ),
            new CborArray(
                nativeScript.scripts.map( nativeScriptToCborObj )
            )
        ]);
    if( type === "after" || type === "before" )
        return new CborArray([
            new CborUInt( type === "after" ? 4 : 5 ),
            new CborUInt( forceBigUInt( nativeScript.slot ) ),
        ]);
    if( type === "requireGuard" )
        return new CborArray([
            new CborUInt( 6 ),
            nativeScript.credential.toCborObj()
        ]);

    throw new Error(
        "unmatched 'nativeScript.type' while converting to cbor"
    );
}
export function nativeScriptToCbor( nativeScript: NativeScript ): CborString
{
    return Cbor.encode( nativeScriptToCborObj( nativeScript ) );
}

const notNativeScriptError = new Error(
    "ill formed native script to deserialize"
);

/**
 * cardano-ledger `DecCBOR (Annotator (TimelockRaw era))` (`Summands "TimelockRaw"`):
 * an array (definite with the exact size, or indefinite) tagged with a `decodeWord`:
 *
 * - `[0, keyhash]` (28 bytes)
 * - `[1, [* script]]`, `[2, [* script]]` (lists, definite or indefinite)
 * - `[3, n, [* script]]`, `n` an `Int` (Int64: negative values are valid and always satisfied)
 * - `[4, slot]`, `[5, slot]`, slots Word64 (kept as bigint)
 * - `[6, credential]` only from protocol version 12 (Dijkstra guard scripts)
 */
export function nativeScriptFromCborObj( cbor: CborObj ): NativeScript
{
    let parts: { tag: number, fields: CborObj[], size: number };
    try {
        parts = recordSum( cbor, "NativeScript" );
    }
    catch {
        throw notNativeScriptError;
    }
    const { tag: type, fields, size } = parts;
    const [ f1, f2 ] = fields;
    const sizes: { [t: number]: number } = { 0: 2, 1: 2, 2: 2, 3: 3, 4: 2, 5: 2, 6: 2 };

    if( sizes[type] === undefined || ( type === 6 && !decodeVersionAtLeast( 12 ) ) )
    throw notNativeScriptError;
    expectSize( size, sizes[type], "NativeScript" );

    switch( type )
    {
        case 0:
            return {
                type: "sig",
                keyHash: toHex( Hash28.fromCborObj( f1 ).toBuffer() )
            }
        case 1:
        case 2:
            return {
                type: type === 1 ? "all" : "any",
                scripts: cborArray( f1, "NativeScript" ).map( nativeScriptFromCborObj as any ) as NativeScript[]
            }
        case 3:
            return {
                type: "atLeast",
                required: cborInt( f1, "NativeScript atLeast" ),
                scripts: cborArray( f2, "NativeScript" ).map( nativeScriptFromCborObj as any ) as NativeScript[]
            }
        case 4:
        case 5:
            return {
                type: type === 4 ? "after" : "before",
                slot: cborUInt( f1, "NativeScript slot" )
            }
        case 6:
            // script_require_guard = (6, credential)
            return {
                type: "requireGuard",
                credential: Credential.fromCborObj( f1 )
            }

        default:
            throw notNativeScriptError;
    }
}

export function nativeScriptFromCbor( cbor: CborString ): NativeScript
{
    return nativeScriptFromCborObj( parseCborFull( cbor, "NativeScript" ) );
};