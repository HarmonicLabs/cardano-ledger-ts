import { ToCbor, SubCborRef, CborString, Cbor, CborObj, CborMap, CborUInt, CborArray, CborMapEntry, CanBeCborString, forceCborString } from "@harmoniclabs/cbor";
import { CanBeUInteger, canBeUInteger, forceBigUInt } from "@harmoniclabs/cbor/dist/utils/ints";
import { blake2b_256 } from "@harmoniclabs/crypto";
import { hasOwn, isObject } from "@harmoniclabs/obj-utils";
import { PubKeyHash } from "../../../credentials";
import { AuxiliaryDataHash, ScriptDataHash, CanBeHash28, Hash32, canBeHash28 } from "../../../hashes";
import { Coin, TxWithdrawals, ITxWithdrawals, Value, NetworkT, isCertificate, canBeTxWithdrawals, forceTxWithdrawals, isIValue, certificateFromCborObj, certificatesToDepositLovelaces, Certificate } from "../../common/ledger";
import { LegacyPPUpdateProposal, isLegacyPPUpdateProposal, LegacyPPUpdateProposalToCborObj, LegacyPPUpdateProposalFromCborObj, protocolUpdateToJson, LegacyPPUpdateMapFromCborObj } from "../../common/ledger/protocol/LegacyPPUpdateProposal";
import { partialBabbageProtocolParametersToCborObj, BabbageProtocolParameters, defaultBabbageProtocolParameters, partialBabbageProtocolParamsToJson, partialBabbageProtocolParametersFromCborObj } from "../protocol";
import { TxOutRef } from "../../common/tx/TxOutRef";
import { BabbageUTxO, isIBabbageUTxO, } from "./BabbageUTxO";
import { BabbageTxOut, isIBabbageTxOut } from "./";
import { getCborSet } from "../../../utils/getCborSet";
import { subCborRefOrUndef, getSubCborRef } from "../../../utils/getSubCborRef";
import { maybeBigUint } from "../../../utils/ints";
import { InvalidCborFormatError } from "../../../utils/InvalidCborFormatError";
import { ToJson } from "../../../utils/ToJson";


export interface IBabbageTxBody {
    inputs: [ BabbageUTxO, ...BabbageUTxO[] ],
    outputs: BabbageTxOut[],
    fee: Coin,
    ttl?: CanBeUInteger,
    certs?: Certificate[],
    withdrawals?: TxWithdrawals | ITxWithdrawals,
    protocolUpdate?: LegacyPPUpdateProposal,
    auxDataHash?: AuxiliaryDataHash, // hash 32
    validityIntervalStart?: CanBeUInteger,
    mint?: Value,
    scriptDataHash?: ScriptDataHash, // hash 32
    collateralInputs?: BabbageUTxO[], 
    requiredSigners?: CanBeHash28[],
    network?: NetworkT,
    collateralReturn?: BabbageTxOut,
    totCollateral?: Coin,
    refInputs?: BabbageUTxO[]
}

export function isIBabbageTxBody( body: Readonly<object> ): body is IBabbageTxBody
{
    if( !isObject( body ) ) return false;

    const fields = Object.keys( body );
    const b = body as IBabbageTxBody;

    return (
        fields.length >= 3 &&
        
        hasOwn( b, "inputs" ) &&
        Array.isArray( b.inputs ) && b.inputs.length > 0 &&
        b.inputs.every( _in => _in instanceof BabbageUTxO || isIBabbageUTxO( _in ) ) &&
        
        hasOwn( b, "outputs" ) &&
        Array.isArray( b.outputs ) && b.outputs.length > 0 &&
        b.outputs.every( out => out instanceof BabbageTxOut || isIBabbageTxOut( out ) ) &&

        hasOwn( b, "fee" ) && canBeUInteger( b.fee ) &&

        ( b.ttl === undefined || canBeUInteger( b.ttl ) ) &&
        ( b.certs === undefined || b.certs.every( isCertificate ) ) &&
        ( b.withdrawals === undefined || canBeTxWithdrawals( b.withdrawals ) ) &&
        ( b.protocolUpdate === undefined || isLegacyPPUpdateProposal( b.protocolUpdate ) ) &&
        ( b.auxDataHash === undefined || b.auxDataHash instanceof Hash32 ) &&
        ( b.validityIntervalStart === undefined || canBeUInteger( b.validityIntervalStart ) ) &&
        ( b.mint === undefined || b.mint instanceof Value ) &&
        ( b.scriptDataHash === undefined || b.scriptDataHash instanceof Hash32 ) &&
        ( b.network === undefined || b.network === "mainnet" || b.network === "testnet" ) &&
        ( b.collateralReturn === undefined || b.collateralReturn instanceof BabbageTxOut || isIBabbageTxOut( b.collateralReturn ) ) &&
        ( b.totCollateral === undefined || canBeUInteger( b.totCollateral ) ) &&
        ( b.collateralInputs === undefined || (
            Array.isArray( b.collateralInputs ) && 
            b.collateralInputs.every( collateral => collateral instanceof BabbageUTxO )
        )) &&
        ( b.requiredSigners === undefined || (
            Array.isArray( b.requiredSigners ) &&
            b.requiredSigners.every( sig => sig instanceof PubKeyHash )
        )) &&
        ( b.refInputs === undefined || (
            Array.isArray( b.refInputs ) &&
            b.refInputs.every( ref => ref instanceof BabbageUTxO || isIBabbageUTxO( ref ) )
        ))
    )
}

export class BabbageTxBody
    implements IBabbageTxBody, ToCbor, ToJson
{
    readonly inputs!: [ BabbageUTxO, ...BabbageUTxO[] ];
    readonly outputs!: BabbageTxOut[];
    readonly fee!: bigint;
    readonly ttl?: bigint;
    readonly certs?: Certificate[];
    readonly withdrawals?: TxWithdrawals;
    readonly protocolUpdate?: LegacyPPUpdateProposal; // babbage only; removed in conway
    readonly auxDataHash?: AuxiliaryDataHash; // hash 32
    readonly validityIntervalStart?: bigint;
    readonly mint?: Value;
    readonly scriptDataHash?: ScriptDataHash; // hash 32
    readonly collateralInputs?: BabbageUTxO[];
    readonly requiredSigners?: PubKeyHash[];
    readonly network?: NetworkT;
    readonly collateralReturn?: BabbageTxOut;
    readonly totCollateral?: bigint; // Coin
    readonly refInputs?: BabbageUTxO[];

    /**
     * getter
     */
    get hash(): Hash32
    {
        if(
            this._isHashValid === true
            && this._hash !== undefined
            && this._hash instanceof Hash32
        ) return this._hash;

        this._hash = new Hash32(
            new Uint8Array(
                blake2b_256( this.toCbor().toBuffer() )
            )
        );
        this._isHashValid = true;

        return this._hash;
    }

    private _isHashValid = false;
    private _hash: Hash32 | undefined = undefined;

    /**
     * 
     * @param body object describing the transaction
     * @throws only if the the `body` parameter does not respect the `IConwayBabbageTxBody` interface
     *      **DOES NOT THROW** if the transaction is unbalanced; that needs to be checked using `ConwayBabbageTxBody.isValueConserved` static method
     */
    constructor(
        body: IBabbageTxBody,
        readonly cborRef: SubCborRef | undefined = undefined
    )
    {
        const {
            inputs,
            outputs,
            fee,
            ttl,
            certs,
            withdrawals,
            protocolUpdate,
            auxDataHash,
            validityIntervalStart,
            mint,
            scriptDataHash,
            collateralInputs,
            requiredSigners,
            network,
            collateralReturn,
            totCollateral,
            refInputs,
        } = body;

        // -------------------------------------- inputs -------------------------------------- //
        if(!(
            Array.isArray( inputs )  &&
            inputs.length > 0 &&
            inputs.every( isIBabbageUTxO )
        )) throw new Error("invalid 'inputs' field");

        this.inputs = inputs.map( i => i instanceof BabbageUTxO ? i : new BabbageUTxO( i ) ) as [ BabbageUTxO, ...BabbageUTxO[] ];

        // -------------------------------------- outputs -------------------------------------- //

        if(!(
            Array.isArray( outputs )  &&
            outputs.length > 0 &&
            outputs.every( isIBabbageTxOut )
        )) throw new Error("invald 'outputs' field");

        this.outputs = outputs.map( out => out instanceof BabbageTxOut ? out : new BabbageTxOut( out ) );

        // -------------------------------------- fee -------------------------------------- //
        if( !canBeUInteger( fee ) ) throw new Error("invald 'fee' field");

        this.fee = forceBigUInt( fee );

        // -------------------------------------- ttl -------------------------------------- //

        this.ttl = ttl === undefined ? undefined : forceBigUInt( ttl );

        // -------------------------------------- certs -------------------------------------- //
        if(!(
            certs === undefined ||
            (
                Array.isArray( certs )
                && certs.every( isCertificate )
            )
        )) throw new Error("invalid 'certs' field");

        if(
            certs === undefined
            || certs.length <= 0
        ) this.certs = undefined
        else this.certs = certs;

        // -------------------------------------- withdrawals -------------------------------------- //
        
        if(!(
            withdrawals === undefined ||
            canBeTxWithdrawals( withdrawals )
        )) throw new Error("invalid 'withdrawals' field");

        this.withdrawals = (
            withdrawals === undefined ? undefined :
            forceTxWithdrawals( withdrawals )
        ); 
        
        // -------------------------------------- protocolUpdate -------------------------------------- //
        
        if(!(
            protocolUpdate === undefined ||
            isLegacyPPUpdateProposal( protocolUpdate )
        ))

        this.protocolUpdate = protocolUpdate;
        
        // -------------------------------------- auxDataHash -------------------------------------- //
        
        if(!(
            auxDataHash === undefined ||
            auxDataHash instanceof Hash32
        )) throw new Error("invalid 'auxDataHash' field");

        this.auxDataHash = auxDataHash === undefined ? undefined : new AuxiliaryDataHash( auxDataHash );
        
        // -------------------------------------- validityIntervalStart -------------------------------------- //
                
        if(!(
            validityIntervalStart === undefined ||
            canBeUInteger( validityIntervalStart )
        )) throw new Error("invalid 'validityIntervalStart' field");

        this.validityIntervalStart = validityIntervalStart === undefined ? undefined : forceBigUInt( validityIntervalStart );
        
        // -------------------------------------- mint -------------------------------------- //

        if(!(
            mint === undefined
            || mint instanceof Value
            || isIValue( mint )
        )) throw new Error("invalid 'mint' field");
        
        if( mint === undefined ) this.mint = undefined;
        else if( mint instanceof Value ) this.mint = mint;
        else this.mint = new Value( mint );
        
        // -------------------------------------- scriptDataHash -------------------------------------- //
        
        if(!(
            scriptDataHash === undefined ||
            scriptDataHash instanceof Hash32
        )) throw new Error("invalid 'scriptDataHash' field");

        this.scriptDataHash = scriptDataHash === undefined ? undefined : new ScriptDataHash( scriptDataHash );

        // -------------------------------------- collateral inputs -------------------------------------- //

        if(!(
            collateralInputs === undefined ||
            (
                Array.isArray( collateralInputs ) &&
                collateralInputs.every( isIBabbageUTxO )
            )
        )) throw new Error("invalid 'collateralInputs' field");

        this.collateralInputs = collateralInputs?.map( collateral =>
            collateral instanceof BabbageUTxO ? collateral :
            new BabbageUTxO( collateral )
        );
        // -------------------------------------- requiredSigners -------------------------------------- //
        if(!(
            requiredSigners === undefined ||
            (
                Array.isArray( requiredSigners ) &&
                requiredSigners.every( canBeHash28 )
            )
        )) throw new Error("invalid 'requiredSigners' field");

        this.requiredSigners = requiredSigners?.map( signer =>
            signer instanceof PubKeyHash ? signer :
            new PubKeyHash( signer )
        );

        // -------------------------------------- network -------------------------------------- //
        
        if(!(
            network === undefined ||
            network === "mainnet" ||
            network === "testnet"
        )) throw new Error("invalid 'network' field");

        this.network = network;

        // -------------------------------------- collateralReturn -------------------------------------- //
        
        if(!(
            collateralReturn === undefined ||
            collateralReturn instanceof BabbageTxOut ||
            isIBabbageTxOut( collateralReturn )
        )) throw new Error("invalid 'collateralReturn' field");

        this.collateralReturn = (
            collateralReturn === undefined ? undefined :
            collateralReturn instanceof BabbageTxOut ? collateralReturn :
            new BabbageTxOut( collateralReturn )
        )
        // -------------------------------------- totCollateral -------------------------------------- //

        if(!(
            totCollateral === undefined ||
            canBeUInteger( totCollateral )
        ))

        this.totCollateral = maybeBigUint( totCollateral );

        // -------------------------------------- reference inputs -------------------------------------- //  

        if(!(
            refInputs === undefined ||
            (
                Array.isArray( refInputs ) &&
                refInputs.every( isIBabbageUTxO )
            )
        )) throw new Error("invalid 'refInputs' field");

        this.refInputs = refInputs?.map( refIn =>
            refIn instanceof BabbageUTxO ? refIn :
            new BabbageUTxO( refIn )
        );

        this.cborRef = cborRef ?? subCborRefOrUndef( body );
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

        return new CborMap(([
            {
                k: new CborUInt( 0 ),
                v: new CborArray( this.inputs.map( input => input.utxoRef.toCborObj() ) )
            },
            {
                k: new CborUInt( 1 ),
                v: new CborArray( this.outputs.map( out => out.toCborObj() ) )
            },
            {
                k: new CborUInt( 2 ),
                v: new CborUInt( this.fee )
            },
            this.ttl === undefined ? undefined :
            {
                k: new CborUInt( 3 ),
                v: new CborUInt( this.ttl )
            },
            this.certs === undefined || this.certs.length === 0 ? undefined :
            {
                k: new CborUInt( 4 ),
                v: new CborArray( this.certs.map( cert => cert.toCborObj() ) )
            },
            this.withdrawals === undefined ? undefined :
            {
                k: new CborUInt( 5 ),
                v: this.withdrawals.toCborObj()
            },
            this.protocolUpdate === undefined ? undefined :
            {
                k: new CborUInt( 6 ),
                v: LegacyPPUpdateProposalToCborObj( 
                    this.protocolUpdate,
                    () => partialBabbageProtocolParametersToCborObj(defaultBabbageProtocolParameters as Partial<BabbageProtocolParameters> )
                )
            },
            this.auxDataHash === undefined ? undefined :
            {
                k: new CborUInt( 7 ),
                v: this.auxDataHash.toCborObj()
            },
            this.validityIntervalStart === undefined ? undefined :
            {
                k: new CborUInt( 8 ),
                v: new CborUInt( this.validityIntervalStart )
            },
            this.mint === undefined ? undefined :
            {
                k: new CborUInt( 9 ),
                v: this.mint.toCborObj()
            },
            this.scriptDataHash === undefined ? undefined :
            {
                k: new CborUInt( 11 ),
                v: this.scriptDataHash.toCborObj()
            },
            this.collateralInputs === undefined || this.collateralInputs.length === 0 ? undefined :
            {
                k: new CborUInt( 13 ),
                v: new CborArray( this.collateralInputs.map( collateral => collateral.utxoRef.toCborObj() ) )
            },
            this.requiredSigners === undefined || this.requiredSigners.length === 0 ? undefined :
            {
                k: new CborUInt( 14 ),
                v: new CborArray( this.requiredSigners.map( signer => signer.toCborObj() ) )
            },
            this.network === undefined ? undefined :
            {
                k: new CborUInt( 15 ),
                v: new CborUInt(this.network === "testnet" ? 0 : 1)
            },
            this.collateralReturn === undefined ? undefined :
            {
                k: new CborUInt( 16 ),
                v: this.collateralReturn.toCborObj()
            },
            this.totCollateral === undefined ? undefined :
            {
                k: new CborUInt( 17 ),
                v: new CborUInt( this.totCollateral )
            },
            this.refInputs === undefined || this.refInputs.length === 0 ? undefined :
            {
                k: new CborUInt( 18 ),
                v: new CborArray( this.refInputs.map( refIn => refIn.utxoRef.toCborObj() ) )
            }
        ].filter( entry => entry !== undefined ) as CborMapEntry[]))
    }

    static fromCbor( cStr: CanBeCborString ): BabbageTxBody
    {
        return BabbageTxBody.fromCborObj( Cbor.parse( forceCborString( cStr ), { keepRef: true } ) );
    }
    static fromCborObj( cObj: CborObj ): BabbageTxBody
    {
        if(!(
            cObj instanceof CborMap
            // && cObj.map.length >= 19
        )) throw new InvalidCborFormatError("BabbageTxBody")

        let fields: (CborObj | undefined)[] = new Array( 19 ).fill( undefined );

        for( let i = 0; i < 19; i++)
        {
            const { v } = cObj.map.find(
                ({ k }) => k instanceof CborUInt && Number( k.num ) === i
            ) ?? { v: undefined };

            if( v === undefined ) continue;

            fields[i] = v;
        }

        const [
            _ins_,                  // 0 // set
            _outs,                  // 1
            _fee,                   // 2
            _ttl,                   // 3
            _certs_,                // 4
            _withdrawals,           // 5
            _pUp,                   // 6
            _auxDataHash,           // 7
            _validityStart,         // 8
            _mint,                  // 9
            _10,                    // 10
            _scriptDataHash,        // 11
            _12,                    // 12
            _collIns,               // 13 // set
            _reqSigs,               // 14 // set
            _net,                   // 15
            _collRet,               // 16
            _totColl,               // 17
            _refIns,                // 18
        ] = fields;

        if( _ins_ === undefined || _outs === undefined || _fee === undefined )
        throw new InvalidCborFormatError("BabbageTxBody");

        if(!(
            // _ins  instanceof CborArray &&
            _outs instanceof CborArray &&
            _fee  instanceof CborUInt
        ))
        throw new InvalidCborFormatError("BabbageTxBody");

        let ttl: bigint | undefined = undefined;
        if( _ttl !== undefined )
        {
            if(!( _ttl instanceof CborUInt ))
            throw new InvalidCborFormatError("BabbageTxBody");

            ttl = _ttl.num;
        }
        
        return new BabbageTxBody({
            inputs: getCborSet( _ins_ ).map( txOutRefAsUTxOFromCborObj ) as [BabbageUTxO, ...BabbageUTxO[]],
            outputs: _outs.array.map( BabbageTxOut.fromCborObj ),
            fee: _fee.num,
            ttl,
            certs:                      _certs_ !== undefined ? getCborSet( _certs_ ).map( certificateFromCborObj ) : undefined,
            withdrawals:                _withdrawals === undefined ? undefined : TxWithdrawals.fromCborObj( _withdrawals ),
            protocolUpdate:             _pUp === undefined ? undefined : LegacyPPUpdateProposalFromCborObj( _pUp, (cObj) => LegacyPPUpdateMapFromCborObj( cObj, partialBabbageProtocolParametersFromCborObj as any ) ),
            auxDataHash:                _auxDataHash === undefined ? undefined : AuxiliaryDataHash.fromCborObj( _auxDataHash ),
            validityIntervalStart:      _validityStart instanceof CborUInt ? _validityStart.num : undefined,
            mint:                       _mint === undefined ? undefined : Value.fromCborObj( _mint ),
            scriptDataHash:             _scriptDataHash === undefined ? undefined : ScriptDataHash.fromCborObj( _scriptDataHash ),
            collateralInputs:           _collIns !== undefined ? getCborSet( _collIns ).map( txOutRefAsUTxOFromCborObj ) : undefined ,
            requiredSigners:            _reqSigs !== undefined  ? getCborSet( _reqSigs ).map( PubKeyHash.fromCborObj ) : undefined,
            network:                    _net instanceof CborUInt ? (Number( _net.num ) === 0 ? "testnet": "mainnet") : undefined,
            collateralReturn:           _collRet === undefined ? undefined : BabbageTxOut.fromCborObj( _collRet ),
            totCollateral:              _totColl instanceof CborUInt ? _totColl.num : undefined,
            refInputs:                  _refIns !== undefined ? getCborSet( _refIns ).map( txOutRefAsUTxOFromCborObj ) : undefined
        }, getSubCborRef( cObj ));
    }

    toJSON() { return this.toJson(); }
    
    toJson()
    {
        return {
            inputs: this.inputs.map( i => i.toJson() ),
            outputs: this.outputs.map( o => o.toJson() ),
            fee: this.fee.toString(),
            ttl: this.ttl?.toString(),
            certs: this.certs?.map( c => c.toJson() ),
            withdrawals: this.withdrawals?.toJson() ,
            protocolUpdate: this.protocolUpdate === undefined ? undefined : protocolUpdateToJson( this.protocolUpdate, partialBabbageProtocolParamsToJson ),
            auxDataHash: this.auxDataHash?.toString() , // hash 32
            validityIntervalStart: this.validityIntervalStart?.toString(),
            mint: this.mint?.toJson(),
            scriptDataHash: this.scriptDataHash?.toString(), // hash 32
            collateralInputs: this.collateralInputs?.map( i => i.toJson() ), 
            requiredSigners: this.requiredSigners?.map( sig => sig.toString() ),
            network: this.network,
            collateralReturn: this.collateralReturn?.toJson(),
            totCollateral: this.totCollateral?.toString(),
            refInputs: this.refInputs?.map( i => i.toJson() )
        }
    }

    /**
     * tests that
     * inputs + withdrawals + refund + mints === outputs + burns + deposit + fee
     * 
     * @todo add mints and burns
     * @deprecated until mints and burns are added
     */
    static isValueConserved( tx: BabbageTxBody ): boolean
    {
        const {
            inputs,
            withdrawals,
            outputs,
            certs,
            fee
        } = tx;

        // withdrawals
        let tot = withdrawals === undefined ? Value.zero : withdrawals.toTotalWitdrawn();

        // + inputs
        tot = inputs.reduce( (a,b) => Value.add( a, b.resolved.value ) , tot );
        
        // - (outputs + fee)
        // - outputs - fee
        tot = Value.sub(
            tot,
            outputs.reduce( (a,b) => Value.add( a, b.value ), Value.lovelaces( fee ) )
        );

        return Value.isZero(
            certs === undefined ?
            tot :
            Value.add(
                tot,
                Value.lovelaces( certificatesToDepositLovelaces( certs ) )
            )
        );
    }

};


function txOutRefAsUTxOFromCborObj( cObj: CborObj ): BabbageUTxO
{
    return new BabbageUTxO({
        utxoRef: TxOutRef.fromCborObj( cObj ),
        resolved: BabbageTxOut.fake
    });
}