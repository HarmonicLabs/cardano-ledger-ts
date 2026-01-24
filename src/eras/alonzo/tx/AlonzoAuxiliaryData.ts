import { CborArray, CborBytes, ToCbor, SubCborRef, CborString, Cbor, CborTag, CborMap, CborUInt, CborMapEntry, CanBeCborString, forceCborString, CborObj } from "@harmoniclabs/cbor";
import { blake2b_256 } from "@harmoniclabs/crypto";
import { hasOwn } from "@harmoniclabs/obj-utils";
import { AuxiliaryDataHash } from "../../../hashes";
import { NativeScript, nativeScriptFromCborObj } from "../../../script/NativeScript";
import { PlutusScriptJsonFormat, Script, ScriptType } from "../../../script/Script";
import { TxMetadata } from "../../common";
import { subCborRefOrUndef, getSubCborRef } from "../../../utils/getSubCborRef";
import { InvalidCborFormatError } from "../../../utils/InvalidCborFormatError";
import { ToJson } from "../../../utils/ToJson";

export interface IAlonzoAuxiliaryData {
    metadata?: TxMetadata;
    nativeScripts?: (NativeScript | Script<ScriptType.NativeScript>)[];
    plutusV1Scripts?: (PlutusScriptJsonFormat<ScriptType.PlutusV1 | "PlutusScriptV1"> | Script<ScriptType.PlutusV1>)[];
}

function scriptArrToCbor( scripts: Script[] ): CborArray
{
    return new CborArray(
        scripts.map( script => new CborBytes( script.bytes ) )
    );
}

export class AlonzoAuxiliaryData
    implements IAlonzoAuxiliaryData, ToCbor, ToJson
{
    readonly metadata?: TxMetadata;
    readonly nativeScripts?: Script<ScriptType.NativeScript>[];
    readonly plutusV1Scripts?: Script<ScriptType.PlutusV1>[];

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
        auxData: IAlonzoAuxiliaryData,
        readonly cborRef: SubCborRef | undefined = undefined
    )
    {
        if(!(
            hasOwn( auxData, "metadata" )
        ))throw new Error("'AlonzoAuxiliaryData' is missing 'metadata' field");

        const {
            metadata,
            nativeScripts,
            plutusV1Scripts,
        } = auxData;

        // -------------------------------- native scripts -------------------------------- //
        if(!(
            metadata === undefined || 
            metadata instanceof TxMetadata
        ))throw new Error("'AlonzoAuxiliaryData' :: 'metadata' field was not instance of 'TxMetadata'");
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
                    new Script(
                        ScriptType.NativeScript, 
                        nativeScript 
                    )
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
        if( this.cborRef instanceof SubCborRef ) return Cbor.parse( this.cborRef.toBuffer() ) as CborTag;

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
                }
            ].filter( elem => elem !== undefined ) as CborMapEntry[])
        )
    }

    static fromCbor( cStr: CanBeCborString ): AlonzoAuxiliaryData
    {
        return AlonzoAuxiliaryData.fromCborObj( Cbor.parse( forceCborString( cStr ), { keepRef: true } ) );
    }
    static fromCborObj( cObj: CborObj ): AlonzoAuxiliaryData
    {
        // shelley; metadata only
        if( cObj instanceof CborMap )
        {
            return new AlonzoAuxiliaryData({
                metadata: TxMetadata.fromCborObj( cObj )
            });
        }

        // shelley multi assets; metadata + native scripts
        if( cObj instanceof CborArray )
        {
            if(!(
                cObj.array[1] instanceof CborArray
            ))throw new InvalidCborFormatError("AlonzoAuxiliaryData")

            return new AlonzoAuxiliaryData({
                metadata: TxMetadata.fromCborObj( cObj.array[0] ),
                nativeScripts: cObj.array[1].array.map( nativeScriptFromCborObj )
            });
        }
        /* 
            some blocks have auxiliary data as plain CborMap (metadata only old format) instead of CborTag(259, CborMap) for post Alonzo
            some blocks use legacy auxiliary data encoding.(face palm)
        */
            if( cObj instanceof CborMap )
                {
        
                    return new AlonzoAuxiliaryData({
                        metadata: TxMetadata.fromCborObj( cObj )
                    }, getSubCborRef( cObj ));
                };
        /*
        ;             metadata: shelley
        ; transaction_metadata: shelley-ma
        ; NEW
        ;   #6.259(0 ==> metadata): alonzo onwards
        ;       3: [* plutus_v1_script]
        */
        if(!(
            cObj instanceof CborTag &&
            cObj.data instanceof CborMap 
            // && cObj.data.map.length >= 3
        ))throw new InvalidCborFormatError("AlonzoAuxiliaryData")

        let fields: (CborObj | undefined)[] = new Array( 3 ).fill( undefined );

        for( let i = 0; i < 3; i++)
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
            _pV1
        ] = fields;

        if (_native !== undefined && !(_native instanceof CborArray)) throw new InvalidCborFormatError("AlonzoAuxiliaryData native")
        if (_pV1 !== undefined && !(_pV1 instanceof CborArray)) throw new InvalidCborFormatError("AlonzoAuxiliaryData pV1")

        return new AlonzoAuxiliaryData({
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
                )            
        }, getSubCborRef( cObj ));
    }

    toJSON() { return this.toJson(); }
    toJson()
    {
        return {
            metadata: this.metadata?.toJson(),
            nativeScripts: this.nativeScripts?.map( s => s.toJson() ),
            plutusV1Scripts: this.plutusV1Scripts?.map( s => s.toJson() )
        }
    }
}