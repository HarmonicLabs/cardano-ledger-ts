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
    readonly cbor!: T extends ScriptType.NativeScript ? never : CborString;
    
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

    constructor(
        script: IScript<T>,
        readonly cborRef: SubCborRef | undefined = undefined
    )
    
    {
        // console.log("type: ", this.type);
        let { 
            scriptType, 
            bytes 
        } = script;

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
            /// @ts-ignore Type 'CborString' is not assignable to type 'T extends ScriptType.NativeScript ? never : CborString'.
            this.cbor = Cbor.encode(
                new CborBytes(
                    Cbor.encode(
                        new CborBytes(
                            Uint8Array.prototype.slice.call(bytes)
                        )
                    ).toBuffer()
                )
            );
        };

        this.cborRef = cborRef ?? subCborRefOrUndef( script );
    }

    clone(): Script<T>
    {
        return new Script({
            scriptType: this.type as any,
            bytes: Uint8Array.prototype.slice.call( this.bytes )
        });
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

    static fromJson( json: any & { type: string } ): Script
    {
        const t = json.type;

        if( t !== ScriptType.NativeScript )
        {
            return new Script({ 
                scriptType: t, 
                bytes: fromHex( json.cborHex ) 
            });
        }

        return new Script({
            scriptType: ScriptType.NativeScript,
            bytes: json as NativeScript
        });
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
            return new Script({
                scriptType: defType,
                bytes: Cbor.encode( cObj ).toBuffer()
            });
        }

        if(!(
            cObj instanceof CborArray   &&
            cObj.array.length >= 2      &&
            cObj.array[0] instanceof CborUInt
        ))
        throw new Error(`Invalid CBOR format for "Script"`);

        const n = Number(cObj.array[0].num);
        const t = n === 0 ? ScriptType.NativeScript :
            n === 1 ? ScriptType.PlutusV1 :
            ScriptType.PlutusV2;

        if( t === ScriptType.NativeScript )
        return new Script({
            scriptType: t, 
            bytes: Cbor.encode( cObj.array[1] ).toBuffer() 
    });

        if(!( cObj.array[1] instanceof CborBytes ))
        throw new Error(`Invalid CBOR format for "Script"`);

        return new Script({
            scriptType: t, 
            bytes:cObj.array[1].bytes
        }, 
        getSubCborRef( cObj ) );
    }
}