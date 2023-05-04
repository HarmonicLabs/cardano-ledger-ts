import { CborArray, CborBytes, ToCbor, CborString, Cbor, CborTag, CborMap, CborUInt, CborMapEntry, CanBeCborString, forceCborString, CborObj } from "@harmoniclabs/cbor";
import { blake2b_256 } from "@harmoniclabs/crypto";
import { AuxiliaryDataHash } from "../../hashes";
import { NativeScript, nativeScriptFromCborObj } from "../../script/NativeScript";
import { PlutusScriptJsonFormat, Script, ScriptType } from "../../script/Script";
import { ToJson } from "../../utils/ToJson";
import { TxMetadata } from "../metadata";
import { hasOwn, defineReadOnlyProperty, definePropertyIfNotPresent } from "@harmoniclabs/obj-utils";
import { assert } from "../../utils/assert";
import { InvalidCborFormatError } from "../../utils/InvalidCborFormatError";

export interface IAuxiliaryData {
    metadata?: TxMetadata;
    nativeScripts?: (NativeScript | Script<ScriptType.NativeScript>)[];
    plutusV1Scripts?: (PlutusScriptJsonFormat<ScriptType.PlutusV1 | "PlutusScriptV1"> | Script<ScriptType.PlutusV1>)[];
    plutusV2Scripts?: (PlutusScriptJsonFormat<ScriptType.PlutusV2 | "PlutusScriptV2"> | Script<ScriptType.PlutusV2>)[];
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

    readonly hash!: AuxiliaryDataHash

    constructor( auxData: IAuxiliaryData )
    {
        assert(
            hasOwn( auxData, "metadata" ),
            "'AuxiliaryData' is missing 'metadata' field"
        );

        const {
            metadata,
            nativeScripts,
            plutusV1Scripts,
            plutusV2Scripts
        } = auxData;

        // -------------------------------- native scripts -------------------------------- //
        assert(
            metadata === undefined || metadata instanceof TxMetadata,
            "'AuxiliaryData' :: 'metadata' field was not instance of 'TxMetadata'"
        );
        defineReadOnlyProperty(
            this,
            "metadata",
            metadata
        );

        // -------------------------------- native scripts -------------------------------- //
        if( nativeScripts !== undefined )
        {
            assert(
                Array.isArray( nativeScripts ) &&
                nativeScripts.every( script => {

                    return true;
                }),
                "invalid nativeScripts field"
            );

            defineReadOnlyProperty(
                this,
                "nativeScripts",
                nativeScripts.length === 0 ? undefined : Object.freeze( nativeScripts )
            );
        }
        else
        {
            defineReadOnlyProperty(
                this,
                "nativeScripts",
                undefined
            );
        }

        // -------------------------------- plutus v1 -------------------------------- //
        if( plutusV1Scripts !== undefined )
        {
            assert(
                Array.isArray( plutusV1Scripts ) &&
                plutusV1Scripts.every( script => {

                    return true;
                }),
                "invalid plutusV1Scripts field"
            );

            defineReadOnlyProperty(
                this,
                "plutusV1Scripts",
                plutusV1Scripts.length === 0 ? undefined : Object.freeze( plutusV1Scripts )
            );
        }
        else
        {
            defineReadOnlyProperty(
                this,
                "plutusV1Scripts",
                undefined
            );
        }

        // -------------------------------- plutus v2 -------------------------------- //
        if( plutusV2Scripts !== undefined )
        {
            assert(
                Array.isArray( plutusV2Scripts ) &&
                plutusV2Scripts.every( script => {

                    return true;
                }),
                "invalid plutusV2Scripts field"
            );

            defineReadOnlyProperty(
                this,
                "plutusV2Scripts",
                plutusV2Scripts.length === 0 ? undefined : Object.freeze( plutusV2Scripts )
            );
        }
        else
        {
            defineReadOnlyProperty(
                this,
                "plutusV2Scripts",
                undefined
            );
        }

        // --------- hash ---- //
        let _hash: AuxiliaryDataHash = undefined as any;
        definePropertyIfNotPresent(
            this, "hash",
            {
                get: (): AuxiliaryDataHash => {
                    if( _hash instanceof AuxiliaryDataHash ) return _hash.clone();

                    _hash = new AuxiliaryDataHash(
                        new Uint8Array(
                            blake2b_256( this.toCbor().toBuffer() )
                        )
                    );

                    return _hash.clone()
                },
                set: () => {},
                enumerable: true,
                configurable: false
            }
        );


    }
    
    toCbor(): CborString
    {
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
                }
            ].filter( elem => elem !== undefined ) as CborMapEntry[])
        )
    }

    static fromCbor( cStr: CanBeCborString ): AuxiliaryData
    {
        return AuxiliaryData.fromCborObj( Cbor.parse( forceCborString( cStr ) ) );
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
        ))
        throw new InvalidCborFormatError("AuxiliaryData")

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
            _pV2
        ] = fields;

        if(!(
            _native instanceof CborArray &&
            _pV1 instanceof CborArray &&
            _pV2 instanceof CborArray
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
                    new Script(
                        ScriptType.PlutusV1,
                        Cbor.encode( cbor ).toBuffer()
                    )
                ),
            plutusV2Scripts: _pV2 === undefined ? undefined :
                _pV2.array.map( cbor =>
                    new Script(
                        ScriptType.PlutusV2,
                        Cbor.encode( cbor ).toBuffer()
                    )
                )
        })
    }

    toJson()
    {
        return {
            metadata: this.metadata?.toJson(),
            nativeScripts: this.nativeScripts?.map( s => s.toJson() ),
            plutusV1Scripts: this.plutusV1Scripts?.map( s => s.toJson() ),
            plutusV2Scripts: this.plutusV2Scripts?.map( s => s.toJson() ),
        }
    }
}