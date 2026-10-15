import { CborArray, CborBytes, ToCbor, SubCborRef, CborString, Cbor, CborTag, CborMap, CborUInt, CborMapEntry, CanBeCborString, forceCborString, CborObj } from "@harmoniclabs/cbor";
import { cborArray, cborMapEntries, decodeVersionAtLeast, definiteBytes, expectTag, sparseMapKeys } from "../../../utils/strictCbor";
import { blake2b_256 } from "@harmoniclabs/crypto";
import { hasOwn } from "@harmoniclabs/obj-utils";
import { AuxiliaryDataHash } from "../../../hashes";
import { NativeScript, nativeScriptFromCborObj } from "../../../script/NativeScript";
import { PlutusScriptJsonFormat, Script, ScriptType } from "../../../script";
import { TxMetadata } from "../../common/tx/metadata/TxMetadata";
import { subCborRefOrUndef, getSubCborRef } from "../../../utils/getSubCborRef";
import { InvalidCborFormatError } from "../../../utils/InvalidCborFormatError";
import { ToJson } from "../../../utils/ToJson";


export interface IConwayAuxiliaryData {
    metadata?: TxMetadata;
    nativeScripts?: (NativeScript | Script<ScriptType.NativeScript>)[];
    plutusV1Scripts?: (PlutusScriptJsonFormat<ScriptType.PlutusV1 | "PlutusScriptV1"> | Script<ScriptType.PlutusV1>)[];
    plutusV2Scripts?: (PlutusScriptJsonFormat<ScriptType.PlutusV2 | "PlutusScriptV2"> | Script<ScriptType.PlutusV2>)[];
    plutusV3Scripts?: (PlutusScriptJsonFormat<ScriptType.PlutusV3 | "PlutusScriptV3"> | Script<ScriptType.PlutusV3>)[];
}

function scriptArrToCbor( scripts: Script[] ): CborArray
{
    return new CborArray(
        scripts.map( script => new CborBytes( script.bytes ) )
    );
}

export class ConwayAuxiliaryData
    implements IConwayAuxiliaryData, ToCbor, ToJson
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
                blake2b_256( this.toCbor() )
            )
        );

        return this._hash
    }

    constructor(
        auxData: IConwayAuxiliaryData,
        readonly cborRef: SubCborRef | undefined = undefined
    )
    {
        if(!(
            hasOwn( auxData, "metadata" )
        ))throw new Error("'ConwayAuxiliaryData' is missing 'metadata' field");

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
        ))throw new Error("'ConwayAuxiliaryData' :: 'metadata' field was not instance of 'TxMetadata'");
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
                    new Script(ScriptType.NativeScript, nativeScript)
                    
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
        if( 
            this.cborRef instanceof SubCborRef  
        ) return this.cborRef.toBuffer();

        return this.toCbor();
    }
    toCbor(): CborString
    {
        if( this.cborRef instanceof SubCborRef )
        {
            // TODO: validate cbor structure
            // we assume correctness here
            return this.cborRef.toBuffer();
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

    static fromCbor( cStr: CanBeCborString ): ConwayAuxiliaryData
    {
        return ConwayAuxiliaryData.fromCborObj( Cbor.parse( forceCborString( cStr ), { keepRef: true } ) );
    }
    
    /**
     * cardano-ledger `DecCBOR (Annotator (AlonzoTxAuxDataRaw era))`, by token type
     * (below protocol version 12):
     *
     * - a map: Shelley form, metadata only;
     * - an array: Allegra form `[metadata, [* native_script]]`, a `RecD` record
     *   (definite array of exactly two; an indefinite one is accepted too, as the
     *   ledger's testlib decoder does);
     * - a tag: it must be 259, over a sparse map with keys 0 (metadata), 1 (native
     *   scripts), 2 / 3 / 4 (plutus V1 / V2 / V3 scripts as byte strings); a repeated
     *   or unknown key fails, and so does key 5 (PlutusV4) before Dijkstra.
     *
     * The decoded value keeps its bytes in every form (588): auxiliary data is
     * memoized in cardano-ledger and its hash is over these bytes.
     */
    static fromCborObj( cObj: CborObj ): ConwayAuxiliaryData
    {
        const ref = getSubCborRef( cObj );

        if( cObj instanceof CborMap )
        {
            return new ConwayAuxiliaryData({
                metadata: TxMetadata.fromCborObj( cObj )
            }, ref );
        }

        if( cObj instanceof CborArray )
        {
            // production (Annotator) decoder: `RecD`, i.e. definite only; the reference decoder of
            // the conformance corpus (testlib `decodeRecordNamed`) also takes an indefinite array.
            // Accepting both can never reject what a node accepts.
            const [ _metadata, _native ] = cborArray( cObj, "ConwayAuxiliaryData", { len: 2 } );
            return new ConwayAuxiliaryData({
                metadata: TxMetadata.fromCborObj( _metadata ),
                nativeScripts: cborArray( _native, "ConwayAuxiliaryData native scripts" ).map( nativeScriptOf )
            }, ref );
        }

        const data = expectTag( cObj, 259, "ConwayAuxiliaryData" );
        const fields: ( CborObj | undefined )[] = new Array( 5 ).fill( undefined );
        const maxKey = decodeVersionAtLeast( 12 ) ? 5 : 4;
        for( const k of sparseMapKeys( data, "ConwayAuxiliaryData" ) )
        {
            if( k > maxKey ) throw new InvalidCborFormatError( "ConwayAuxiliaryData", "unknown or unsupported key " + k );
        }
        for( const { k, v } of cborMapEntries( data, "ConwayAuxiliaryData" ) )
        {
            const key = Number( ( k as CborUInt ).num );
            if( key < 5 ) fields[ key ] = v;
            else cborArray( v, "AlonzoAuxiliaryData plutus V4" ).forEach( c => definiteBytes( c, "plutus V4 script" ) );
        }

        const [
            _metadata,
            _native,
            _pV1,
            _pV2,
            _pV3
        ] = fields;

        const plutus = ( c: CborObj | undefined, v: 1 | 2 | 3 ) => c === undefined ? undefined :
            cborArray( c, "AlonzoAuxiliaryData plutus V" + v ).map( cbor => {
                const bytes = Cbor.encode( new CborBytes( definiteBytes( cbor, "plutus V" + v + " script" ) ) );
                return v === 1 ? Script.plutusV1( bytes ) : v === 2 ? Script.plutusV2( bytes ) : Script.plutusV3( bytes );
            });

        return new ConwayAuxiliaryData({
            metadata: _metadata === undefined ? undefined : TxMetadata.fromCborObj( _metadata ),
            nativeScripts: _native === undefined ? undefined :
                cborArray( _native, "AlonzoAuxiliaryData native" ).map( nativeScriptOf ),
            plutusV1Scripts: plutus( _pV1, 1 ) as any,
            plutusV2Scripts: plutus( _pV2, 2 ) as any,
            plutusV3Scripts: plutus( _pV3, 3 ) as any,
        }, ref );
    }

    toJSON() { return this.toJson(); }
    toJson()
    {
        return {
            metadata: this.metadata?.toJson(),
            nativeScripts: this.nativeScripts?.map( s => s.toJson() ),
            plutusV1Scripts: this.plutusV1Scripts?.map( s => s.toJson() ),
            plutusV2Scripts: this.plutusV2Scripts?.map( s => s.toJson() ),
            plutusV3Scripts: this.plutusV3Scripts?.map( s => s.toJson() )
        }
    }
}
/** a native script of auxiliary data: decoded strictly, kept with its own bytes */
function nativeScriptOf( c: CborObj ): Script<ScriptType.NativeScript>
{
    nativeScriptFromCborObj( c );
    return new Script( ScriptType.NativeScript, Cbor.encode( c ) ) as Script<ScriptType.NativeScript>;
}
