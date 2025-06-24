import { CborArray, CborBytes, ToCbor, CborString, Cbor, CborTag, CborMap, CborUInt, CborMapEntry, CanBeCborString, forceCborString, CborObj, SubCborRef } from "@harmoniclabs/cbor";
import { blake2b_256 } from "@harmoniclabs/crypto";
import { hasOwn } from "@harmoniclabs/obj-utils";
import { AuxiliaryDataHash } from "../../hashes";
import { NativeScript, nativeScriptFromCborObj } from "../../script/NativeScript";
import { PlutusScriptJsonFormat, Script, ScriptType } from "../../script/Script";
import { ToJson } from "../../utils/ToJson";
import { TxMetadata } from "../metadata/TxMetadata";
import { InvalidCborFormatError } from "../../utils/InvalidCborFormatError";
import { getSubCborRef, subCborRefOrUndef } from "../../utils/getSubCborRef";

export interface IAuxiliaryData {
    metadata?: TxMetadata;
    nativeScripts?: (NativeScript | Script<ScriptType.NativeScript>)[];
    plutusV1Scripts?: (PlutusScriptJsonFormat<ScriptType.PlutusV1 | "PlutusScriptV1"> | Script<ScriptType.PlutusV1>)[];
    plutusV2Scripts?: (PlutusScriptJsonFormat<ScriptType.PlutusV2 | "PlutusScriptV2"> | Script<ScriptType.PlutusV2>)[];
    plutusV3Scripts?: (PlutusScriptJsonFormat<ScriptType.PlutusV3 | "PlutusScriptV2"> | Script<ScriptType.PlutusV3>)[];
}

function scriptArrToCbor( scripts: Script[] ): CborArray
{
    return new CborArray(
        scripts.map( script => new CborBytes( script.bytes ) )
    );
}

export class AuxiliaryData
    implements IAuxiliaryData, ToCbor, ToJson
{
    readonly metadata?: TxMetadata;
    readonly nativeScripts?: Script<ScriptType.NativeScript>[];
    readonly plutusV1Scripts?: Script<ScriptType.PlutusV1>[];
    readonly plutusV2Scripts?: Script<ScriptType.PlutusV2>[];
    readonly plutusV3Scripts?: Script<ScriptType.PlutusV3>[];

    // --------- hash ---- //
    private _hash!: AuxiliaryDataHash
    
    get hash(): AuxiliaryDataHash
    {
        if( 
            this._hash instanceof AuxiliaryDataHash 
        ) return this._hash;

        this._hash = new AuxiliaryDataHash(
            new Uint8Array(
                blake2b_256( this.toCbor().toBuffer() )
            )
        );

        return this._hash
    }

    constructor(
        auxData: IAuxiliaryData,
        readonly cborRef: SubCborRef | undefined = undefined
    )
    {
        if(!(
            hasOwn( auxData, "metadata" )
        ))throw new Error("'AuxiliaryData' is missing 'metadata' field");

        const {
            metadata,
            nativeScripts,
            plutusV1Scripts,
            plutusV2Scripts,
            plutusV3Scripts
        } = auxData;

        // -------------------------------- native scripts -------------------------------- //
        if(!(
            metadata === undefined || 
            metadata instanceof TxMetadata
        ))throw new Error("'AuxiliaryData' :: 'metadata' field was not instance of 'TxMetadata'");
        this.metadata = metadata
        

        // -------------------------------- native scripts -------------------------------- //
        if( nativeScripts !== undefined )
        {
            if(!(
                Array.isArray( nativeScripts ) &&
                nativeScripts.every( script => {
                    return true;
                })
            ))throw new Error("invalid nativeScripts field");
            
            this.nativeScripts = nativeScripts?.map( nativeScript =>
                nativeScript instanceof Script
                    ? nativeScript :
                    new Script( ScriptType.NativeScript, nativeScript )
                    
            );
        }
        else
        {
            this.nativeScripts = undefined;
        }

        // -------------------------------- plutus v1 -------------------------------- //
        if( plutusV1Scripts !== undefined )
        {   
            if(!(
                Array.isArray( plutusV1Scripts ) &&
                plutusV1Scripts.every( script => {
                    return true;
                })
            ))throw new Error("invalid plutusV1Scripts field");

            this.plutusV1Scripts = plutusV1Scripts?.map( plutusScript =>
                plutusScript instanceof Script
                    ? plutusScript :
                    Script.fromJson( plutusScript )
            )
        }
        else
        {
            this.plutusV1Scripts = undefined;
        }

        // -------------------------------- plutus v2 -------------------------------- //
        if( plutusV2Scripts !== undefined )
        {
            if(!(
                Array.isArray( plutusV2Scripts ) &&
                plutusV2Scripts.every( script => {
                    return true;
                })
            ))throw new Error("invalid plutusV2Scripts field");

            this.plutusV2Scripts = plutusV2Scripts?.map( plutusScript =>
                plutusScript instanceof Script
                    ? plutusScript :
                    Script.fromJson( plutusScript )
            )
        }
        else
        {
            this.plutusV2Scripts = undefined;
        }
        // -------------------------------- plutus v3 -------------------------------- //
        if( plutusV3Scripts !== undefined )
            {
                if(!(
                    Array.isArray( plutusV3Scripts ) &&
                    plutusV3Scripts.every( script => {
                        return true;
                    })
                ))throw new Error("invalid plutusV3Scripts field");
    
                this.plutusV3Scripts = plutusV3Scripts?.map( plutusScript =>
                    plutusScript instanceof Script
                        ? plutusScript :
                        Script.fromJson( plutusScript )
                )
            }
            else
            {
                this.plutusV3Scripts = undefined;
            }
        

        this.cborRef = cborRef ?? subCborRefOrUndef( auxData );
    }
    
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
    toCborObj(): CborTag
    {
        return new CborTag(
            259,
            new CborMap([
                this.metadata === undefined ?  undefined :
                {
                    k: new CborUInt( 0 ),
                    v: this.metadata.toCborObj()
                },
                this.nativeScripts === undefined || this.nativeScripts.length === 0 ? undefined :
                {
                    k: new CborUInt( 1 ),
                    v: scriptArrToCbor( this.nativeScripts )
                },
                this.plutusV1Scripts === undefined || this.plutusV1Scripts.length === 0 ? undefined :
                {
                    k: new CborUInt( 2 ),
                    v: scriptArrToCbor( this.plutusV1Scripts )
                },
                this.plutusV2Scripts === undefined || this.plutusV2Scripts.length === 0 ? undefined :
                {
                    k: new CborUInt( 3 ),
                    v: scriptArrToCbor( this.plutusV2Scripts )
                },
                this.plutusV3Scripts === undefined || this.plutusV3Scripts.length === 0 ? undefined :
                {
                    k: new CborUInt( 4 ),
                    v: scriptArrToCbor( this.plutusV3Scripts )
                }
            ].filter( elem => elem !== undefined ) as CborMapEntry[])
        )
    }

    static fromCbor( cStr: CanBeCborString ): AuxiliaryData
    {
        return AuxiliaryData.fromCborObj( Cbor.parse( forceCborString( cStr ), { keepRef: true } ) );
    }
    static fromCborObj( cObj: CborObj ): AuxiliaryData
    {
        // shelley; metadata only
        if( cObj instanceof CborMap )
        {
            return new AuxiliaryData({
                metadata: TxMetadata.fromCborObj( cObj )
            });
        }

        // shelley multi assets; metadata + native scripts
        if( cObj instanceof CborArray )
        {
            if(!(
                cObj.array[1] instanceof CborArray
            ))
            throw new InvalidCborFormatError("AuxiliaryData")

            return new AuxiliaryData({
                metadata: TxMetadata.fromCborObj( cObj.array[0] ),
                nativeScripts: cObj.array[1].array.map( nativeScriptFromCborObj )
            });
        }

        if(!(
            cObj instanceof CborTag &&
            cObj.data instanceof CborMap
        )) throw new InvalidCborFormatError("AuxiliaryData")

        let fields: (CborObj | undefined)[] = new Array( 4 ).fill( undefined );

        for( let i = 0; i < 4; i++)
        {
            const { v } = cObj.data.map.find(
                ({ k }) => k instanceof CborUInt && Number( k.num ) === i
            ) ?? { v: undefined };

            if( v === undefined ) continue;

            fields[i] = v;
        }

        const [
            _metadata,
            _native,
            _pV1,
            _pV2,
            _pV3
        ] = fields;

        if(!(
            _native instanceof CborArray &&
            _pV1 instanceof CborArray &&
            _pV2 instanceof CborArray &&
            _pV3 instanceof CborArray
        ))
        throw new InvalidCborFormatError("AuxiliaryData")

        return new AuxiliaryData({
            metadata: _metadata === undefined ? undefined : TxMetadata.fromCborObj( _metadata ),
            nativeScripts:_native === undefined ? undefined : 
                _native.array.map( nativeCborObj => 
                    new Script(
                        ScriptType.NativeScript, 
                        Cbor.encode( nativeCborObj ).toBuffer()
                    )
                ),
            plutusV1Scripts: _pV1 === undefined ? undefined :
                _pV1.array.map( cbor =>
                    Script.plutusV1( Cbor.encode( cbor ).toBuffer() )
                ),
            plutusV2Scripts: _pV2 === undefined ? undefined :
                _pV2.array.map( cbor =>
                    Script.plutusV2( Cbor.encode( cbor ).toBuffer() )
                ),
            plutusV3Scripts: _pV3 === undefined ? undefined :
                _pV3.array.map( cbor =>
                    Script.plutusV3( Cbor.encode( cbor ).toBuffer() )
                )                
        }, getSubCborRef( cObj ));
    }

    toJSON() { return this.toJson(); }
    toJson()
    {
        return {
            metadata: this.metadata?.toJson(),
            nativeScripts: this.nativeScripts?.map( s => s.toJson() ),
            plutusV1Scripts: this.plutusV1Scripts?.map( s => s.toJson() ),
            plutusV2Scripts: this.plutusV2Scripts?.map( s => s.toJson() ),
            plutusV3Scripts: this.plutusV2Scripts?.map( s => s.toJson() )
        }
    }
}