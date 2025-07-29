import { ToCbor, CborString, Cbor, CborBytes, CborObj, CborArray, CborUInt, CanBeCborString, forceCborString, SubCborRef } from "@harmoniclabs/cbor";
import { blake2b_224, byte } from "@harmoniclabs/crypto";
import { fromHex, isUint8Array } from "@harmoniclabs/uint8array-utils";
import { Hash28 } from "../hashes";
import { NativeScript, nativeScriptToCbor, nativeScriptFromCbor } from "./NativeScript";
import { defineReadOnlyProperty } from "@harmoniclabs/obj-utils";
import { getSubCborRef, subCborRefOrUndef } from "../utils/getSubCborRef";

export enum ScriptType {
    NativeScript = "NativeScript",
    PlutusV1 = "PlutusScriptV1",
    PlutusV2 = "PlutusScriptV2",
    PlutusV3 = "PlutusScriptV3"
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
    }
    if( typeof scriptType === "string" )
    {
        switch( scriptType )
        {
            case "NativeScript": return 0;
            case "PlutusScriptV1": return 1;
            case "PlutusScriptV2": return 2;
            case "PlutusScriptV3": return 3;
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
    }

    throw new Error(`Invalid ScriptType number: ${n}`);
}

export const defaultScriptType = ScriptType.PlutusV3;

export type PlutusScriptType = ScriptType.PlutusV1 | ScriptType.PlutusV2 | ScriptType.PlutusV3 | "PlutusScriptV1" | "PlutusScriptV2" | "PlutusScriptV3"

export type LitteralScriptType = ScriptType | "NativeScript" | "PlutusScriptV1" | "PlutusScriptV2" | "PlutusScriptV3"

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
            const singleCbor = Array.from(
                Cbor.encode(
                    new CborBytes(
                        this.bytes
                    )
                ).toBuffer()
            );

            scriptDataToBeHashed = [
                this.type === ScriptType.PlutusV1 ? 0x01 :
                this.type === ScriptType.PlutusV2 ? 0x02 :
                0x03
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

    constructor(
        scriptType: T,
        bytes: Uint8Array | (T extends ScriptType.NativeScript ? NativeScript : PlutusScriptJsonFormat),
        readonly cborRef: SubCborRef | undefined = undefined
    )
    
    {
        if(!(
            scriptType === ScriptType.NativeScript  ||
            scriptType === ScriptType.PlutusV1      ||
            scriptType === ScriptType.PlutusV2      ||
            scriptType === ScriptType.PlutusV3
        ))throw new Error("invalid 'scriptType'")
        
        this.type = scriptType;

        if( !( bytes instanceof Uint8Array ) )
        {
            if(
                (bytes?.type as any) === ScriptType.PlutusV1 ||
                (bytes?.type as any) === ScriptType.PlutusV2 ||
                (bytes?.type as any) === ScriptType.PlutusV3
            )
            {
                bytes = fromHex( (bytes as PlutusScriptJsonFormat).cborHex );
            }
            else
            {
                bytes = nativeScriptToCbor( bytes as NativeScript ).toBuffer()
            }
        }
        else bytes = Uint8Array.prototype.slice.call( bytes );

        if(
            scriptType === ScriptType.PlutusV1 ||
            scriptType === ScriptType.PlutusV2 ||
            scriptType === ScriptType.PlutusV3
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
        if (this.type !== ScriptType.NativeScript) {
            this.cbor = Cbor.encode(
                new CborBytes(
                    Cbor.encode(
                        new CborBytes(
                            Uint8Array.prototype.slice.call(bytes)
                        )
                    ).toBuffer()
                )
            );
        }
        else {
            this.cbor = new CborString( this.bytes );
        }

        this.cborRef = cborRef;
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
            return nativeScriptFromCbor( new CborString( this.bytes ) );
        }
        return undefined;
    }

    clone(): Script<T>
    {
        return new Script(
            this.type,
            this.bytes,
            this.cborRef instanceof SubCborRef ? this.cborRef.clone() : undefined
        );
    }

    toJSON() { return this.toJson(); }
    toJson()
    {
        if( this.type === ScriptType.NativeScript )
        {
            return nativeScriptFromCbor( new CborString( this.bytes ) )
        }
        else
        {
            return {
                type: this.type,
                description: "",
                cborHex: Cbor.encode(
                    new CborBytes(
                        Cbor.encode(
                            new CborBytes(
                                this.bytes
                            )
                        ).toBuffer()
                    )
                ).toString()
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
        return this.toCbor().toBuffer();
    }
    toCbor(): CborString
    {
        if( this.cborRef instanceof SubCborRef )
        {
            // TODO: validate cbor structure
            // we assume correctness here
            return new CborString( this.cborRef.toBuffer() );
        }
        
        return Cbor.encode( this.toCborObj() );
    }
    /**
     * format specified in the ledger CDDL
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
            new CborBytes(
                Cbor.encode(
                    new CborBytes( Uint8Array.prototype.slice.call( this.bytes ) )
                ).toBuffer()
            )
        ]);
    }

    static fromCbor( cbor: CanBeCborString, defType: ScriptType = defaultScriptType ): Script
    {
        return Script.fromCborObj( Cbor.parse( forceCborString( cbor ) ), defType );
    }

    static fromCborObj( cObj: CborObj, defType: ScriptType = defaultScriptType ): Script
    {
        // read tx_witness_set
        if( cObj instanceof CborBytes )
        {
            return new Script(
                defType,
                cObj.bytes,
                getSubCborRef( cObj )
            );
        }

        if(!(
            cObj instanceof CborArray   &&
            cObj.array.length >= 2      &&
            cObj.array[0] instanceof CborUInt
        ))
        throw new Error(`Invalid CBOR format for "Script"`);

        const n = Number(cObj.array[0].num);
        const t = scriptTypeFromNumber( n ); 
        

        if( t === ScriptType.NativeScript )
        return new Script(
            t,
            Cbor.encode( cObj.array[1] ).toBuffer(),
            getSubCborRef( cObj )
        );

        if(!( cObj.array[1] instanceof CborBytes ))
        throw new Error(`Invalid CBOR format for "Script"`);

        return new Script(
            t,
            cObj.array[1].bytes,
            getSubCborRef( cObj )
        );
    }
}