import { ToCbor, SubCborRef, CborString, Cbor, CborObj, CborMap, CborUInt, CborArray, CborMapEntry, CanBeCborString, forceCborString, isCborObj } from "@harmoniclabs/cbor";
import { Cloneable } from "@harmoniclabs/cbor/dist/utils/Cloneable";
import { Data, isData, dataToCborObj, dataFromCborObj } from "@harmoniclabs/plutus-data";
import { isObject } from "@harmoniclabs/obj-utils";
import { Script, ScriptType, nativeScriptToCborObj } from "../../../script";
import { Hash28 } from "../../../hashes";
import { BabbageTxRedeemer } from "./";
import { isCborSet, getCborSet } from "../../../utils/getCborSet";
import { subCborRefOrUndef, getSubCborRef } from "../../../utils/getSubCborRef";
import { InvalidCborFormatError } from "../../../utils/InvalidCborFormatError";
import { ToJson } from "../../../utils/ToJson";
import { BootstrapWitness } from "../../../tx/TxWitnessSet/BootstrapWitness";
import { VKeyWitness } from "../../../tx/TxWitnessSet/VKeyWitness/VKeyWitness";

export interface IBabbageTxWitnessSet {
    vkeyWitnesses?: VKeyWitness[],
    nativeScripts?: Script<ScriptType.NativeScript>[],
    bootstrapWitnesses?: BootstrapWitness[],
    plutusV1Scripts?: Script<ScriptType.PlutusV1>[],
    datums?: Data[],
    redeemers?: BabbageTxRedeemer[],
    plutusV2Scripts?: Script<ScriptType.PlutusV2>[]
};

function isUndefOrCheckedArr<ArrElemT>( stuff: undefined | ArrElemT[], arrayElemCheck: (elem: ArrElemT) => boolean )
{
    return (
        stuff === undefined || (
            Array.isArray( stuff ) &&
            stuff.every( arrayElemCheck )
        )
    );
}

export function isIBabbageTxWitnessSet( set: object ): set is IBabbageTxWitnessSet
{
    if( !isObject( set ) ) return false;

    const {
        vkeyWitnesses,
        nativeScripts,
        bootstrapWitnesses,
        plutusV1Scripts,
        datums,
        redeemers,
        plutusV2Scripts
    } = set as IBabbageTxWitnessSet;

    return (
        isUndefOrCheckedArr(
            vkeyWitnesses,
            vkeyWit => vkeyWit instanceof VKeyWitness
        ) &&
        isUndefOrCheckedArr(
            nativeScripts,
            ns => ns instanceof Script && ns.type === ScriptType.NativeScript
        ) &&
        isUndefOrCheckedArr(
            bootstrapWitnesses,
            bootWit => bootWit instanceof BootstrapWitness
        ) &&
        isUndefOrCheckedArr(
            plutusV1Scripts,
            pv1 => pv1 instanceof Script && pv1.type === ScriptType.PlutusV1
        ) &&
        isUndefOrCheckedArr( datums, isData ) &&
        isUndefOrCheckedArr(
            redeemers,
            rdmr => rdmr instanceof BabbageTxRedeemer
        ) &&
        isUndefOrCheckedArr(
            plutusV2Scripts,
            pv2 => pv2 instanceof Script && pv2.type === ScriptType.PlutusV2
        )
    );
}

export class BabbageTxWitnessSet
    implements IBabbageTxWitnessSet, ToCbor, ToJson
{
    readonly vkeyWitnesses?: VKeyWitness[];
    readonly nativeScripts?: Script<ScriptType.NativeScript>[];
    readonly bootstrapWitnesses?: BootstrapWitness[];
    readonly plutusV1Scripts?: Script<ScriptType.PlutusV1>[];
    readonly datums?: Data[];
    readonly redeemers?: BabbageTxRedeemer[];
    readonly plutusV2Scripts?: Script<ScriptType.PlutusV2>[];
    
    /*
     * checks that the signer is needed
     * if true adds the witness
     * otherwise nothing happens (the signature is not added)
    **/
    readonly addVKeyWitness: ( vkeyWit: VKeyWitness ) => void
    /*
     * @returns {boolean}
     *  `true` if all the signers needed
     *  have signed the transaction; `false` otherwise
     * 
     * signers needed are:
     *  - required to spend an utxo
     *  - required by certificate
     *  - required by withdrawals
     *  - additional specified in the `requiredSigners` field
     */
    readonly isComplete: boolean

    constructor(
        witnesses: IBabbageTxWitnessSet,
        readonly cborRef: SubCborRef | undefined = undefined,
        allRequiredSigners: Hash28[] | undefined = undefined,
    )
    {
        if(!(
            isIBabbageTxWitnessSet( witnesses )
        )) throw new Error("invalid witnesses passed");


        
        const defGetter = ( name: keyof IBabbageTxWitnessSet, get: () => any ) =>
        {
            Object.defineProperty(this, name, {
                get,
                set: () => {},
                enumerable: true,
                configurable: false
            });   
            /*
            definePropertyIfNotPresent(
                this, name,
                {
                    get,
                    set: () => {},
                    enumerable: true,
                    configurable: false
                }
            )
            */
        };
        function cloneArr<Stuff extends Cloneable<any>>( arr?: Stuff[] ): Stuff[]
        {
            return arr?.map( element => element.clone() ) ?? [];
        }

        function defGetterArr( name: keyof IBabbageTxWitnessSet, elems?: Cloneable<any>[] )
        {
            let _elems = elems ?? [];
            defGetter(
                name,
                () => _elems.length === 0 ? undefined : cloneArr( _elems )
            );
        }

        const {
            vkeyWitnesses,
            bootstrapWitnesses,
            datums,
            nativeScripts,
            plutusV1Scripts,
            plutusV2Scripts,
            redeemers
        } = witnesses;

        const _vkeyWits = vkeyWitnesses?.map( wit => wit.clone() ) ?? [];

        defGetterArr( "vkeyWitnesses", _vkeyWits );
        defGetterArr( "bootstrapWitnesses", bootstrapWitnesses );
        defGetterArr( "datums", datums );
        defGetterArr( "nativeScripts", nativeScripts );
        defGetterArr( "plutusV1Scripts", plutusV1Scripts );
        defGetterArr( "plutusV2Scripts", plutusV2Scripts );
        defGetterArr( "redeemers", redeemers );

        const _reqSigs =
            Array.isArray( allRequiredSigners ) && allRequiredSigners.every( reqSig => reqSig instanceof Hash28 ) ? 
            allRequiredSigners.map( sig => sig.toString() ) :
            undefined;

        const noRequiredSigs = _reqSigs === undefined; 

        Object.defineProperty(
            this, "isComplete",
            {
                get: () => noRequiredSigs ||
                    _reqSigs.every( 
                        sig => 
                        _vkeyWits.some( 
                            wit => wit.vkey.hash.toString() === sig 
                        )
                    ),
                set: () => {},
                configurable: false,
                enumerable: true 
            }
        );

        this.addVKeyWitness = ( vkeyWit: VKeyWitness ) => {_vkeyWits.push( vkeyWit.clone() );
        }

        /* DONE: this.cboRref params */
        this.cborRef = cborRef ?? subCborRefOrUndef( witnesses );
    }

    toJSON() { return this.toJson(); }
    toJson()
    {
        return {
            vkeyWitnesses: this.vkeyWitnesses?.map( vkWit => vkWit.toJson() ),
            nativeScripts: this.nativeScripts?.map( ns => ns.toJson() ),
            bootstrapWitnesses: this.bootstrapWitnesses?.map( bWit => bWit.toJson() ),
            plutusV1Scripts: this.plutusV1Scripts?.map( s => s.toJson() ),
            datums: this.datums?.map( dat => dat.toJson() ),
            redeemers: this.redeemers?.map( rdmr => rdmr.toJson() ),
            plutusV2Scripts: this.plutusV2Scripts?.map( s => s.toJson() ),
        }
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
    toCborObj(): CborObj
    {
        if( this.cborRef instanceof SubCborRef )
        {
            // TODO: validate cbor structure
            // we assume correctness here
            return Cbor.parse( this.cborRef.toBuffer() );
        }
        return new CborMap(
            ([
                this.vkeyWitnesses === undefined ? undefined :
                {
                    k: new CborUInt( 0 ),
                    v: new CborArray(
                        this.vkeyWitnesses.map( witness => witness.toCborObj() )
                    )
                },

                this.nativeScripts === undefined ? undefined :
                {
                    k: new CborUInt( 1 ),
                    v: new CborArray(
                        this.nativeScripts.map( 
                            nativeScript => nativeScript instanceof Script ?
                            Cbor.parse( nativeScript.cbor ) :
                            nativeScriptToCborObj( nativeScript ) )
                    )
                },

                this.bootstrapWitnesses === undefined ? undefined :
                {
                    k: new CborUInt( 2 ),
                    v: new CborArray(
                        this.bootstrapWitnesses.map( w => w.toCborObj() )
                    )
                },

                this.plutusV1Scripts === undefined ? undefined :
                {
                    k: new CborUInt( 3 ),
                    v: new CborArray(
                        this.plutusV1Scripts
                        .map( script =>  Cbor.parse( script.cbor ) )
                    )
                },

                this.datums === undefined ? undefined :
                {
                    k: new CborUInt( 4 ),
                    v: new CborArray(
                        this.datums.map( dataToCborObj )
                    )
                },

                this.redeemers === undefined ? undefined :
                {
                    k: new CborUInt( 5 ),
                    v: new CborArray(
                        this.redeemers.map( r => r.toCborObj() )
                    )
                },

                this.plutusV2Scripts === undefined ? undefined :
                {
                    k: new CborUInt( 6 ),
                    v: new CborArray(
                        this.plutusV2Scripts
                        .map( script => Cbor.parse( script.cbor ) )
                    )
                }
            ]
            .filter( elem => elem !== undefined ) as CborMapEntry[])
        )
    }

    static fromCbor( cStr: CanBeCborString ): BabbageTxWitnessSet
    {
        return BabbageTxWitnessSet.fromCborObj( Cbor.parse( forceCborString( cStr ), { keepRef: true } ) );
    }

    static fromCborObj( cObj: CborObj ): BabbageTxWitnessSet
    {
        if(!( 
            cObj instanceof CborMap 
            // && cObj.map.length >= 7
        ))throw new InvalidCborFormatError("BabbageTxWitnessSet");

        let fields: (CborObj | undefined)[] = new Array( 7 ).fill( undefined );

        for( let i = 0; i < 7; i++)
        {
            const { v } = cObj.map.find(
                ({ k }) => k instanceof CborUInt && Number( k.num ) === i
            ) ?? { v: undefined };

            if( v === undefined || !isCborObj( v ) ) continue;

            fields[i] = v;
        }

        const [
            _vkey,
            _native,
            _bootstrap,
            _plutusV1,
            _dats,
            _reds,
            _plutusV2,
        ] = fields;

        // redeemer might be either array or map in conway
        if(!(
            (_vkey === undefined        || isCborSet( _vkey ) )      &&
            (_native === undefined      || isCborSet( _native ) )    &&
            (_bootstrap === undefined   || isCborSet( _bootstrap ) ) &&
            (_plutusV1 === undefined    || isCborSet( _plutusV1 ) )  &&
            (_dats === undefined        || isCborSet( _dats ) )      &&
            (_plutusV2 === undefined    || isCborSet( _plutusV2 ) )  
        )) throw new InvalidCborFormatError("BabbageTxWitnessSet");

        return new BabbageTxWitnessSet({
            vkeyWitnesses: _vkey === undefined ? undefined : getCborSet( _vkey ).map( VKeyWitness.fromCborObj ),
            nativeScripts: _native === undefined ? undefined : 
                getCborSet( _native ).map( nativeCborObj => 
                    new Script(
                        ScriptType.NativeScript, 
                        Cbor.encode( nativeCborObj ).toBuffer()
                    )
                ),
            bootstrapWitnesses: _bootstrap === undefined ? undefined :
                getCborSet( _bootstrap ).map( BootstrapWitness.fromCborObj ),
            plutusV1Scripts: _plutusV1 === undefined ? undefined :
                getCborSet( _plutusV1 ).map( cbor =>
                    new Script(
                        ScriptType.PlutusV1,
                        Cbor.encode( cbor ).toBuffer()
                    )
                ),
            datums: _dats === undefined ? undefined :
                getCborSet( _dats ).map( dataFromCborObj ),
            redeemers: _reds === undefined ? undefined : witnessRedeemersFromCborObj( _reds ),
            plutusV2Scripts: _plutusV2 === undefined ? undefined :
                getCborSet( _plutusV2 ).map( cbor =>
                    Script.plutusV2( Cbor.encode( cbor ).toBuffer() )
                )
        }, getSubCborRef( cObj ));
    }

}

function witnessRedeemersFromCborObj( cbor: CborObj ): BabbageTxRedeemer[]
{
    if( cbor instanceof CborArray )
    {
        return cbor.array.map( BabbageTxRedeemer.fromCborObj );
    }
    else if( cbor instanceof CborMap )
    {
        return cbor.map.map( BabbageTxRedeemer.fromCborMapEntry );
    }
    else throw new Error("invalid format for witness set redeemers field");
}