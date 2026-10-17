import { ToCbor, CborString, Cbor, CborBytes, CborObj, CborArray, CborUInt, CanBeCborString, forceCborString, SubCborRef } from "@harmoniclabs/cbor";
import { decodeVersionAtLeast, definiteBytes, expectSize, parseCborFull, recordSum } from "../utils/strictCbor";
import { blake2b_224, byte } from "@harmoniclabs/crypto";
import { fromHex, isUint8Array, toHex } from "@harmoniclabs/uint8array-utils";
import { Hash28 } from "../hashes";
import { NativeScript, nativeScriptToCbor, nativeScriptFromCbor, nativeScriptFromCborObj, nativeScriptToJson } from "./NativeScript";
import { defineReadOnlyProperty } from "@harmoniclabs/obj-utils";
import { getSubCborRef, subCborRefOrUndef } from "../utils/getSubCborRef";

export enum ScriptType {
    NativeScript = "NativeScript",
    PlutusV1 = "PlutusScriptV1",
    PlutusV2 = "PlutusScriptV2",
    PlutusV3 = "PlutusScriptV3",
    PlutusV4 = "PlutusScriptV4" // Dijkstra
}
Object.freeze( ScriptType );

export function scriptTypeToNumber( scriptType: LitteralScriptType ): number
{
    switch( scriptType )
    {
        case ScriptType.NativeScript: return 0;
        case ScriptType.PlutusV1:     return 1;
        case ScriptType.PlutusV2:     return 2;
        case ScriptType.PlutusV3:     return 3;
        case ScriptType.PlutusV4:     return 4;
    }
    if( typeof scriptType === "string" )
    {
        switch( scriptType )
        {
            case "NativeScript": return 0;
            case "PlutusScriptV1": return 1;
            case "PlutusScriptV2": return 2;
            case "PlutusScriptV3": return 3;
            case "PlutusScriptV4": return 4;
        }
    }

    throw new Error(`Invalid ScriptType: ${scriptType}`);
}

export function scriptTypeFromNumber( n: number ): ScriptType
{
    switch( n )
    {
        case 0: return ScriptType.NativeScript;
        case 1: return ScriptType.PlutusV1;
        case 2: return ScriptType.PlutusV2;
        case 3: return ScriptType.PlutusV3;
        case 4: return ScriptType.PlutusV4;
    }

    throw new Error(`Invalid ScriptType number: ${n}`);
}

export const defaultScriptType = ScriptType.PlutusV3;

export type PlutusScriptType = ScriptType.PlutusV1 | ScriptType.PlutusV2 | ScriptType.PlutusV3 | ScriptType.PlutusV4 | "PlutusScriptV1" | "PlutusScriptV2" | "PlutusScriptV3" | "PlutusScriptV4"

export type LitteralScriptType = ScriptType | "NativeScript" | "PlutusScriptV1" | "PlutusScriptV2" | "PlutusScriptV3" | "PlutusScriptV4"

export interface PlutusScriptJsonFormat<T extends PlutusScriptType = PlutusScriptType> {
    type: T,
    description?: string,
    cborHex: string
}

export interface IScript<T extends LitteralScriptType = LitteralScriptType> {
    scriptType: T,
    bytes: Uint8Array | (T extends ScriptType.NativeScript ? NativeScript : PlutusScriptJsonFormat)
}

export class Script<T extends LitteralScriptType = LitteralScriptType>
    implements ToCbor
{

    readonly type!: T;
    /**
     * format expected by `cardano-cli`
     * 
     * for standard ledger format (as defined in CDDL) use `toCbor` method
     * 
     * this one is used in the witness set
    **/
    readonly bytes!: Uint8Array;

    /**
     * format expected by `cardano-cli`
     *
     * for standard ledger format (as defined in CDDL) use `toCbor` method
     *
     * this one is used in the witness set
     *
     * @deprecated
    **/
    readonly cbor!: CborString;

    /**
     * Plutus scripts only: the payload of the ledger's `[tag, payload]` wrapper exactly as it
     * was decoded (cardano-ledger `PlutusBinary`, the byte-string content; for a program built by
     * the Plutus tools it is the CBOR byte string around the flat encoding). Set by `fromCborObj`;
     * `toCbor` emits it and `hash` hashes it (`hashPlutusScript`: language tag ++ binary), so
     * both match cardano-ledger byte for byte even when the payload is not the canonical
     * wrapping of `bytes`. Scripts built from `bytes` alone wrap them canonically instead.
     *
     * A native script's payload is `bytes` itself (the timelock's own CBOR, `MemoBytes`).
     */
    readonly ledgerPayload: Uint8Array | undefined;

    // --------- hash ---- //
    private _hash!: Hash28;

    get hash(): Hash28
    {
        if(
            this. _hash !== undefined && this._hash instanceof Hash28
        ) return this._hash;

        let scriptDataToBeHashed = [] as number[];

        if( this.type === ScriptType.NativeScript )
            scriptDataToBeHashed = [ 0x00 ].concat( Array.from( this.bytes ) );
        else
        {
            const singleCbor = Array.from( this.plutusPayload() );

            scriptDataToBeHashed = [
                this.type === ScriptType.PlutusV1 ? 0x01 :
                this.type === ScriptType.PlutusV2 ? 0x02 :
                this.type === ScriptType.PlutusV3 ? 0x03 :
                0x04 // Plutus V4 (Dijkstra)
            ].concat( singleCbor );
        }

        this._hash = new Hash28(
            Uint8Array.from(
                blake2b_224( scriptDataToBeHashed as byte[] )
            )
        );

        return this._hash;
    }

    static native( script: NativeScript ): Script<ScriptType.NativeScript>
    {
        return new Script(
            ScriptType.NativeScript,
            script
        );
    }
    static plutusV1( script: Uint8Array ): Script<ScriptType.PlutusV1>
    {
        return new Script(
            ScriptType.PlutusV1,
            script
        );
    }
    static plutusV2( script: Uint8Array ): Script<ScriptType.PlutusV2>
    {
        return new Script(
            ScriptType.PlutusV2,
            script
        );
    }
    static plutusV3( script: Uint8Array ): Script<ScriptType.PlutusV3>
    {
        return new Script(
            ScriptType.PlutusV3,
            script
        );
    }
    static plutusV4( script: Uint8Array ): Script<ScriptType.PlutusV4>
    {
        return new Script(
            ScriptType.PlutusV4,
            script
        );
    }

    constructor(
        scriptType: T,
        bytes: Uint8Array | (T extends ScriptType.NativeScript ? NativeScript : PlutusScriptJsonFormat),
        readonly cborRef: SubCborRef | undefined = undefined,
        ledgerPayload: Uint8Array | undefined = undefined
    )

    {
        if(!(
            scriptType === ScriptType.NativeScript  ||
            scriptType === ScriptType.PlutusV1      ||
            scriptType === ScriptType.PlutusV2      ||
            scriptType === ScriptType.PlutusV3      ||
            scriptType === ScriptType.PlutusV4
        ))throw new Error("invalid 'scriptType'")
        
        this.type = scriptType;

        if( !( bytes instanceof Uint8Array ) )
        {
            if(
                (bytes?.type as any) === ScriptType.PlutusV1 ||
                (bytes?.type as any) === ScriptType.PlutusV2 ||
                (bytes?.type as any) === ScriptType.PlutusV3 ||
                (bytes?.type as any) === ScriptType.PlutusV4
            )
            {
                bytes = fromHex( (bytes as PlutusScriptJsonFormat).cborHex );
            }
            else
            {
                bytes = nativeScriptToCbor( bytes as NativeScript )
            }
        }
        else bytes = Uint8Array.prototype.slice.call( bytes );

        if(
            scriptType === ScriptType.PlutusV1 ||
            scriptType === ScriptType.PlutusV2 ||
            scriptType === ScriptType.PlutusV3 ||
            scriptType === ScriptType.PlutusV4
        )
        {
            // unwrap up to 2 cbor bytes
            try {
                let parsed = Cbor.parse( bytes );
                
                if( parsed instanceof CborBytes )
                {
                    bytes = parsed.buffer;
                    parsed = Cbor.parse( bytes );
                    if( parsed instanceof CborBytes )
                    {
                        bytes = parsed.buffer
                    }
                }
            }
            // assume bytes are flat
            catch {}
        }

        this.bytes = bytes;
        /** TO DO: check for accuracy */
        /**
         * format expected by `cardano-cli`
         * 
         * for standard ledger format (as defined in CDDL) use `toCbor` method
         * 
         * this one is used in the witness set
         * 
         * @deprecated
        **/
        if (this.type !== ScriptType.NativeScript) {
            this.cbor = Cbor.encode(
                new CborBytes(
                    Cbor.encode(
                        new CborBytes(
                            Uint8Array.prototype.slice.call(this.bytes)
                        )
                    )
                )
            );
        }
        else {
            this.cbor = Uint8Array.prototype.slice.call( this.bytes );
        }
        this.cborRef = cborRef;
        this.ledgerPayload =
            scriptType !== ScriptType.NativeScript && ledgerPayload instanceof Uint8Array ?
                Uint8Array.prototype.slice.call( ledgerPayload ) :
                undefined;
    }

    /**
     * a Plutus script's payload in the ledger form: `ledgerPayload` when the script was decoded
     * from it, otherwise `bytes` wrapped in one CBOR byte string
     */
    private plutusPayload(): Uint8Array
    {
        if( this.ledgerPayload instanceof Uint8Array ) return this.ledgerPayload;
        return Cbor.encode( new CborBytes( Uint8Array.prototype.slice.call( this.bytes ) ) );
    }

    /*
    apply( ...args: ScriptApplyArg[] ): Script<T>
    {
        if( this.type === ScriptType.NativeScript ) return this.clone();
        
    }
    //*/

    nativeScript(): NativeScript | undefined
    {
        if( this.type === ScriptType.NativeScript )
        {
            return nativeScriptFromCbor( this.bytes );
        }
        return undefined;
    }

    clone(): Script<T>
    {
        return new Script(
            this.type,
            this.bytes,
            this.cborRef instanceof SubCborRef ? this.cborRef.clone() : undefined,
            this.ledgerPayload
        );
    }

    toJSON() { return this.toJson(); }
    toJson()
    {
        if( this.type === ScriptType.NativeScript )
        {
            return nativeScriptToJson( nativeScriptFromCbor( this.bytes ) )
        }
        else
        {
            return {
                type: this.type,
                description: "",
                cborHex: toHex(Cbor.encode(
                    new CborBytes(
                        Cbor.encode(
                            new CborBytes(
                                this.bytes
                            )
                        )
                    )
                ))
            }
        }
    }

    static fromJson<T extends LitteralScriptType = LitteralScriptType>( json: any & { type: string } ): Script<T>
    {
        const t = json.type;

        if( t !== ScriptType.NativeScript )
        {
            return new Script(
                t,
                fromHex( json.cborHex )
            );
        }

        return new Script(
            ScriptType.NativeScript,
            json as NativeScript,
        ) as Script<T>;
    }

    /**
     * format specified in the ledger CDDL
    **/
    toCborBytes(): Uint8Array
    {
        if( this.cborRef instanceof SubCborRef ) return this.cborRef.toBuffer();
        return this.toCbor();
    }
    /**
     * The ledger form `[tag, payload]`, rebuilt as cardano-ledger rebuilds it (Alonzo
     * `encodeScript`: `Sum NativeScript 0 !> To timelock`, `Sum (PlutusScript ..) n !> To binary`,
     * i.e. `encodeListLen 2 <> encodeWord tag <> payload`): the wrapper is always a definite
     * two-element array, the payload is emitted as the ledger keeps it, a native script's own
     * bytes (`MemoBytes`) or the Plutus binary as a definite byte string.
     *
     * `cborRef` is only set for a script decoded from a bare byte string (the witness-set form),
     * which is re-emitted as such.
    **/
    toCbor(): CborString
    {
        if( this.cborRef instanceof SubCborRef )
        {
            // TODO: validate cbor structure
            // we assume correctness here
            return this.cborRef.toBuffer();
        }

        if( this.type === ScriptType.NativeScript )
        {
            // [0, <timelock bytes as they are>]
            const out = new Uint8Array( 2 + this.bytes.length );
            out[0] = 0x82;
            out[1] = 0x00;
            out.set( this.bytes, 2 );
            return out;
        }

        return Cbor.encode( this.toCborObj() );
    }
    /**
     * format specified in the ledger CDDL (see `toCbor`)
    **/
    toCborObj(): CborObj
    {
        if( this.cborRef instanceof SubCborRef )
        {
            // TODO: validate cbor structure
            // we assume correctness here
            return Cbor.parse( this.cborRef.toBuffer() );
        }
        if( this.type === ScriptType.NativeScript )
        return new CborArray([
            new CborUInt(0),
            Cbor.parse( this.bytes )
        ]);

        return new CborArray([
            new CborUInt(
                scriptTypeToNumber( this.type as ScriptType )
            ),
            new CborBytes( this.plutusPayload() )
        ]);
    }

    static fromCbor( cbor: CanBeCborString, defType: ScriptType = defaultScriptType ): Script
    {
        return Script.fromCborObj( parseCborFull( cbor, "Script" ), defType );
    }

    static fromCborObj( cObj: CborObj, defType: ScriptType = defaultScriptType ): Script
    {
        // read tx_witness_set
        if( cObj instanceof CborBytes )
        {
            return new Script(
                defType,
                definiteBytes( cObj, "Script" ),
                getSubCborRef( cObj )
            );
        }

        // cardano-ledger `DecCBOR (Annotator (AlonzoScript era))` (`Summands`): `[0, native]`,
        // `[1 | 2 | 3, plutus bytes]`, plus `[4, bytes]` from protocol version 12;
        // definite arrays have exactly two elements (an indefinite array is accepted).
        //
        // The wrapper's own bytes are not kept: cardano-ledger rebuilds `[tag, payload]` on
        // re-serialisation (`toCbor`) and keeps only the payload, the timelock's bytes
        // (`MemoBytes`) or the Plutus binary.
        const { tag: n, fields, size } = recordSum( cObj, "Script" );
        if( n > ( decodeVersionAtLeast( 12 ) ? 4 : 3 ) )
        throw new Error(`Invalid CBOR format for "Script"; unsupported script tag ${n}`);
        expectSize( size, 2, "Script" );
        const t = scriptTypeFromNumber( n );


        if( t === ScriptType.NativeScript )
        {
            nativeScriptFromCborObj( fields[0] ); // must decode as a native script
            // the timelock's bytes as decoded (`getSubCborRef` re-encodes only when the object
            // was parsed without references)
            return new Script(
                t,
                getSubCborRef( fields[0] ).toBuffer()
            );
        }

        const payload = definiteBytes( fields[0], "Script" );
        return new Script(
            t,
            payload,
            undefined,
            payload
        );
    }

    static encodePlutusScriptForWitnessSet( script: Script ): CborBytes
    {
        return new CborBytes( script.plutusPayload() );
        // return Cbor.parse( script.cbor ) as CborBytes
        // return new CborBytes( script.bytes );
    }
}