import { ToCbor, SubCborRef, CborString, Cbor, CborObj, CborMap, CborUInt, CborArray, CborMapEntry, CborSimple, CanBeCborString, forceCborString } from "@harmoniclabs/cbor";
import { CanBeUInteger, canBeUInteger, forceBigUInt } from "@harmoniclabs/cbor/dist/utils/ints";
import { blake2b_256 } from "@harmoniclabs/crypto";
import { hasOwn, isObject } from "@harmoniclabs/obj-utils";
import { PubKeyHash, Credential } from "../../../credentials";
import { IVotingProcedures, VotingProcedures, ProposalProcedure, IProposalProcedure, isIVotingProceduresEntry, isIProposalProcedure } from "../../../governance";
import { AuxiliaryDataHash, ScriptDataHash, CanBeHash28, Hash32, canBeHash28 } from "../../../hashes";
import { Coin, TxWithdrawals, ITxWithdrawals, Value, NetworkT, Certificate, isCertificate, canBeTxWithdrawals, forceTxWithdrawals, isIValue, certificateFromCborObj, certificatesToDepositLovelaces } from "../../common/ledger";
import { DijkstraAccountBalanceInterval, IDijkstraAccountBalanceInterval, DijkstraAccountBalanceIntervalsEntry, IDijkstraAccountBalanceIntervalsEntry } from "./DijkstraAccountBalanceInterval";
import { IDijkstraSubTransaction, DijkstraSubTransaction } from "./DijkstraSubTransaction";
import { TxOutRef } from "../../common/tx/TxOutRef";
import { DijkstraUTxO, isIDijkstraUTxO } from "./DijkstraUTxO";
import { DijkstraTxOut, isIDijkstraTxOut } from "./";
import { getCborSet } from "../../../utils/getCborSet";
import { subCborRefOrUndef, getSubCborRef } from "../../../utils/getSubCborRef";
import { maybeBigUint } from "../../../utils/ints";
import { InvalidCborFormatError } from "../../../utils/InvalidCborFormatError";
import { ToJson } from "../../../utils/ToJson";
/**
 * CDDL (Dijkstra): `guards = nonempty_set<addr_keyhash>/ nonempty_oset<credential>`
 *
 * Replaces Conway's `required_signers` (key 14). Either a set of key hashes
 * (the backwards-compatible form) or an ordered set of credentials — never a mix.
 */
export type IDijkstraGuards = CanBeHash28[] | Credential[];
export type DijkstraGuards = PubKeyHash[] | Credential[];

export interface IDijkstraTxBody {
    inputs: [ DijkstraUTxO, ...DijkstraUTxO[] ],
    outputs: DijkstraTxOut[],
    fee: Coin,
    ttl?: CanBeUInteger,
    certs?: Certificate[],
    withdrawals?: TxWithdrawals | ITxWithdrawals,
    // key 6 (legacy protocol param update) removed in Dijkstra
    auxDataHash?: AuxiliaryDataHash, // hash 32
    validityIntervalStart?: CanBeUInteger,
    mint?: Value,
    scriptDataHash?: ScriptDataHash, // hash 32
    collateralInputs?: DijkstraUTxO[],
    guards?: IDijkstraGuards, // key 14; replaces `required_signers`
    network?: NetworkT,
    collateralReturn?: DijkstraTxOut,
    totCollateral?: Coin,
    refInputs?: DijkstraUTxO[]
    // conway
    votingProcedures?: VotingProcedures | IVotingProcedures;
    proposalProcedures?: (ProposalProcedure | IProposalProcedure)[];
    currentTreasuryValue?: CanBeUInteger; // Coin
    donation?: CanBeUInteger; // Coin (positive)
    // dijkstra
    nastyTransactions?: (IDijkstraSubTransaction | DijkstraSubTransaction)[]; // key 23; CIP-118 "nasty transactions"
    directDeposits?: TxWithdrawals | ITxWithdrawals; // key 25; {+ reward_account => coin}
    accountBalanceIntervals?: IDijkstraAccountBalanceIntervalsEntry[]; // key 26
}

export function isIDijkstraTxBody( body: Readonly<object> ): body is IDijkstraTxBody
{
    if( !isObject( body ) ) return false;

    const fields = Object.keys( body );
    const b = body as IDijkstraTxBody;

    return (
        fields.length >= 3 &&
        
        hasOwn( b, "inputs" ) &&
        Array.isArray( b.inputs ) && b.inputs.length > 0 &&
        b.inputs.every( _in => _in instanceof DijkstraUTxO || isIDijkstraUTxO( _in ) ) &&
        
        hasOwn( b, "outputs" ) &&
        Array.isArray( b.outputs ) && b.outputs.length > 0 &&
        b.outputs.every( out => out instanceof DijkstraTxOut || isIDijkstraTxOut( out ) ) &&

        hasOwn( b, "fee" ) && canBeUInteger( b.fee ) &&

        ( b.ttl === undefined || canBeUInteger( b.ttl ) ) &&
        ( b.certs === undefined || b.certs.every( isCertificate ) ) &&
        ( b.withdrawals === undefined || canBeTxWithdrawals( b.withdrawals ) ) &&
        ( b.auxDataHash === undefined || b.auxDataHash instanceof Hash32 ) &&
        ( b.validityIntervalStart === undefined || canBeUInteger( b.validityIntervalStart ) ) &&
        ( b.mint === undefined || b.mint instanceof Value ) &&
        ( b.scriptDataHash === undefined || b.scriptDataHash instanceof Hash32 ) &&
        ( b.network === undefined || b.network === "mainnet" || b.network === "testnet" ) &&
        ( b.collateralReturn === undefined || b.collateralReturn instanceof DijkstraTxOut || isIDijkstraTxOut( b.collateralReturn ) ) &&
        ( b.totCollateral === undefined || canBeUInteger( b.totCollateral ) ) &&
        ( b.collateralInputs === undefined || (
            Array.isArray( b.collateralInputs ) && 
            b.collateralInputs.every( collateral => collateral instanceof DijkstraUTxO )
        )) &&
        ( b.guards === undefined || (
            Array.isArray( b.guards ) &&
            (
                (b.guards as any[]).every( g => g instanceof Credential ) ||
                (b.guards as any[]).every( g => canBeHash28( g ) )
            )
        )) &&
        ( b.refInputs === undefined || (
            Array.isArray( b.refInputs ) &&
            b.refInputs.every( ref => ref instanceof DijkstraUTxO || isIDijkstraUTxO( ref ) )
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
        ( b.donation === undefined || canBeUInteger( b.donation ) ) &&
        ( b.directDeposits === undefined || canBeTxWithdrawals( b.directDeposits ) ) &&
        ( b.accountBalanceIntervals === undefined || (
            Array.isArray( b.accountBalanceIntervals ) &&
            b.accountBalanceIntervals.every( e =>
                isObject( e ) && (e as any).credential instanceof Credential
            )
        ))
    )
}

export class DijkstraTxBody
    implements IDijkstraTxBody, ToCbor, ToJson
{
    readonly inputs!: [ DijkstraUTxO, ...DijkstraUTxO[] ];
    readonly outputs!: DijkstraTxOut[];
    readonly fee!: bigint;
    readonly ttl?: bigint;
    readonly certs?: Certificate[];
    readonly withdrawals?: TxWithdrawals;
    // key 6 (legacy protocol param update) removed in Dijkstra
    readonly auxDataHash?: AuxiliaryDataHash; // hash 32
    readonly validityIntervalStart?: bigint;
    readonly mint?: Value;
    readonly scriptDataHash?: ScriptDataHash; // hash 32
    readonly collateralInputs?: DijkstraUTxO[];
    readonly guards?: DijkstraGuards; // key 14; replaces `required_signers`
    readonly network?: NetworkT;
    readonly collateralReturn?: DijkstraTxOut;
    readonly totCollateral?: bigint; // Coin
    readonly refInputs?: DijkstraUTxO[];
    // conway
    readonly votingProcedures?: VotingProcedures;
    readonly proposalProcedures?: ProposalProcedure[];
    readonly currentTreasuryValue?: bigint; // Coin
    readonly donation?: bigint; // Coin (positive)
    // dijkstra
    readonly nastyTransactions?: DijkstraSubTransaction[]; // key 23; CIP-118 "nasty transactions"
    readonly directDeposits?: TxWithdrawals; // key 25
    readonly accountBalanceIntervals?: DijkstraAccountBalanceIntervalsEntry[]; // key 26

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
                blake2b_256( this.toCbor() )
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
     * @throws only if the the `body` parameter does not respect the `IDijkstraDijkstraTxBody` interface
     *      **DOES NOT THROW** if the transaction is unbalanced; that needs to be checked using `DijkstraDijkstraTxBody.isValueConserved` static method
     */
    constructor(
        body: IDijkstraTxBody,
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
            auxDataHash,
            validityIntervalStart,
            mint,
            scriptDataHash,
            collateralInputs,
            guards,
            network,
            collateralReturn,
            totCollateral,
            refInputs,
            votingProcedures,
            proposalProcedures,
            currentTreasuryValue,
            donation,
            nastyTransactions,
            directDeposits,
            accountBalanceIntervals
        } = body;

        // -------------------------------------- inputs -------------------------------------- //
        if(!(
            Array.isArray( inputs )  &&
            inputs.length > 0 &&
            inputs.every( isIDijkstraUTxO )
        )) throw new Error("invalid 'inputs' field");

        this.inputs = inputs.map( i => i instanceof DijkstraUTxO ? i : new DijkstraUTxO( i ) ) as [ DijkstraUTxO, ...DijkstraUTxO[] ];

        // -------------------------------------- outputs -------------------------------------- //

        if(!(
            Array.isArray( outputs )  &&
            outputs.length > 0 &&
            outputs.every( isIDijkstraTxOut )
        )) throw new Error("invald 'outputs' field");

        this.outputs = outputs.map( out => out instanceof DijkstraTxOut ? out : new DijkstraTxOut( out ) );

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
                collateralInputs.every( isIDijkstraUTxO )
            )
        )) throw new Error("invalid 'collateralInputs' field");

        this.collateralInputs = collateralInputs?.map( collateral =>
            collateral instanceof DijkstraUTxO ? collateral :
            new DijkstraUTxO( collateral )
        );
        // -------------------------------------- guards (replaces required_signers) -------------------------------------- //
        this.guards = guards === undefined ? undefined : normalizeGuards( guards );

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
            collateralReturn instanceof DijkstraTxOut ||
            isIDijkstraTxOut( collateralReturn )
        )) throw new Error("invalid 'collateralReturn' field");

        this.collateralReturn = (
            collateralReturn === undefined ? undefined :
            collateralReturn instanceof DijkstraTxOut ? collateralReturn :
            new DijkstraTxOut( collateralReturn )
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
                refInputs.every( isIDijkstraUTxO )
            )
        )) throw new Error("invalid 'refInputs' field");

        this.refInputs = refInputs?.map( refIn =>
            refIn instanceof DijkstraUTxO ? refIn :
            new DijkstraUTxO( refIn )
        );

        // -------------------------------------- votingProcedures -------------------------------------- //

        if( votingProcedures !== undefined )
        {
            if( votingProcedures instanceof VotingProcedures )
            {
                this.votingProcedures = votingProcedures;
            }
            else
            {
                if(!(
                    Array.isArray( votingProcedures ) &&
                    votingProcedures.length > 0 &&
                    votingProcedures.every( isIVotingProceduresEntry )
                )) throw new Error("invalid 'votingProcedures' while constructing a 'Tx'")

                this.votingProcedures = new VotingProcedures( votingProcedures )

            }
        }
        else this.votingProcedures = undefined

        // -------------------------------------- proposalProcedures -------------------------------------- //

        if( proposalProcedures !== undefined )
        {
            if(!(
                Array.isArray( proposalProcedures ) &&
                proposalProcedures.every( elem =>
                    elem instanceof ProposalProcedure ||
                    isIProposalProcedure( elem )
                )
            )) throw new Error("invalid 'proposalProcedures' while constructing a 'Tx'")

            this.proposalProcedures = proposalProcedures.map( elem =>
                elem instanceof ProposalProcedure ? elem : new ProposalProcedure( elem )
            )
        }
        else this.proposalProcedures = undefined


        // -------------------------------------- currentTreasuryValue -------------------------------------- //

        if( currentTreasuryValue !== undefined )
        {
            if(!(
                canBeUInteger( currentTreasuryValue )
            
            )) throw new Error("invalid 'currentTreasuryValue' field");

            this.currentTreasuryValue = forceBigUInt( currentTreasuryValue );

        }
        else this.currentTreasuryValue = undefined;
    

        // -------------------------------------- donation -------------------------------------- //

        if( donation !== undefined )
        {
            if(!(
                canBeUInteger( donation )
            ))throw new Error("invalid 'donation' while constructing a 'Tx'")

            this.donation = forceBigUInt( donation )
        }
        else this.donation = undefined

        // -------------------------------------- nastyTransactions (dijkstra; CIP-118 "nasty transactions") -------------------------------------- //

        if( nastyTransactions === undefined ) this.nastyTransactions = undefined;
        else
        {
            if(!( Array.isArray( nastyTransactions ) ))
            throw new Error("invalid 'nastyTransactions' field");
            this.nastyTransactions = nastyTransactions.length === 0 ? undefined :
                nastyTransactions.map( st => st instanceof DijkstraSubTransaction ? st : new DijkstraSubTransaction( st ) );
        }

        // -------------------------------------- directDeposits (dijkstra) -------------------------------------- //

        if(!(
            directDeposits === undefined ||
            canBeTxWithdrawals( directDeposits )
        )) throw new Error("invalid 'directDeposits' field");

        this.directDeposits = (
            directDeposits === undefined ? undefined :
            forceTxWithdrawals( directDeposits )
        );

        // -------------------------------------- accountBalanceIntervals (dijkstra) -------------------------------------- //

        if( accountBalanceIntervals === undefined ) this.accountBalanceIntervals = undefined;
        else
        {
            if(!(
                Array.isArray( accountBalanceIntervals ) &&
                accountBalanceIntervals.every( e => isObject( e ) && (e as any).credential instanceof Credential )
            )) throw new Error("invalid 'accountBalanceIntervals' field");

            this.accountBalanceIntervals = accountBalanceIntervals.map( e => ({
                credential: e.credential,
                interval: e.interval instanceof DijkstraAccountBalanceInterval ? e.interval : new DijkstraAccountBalanceInterval( e.interval )
            }) );
        }

        this.cborRef = cborRef ?? subCborRefOrUndef( body );
    }

    toCborBytes(): Uint8Array
    {
        if( this.cborRef instanceof SubCborRef ) return this.cborRef.toBuffer();
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
            this.guards === undefined || this.guards.length === 0 ? undefined :
            {
                k: new CborUInt( 14 ),
                v: guardsToCborObj( this.guards )
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
            },
            this.nastyTransactions === undefined || this.nastyTransactions.length === 0 ? undefined :
            {
                k: new CborUInt( 23 ),
                // nonempty_oset<sub_transaction>
                v: new CborArray( this.nastyTransactions.map( st => st.toCborObj() ) )
            },
            this.directDeposits === undefined ? undefined :
            {
                k: new CborUInt( 25 ),
                v: this.directDeposits.toCborObj()
            },
            this.accountBalanceIntervals === undefined || this.accountBalanceIntervals.length === 0 ? undefined :
            {
                k: new CborUInt( 26 ),
                v: accountBalanceIntervalsToCborObj( this.accountBalanceIntervals )
            }
        ].filter( entry => entry !== undefined ) as CborMapEntry[]))
    }

    static fromCbor( cStr: CanBeCborString ): DijkstraTxBody
    {
        return DijkstraTxBody.fromCborObj( Cbor.parse( forceCborString( cStr ), { keepRef: true } ) );
    }

    static fromCborObj( cObj: CborObj ): DijkstraTxBody
    {
        // console.log("cObj: ", cObj);
        if(!(
            cObj instanceof CborMap 
            // && cObj.map.length >= 20 
        ))throw new InvalidCborFormatError("DijkstraTxBody")

        let fields: (CborObj | undefined)[] = new Array( 27 ).fill( undefined );

        for( let i = 0; i < 27; i++)
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
            _6,                     // 6 // legacy pp update; removed in Dijkstra
            _auxDataHash,           // 7
            _validityStart,         // 8
            _mint,                  // 9
            _10,                    // 10
            _scriptDataHash,        // 11
            _12,                    // 12
            _collIns,               // 13 // set
            _guards,                // 14 // set; replaces required_signers
            _net,                   // 15
            _collRet,               // 16
            _totColl,               // 17
            _refIns,                // 18
            _voting_procedures,     // 19
            _proposal_procedures,   // 20 // set
            _current_treasury,      // 21
            _donation,              // 22
            _sub_transactions,      // 23 // set (nasty transactions) — wired in step 3a
            _24,                    // 24 // (sub_transaction_body only)
            _direct_deposits,       // 25
            _account_balance_ivals  // 26
        ] = fields;
        // console.log("fee", _fee);

        if( _ins_ === undefined || _outs === undefined || _fee === undefined )
        throw new InvalidCborFormatError("DijkstraTxBody");

        if(!(
            // _ins  instanceof CborArray &&
            _outs instanceof CborArray &&
            _fee  instanceof CborUInt
        ))
        throw new InvalidCborFormatError("DijkstraTxBody");

        let ttl: bigint | undefined = undefined;
        if( _ttl !== undefined )
        {
            if(!( _ttl instanceof CborUInt ))
            throw new InvalidCborFormatError("DijkstraTxBody");

            ttl = _ttl.num;
        }
        
        //** TO DO: add votingProcedures, proposalProcedures, currentTreasuryValue, donation */
        return new DijkstraTxBody({
            inputs: getCborSet( _ins_ ).map( txOutRefAsUTxOFromCborObj ) as [DijkstraUTxO, ...DijkstraUTxO[]],
            outputs: _outs.array.map( DijkstraTxOut.fromCborObj ),
            fee: _fee.num,
            ttl,
            certs:                      _certs_ !== undefined ? getCborSet( _certs_ ).map( certificateFromCborObj ) : undefined,
            withdrawals:                _withdrawals === undefined ? undefined : TxWithdrawals.fromCborObj( _withdrawals ),
            auxDataHash:                _auxDataHash === undefined ? undefined : AuxiliaryDataHash.fromCborObj( _auxDataHash ),
            validityIntervalStart:      _validityStart instanceof CborUInt ? _validityStart.num : undefined,
            mint:                       _mint === undefined ? undefined : Value.fromCborObj( _mint ),
            scriptDataHash:             _scriptDataHash === undefined ? undefined : ScriptDataHash.fromCborObj( _scriptDataHash ),
            collateralInputs:           _collIns !== undefined ? getCborSet( _collIns ).map( txOutRefAsUTxOFromCborObj ) : undefined ,
            guards:                     _guards === undefined ? undefined : guardsFromCborObj( _guards ),
            network:                    _net instanceof CborUInt ? (Number( _net.num ) === 0 ? "testnet": "mainnet") : undefined,
            collateralReturn:           _collRet === undefined ? undefined : DijkstraTxOut.fromCborObj( _collRet ),
            totCollateral:              _totColl instanceof CborUInt ? _totColl.num : undefined,
            refInputs:                  _refIns !== undefined ? getCborSet( _refIns ).map( txOutRefAsUTxOFromCborObj ) : undefined,
            nastyTransactions:            _sub_transactions === undefined ? undefined : getCborSet( _sub_transactions ).map( DijkstraSubTransaction.fromCborObj ),
            directDeposits:             _direct_deposits === undefined ? undefined : TxWithdrawals.fromCborObj( _direct_deposits ),
            accountBalanceIntervals:    _account_balance_ivals === undefined ? undefined : accountBalanceIntervalsFromCborObj( _account_balance_ivals )
        }, getSubCborRef( cObj ));
    }

    toJSON() { return this.toJson(); }

    //** TO DO: add votingProcedures, proposalProcedures, currentTreasuryValue, donation */
    toJson()
    {
        return {
            inputs: this.inputs.map( i => i.toJson() ),
            outputs: this.outputs.map( o => o.toJson() ),
            fee: this.fee.toString(),
            ttl: this.ttl?.toString(),
            certs: this.certs?.map( c => c.toJson() ),
            withdrawals: this.withdrawals?.toJson() ,
            auxDataHash: this.auxDataHash?.toString() , // hash 32
            validityIntervalStart: this.validityIntervalStart?.toString(),
            mint: this.mint?.toJson(),
            scriptDataHash: this.scriptDataHash?.toString(), // hash 32
            collateralInputs: this.collateralInputs?.map( i => i.toJson() ),
            guards: this.guards?.map( g => g instanceof Credential ? g.toJson() : g.toString() ),
            network: this.network,
            collateralReturn: this.collateralReturn?.toJson(),
            totCollateral: this.totCollateral?.toString(),
            refInputs: this.refInputs?.map( i => i.toJson() ),
            nastyTransactions: this.nastyTransactions?.map( st => st.toJson() ),
            directDeposits: this.directDeposits?.toJson(),
            accountBalanceIntervals: this.accountBalanceIntervals?.map( e => ({
                credential: e.credential.toJson(),
                interval: e.interval.toJson()
            }) )
        }
    }

    /**
     * tests that
     * inputs + withdrawals + refund + mints === outputs + burns + deposit + fee
     * 
     * @todo add mints and burns
     * @deprecated until mints and burns are added
     */
    static isValueConserved( tx: DijkstraTxBody ): boolean
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


export function txOutRefAsUTxOFromCborObj( cObj: CborObj ): DijkstraUTxO
{
    return new DijkstraUTxO({
        utxoRef: TxOutRef.fromCborObj( cObj ),
        resolved: DijkstraTxOut.fake
    });
}

/** encodes `guards = nonempty_set<addr_keyhash> / nonempty_oset<credential>` */
export function guardsToCborObj( guards: DijkstraGuards ): CborArray
{
    return new CborArray( (guards as (PubKeyHash | Credential)[]).map( g => g.toCborObj() ) );
}

/**
 * decodes `guards = nonempty_set<addr_keyhash> / nonempty_oset<credential>`.
 * credentials encode as `[type, hash]` (CborArray); addr_keyhash as bare bytes.
 */
export function guardsFromCborObj( cObj: CborObj ): DijkstraGuards
{
    const elems = getCborSet( cObj );
    if( elems.length === 0 ) return [];
    return elems[0] instanceof CborArray ?
        elems.map( Credential.fromCborObj ) :
        elems.map( PubKeyHash.fromCborObj );
}

/** encodes `account_balance_intervals = {+ credential => account_balance_interval}` */
export function accountBalanceIntervalsToCborObj( entries: DijkstraAccountBalanceIntervalsEntry[] ): CborMap
{
    return new CborMap( entries.map( e => ({
        k: e.credential.toCborObj(),
        v: e.interval.toCborObj()
    }) ) );
}

/** decodes `account_balance_intervals = {+ credential => account_balance_interval}` */
export function accountBalanceIntervalsFromCborObj( cObj: CborObj ): DijkstraAccountBalanceIntervalsEntry[]
{
    if(!( cObj instanceof CborMap ))
    throw new InvalidCborFormatError("DijkstraTxBody::accountBalanceIntervals");

    return cObj.map.map(({ k, v }) => ({
        credential: Credential.fromCborObj( k ),
        interval: DijkstraAccountBalanceInterval.fromCborObj( v )
    }));
}

/** normalize an `IDijkstraGuards` input to the stored `DijkstraGuards` form */
export function normalizeGuards( guards: IDijkstraGuards ): DijkstraGuards
{
    if(!( Array.isArray( guards ) ))
    throw new Error("invalid 'guards'");

    const allCredentials = guards.length > 0 && (guards as any[]).every( g => g instanceof Credential );
    const allKeyHashes   = (guards as any[]).every( g => canBeHash28( g ) );

    if(!( allCredentials || allKeyHashes ))
    throw new Error("invalid 'guards'; must be all addr_keyhash or all credential");

    return allCredentials ?
        (guards as Credential[]) :
        (guards as CanBeHash28[]).map( g => g instanceof PubKeyHash ? g : new PubKeyHash( g ) );
}