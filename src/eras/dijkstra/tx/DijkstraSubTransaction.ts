import { ToCbor, SubCborRef, CborString, Cbor, CborObj, CborMap, CborUInt, CborArray, CborMapEntry, CborSimple, CanBeCborString, forceCborString } from "@harmoniclabs/cbor";
import { CanBeUInteger, canBeUInteger, forceBigUInt } from "@harmoniclabs/cbor/dist/utils/ints";
import { isObject } from "@harmoniclabs/obj-utils";
import { Data, isData, dataToCborObj, dataFromCborObj } from "@harmoniclabs/plutus-data";
import { Credential } from "../../../credentials";
import { IVotingProcedures, VotingProcedures, ProposalProcedure, IProposalProcedure, isIVotingProceduresEntry, isIProposalProcedure } from "../../../governance";
import { AuxiliaryDataHash, ScriptDataHash, Hash32 } from "../../../hashes";
import { TxWithdrawals, ITxWithdrawals, Value, NetworkT, Certificate, isCertificate, canBeTxWithdrawals, forceTxWithdrawals, isIValue, certificateFromCborObj } from "../../common/ledger";
import { getCborSet } from "../../../utils/getCborSet";
import { getSubCborRef, subCborRefOrUndef } from "../../../utils/getSubCborRef";
import { InvalidCborFormatError } from "../../../utils/InvalidCborFormatError";
import { ToJson } from "../../../utils/ToJson";
import { DijkstraUTxO, isIDijkstraUTxO } from "./DijkstraUTxO";
import { DijkstraTxOut, isIDijkstraTxOut } from "./DijkstraTxOut";
import { DijkstraTxWitnessSet, IDijkstraTxWitnessSet } from "./DijkstraTxWitnessSet";
import { DijkstraAuxiliaryData, IDijkstraAuxiliaryData } from "./DijkstraAuxiliaryData";
import { DijkstraAccountBalanceInterval, DijkstraAccountBalanceIntervalsEntry, IDijkstraAccountBalanceIntervalsEntry } from "./DijkstraAccountBalanceInterval";
import {
    IDijkstraGuards, DijkstraGuards, normalizeGuards, guardsToCborObj, guardsFromCborObj,
    accountBalanceIntervalsToCborObj, accountBalanceIntervalsFromCborObj, txOutRefAsUTxOFromCborObj
} from "./DijkstraTxBody";

/*
    CIP-118 "nasty transactions" (a.k.a. sub-transactions).

    sub_transactions    = nonempty_oset<sub_transaction>
    sub_transaction     = [sub_transaction_body, transaction_witness_set, auxiliary_data/ nil]

    sub_transaction_body =
      {   0  : set<transaction_input>
      ,   1  : [* transaction_output]
      , ? 3  : slot
      , ? 4  : certificates
      , ? 5  : withdrawals
      , ? 7  : auxiliary_data_hash
      , ? 8  : slot
      , ? 9  : mint
      , ? 11 : script_data_hash
      , ? 14 : guards
      , ? 15 : network_id
      , ? 18 : nonempty_set<transaction_input>
      , ? 19 : voting_procedures
      , ? 20 : proposal_procedures
      , ? 21 : coin
      , ? 22 : positive_coin
      , ? 24 : required_top_level_guards
      , ? 25 : direct_deposits
      , ? 26 : account_balance_intervals
      }

    required_top_level_guards = {+ credential => plutus_data/ nil}

    Note: a nasty-transaction body has NO fee (key 2) and NO collateral (keys 13/16/17).
*/

export type IDijkstraRequiredTopLevelGuardsEntry = {
    credential: Credential,
    data: Data | null
};

export interface IDijkstraSubTransactionBody {
    inputs: [ DijkstraUTxO, ...DijkstraUTxO[] ];
    outputs: DijkstraTxOut[];
    ttl?: CanBeUInteger;
    certs?: Certificate[];
    withdrawals?: TxWithdrawals | ITxWithdrawals;
    auxDataHash?: AuxiliaryDataHash;
    validityIntervalStart?: CanBeUInteger;
    mint?: Value;
    scriptDataHash?: ScriptDataHash;
    guards?: IDijkstraGuards;
    network?: NetworkT;
    refInputs?: DijkstraUTxO[];
    votingProcedures?: VotingProcedures | IVotingProcedures;
    proposalProcedures?: (ProposalProcedure | IProposalProcedure)[];
    currentTreasuryValue?: CanBeUInteger;
    donation?: CanBeUInteger;
    requiredTopLevelGuards?: IDijkstraRequiredTopLevelGuardsEntry[]; // key 24
    directDeposits?: TxWithdrawals | ITxWithdrawals; // key 25
    accountBalanceIntervals?: IDijkstraAccountBalanceIntervalsEntry[]; // key 26
}

export function isIDijkstraSubTransactionBody( body: Readonly<object> ): body is IDijkstraSubTransactionBody
{
    if( !isObject( body ) ) return false;
    const b = body as IDijkstraSubTransactionBody;
    return (
        Array.isArray( b.inputs ) && b.inputs.length > 0 &&
        b.inputs.every( i => i instanceof DijkstraUTxO || isIDijkstraUTxO( i ) ) &&
        Array.isArray( b.outputs ) &&
        b.outputs.every( o => o instanceof DijkstraTxOut || isIDijkstraTxOut( o ) )
    );
}

export class DijkstraSubTransactionBody implements ToCbor, ToJson {
    readonly inputs: [ DijkstraUTxO, ...DijkstraUTxO[] ];
    readonly outputs: DijkstraTxOut[];
    readonly ttl?: bigint;
    readonly certs?: Certificate[];
    readonly withdrawals?: TxWithdrawals;
    readonly auxDataHash?: AuxiliaryDataHash;
    readonly validityIntervalStart?: bigint;
    readonly mint?: Value;
    readonly scriptDataHash?: ScriptDataHash;
    readonly guards?: DijkstraGuards;
    readonly network?: NetworkT;
    readonly refInputs?: DijkstraUTxO[];
    readonly votingProcedures?: VotingProcedures;
    readonly proposalProcedures?: ProposalProcedure[];
    readonly currentTreasuryValue?: bigint;
    readonly donation?: bigint;
    readonly requiredTopLevelGuards?: IDijkstraRequiredTopLevelGuardsEntry[];
    readonly directDeposits?: TxWithdrawals;
    readonly accountBalanceIntervals?: DijkstraAccountBalanceIntervalsEntry[];

    constructor(
        body: IDijkstraSubTransactionBody,
        readonly cborRef: SubCborRef | undefined = undefined
    )
    {
        const {
            inputs, outputs, ttl, certs, withdrawals, auxDataHash, validityIntervalStart,
            mint, scriptDataHash, guards, network, refInputs, votingProcedures, proposalProcedures,
            currentTreasuryValue, donation, requiredTopLevelGuards, directDeposits, accountBalanceIntervals
        } = body;

        if(!( Array.isArray( inputs ) && inputs.length > 0 && inputs.every( isIDijkstraUTxO ) ))
        throw new Error("invalid 'inputs' field in sub_transaction_body");
        this.inputs = inputs.map( i => i instanceof DijkstraUTxO ? i : new DijkstraUTxO( i ) ) as [ DijkstraUTxO, ...DijkstraUTxO[] ];

        if(!( Array.isArray( outputs ) && outputs.every( isIDijkstraTxOut ) ))
        throw new Error("invalid 'outputs' field in sub_transaction_body");
        this.outputs = outputs.map( o => o instanceof DijkstraTxOut ? o : new DijkstraTxOut( o ) );

        this.ttl = ttl === undefined ? undefined : forceBigUInt( ttl );

        this.certs = ( certs === undefined || certs.length <= 0 ) ? undefined : certs;

        this.withdrawals = withdrawals === undefined ? undefined : forceTxWithdrawals( withdrawals );

        this.auxDataHash = auxDataHash === undefined ? undefined : new AuxiliaryDataHash( auxDataHash );

        this.validityIntervalStart = validityIntervalStart === undefined ? undefined : forceBigUInt( validityIntervalStart );

        if( mint === undefined ) this.mint = undefined;
        else if( mint instanceof Value ) this.mint = mint;
        else if( isIValue( mint ) ) this.mint = new Value( mint );
        else throw new Error("invalid 'mint' field in sub_transaction_body");

        this.scriptDataHash = scriptDataHash === undefined ? undefined : new ScriptDataHash( scriptDataHash );

        this.guards = guards === undefined ? undefined : normalizeGuards( guards );

        this.network = network;

        this.refInputs = refInputs?.map( r => r instanceof DijkstraUTxO ? r : new DijkstraUTxO( r ) );

        this.votingProcedures = votingProcedures === undefined ? undefined :
            ( votingProcedures instanceof VotingProcedures ? votingProcedures : new VotingProcedures( votingProcedures ) );

        this.proposalProcedures = proposalProcedures === undefined ? undefined :
            proposalProcedures.map( p => p instanceof ProposalProcedure ? p : new ProposalProcedure( p ) );

        this.currentTreasuryValue = currentTreasuryValue === undefined ? undefined : forceBigUInt( currentTreasuryValue );

        this.donation = donation === undefined ? undefined : forceBigUInt( donation );

        if( requiredTopLevelGuards === undefined ) this.requiredTopLevelGuards = undefined;
        else
        {
            if(!(
                Array.isArray( requiredTopLevelGuards ) &&
                requiredTopLevelGuards.every( e => isObject( e ) && e.credential instanceof Credential && ( e.data === null || isData( e.data ) ) )
            )) throw new Error("invalid 'requiredTopLevelGuards' field");
            this.requiredTopLevelGuards = requiredTopLevelGuards.map( e => ({ credential: e.credential, data: e.data ?? null }) );
        }

        this.directDeposits = directDeposits === undefined ? undefined : forceTxWithdrawals( directDeposits );

        if( accountBalanceIntervals === undefined ) this.accountBalanceIntervals = undefined;
        else this.accountBalanceIntervals = accountBalanceIntervals.map( e => ({
            credential: e.credential,
            interval: e.interval instanceof DijkstraAccountBalanceInterval ? e.interval : new DijkstraAccountBalanceInterval( e.interval )
        }) );

        this.cborRef = cborRef ?? subCborRefOrUndef( body );
    }

    toCborBytes(): Uint8Array
    {
        if( this.cborRef instanceof SubCborRef ) return this.cborRef.toBuffer();
        return this.toCbor();
    }
    toCbor(): CborString
    {
        if( this.cborRef instanceof SubCborRef ) return this.cborRef.toBuffer();
        return Cbor.encode( this.toCborObj() );
    }
    toCborObj(): CborMap
    {
        if( this.cborRef instanceof SubCborRef ) return Cbor.parse( this.cborRef.toBuffer() ) as CborMap;
        return new CborMap(([
            { k: new CborUInt( 0 ), v: new CborArray( this.inputs.map( i => i.utxoRef.toCborObj() ) ) },
            { k: new CborUInt( 1 ), v: new CborArray( this.outputs.map( o => o.toCborObj() ) ) },
            this.ttl === undefined ? undefined :
                { k: new CborUInt( 3 ), v: new CborUInt( this.ttl ) },
            this.certs === undefined || this.certs.length === 0 ? undefined :
                { k: new CborUInt( 4 ), v: new CborArray( this.certs.map( c => c.toCborObj() ) ) },
            this.withdrawals === undefined ? undefined :
                { k: new CborUInt( 5 ), v: this.withdrawals.toCborObj() },
            this.auxDataHash === undefined ? undefined :
                { k: new CborUInt( 7 ), v: this.auxDataHash.toCborObj() },
            this.validityIntervalStart === undefined ? undefined :
                { k: new CborUInt( 8 ), v: new CborUInt( this.validityIntervalStart ) },
            this.mint === undefined ? undefined :
                { k: new CborUInt( 9 ), v: this.mint.toCborObj() },
            this.scriptDataHash === undefined ? undefined :
                { k: new CborUInt( 11 ), v: this.scriptDataHash.toCborObj() },
            this.guards === undefined || this.guards.length === 0 ? undefined :
                { k: new CborUInt( 14 ), v: guardsToCborObj( this.guards ) },
            this.network === undefined ? undefined :
                { k: new CborUInt( 15 ), v: new CborUInt( this.network === "testnet" ? 0 : 1 ) },
            this.refInputs === undefined || this.refInputs.length === 0 ? undefined :
                { k: new CborUInt( 18 ), v: new CborArray( this.refInputs.map( r => r.utxoRef.toCborObj() ) ) },
            this.votingProcedures === undefined ? undefined :
                { k: new CborUInt( 19 ), v: this.votingProcedures.toCborObj() },
            this.proposalProcedures === undefined || this.proposalProcedures.length === 0 ? undefined :
                { k: new CborUInt( 20 ), v: new CborArray( this.proposalProcedures.map( p => p.toCborObj() ) ) },
            this.currentTreasuryValue === undefined ? undefined :
                { k: new CborUInt( 21 ), v: new CborUInt( this.currentTreasuryValue ) },
            this.donation === undefined ? undefined :
                { k: new CborUInt( 22 ), v: new CborUInt( this.donation ) },
            this.requiredTopLevelGuards === undefined || this.requiredTopLevelGuards.length === 0 ? undefined :
                { k: new CborUInt( 24 ), v: requiredTopLevelGuardsToCborObj( this.requiredTopLevelGuards ) },
            this.directDeposits === undefined ? undefined :
                { k: new CborUInt( 25 ), v: this.directDeposits.toCborObj() },
            this.accountBalanceIntervals === undefined || this.accountBalanceIntervals.length === 0 ? undefined :
                { k: new CborUInt( 26 ), v: accountBalanceIntervalsToCborObj( this.accountBalanceIntervals ) }
        ].filter( e => e !== undefined ) as CborMapEntry[]));
    }

    static fromCbor( cStr: CanBeCborString ): DijkstraSubTransactionBody
    {
        return DijkstraSubTransactionBody.fromCborObj( Cbor.parse( forceCborString( cStr ), { keepRef: true } ) );
    }
    static fromCborObj( cObj: CborObj ): DijkstraSubTransactionBody
    {
        if(!( cObj instanceof CborMap ))
        throw new InvalidCborFormatError("DijkstraSubTransactionBody");

        const fields: (CborObj | undefined)[] = new Array( 27 ).fill( undefined );
        for( let i = 0; i < 27; i++ )
        {
            const { v } = cObj.map.find(({ k }) => k instanceof CborUInt && Number( k.num ) === i ) ?? { v: undefined };
            if( v !== undefined ) fields[i] = v;
        }

        const _ins = fields[0], _outs = fields[1];
        if( _ins === undefined || !( _outs instanceof CborArray ) )
        throw new InvalidCborFormatError("DijkstraSubTransactionBody: missing inputs/outputs");

        return new DijkstraSubTransactionBody({
            inputs:                  getCborSet( _ins ).map( txOutRefAsUTxOFromCborObj ) as [ DijkstraUTxO, ...DijkstraUTxO[] ],
            outputs:                 _outs.array.map( DijkstraTxOut.fromCborObj ),
            ttl:                     fields[3] instanceof CborUInt ? fields[3].num : undefined,
            certs:                   fields[4] !== undefined ? getCborSet( fields[4] ).map( certificateFromCborObj ) : undefined,
            withdrawals:             fields[5] === undefined ? undefined : TxWithdrawals.fromCborObj( fields[5] ),
            auxDataHash:             fields[7] === undefined ? undefined : AuxiliaryDataHash.fromCborObj( fields[7] ),
            validityIntervalStart:   fields[8] instanceof CborUInt ? fields[8].num : undefined,
            mint:                    fields[9] === undefined ? undefined : Value.fromCborObj( fields[9] ),
            scriptDataHash:          fields[11] === undefined ? undefined : ScriptDataHash.fromCborObj( fields[11] ),
            guards:                  fields[14] === undefined ? undefined : guardsFromCborObj( fields[14] ),
            network:                 fields[15] instanceof CborUInt ? (Number( fields[15].num ) === 0 ? "testnet" : "mainnet") : undefined,
            refInputs:               fields[18] !== undefined ? getCborSet( fields[18] ).map( txOutRefAsUTxOFromCborObj ) : undefined,
            // TODO: VotingProcedures / ProposalProcedure lack fromCborObj repo-wide (same as the base tx body)
            votingProcedures:        undefined,
            proposalProcedures:      undefined,
            currentTreasuryValue:    fields[21] instanceof CborUInt ? fields[21].num : undefined,
            donation:                fields[22] instanceof CborUInt ? fields[22].num : undefined,
            requiredTopLevelGuards:  fields[24] === undefined ? undefined : requiredTopLevelGuardsFromCborObj( fields[24] ),
            directDeposits:          fields[25] === undefined ? undefined : TxWithdrawals.fromCborObj( fields[25] ),
            accountBalanceIntervals: fields[26] === undefined ? undefined : accountBalanceIntervalsFromCborObj( fields[26] )
        }, getSubCborRef( cObj ));
    }

    toJSON() { return this.toJson(); }
    toJson()
    {
        return {
            inputs: this.inputs.map( i => i.toJson() ),
            outputs: this.outputs.map( o => o.toJson() ),
            ttl: this.ttl?.toString(),
            certs: this.certs?.map( c => c.toJson() ),
            withdrawals: this.withdrawals?.toJson(),
            auxDataHash: this.auxDataHash?.toString(),
            validityIntervalStart: this.validityIntervalStart?.toString(),
            mint: this.mint?.toJson(),
            scriptDataHash: this.scriptDataHash?.toString(),
            guards: this.guards?.map( g => g instanceof Credential ? g.toJson() : g.toString() ),
            network: this.network,
            refInputs: this.refInputs?.map( r => r.toJson() ),
            currentTreasuryValue: this.currentTreasuryValue?.toString(),
            donation: this.donation?.toString(),
            requiredTopLevelGuards: this.requiredTopLevelGuards?.map( e => ({ credential: e.credential.toJson(), data: e.data?.toJson() ?? null }) ),
            directDeposits: this.directDeposits?.toJson(),
            accountBalanceIntervals: this.accountBalanceIntervals?.map( e => ({ credential: e.credential.toJson(), interval: e.interval.toJson() }) )
        };
    }
}

export interface IDijkstraSubTransaction {
    body: IDijkstraSubTransactionBody | DijkstraSubTransactionBody;
    witnessSet: IDijkstraTxWitnessSet | DijkstraTxWitnessSet;
    auxiliaryData?: IDijkstraAuxiliaryData | DijkstraAuxiliaryData | null;
}

export class DijkstraSubTransaction implements ToCbor, ToJson {
    readonly body: DijkstraSubTransactionBody;
    readonly witnessSet: DijkstraTxWitnessSet;
    readonly auxiliaryData?: DijkstraAuxiliaryData | null;

    constructor(
        tx: IDijkstraSubTransaction,
        readonly cborRef: SubCborRef | undefined = undefined
    )
    {
        this.body = tx.body instanceof DijkstraSubTransactionBody ? tx.body : new DijkstraSubTransactionBody( tx.body );
        this.witnessSet = tx.witnessSet instanceof DijkstraTxWitnessSet ? tx.witnessSet : new DijkstraTxWitnessSet( tx.witnessSet );
        this.auxiliaryData = (
            tx.auxiliaryData === undefined || tx.auxiliaryData === null ? null :
            tx.auxiliaryData instanceof DijkstraAuxiliaryData ? tx.auxiliaryData :
            new DijkstraAuxiliaryData( tx.auxiliaryData )
        );
    }

    toCborBytes(): Uint8Array
    {
        if( this.cborRef instanceof SubCborRef ) return this.cborRef.toBuffer();
        return this.toCbor();
    }
    toCbor(): CborString { return Cbor.encode( this.toCborObj() ); }
    toCborObj(): CborArray
    {
        return new CborArray([
            this.body.toCborObj(),
            this.witnessSet.toCborObj(),
            this.auxiliaryData === undefined || this.auxiliaryData === null ?
                new CborSimple( null ) : this.auxiliaryData.toCborObj()
        ]);
    }

    static fromCbor( cStr: CanBeCborString ): DijkstraSubTransaction
    {
        return DijkstraSubTransaction.fromCborObj( Cbor.parse( forceCborString( cStr ), { keepRef: true } ) );
    }
    static fromCborObj( cObj: CborObj ): DijkstraSubTransaction
    {
        if(!( cObj instanceof CborArray && cObj.array.length >= 2 ))
        throw new InvalidCborFormatError("DijkstraSubTransaction must be [sub_transaction_body, witness_set, auxiliary_data/nil]");

        const [ _body, _wits, _aux ] = cObj.array;
        return new DijkstraSubTransaction({
            body: DijkstraSubTransactionBody.fromCborObj( _body ),
            witnessSet: DijkstraTxWitnessSet.fromCborObj( _wits ),
            auxiliaryData: ( _aux === undefined || _aux instanceof CborSimple ) ? null : DijkstraAuxiliaryData.fromCborObj( _aux )
        }, getSubCborRef( cObj ));
    }

    toJSON() { return this.toJson(); }
    toJson()
    {
        return {
            body: this.body.toJson(),
            witnessSet: this.witnessSet.toJson(),
            auxiliaryData: this.auxiliaryData?.toJson() ?? null
        };
    }
}

// ------------------------------------------------------------------ helpers

/** encodes `required_top_level_guards = {+ credential => plutus_data/ nil}` */
export function requiredTopLevelGuardsToCborObj( entries: IDijkstraRequiredTopLevelGuardsEntry[] ): CborMap
{
    return new CborMap( entries.map( e => ({
        k: e.credential.toCborObj(),
        v: e.data === null ? new CborSimple( null ) : dataToCborObj( e.data )
    }) ) );
}

/** decodes `required_top_level_guards = {+ credential => plutus_data/ nil}` */
export function requiredTopLevelGuardsFromCborObj( cObj: CborObj ): IDijkstraRequiredTopLevelGuardsEntry[]
{
    if(!( cObj instanceof CborMap ))
    throw new InvalidCborFormatError("required_top_level_guards");

    return cObj.map.map(({ k, v }) => ({
        credential: Credential.fromCborObj( k ),
        data: v instanceof CborSimple ? null : dataFromCborObj( v )
    }));
}
