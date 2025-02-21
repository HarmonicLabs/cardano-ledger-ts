import { ToCbor, CborString, Cbor, CborObj, CborMap, CborUInt, CborArray, CborMapEntry, CanBeCborString, forceCborString, isCborObj, SubCborRef } from "@harmoniclabs/cbor";
import { blake2b_256 } from "@harmoniclabs/crypto";
import { isObject, hasOwn, defineReadOnlyProperty, definePropertyIfNotPresent } from "@harmoniclabs/obj-utils";
import { PubKeyHash } from "../../credentials";
import { AuxiliaryDataHash, ScriptDataHash, Hash32 } from "../../hashes";
import { Coin, TxWithdrawals, ITxWithdrawals, LegacyPPUpdateProposal, Value, NetworkT, Certificate, canBeTxWithdrawals, isLegacyPPUpdateProposal, forceTxWithdrawals, LegacyPPUpdateProposalToCborObj, LegacyPPUpdateProposalFromCborObj, protocolUpdateToJson, isCertificate, certificateFromCborObj, certificatesToDepositLovelaces } from "../../ledger";
import { InvalidCborFormatError } from "../../utils/InvalidCborFormatError";
import { ToJson } from "../../utils/ToJson";
import { CanBeUInteger, canBeUInteger, forceBigUInt } from "../../utils/ints";
import { UTxO, TxOut, isIUTxO, isITxOut, TxOutRef } from "./output";
import { assert } from "../../utils/assert";
import { IVotingProcedures, VotingProcedures, isIVotingProceduresEntry } from "../../governance/VotingProcedures";
import { IProposalProcedure, ProposalProcedure, isIProposalProcedure } from "../../governance/ProposalProcedure";
import { getCborSet } from "../../utils/getCborSet";
import { getSubCborRef } from "../../utils/getSubCborRef";

export interface ITxBody {
    inputs: [ UTxO, ...UTxO[] ],
    outputs: TxOut[],
    fee: Coin,
    ttl?: CanBeUInteger,
    certs?: Certificate[],
    withdrawals?: TxWithdrawals | ITxWithdrawals,
    protocolUpdate?: LegacyPPUpdateProposal,
    auxDataHash?: AuxiliaryDataHash, // hash 32
    validityIntervalStart?: CanBeUInteger,
    mint?: Value,
    scriptDataHash?: ScriptDataHash, // hash 32
    collateralInputs?: UTxO[], 
    requiredSigners?: PubKeyHash[],
    network?: NetworkT,
    collateralReturn?: TxOut,
    totCollateral?: Coin,
    refInputs?: UTxO[]
    // conway
    votingProcedures?: IVotingProcedures | VotingProcedures;
    proposalProcedures?: (ProposalProcedure | IProposalProcedure)[];
    currentTreasuryValue?: CanBeUInteger; // Coin
    donation?: CanBeUInteger; // Coin (positive)
}

export function isITxBody( body: Readonly<object> ): body is ITxBody
{
    if( !isObject( body ) ) return false;

    const fields = Object.keys( body );
    const b = body as ITxBody;

    return (
        fields.length >= 3 &&
        
        hasOwn( b, "inputs" ) &&
        Array.isArray( b.inputs ) && b.inputs.length > 0 &&
        b.inputs.every( _in => _in instanceof UTxO || isIUTxO( _in ) ) &&
        
        hasOwn( b, "outputs" ) &&
        Array.isArray( b.outputs ) && b.outputs.length > 0 &&
        b.outputs.every( out => out instanceof TxOut || isITxOut( out ) ) &&

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
        ( b.collateralReturn === undefined || b.collateralReturn instanceof TxOut || isITxOut( b.collateralReturn ) ) &&
        ( b.totCollateral === undefined || canBeUInteger( b.totCollateral ) ) &&
        ( b.collateralInputs === undefined || (
            Array.isArray( b.collateralInputs ) && 
            b.collateralInputs.every( collateral => collateral instanceof UTxO )
        )) &&
        ( b.requiredSigners === undefined || (
            Array.isArray( b.requiredSigners ) &&
            b.requiredSigners.every( sig => sig instanceof PubKeyHash )
        )) &&
        ( b.refInputs === undefined || (
            Array.isArray( b.refInputs ) &&
            b.refInputs.every( ref => ref instanceof UTxO || isIUTxO( ref ) )
        )) &&
        (b.votingProcedures === undefined || (
            b.votingProcedures instanceof VotingProcedures ||
            (
                Array.isArray( b.votingProcedures ) &&
                b.votingProcedures.length > 0 &&
                b.votingProcedures.every( isIVotingProceduresEntry )
            )
        )) && (
            b.proposalProcedures === undefined ||
            (
                Array.isArray( b.proposalProcedures ) &&
                b.proposalProcedures.every( elem =>
                    elem instanceof ProposalProcedure ||
                    isIProposalProcedure( elem )
                )
            )
        ) &&
        ( b.currentTreasuryValue === undefined || canBeUInteger( b.currentTreasuryValue ) ) &&
        ( b.donation === undefined || canBeUInteger( b.donation ) )
    )
}

export class TxBody
    implements ITxBody, ToCbor, ToJson
{
    readonly inputs!: [ UTxO, ...UTxO[] ];
    readonly outputs!: TxOut[];
    readonly fee!: bigint;
    readonly ttl?: bigint;
    readonly certs?: Certificate[];
    readonly withdrawals?: TxWithdrawals;
    readonly protocolUpdate?: LegacyPPUpdateProposal; // babbage only; removed in conway
    readonly auxDataHash?: AuxiliaryDataHash; // hash 32
    readonly validityIntervalStart?: bigint;
    readonly mint?: Value;
    readonly scriptDataHash?: ScriptDataHash; // hash 32
    readonly collateralInputs?: UTxO[];
    readonly requiredSigners?: PubKeyHash[];
    readonly network?: NetworkT;
    readonly collateralReturn?: TxOut;
    readonly totCollateral?: bigint; // Coin
    readonly refInputs?: UTxO[];
    // conway
    readonly votingProcedures?: VotingProcedures;
    readonly proposalProcedures?: ProposalProcedure[];
    readonly currentTreasuryValue?: bigint; // Coin
    readonly donation?: bigint; // Coin (positive)

    /**
     * getter
     */
    readonly hash!: Hash32;

    /**
     * 
     * @param body object describing the transaction
     * @throws only if the the `body` parameter does not respect the `ITxBody` interface
     *      **DOES NOT THROW** if the transaction is unbalanced; that needs to be checked using `TxBody.isValueConserved` static method
     */
    constructor(
        body: ITxBody,
        readonly cborRef: SubCborRef | undefined = undefined
    )
    {
        assert(
            (hasOwn( body, "inputs" ) as any) &&
            hasOwn( body, "outputs" ) &&
            hasOwn( body, "fee" ),
            "can't construct a 'TxBody' if 'inputs', 'outputs' and 'fee' fields aren't present"
        );
        
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
            votingProcedures,
            proposalProcedures,
            currentTreasuryValue,
            donation
        } = body;

        let _isHashValid: boolean = false;
        let _hash: Hash32;

        // -------------------------------------- inputs -------------------------------------- //
        assert(
            Array.isArray( inputs )  &&
            inputs.length > 0 &&
            inputs.every( input => input instanceof UTxO ),
            "invald 'inputs' field"
        );
        defineReadOnlyProperty(
            this,
            "inputs",
            Object.freeze(
                inputs.map( i => i instanceof UTxO ? i : new UTxO( i ) )
            )
        );

        // -------------------------------------- outputs -------------------------------------- //
        assert(
            Array.isArray( outputs )  &&
            outputs.length > 0 &&
            outputs.every( out => out instanceof TxOut ),
            "invald 'outputs' field"
        );
        defineReadOnlyProperty(
            this,
            "outputs",
            Object.freeze( outputs )
        );

        // -------------------------------------- fee -------------------------------------- //
        assert(
            (typeof fee === "number" && fee === Math.round( Math.abs( fee ) ) ) ||
            (typeof fee === "bigint" && fee >= BigInt( 0 ) ),
            "invald 'fee' field"
        );
        let _fee = forceBigUInt( fee );
        definePropertyIfNotPresent(
            this,
            "fee",
            {
                get: () => _fee,
                set: ( ...whatever: any[] ) => {},
                enumerable: true,
                configurable: false
            }
        );

        defineReadOnlyProperty(
            this,
            "ttl",
            ttl === undefined ? undefined : forceBigUInt( ttl )
        );

        // -------------------------------------- certs -------------------------------------- //
        if( certs !== undefined )
        {
            assert(
                Array.isArray( certs )  &&
                certs.every( isCertificate ),
                "invalid 'certs' field"
            );

            if( certs.length <= 0 )
            {
                defineReadOnlyProperty(
                    this,
                    "certs",
                    undefined
                );
            }

            defineReadOnlyProperty(
                this,
                "certs",
                Object.freeze( certs )
            );
        }
        else defineReadOnlyProperty(
            this,
            "certs",
            undefined
        );

        // -------------------------------------- withdrawals -------------------------------------- //
        
        if( withdrawals !== undefined )
        assert(
            canBeTxWithdrawals( withdrawals ),
            "withdrawals was not undefined nor an instance of 'TxWithdrawals'"
        )

        defineReadOnlyProperty(
            this,
            "withdrawals",
            withdrawals === undefined ? undefined : forceTxWithdrawals( withdrawals )
        );
        
        // -------------------------------------- protocolUpdate -------------------------------------- //
        
        if( protocolUpdate !== undefined )
        {
            assert(
                isLegacyPPUpdateProposal( protocolUpdate ),
                "invalid 'protocolUpdate' while constructing a 'Tx'"
            )
        }

        defineReadOnlyProperty(
            this,
            "protocolUpdate",
            protocolUpdate
        );
        
        // -------------------------------------- auxDataHash -------------------------------------- //
        
        if( auxDataHash !== undefined )
        {
            assert(
                auxDataHash instanceof Hash32,
                "invalid 'auxDataHash' while constructing a 'Tx'"
            )
        }

        defineReadOnlyProperty(
            this,
            "auxDataHash",
            auxDataHash === undefined ? undefined : new AuxiliaryDataHash( auxDataHash )
        );
        
        // -------------------------------------- validityIntervalStart -------------------------------------- //
                
        if( validityIntervalStart !== undefined )
        {
            assert(
                canBeUInteger( validityIntervalStart ),
                "invalid 'validityIntervalStart' while constructing a 'Tx'"
            )
        }

        defineReadOnlyProperty(
            this,
            "validityIntervalStart",
            validityIntervalStart === undefined ? undefined : forceBigUInt( validityIntervalStart )
        );
        
        // -------------------------------------- mint -------------------------------------- //
        
        if( mint !== undefined )
        {
            assert(
                mint instanceof Value,
                "invalid 'mint' while constructing a 'Tx'"
            )
        }

        defineReadOnlyProperty(
            this,
            "mint",
            mint
        );
        
        // -------------------------------------- scriptDataHash -------------------------------------- //
        
        if( scriptDataHash !== undefined )
        {
            assert(
                scriptDataHash instanceof Hash32,
                "invalid 'scriptDataHash' while constructing a 'Tx'"
            )
        }

        defineReadOnlyProperty(
            this,
            "scriptDataHash",
            scriptDataHash === undefined ? undefined : new ScriptDataHash( scriptDataHash )
        );

        // -------------------------------------- collateral inputs -------------------------------------- //

        if( collateralInputs !== undefined )
        {
            assert(
                Array.isArray( collateralInputs ) &&
                collateralInputs.every( input => input instanceof UTxO ),
                "invalid 'collateralInputs' while constructing a 'Tx'"
            );
        }

        defineReadOnlyProperty(
            this,
            "collateralInputs",
            collateralInputs?.length === 0 ? undefined : Object.freeze( collateralInputs )
        );
        
        // -------------------------------------- requiredSigners -------------------------------------- //
        if( requiredSigners !== undefined )
        {
            assert(
                Array.isArray( requiredSigners ) &&
                requiredSigners.every( sig => sig instanceof PubKeyHash ),
                "invalid 'requiredSigners' while constructing a 'Tx'"
            );
        }

        defineReadOnlyProperty(
            this,
            "requiredSigners",
            requiredSigners?.length === 0 ? undefined : Object.freeze( requiredSigners )
        );

        // -------------------------------------- network -------------------------------------- //
        
        if( network !== undefined )
        assert(
            network === "mainnet" ||
            network === "testnet",
            "invalid 'network' while constructing 'Tx'"
        )
        
        defineReadOnlyProperty(
            this,
            "network",
            network
        );

        // -------------------------------------- collateralReturn -------------------------------------- //
        
        if( collateralReturn !== undefined )
        assert(
            collateralReturn instanceof TxOut,
            "invalid 'collateralReturn' while constructing 'Tx'"
        )
        
        defineReadOnlyProperty(
            this,
            "collateralReturn",
            collateralReturn
        );
        // -------------------------------------- totCollateral -------------------------------------- //

        if( totCollateral !== undefined )
        assert(
            canBeUInteger( totCollateral ),
            "invalid 'collateralReturn' while constructing 'Tx'"
        )
        
        defineReadOnlyProperty(
            this,
            "collateralReturn",
            totCollateral === undefined ? undefined : forceBigUInt( totCollateral )
        );

        // -------------------------------------- reference inputs -------------------------------------- //  

        if( refInputs !== undefined )
        assert(
            Array.isArray( refInputs ) &&
            refInputs.every( input => input instanceof UTxO ),
            "invalid 'refInputs' while constructing a 'Tx'"
        );

        defineReadOnlyProperty(
            this,
            "refInputs",
            refInputs?.length === 0 ? undefined : Object.freeze( refInputs )
        );

        // -------------------------------------- votingProcedures -------------------------------------- //

        if( votingProcedures !== undefined )
        {
            if( votingProcedures instanceof VotingProcedures )
            {
                defineReadOnlyProperty(
                    this,
                    "votingProcedures",
                    votingProcedures
                );
            }
            else
            {
                assert(
                    Array.isArray( votingProcedures ) &&
                    votingProcedures.length > 0 &&
                    votingProcedures.every( isIVotingProceduresEntry ),
                    "invalid 'votingProcedures' while constructing a 'Tx'"
                );

                defineReadOnlyProperty(
                    this,
                    "votingProcedures",
                    new VotingProcedures( votingProcedures )
                );
            }
        }
        else defineReadOnlyProperty(
            this,
            "votingProcedures",
            undefined
        );

        // -------------------------------------- proposalProcedures -------------------------------------- //

        if( proposalProcedures !== undefined )
        {
            assert(
                Array.isArray( proposalProcedures ) &&
                proposalProcedures.every( elem =>
                    elem instanceof ProposalProcedure ||
                    isIProposalProcedure( elem )
                ),
                "invalid 'proposalProcedures' while constructing a 'Tx'"
            )

            defineReadOnlyProperty(
                this,
                "proposalProcedures",
                proposalProcedures.map( elem =>
                    elem instanceof ProposalProcedure ? elem : new ProposalProcedure( elem )
                )
            );
        }
        else defineReadOnlyProperty(
            this,
            "proposalProcedures",
            undefined
        );

        // -------------------------------------- currentTreasuryValue -------------------------------------- //

        if( currentTreasuryValue !== undefined )
        {
            assert(
                canBeUInteger( currentTreasuryValue ),
                "invalid 'currentTreasuryValue' while constructing a 'Tx'"
            );

            defineReadOnlyProperty(
                this,
                "currentTreasuryValue",
                forceBigUInt( currentTreasuryValue )
            );
        }
        else defineReadOnlyProperty(
            this,
            "currentTreasuryValue",
            undefined
        );

        // -------------------------------------- donation -------------------------------------- //

        if( donation !== undefined )
        {
            assert(
                canBeUInteger( donation ),
                "invalid 'donation' while constructing a 'Tx'"
            );

            defineReadOnlyProperty(
                this,
                "donation",
                forceBigUInt( donation )
            );
        }
        else defineReadOnlyProperty(
            this,
            "donation",
            undefined
        );


        // -------------------------------------- hash -------------------------------------- //  

        definePropertyIfNotPresent(
            this, "hash",
            {
                get: (): Hash32 => {
                    if( _isHashValid === true && _hash !== undefined && _hash instanceof Hash32 ) return _hash.clone();

                    _hash = new Hash32(
                        new Uint8Array(
                            blake2b_256( this.toCbor().toBuffer() )
                        )
                    );
                    _isHashValid = true;

                    return _hash.clone()
                },
                set: () => {},
                enumerable: true,
                configurable: false
            }
        );
        
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
                v: LegacyPPUpdateProposalToCborObj( this.protocolUpdate )
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
            },
            this.votingProcedures === undefined ? undefined :
            {
                k: new CborUInt( 19 ),
                v: this.votingProcedures.toCborObj()
            },
            this.proposalProcedures === undefined || this.proposalProcedures.length === 0 ? undefined :
            {
                k: new CborUInt( 20 ),
                v: new CborArray( this.proposalProcedures.map( prop => prop.toCborObj() ) )
            },
            this.currentTreasuryValue === undefined ? undefined :
            {
                k: new CborUInt( 21 ),
                v: new CborUInt( this.currentTreasuryValue )
            },
            this.donation === undefined ? undefined :
            {
                k: new CborUInt( 22 ),
                v: new CborUInt( this.donation )
            }
        ].filter( entry => entry !== undefined ) as CborMapEntry[]))
    }

    static fromCbor( cStr: CanBeCborString ): TxBody
    {
        return TxBody.fromCborObj( Cbor.parse( forceCborString( cStr ), { keepRef: true } ) );
    }
    static fromCborObj( cObj: CborObj ): TxBody
    {
        if(!(cObj instanceof CborMap))
        throw new InvalidCborFormatError("TxBody")

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
            _voting_procedures,     // 19
            _proposal_procedures,   // 20 // set
            _current_treasury,      // 21
            _donation               // 22
        ] = fields;

        if( _ins_ === undefined || _outs === undefined || _fee === undefined )
        throw new InvalidCborFormatError("TxBody");

        if(!(
            // _ins  instanceof CborArray &&
            _outs instanceof CborArray &&
            _fee  instanceof CborUInt
        ))
        throw new InvalidCborFormatError("TxBody");

        let ttl: bigint | undefined = undefined;
        if( _ttl !== undefined )
        {
            if(!( _ttl instanceof CborUInt ))
            throw new InvalidCborFormatError("TxBody");

            ttl = _ttl.num;
        }

        return new TxBody({
            inputs: getCborSet( _ins_ ).map( txOutRefAsUTxOFromCborObj ) as [UTxO, ...UTxO[]],
            outputs: _outs.array.map( TxOut.fromCborObj ),
            fee: _fee.num,
            ttl,
            certs:                      _certs_ !== undefined ? getCborSet( _certs_ ).map( certificateFromCborObj ) : undefined,
            withdrawals:                _withdrawals === undefined ? undefined : TxWithdrawals.fromCborObj( _withdrawals ),
            protocolUpdate:             _pUp === undefined ? undefined : LegacyPPUpdateProposalFromCborObj( _pUp ),
            auxDataHash:                _auxDataHash === undefined ? undefined : AuxiliaryDataHash.fromCborObj( _auxDataHash ),
            validityIntervalStart:      _validityStart instanceof CborUInt ? _validityStart.num : undefined,
            mint:                       _mint === undefined ? undefined : Value.fromCborObj( _mint ),
            scriptDataHash:             _scriptDataHash === undefined ? undefined : ScriptDataHash.fromCborObj( _scriptDataHash ),
            collateralInputs:           _collIns !== undefined ? getCborSet( _collIns ).map( txOutRefAsUTxOFromCborObj ) : undefined ,
            requiredSigners:            _reqSigs !== undefined  ? getCborSet( _reqSigs ).map( PubKeyHash.fromCborObj ) : undefined,
            network:                    _net instanceof CborUInt ? (Number( _net.num ) === 0 ? "testnet": "mainnet") : undefined,
            collateralReturn:           _collRet === undefined ? undefined : TxOut.fromCborObj( _collRet ),
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
            protocolUpdate: 
                this.protocolUpdate === undefined ? undefined :
                protocolUpdateToJson( this.protocolUpdate ),
            auxDataHash: this.auxDataHash?.asString , // hash 32
            validityIntervalStart: this.validityIntervalStart?.toString(),
            mint: this.mint?.toJson(),
            scriptDataHash: this.scriptDataHash?.asString, // hash 32
            collateralInputs: this.collateralInputs?.map( i => i.toJson() ), 
            requiredSigners: this.requiredSigners?.map( sig => sig.asString ),
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
    static isValueConserved( tx: TxBody ): boolean
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


function txOutRefAsUTxOFromCborObj( cObj: CborObj ): UTxO
{
    return new UTxO({
        utxoRef: TxOutRef.fromCborObj( cObj ),
        resolved: TxOut.fake
    });
}