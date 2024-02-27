import { ToCbor, CborString, Cbor, CborObj, CborMap, CborUInt, CborArray, CborMapEntry, CanBeCborString, forceCborString, isCborObj } from "@harmoniclabs/cbor";
import { Cloneable } from "@harmoniclabs/cbor/dist/utils/Cloneable";
import { isObject, definePropertyIfNotPresent, defineReadOnlyProperty } from "@harmoniclabs/obj-utils";
import { Data, isData, dataToCborObj, dataFromCborObj } from "@harmoniclabs/plutus-data";
import { Hash28 } from "../../hashes";
import { Script, ScriptType, nativeScriptToCborObj } from "../../script";
import { InvalidCborFormatError } from "../../utils/InvalidCborFormatError";
import { ToJson } from "../../utils/ToJson";
import { assert } from "../../utils/assert";
import { BootstrapWitness } from "./BootstrapWitness";
import { TxRedeemer } from "./TxRedeemer";
import { VKeyWitness } from "./VKeyWitness";


export interface ITxWitnessSet {
    vkeyWitnesses?: VKeyWitness[],
    nativeScripts?: Script<ScriptType.NativeScript>[],
    bootstrapWitnesses?: BootstrapWitness[],
    plutusV1Scripts?: Script<ScriptType.PlutusV1>[],
    datums?: Data[],
    redeemers?: TxRedeemer[],
    plutusV2Scripts?: Script<ScriptType.PlutusV2>[],
    plutusV3Scripts?: Script<ScriptType.PlutusV3>[],
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

export function isITxWitnessSet( set: object ): set is ITxWitnessSet
{
    if( !isObject( set ) ) return false;

    const {
        vkeyWitnesses,
        nativeScripts,
        bootstrapWitnesses,
        plutusV1Scripts,
        datums,
        redeemers,
        plutusV2Scripts,
        plutusV3Scripts,
    } = set as ITxWitnessSet;

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
            rdmr => rdmr instanceof TxRedeemer
        ) &&
        isUndefOrCheckedArr(
            plutusV2Scripts,
            pv2 => pv2 instanceof Script && pv2.type === ScriptType.PlutusV2
        ) &&
        isUndefOrCheckedArr(
            plutusV3Scripts,
            pv3 => pv3 instanceof Script && pv3.type === ScriptType.PlutusV3
        )
    );
}

export class TxWitnessSet
    implements ITxWitnessSet, ToCbor, ToJson
{
    readonly vkeyWitnesses?: VKeyWitness[];
    readonly nativeScripts?: Script<ScriptType.NativeScript>[];
    readonly bootstrapWitnesses?: BootstrapWitness[];
    readonly plutusV1Scripts?: Script<ScriptType.PlutusV1>[];
    readonly datums?: Data[];
    readonly redeemers?: TxRedeemer[];
    readonly plutusV2Scripts?: Script<ScriptType.PlutusV2>[];
    readonly plutusV3Scripts?: Script<ScriptType.PlutusV3>[];
    
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

    constructor( witnesses: ITxWitnessSet, allRequiredSigners: Hash28[] | undefined = undefined )
    {
        assert(
            isITxWitnessSet( witnesses ),
            "invalid witnesses passed"
        );

        const defGetter = ( name: keyof ITxWitnessSet, get: () => any ) =>
        {
            definePropertyIfNotPresent(
                this, name,
                {
                    get,
                    set: () => {},
                    enumerable: true,
                    configurable: false
                }
            )
        };

        function cloneArr<Stuff extends Cloneable<any>>( arr?: Stuff[] ): Stuff[]
        {
            return arr?.map( element => element.clone() ) ?? [];
        }

        function defGetterArr( name: keyof ITxWitnessSet, elems?: Cloneable<any>[] )
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
            redeemers,
            plutusV3Scripts
        } = witnesses;

        const _vkeyWits = vkeyWitnesses?.map( wit => wit.clone() ) ?? [];

        defGetterArr( "vkeyWitnesses", _vkeyWits );
        defGetterArr( "bootstrapWitnesses", bootstrapWitnesses );
        defGetterArr( "datums", datums );
        defGetterArr( "nativeScripts", nativeScripts );
        defGetterArr( "plutusV1Scripts", plutusV1Scripts );
        defGetterArr( "plutusV2Scripts", plutusV2Scripts );
        defGetterArr( "redeemers", redeemers );
        defGetterArr( "plutusV3Scripts", plutusV3Scripts );

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

        defineReadOnlyProperty(
            this, "addVKeyWitness",
            ( vkeyWit: VKeyWitness ) => {
                // if(
                //     noRequiredSigs ||
                //     _reqSigs.includes( vkeyWit.vkey.hash.toString() )
                // )
                // {
                //     _vkeyWits.push( vkeyWit.clone() );
                // }
                _vkeyWits.push( vkeyWit.clone() );
            }
        )
    }

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
            plutusV3Scripts: this.plutusV3Scripts?.map( s => s.toJson() ),
        }
    }

    toCbor(): CborString
    {
        return Cbor.encode( this.toCborObj() );
    }
    toCborObj(): CborObj
    {
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
                },

                this.plutusV3Scripts === undefined ? undefined :
                {
                    k: new CborUInt( 7 ),
                    v: new CborArray(
                        this.plutusV3Scripts
                        .map( script => Cbor.parse( script.cbor ) )
                    )
                },
            ]
            .filter( elem => elem !== undefined ) as CborMapEntry[])
        )
    }

    static fromCbor( cStr: CanBeCborString ): TxWitnessSet
    {
        return TxWitnessSet.fromCborObj( Cbor.parse( forceCborString( cStr ) ) );
    }
    static fromCborObj( cObj: CborObj ): TxWitnessSet
    {
        if(!( cObj instanceof CborMap ))
        throw new InvalidCborFormatError("TxWitnessSet");

        let fields: (CborObj | undefined)[] = new Array( 8 ).fill( undefined );

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
            _plutusV3,
        ] = fields;

        if(!(
            _vkey instanceof CborArray &&
            _native instanceof CborArray &&
            _bootstrap instanceof CborArray &&
            _plutusV1 instanceof CborArray &&
            _dats instanceof CborArray &&
            // _reds
            _plutusV2 instanceof CborArray &&
            _plutusV3 instanceof CborArray
        )) throw new InvalidCborFormatError("TxWitnessSet");

        return new TxWitnessSet({
            vkeyWitnesses: _vkey === undefined ? undefined : _vkey.array.map( VKeyWitness.fromCborObj ),
            nativeScripts: _native === undefined ? undefined : 
                _native.array.map( nativeCborObj => 
                    new Script(
                        ScriptType.NativeScript, 
                        Cbor.encode( nativeCborObj ).toBuffer()
                    )
                ),
            bootstrapWitnesses: _bootstrap === undefined ? undefined :
                _bootstrap.array.map( BootstrapWitness.fromCborObj ),
            plutusV1Scripts: _plutusV1 === undefined ? undefined :
                _plutusV1.array.map( cbor =>
                    new Script(
                        ScriptType.PlutusV1,
                        Cbor.encode( cbor ).toBuffer()
                    )
                ),
            datums: _dats === undefined ? undefined :
                _dats.array.map( dataFromCborObj ),
            redeemers: _reds === undefined ? undefined : witnessRedeemersFromCborObj( _reds ),
            plutusV2Scripts: _plutusV2 === undefined ? undefined :
                _plutusV2.array.map( cbor =>
                    new Script(
                        ScriptType.PlutusV2,
                        Cbor.encode( cbor ).toBuffer()
                    )
                ),
            plutusV3Scripts: _plutusV3 === undefined ? undefined :
                _plutusV3.array.map( cbor =>
                    new Script(
                        ScriptType.PlutusV3,
                        Cbor.encode( cbor ).toBuffer()
                    )
                ),
            
        })
    }

}

function witnessRedeemersFromCborObj( cbor: CborObj ): TxRedeemer[]
{
    if( cbor instanceof CborArray )
    {
        return cbor.array.map( TxRedeemer.fromCborObj );
    }
    else if( cbor instanceof CborMap )
    {
        return cbor.map.map( TxRedeemer.fromCborMapEntry );
    }
    else throw new Error("invalid format for witness set redeemers field");
}