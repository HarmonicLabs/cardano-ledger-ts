import { ToCbor, SubCborRef, CborString, Cbor, CborObj, CborMap, CborUInt, CborArray, CborBytes, CborMapEntry, CborSimple, CborTag, CanBeCborString, forceCborString } from "@harmoniclabs/cbor";
import { CanBeUInteger, canBeUInteger, forceBigUInt } from "@harmoniclabs/cbor/dist/utils/ints";
import { blake2b_256 } from "@harmoniclabs/crypto";
import { isObject } from "@harmoniclabs/obj-utils";
import { Data, dataToCborObj, dataFromCborObj } from "@harmoniclabs/plutus-data";
import { PubKeyHash, Credential, CredentialType } from "../../../credentials";
import { IVotingProcedures, VotingProcedures, ProposalProcedure, IProposalProcedure } from "../../../governance";
import { AuxiliaryDataHash, ScriptDataHash, CanBeHash28, Hash32, canBeHash28 } from "../../../hashes";
import { Coin, TxWithdrawals, ITxWithdrawals, Value, NetworkT, Certificate, canBeTxWithdrawals, forceTxWithdrawals, isIValue, certificatesToDepositLovelaces } from "../../common/ledger";
import {
    DijkstraAccountBalanceIntervalsEntry, IDijkstraAccountBalanceIntervalsEntry,
    accountBalanceIntervalsToCborObj, accountBalanceIntervalsFromCborObj, normalizeAccountBalanceIntervals
} from "./DijkstraAccountBalanceInterval";
import { IDijkstraSubTransaction, DijkstraSubTransaction } from "./DijkstraSubTransaction";
import { TxOutRef } from "../../common/tx/TxOutRef";
import { DijkstraUTxO, isIDijkstraUTxO } from "./DijkstraUTxO";
import { DijkstraTxOut, isIDijkstraTxOut } from "./DijkstraTxOut";
import { dijkstraCertificateFromCborObj } from "./DijkstraCertificates";
import { getCborSet } from "../../../utils/getCborSet";
import { subCborRefOrUndef, getSubCborRef } from "../../../utils/getSubCborRef";
import { InvalidCborFormatError } from "../../../utils/InvalidCborFormatError";
import { ToJson } from "../../../utils/ToJson";

export { accountBalanceIntervalsToCborObj, accountBalanceIntervalsFromCborObj } from "./DijkstraAccountBalanceInterval";

/**
 * CDDL (Dijkstra): `guards = nonempty_set<addr_keyhash>/ nonempty_oset<credential>`
 *
 * Replaces Conway's `required_signers` (key 14). Either a set of key hashes
 * (the backwards-compatible form) or an ordered set of credentials. The
 * decoder peeks the first element (TxBody.hs `decodeGuards`): a list means
 * credentials, anything else key hashes.
 */
export type IDijkstraGuards = CanBeHash28[] | Credential[];
export type DijkstraGuards = PubKeyHash[] | Credential[];

/** `required_top_level_guards = {+ credential => plutus_data/ nil}` (key 24) */
export type IDijkstraRequiredTopLevelGuardsEntry = {
    credential: Credential,
    data: Data | null
};

/*
    transaction_body (top level)                  sub_transaction_body
      0  inputs                                     0  inputs
      1  outputs                                    1  outputs
      2  fee                                        -
      3  ttl                                        3
      4  certificates                               4
      5  withdrawals                                5
      7  auxiliary_data_hash                        7
      8  validity interval start                    8
      9  mint                                       9
      11 script_data_hash                           11
      13 collateral inputs                          -
      14 guards                                     14
      15 network_id                                 15
      16 collateral return                          -
      17 total collateral                           -
      18 reference inputs                           18
      19 voting_procedures                          19
      20 proposal_procedures                        20
      21 current treasury value                     21
      22 donation                                   22
      23 sub_transactions                           -
      24 required_top_level_guards                  24
      25 direct_deposits                            25
      26 account_balance_intervals                  26
      27 starting_account_balance_intervals         -

    Unknown or duplicate keys are rejected (cardano-ledger `decodeSparseKeyed`).
*/
export type DijkstraTxLevel = "top" | "sub";

const TOP_LEVEL_KEYS = new Set([ 0, 1, 2, 3, 4, 5, 7, 8, 9, 11, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27 ]);
const SUB_LEVEL_KEYS = new Set([ 0, 1, 3, 4, 5, 7, 8, 9, 11, 14, 15, 18, 19, 20, 21, 22, 24, 25, 26 ]);

/** key order of the Haskell encoder (`encodeTxBodyRaw`), used when encoding from fields */
export const DIJKSTRA_TX_BODY_KEY_ORDER = [ 0, 13, 18, 1, 16, 17, 2, 3, 4, 5, 8, 14, 9, 11, 7, 15, 19, 20, 21, 22, 23, 24, 25, 26, 27 ] as const;

/** collects the body map entries by key, enforcing the allowed key set, no duplicates and the required keys */
export function collectDijkstraBodyFields( cObj: CborObj, level: DijkstraTxLevel ): Map<number, CborObj>
{
    const name = level === "top" ? "DijkstraTxBody" : "DijkstraSubTransactionBody";
    if(!( cObj instanceof CborMap )) throw new InvalidCborFormatError( name + ": not a map" );
    const allowed = level === "top" ? TOP_LEVEL_KEYS : SUB_LEVEL_KEYS;
    const fields = new Map<number, CborObj>();
    for( const { k, v } of cObj.map )
    {
        if(!( k instanceof CborUInt )) throw new InvalidCborFormatError( name + ": non-uint key" );
        const key = Number( k.num );
        if( !allowed.has( key ) ) throw new InvalidCborFormatError( name + ": unexpected key " + key );
        if( fields.has( key ) ) throw new InvalidCborFormatError( name + ": duplicate key " + key );
        fields.set( key, v );
    }
    const required = level === "top" ? [ 0, 1, 2 ] : [ 0, 1 ];
    for( const r of required )
    if( !fields.has( r ) ) throw new InvalidCborFormatError( name + ": missing required key " + r );
    return fields;
}

function nonEmpty<T>( arr: T[], what: string ): T[]
{
    if( arr.length === 0 ) throw new InvalidCborFormatError( "TxBody: '" + what + "' must be non-empty when supplied" );
    return arr;
}

function uintField( c: CborObj, what: string ): bigint
{
    if(!( c instanceof CborUInt )) throw new InvalidCborFormatError( "TxBody: '" + what + "' must be a uint" );
    return c.num;
}

function nonEmptyMap( c: CborObj, what: string ): CborMap
{
    if(!( c instanceof CborMap )) throw new InvalidCborFormatError( "TxBody: '" + what + "' must be a map" );
    if( c.map.length === 0 ) throw new InvalidCborFormatError( "TxBody: '" + what + "' must be non-empty when supplied" );
    return c;
}

/** the decoded field values shared by both body levels (fee, collateral, sub-txs and key 27 are top level only) */
export interface DijkstraBodyDecodedFields {
    inputs: DijkstraUTxO[];
    outputs: DijkstraTxOut[];
    fee?: bigint;
    ttl?: bigint;
    certs?: Certificate[];
    withdrawals?: TxWithdrawals;
    auxDataHash?: AuxiliaryDataHash;
    validityIntervalStart?: bigint;
    mint?: Value;
    scriptDataHash?: ScriptDataHash;
    collateralInputs?: DijkstraUTxO[];
    guards?: DijkstraGuards;
    network?: NetworkT;
    collateralReturn?: DijkstraTxOut;
    totCollateral?: bigint;
    refInputs?: DijkstraUTxO[];
    votingProcedures?: VotingProcedures;
    proposalProcedures?: ProposalProcedure[];
    currentTreasuryValue?: bigint;
    donation?: bigint;
    subTransactions?: DijkstraSubTransaction[];
    requiredTopLevelGuards?: IDijkstraRequiredTopLevelGuardsEntry[];
    directDeposits?: TxWithdrawals;
    accountBalanceIntervals?: DijkstraAccountBalanceIntervalsEntry[];
    startingAccountBalanceIntervals?: DijkstraAccountBalanceIntervalsEntry[];
}

/** decodes every field of a Dijkstra (sub-)transaction body; strict per the Haskell decoder */
export function decodeDijkstraBodyFields( cObj: CborObj, level: DijkstraTxLevel ): DijkstraBodyDecodedFields
{
    const f = collectDijkstraBodyFields( cObj, level );
    const get = ( k: number ) => f.get( k );

    const _outs = get( 1 )!;
    if(!( _outs instanceof CborArray )) throw new InvalidCborFormatError("TxBody: outputs must be an array");

    const out: DijkstraBodyDecodedFields = {
        inputs: getCborSet( get( 0 )! ).map( txOutRefAsUTxOFromCborObj ),
        outputs: _outs.array.map( DijkstraTxOut.fromCborObj ),
    };
    let c: CborObj | undefined;
    if( ( c = get( 2 ) ) !== undefined ) out.fee = uintField( c, "fee" );
    if( ( c = get( 3 ) ) !== undefined ) out.ttl = uintField( c, "ttl" );
    if( ( c = get( 4 ) ) !== undefined ) out.certs = nonEmpty( getCborSet( c ), "Certificates" ).map( dijkstraCertificateFromCborObj );
    if( ( c = get( 5 ) ) !== undefined ) out.withdrawals = TxWithdrawals.fromCborObj( nonEmptyMap( c, "Withdrawals" ) );
    if( ( c = get( 7 ) ) !== undefined ) out.auxDataHash = AuxiliaryDataHash.fromCborObj( c );
    if( ( c = get( 8 ) ) !== undefined ) out.validityIntervalStart = uintField( c, "validity interval start" );
    if( ( c = get( 9 ) ) !== undefined ) { nonEmptyMap( c, "Mint" ); out.mint = Value.fromCborObj( c ); }
    if( ( c = get( 11 ) ) !== undefined ) out.scriptDataHash = ScriptDataHash.fromCborObj( c );
    if( ( c = get( 13 ) ) !== undefined ) out.collateralInputs = nonEmpty( getCborSet( c ), "Collateral Inputs" ).map( txOutRefAsUTxOFromCborObj );
    if( ( c = get( 14 ) ) !== undefined ) out.guards = guardsFromCborObj( c );
    if( ( c = get( 15 ) ) !== undefined )
    {
        const n = uintField( c, "network_id" );
        if( n > BigInt( 1 ) ) throw new InvalidCborFormatError("TxBody: network_id must be 0 or 1");
        out.network = n === BigInt( 0 ) ? "testnet" : "mainnet";
    }
    if( ( c = get( 16 ) ) !== undefined ) out.collateralReturn = DijkstraTxOut.fromCborObj( c );
    if( ( c = get( 17 ) ) !== undefined ) out.totCollateral = uintField( c, "total collateral" );
    if( ( c = get( 18 ) ) !== undefined ) out.refInputs = nonEmpty( getCborSet( c ), "Reference Inputs" ).map( txOutRefAsUTxOFromCborObj );
    if( ( c = get( 19 ) ) !== undefined ) out.votingProcedures = VotingProcedures.fromCborObj( nonEmptyMap( c, "VotingProcedures" ) );
    if( ( c = get( 20 ) ) !== undefined ) out.proposalProcedures = nonEmpty( getCborSet( c ), "ProposalProcedures" ).map( ProposalProcedure.fromCborObj );
    if( ( c = get( 21 ) ) !== undefined ) out.currentTreasuryValue = uintField( c, "current treasury value" );
    if( ( c = get( 22 ) ) !== undefined )
    {
        out.donation = uintField( c, "Treasury Donation" );
        if( out.donation === BigInt( 0 ) ) throw new InvalidCborFormatError("TxBody: 'Treasury Donation' must be non-zero when supplied");
    }
    if( ( c = get( 23 ) ) !== undefined )
    {
        const subs = nonEmpty( getCborSet( c ), "SubTransactions" ).map( s => DijkstraSubTransaction.fromCborObj( s ) );
        const ids = new Set<string>();
        for( const st of subs )
        {
            const id = st.body.hash.toString();
            if( ids.has( id ) ) throw new InvalidCborFormatError("TxBody: duplicate sub-transaction " + id );
            ids.add( id );
        }
        out.subTransactions = subs;
    }
    if( ( c = get( 24 ) ) !== undefined ) out.requiredTopLevelGuards = requiredTopLevelGuardsFromCborObj( nonEmptyMap( c, "RequiredTopLevelGuards" ) );
    if( ( c = get( 25 ) ) !== undefined ) out.directDeposits = TxWithdrawals.fromCborObj( nonEmptyMap( c, "DirectDeposits" ) );
    if( ( c = get( 26 ) ) !== undefined ) out.accountBalanceIntervals = accountBalanceIntervalsFromCborObj( nonEmptyMap( c, "AccountBalanceIntervals" ) );
    if( ( c = get( 27 ) ) !== undefined ) out.startingAccountBalanceIntervals = accountBalanceIntervalsFromCborObj( nonEmptyMap( c, "StartingAccountBalanceIntervals" ) );
    return out;
}

const setTag = ( elems: CborObj[] ) => new CborTag( 258, new CborArray( elems ) );

/** encodes the fields in the Haskell key order; empty optional collections are omitted */
export function encodeDijkstraBodyFields( b: DijkstraBodyDecodedFields, level: DijkstraTxLevel ): CborMap
{
    const entries = new Map<number, CborObj>();
    entries.set( 0, setTag( b.inputs.map( i => i.utxoRef.toCborObj() ) ) );
    entries.set( 1, new CborArray( b.outputs.map( o => o.toCborObj() ) ) );
    if( level === "top" ) entries.set( 2, new CborUInt( b.fee ?? BigInt( 0 ) ) );
    if( b.ttl !== undefined ) entries.set( 3, new CborUInt( b.ttl ) );
    if( b.certs !== undefined && b.certs.length > 0 ) entries.set( 4, setTag( b.certs.map( x => x.toCborObj() ) ) );
    if( b.withdrawals !== undefined && b.withdrawals.map.length > 0 ) entries.set( 5, b.withdrawals.toCborObj() );
    if( b.auxDataHash !== undefined ) entries.set( 7, b.auxDataHash.toCborObj() );
    if( b.validityIntervalStart !== undefined ) entries.set( 8, new CborUInt( b.validityIntervalStart ) );
    if( b.mint !== undefined && !Value.isZero( b.mint ) ) entries.set( 9, b.mint.toCborObj() );
    if( b.scriptDataHash !== undefined ) entries.set( 11, b.scriptDataHash.toCborObj() );
    if( level === "top" && b.collateralInputs !== undefined && b.collateralInputs.length > 0 ) entries.set( 13, setTag( b.collateralInputs.map( i => i.utxoRef.toCborObj() ) ) );
    if( b.guards !== undefined && b.guards.length > 0 ) entries.set( 14, guardsToCborObj( b.guards ) );
    if( b.network !== undefined ) entries.set( 15, new CborUInt( b.network === "testnet" || ( b.network as any ) === 0 ? 0 : 1 ) );
    if( level === "top" && b.collateralReturn !== undefined ) entries.set( 16, b.collateralReturn.toCborObj() );
    if( level === "top" && b.totCollateral !== undefined ) entries.set( 17, new CborUInt( b.totCollateral ) );
    if( b.refInputs !== undefined && b.refInputs.length > 0 ) entries.set( 18, setTag( b.refInputs.map( i => i.utxoRef.toCborObj() ) ) );
    if( b.votingProcedures !== undefined ) entries.set( 19, b.votingProcedures.toCborObj() );
    if( b.proposalProcedures !== undefined && b.proposalProcedures.length > 0 ) entries.set( 20, setTag( b.proposalProcedures.map( p => p.toCborObj() ) ) );
    if( b.currentTreasuryValue !== undefined ) entries.set( 21, new CborUInt( b.currentTreasuryValue ) );
    if( b.donation !== undefined && b.donation > BigInt( 0 ) ) entries.set( 22, new CborUInt( b.donation ) );
    if( level === "top" && b.subTransactions !== undefined && b.subTransactions.length > 0 ) entries.set( 23, setTag( b.subTransactions.map( s => s.toCborObj() ) ) );
    if( b.requiredTopLevelGuards !== undefined && b.requiredTopLevelGuards.length > 0 ) entries.set( 24, requiredTopLevelGuardsToCborObj( b.requiredTopLevelGuards ) );
    if( b.directDeposits !== undefined && b.directDeposits.map.length > 0 ) entries.set( 25, b.directDeposits.toCborObj() );
    if( b.accountBalanceIntervals !== undefined && b.accountBalanceIntervals.length > 0 ) entries.set( 26, accountBalanceIntervalsToCborObj( b.accountBalanceIntervals ) );
    if( level === "top" && b.startingAccountBalanceIntervals !== undefined && b.startingAccountBalanceIntervals.length > 0 ) entries.set( 27, accountBalanceIntervalsToCborObj( b.startingAccountBalanceIntervals ) );

    const ordered: CborMapEntry[] = [];
    for( const k of DIJKSTRA_TX_BODY_KEY_ORDER )
    {
        const v = entries.get( k );
        if( v !== undefined ) ordered.push({ k: new CborUInt( k ), v });
    }
    return new CborMap( ordered );
}

export interface IDijkstraTxBody {
    inputs: DijkstraUTxO[],
    outputs: DijkstraTxOut[],
    fee: Coin,
    ttl?: CanBeUInteger,
    certs?: Certificate[],
    withdrawals?: TxWithdrawals | ITxWithdrawals,
    // key 6 (legacy protocol param update) removed since Conway
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
    subTransactions?: (IDijkstraSubTransaction | DijkstraSubTransaction)[]; // key 23
    /** @deprecated old name of `subTransactions` (CIP-118 "nasty transactions") */
    nastyTransactions?: (IDijkstraSubTransaction | DijkstraSubTransaction)[];
    requiredTopLevelGuards?: IDijkstraRequiredTopLevelGuardsEntry[]; // key 24
    directDeposits?: TxWithdrawals | ITxWithdrawals; // key 25; {+ reward_account => coin}
    accountBalanceIntervals?: IDijkstraAccountBalanceIntervalsEntry[]; // key 26
    startingAccountBalanceIntervals?: IDijkstraAccountBalanceIntervalsEntry[]; // key 27
}

export function isIDijkstraTxBody( body: Readonly<object> ): body is IDijkstraTxBody
{
    if( !isObject( body ) ) return false;
    const b = body as IDijkstraTxBody;
    return (
        Array.isArray( b.inputs ) &&
        b.inputs.every( _in => _in instanceof DijkstraUTxO || isIDijkstraUTxO( _in ) ) &&
        Array.isArray( b.outputs ) &&
        b.outputs.every( out => out instanceof DijkstraTxOut || isIDijkstraTxOut( out ) ) &&
        canBeUInteger( b.fee )
    );
}

export class DijkstraTxBody
    implements ToCbor, ToJson
{
    readonly inputs!: DijkstraUTxO[];
    readonly outputs!: DijkstraTxOut[];
    readonly fee!: bigint;
    readonly ttl?: bigint;
    readonly certs?: Certificate[];
    readonly withdrawals?: TxWithdrawals;
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
    readonly subTransactions?: DijkstraSubTransaction[]; // key 23
    readonly requiredTopLevelGuards?: IDijkstraRequiredTopLevelGuardsEntry[]; // key 24
    readonly directDeposits?: TxWithdrawals; // key 25
    readonly accountBalanceIntervals?: DijkstraAccountBalanceIntervalsEntry[]; // key 26
    readonly startingAccountBalanceIntervals?: DijkstraAccountBalanceIntervalsEntry[]; // key 27

    /** @deprecated old name of `subTransactions` */
    get nastyTransactions(): DijkstraSubTransaction[] | undefined { return this.subTransactions; }

    /**
     * The key-hash guards, i.e. the vkey witnesses key 14 requires. Same role as
     * Conway's `required_signers`, so code written for Conway keeps working.
     * Script guards are not included (see `scriptGuards`).
     */
    get requiredSigners(): PubKeyHash[] | undefined
    {
        return keyHashGuards( this.guards );
    }

    /** the script-credential guards (they need a script witness and, for Plutus, a guarding redeemer) */
    get scriptGuards(): Credential[]
    {
        return scriptGuardsOf( this.guards );
    }

    get hash(): Hash32
    {
        if(
            this._isHashValid === true
            && this._hash !== undefined
            && this._hash instanceof Hash32
        ) return this._hash;

        this._hash = new Hash32(
            new Uint8Array(
                blake2b_256( this.toCborBytes() )
            )
        );
        this._isHashValid = true;

        return this._hash;
    }

    private _isHashValid = false;
    private _hash: Hash32 | undefined = undefined;

    constructor(
        body: IDijkstraTxBody,
        readonly cborRef: SubCborRef | undefined = undefined
    )
    {
        if( !isIDijkstraTxBody( body ) ) throw new Error("invalid DijkstraTxBody");
        const n = normalizeCommonBodyFields( body );
        Object.assign( this, n );
        this.fee = forceBigUInt( body.fee );
        this.collateralInputs = body.collateralInputs?.map( c => c instanceof DijkstraUTxO ? c : new DijkstraUTxO( c ) );
        this.collateralReturn = body.collateralReturn === undefined ? undefined :
            body.collateralReturn instanceof DijkstraTxOut ? body.collateralReturn : new DijkstraTxOut( body.collateralReturn );
        this.totCollateral = body.totCollateral === undefined ? undefined : forceBigUInt( body.totCollateral );
        const subs = body.subTransactions ?? body.nastyTransactions;
        this.subTransactions = subs === undefined || subs.length === 0 ? undefined :
            subs.map( st => st instanceof DijkstraSubTransaction ? st : new DijkstraSubTransaction( st ) );
        this.startingAccountBalanceIntervals = body.startingAccountBalanceIntervals === undefined ? undefined :
            normalizeAccountBalanceIntervals( body.startingAccountBalanceIntervals );

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
    toCborObj(): CborObj
    {
        if( this.cborRef instanceof SubCborRef ) return Cbor.parse( this.cborRef.toBuffer() );
        return encodeDijkstraBodyFields( this as DijkstraBodyDecodedFields, "top" );
    }

    static fromCbor( cStr: CanBeCborString ): DijkstraTxBody
    {
        const bytes = cStr instanceof Uint8Array ? cStr : forceCborString( cStr );
        return DijkstraTxBody.fromCborObj( Cbor.parse( bytes, { keepRef: true } ), bytes );
    }

    static fromCborObj( cObj: CborObj, _originalBytes?: Uint8Array ): DijkstraTxBody
    {
        const f = decodeDijkstraBodyFields( cObj, "top" );
        return new DijkstraTxBody({ ...f, fee: f.fee! }, getSubCborRef( cObj, _originalBytes ));
    }

    toJSON() { return this.toJson(); }
    toJson()
    {
        return {
            ...commonBodyJson( this ),
            fee: this.fee.toString(),
            collateralInputs: this.collateralInputs?.map( i => i.toJson() ),
            collateralReturn: this.collateralReturn?.toJson(),
            totCollateral: this.totCollateral?.toString(),
            subTransactions: this.subTransactions?.map( st => st.toJson() ),
            startingAccountBalanceIntervals: this.startingAccountBalanceIntervals?.map( e => ({
                rewardAccount: Buffer.from( e.rewardAccount ).toString("hex"),
                interval: e.interval.toJson()
            }) )
        }
    }

    /**
     * tests that
     * inputs + withdrawals + refund + mints === outputs + burns + deposit + fee
     *
     * @deprecated ignores mint, sub-transactions and direct deposits
     */
    static isValueConserved( tx: DijkstraTxBody ): boolean
    {
        const { inputs, withdrawals, outputs, certs, fee } = tx;
        let tot = withdrawals === undefined ? Value.zero : withdrawals.toTotalWitdrawn();
        tot = inputs.reduce( (a,b) => Value.add( a, b.resolved.value ) , tot );
        tot = Value.sub(
            tot,
            outputs.reduce( (a,b) => Value.add( a, b.value ), Value.lovelaces( fee ) )
        );
        return Value.isZero(
            certs === undefined ? tot :
            Value.add( tot, Value.lovelaces( certificatesToDepositLovelaces( certs ) ) )
        );
    }
};

/** the fields both body levels share, normalized for the class constructors */
export interface IDijkstraCommonBodyFields {
    inputs: DijkstraUTxO[];
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
    requiredTopLevelGuards?: IDijkstraRequiredTopLevelGuardsEntry[];
    directDeposits?: TxWithdrawals | ITxWithdrawals;
    accountBalanceIntervals?: IDijkstraAccountBalanceIntervalsEntry[];
}

export function normalizeCommonBodyFields( b: IDijkstraCommonBodyFields )
{
    if(!( Array.isArray( b.inputs ) && b.inputs.every( isIDijkstraUTxO ) )) throw new Error("invalid 'inputs' field");
    if(!( Array.isArray( b.outputs ) && b.outputs.every( isIDijkstraTxOut ) )) throw new Error("invalid 'outputs' field");
    if( b.withdrawals !== undefined && !canBeTxWithdrawals( b.withdrawals ) ) throw new Error("invalid 'withdrawals' field");
    if( b.directDeposits !== undefined && !canBeTxWithdrawals( b.directDeposits ) ) throw new Error("invalid 'directDeposits' field");
    if( b.mint !== undefined && !( b.mint instanceof Value || isIValue( b.mint ) ) ) throw new Error("invalid 'mint' field");
    if(!( b.network === undefined || b.network === "mainnet" || b.network === "testnet" || ( b.network as any ) === 0 || ( b.network as any ) === 1 ))
    throw new Error("invalid 'network' field");
    return {
        inputs: b.inputs.map( i => i instanceof DijkstraUTxO ? i : new DijkstraUTxO( i ) ),
        outputs: b.outputs.map( o => o instanceof DijkstraTxOut ? o : new DijkstraTxOut( o ) ),
        ttl: b.ttl === undefined ? undefined : forceBigUInt( b.ttl ),
        certs: b.certs === undefined || b.certs.length === 0 ? undefined : b.certs,
        withdrawals: b.withdrawals === undefined ? undefined : forceTxWithdrawals( b.withdrawals ),
        auxDataHash: b.auxDataHash === undefined ? undefined : new AuxiliaryDataHash( b.auxDataHash ),
        validityIntervalStart: b.validityIntervalStart === undefined ? undefined : forceBigUInt( b.validityIntervalStart ),
        mint: b.mint === undefined ? undefined : b.mint instanceof Value ? b.mint : new Value( b.mint as any ),
        scriptDataHash: b.scriptDataHash === undefined ? undefined : new ScriptDataHash( b.scriptDataHash ),
        guards: b.guards === undefined ? undefined : normalizeGuards( b.guards ),
        network: b.network,
        refInputs: b.refInputs?.map( r => r instanceof DijkstraUTxO ? r : new DijkstraUTxO( r ) ),
        votingProcedures: b.votingProcedures === undefined ? undefined :
            b.votingProcedures instanceof VotingProcedures ? b.votingProcedures : new VotingProcedures( b.votingProcedures ),
        proposalProcedures: b.proposalProcedures === undefined ? undefined :
            b.proposalProcedures.map( p => p instanceof ProposalProcedure ? p : new ProposalProcedure( p ) ),
        currentTreasuryValue: b.currentTreasuryValue === undefined ? undefined : forceBigUInt( b.currentTreasuryValue ),
        donation: b.donation === undefined ? undefined : forceBigUInt( b.donation ),
        requiredTopLevelGuards: b.requiredTopLevelGuards === undefined || b.requiredTopLevelGuards.length === 0 ? undefined : b.requiredTopLevelGuards,
        directDeposits: b.directDeposits === undefined ? undefined : forceTxWithdrawals( b.directDeposits ),
        accountBalanceIntervals: b.accountBalanceIntervals === undefined ? undefined : normalizeAccountBalanceIntervals( b.accountBalanceIntervals )
    };
}

export function commonBodyJson( b: DijkstraBodyDecodedFields )
{
    return {
        inputs: b.inputs.map( i => i.toJson() ),
        outputs: b.outputs.map( o => o.toJson() ),
        ttl: b.ttl?.toString(),
        certs: b.certs?.map( c => c.toJson() ),
        withdrawals: b.withdrawals?.toJson(),
        auxDataHash: b.auxDataHash?.toString(),
        validityIntervalStart: b.validityIntervalStart?.toString(),
        mint: b.mint?.toJson(),
        scriptDataHash: b.scriptDataHash?.toString(),
        guards: b.guards?.map( g => g instanceof Credential ? g.toJson() : g.toString() ),
        network: b.network,
        refInputs: b.refInputs?.map( i => i.toJson() ),
        votingProcedures: ( b.votingProcedures as any )?.toJSON?.() ?? null,
        proposalProcedures: b.proposalProcedures?.map( p => ( p as any ).toJSON?.() ?? null ),
        currentTreasuryValue: b.currentTreasuryValue?.toString(),
        donation: b.donation?.toString(),
        requiredTopLevelGuards: b.requiredTopLevelGuards?.map( e => ({ credential: e.credential.toJson(), data: e.data === null ? null : Buffer.from( Cbor.encode( dataToCborObj( e.data ) ) ).toString("hex") }) ),
        directDeposits: b.directDeposits?.toJson(),
        accountBalanceIntervals: b.accountBalanceIntervals?.map( e => ({
            rewardAccount: Buffer.from( e.rewardAccount ).toString("hex"),
            interval: e.interval.toJson()
        }) )
    };
}

export function txOutRefAsUTxOFromCborObj( cObj: CborObj ): DijkstraUTxO
{
    return new DijkstraUTxO({
        utxoRef: TxOutRef.fromCborObj( cObj ),
        resolved: DijkstraTxOut.fake
    });
}

/** encodes `guards = nonempty_set<addr_keyhash> / nonempty_oset<credential>` (tag 258) */
export function guardsToCborObj( guards: DijkstraGuards ): CborObj
{
    return setTag( (guards as (PubKeyHash | Credential)[]).map( g => g.toCborObj() ) );
}

/**
 * decodes `guards = nonempty_set<addr_keyhash> / nonempty_oset<credential>`.
 * credentials encode as `[type, hash]`; addr_keyhash as bare bytes. The first
 * element decides (TxBody.hs `decodeGuards`).
 */
export function guardsFromCborObj( cObj: CborObj ): DijkstraGuards
{
    const elems = getCborSet( cObj );
    if( elems.length === 0 ) return [];
    if( elems[0] instanceof CborArray )
    {
        return elems.map( e => {
            if(!( e instanceof CborArray )) throw new InvalidCborFormatError("guards: mixed credential and key hash elements");
            return Credential.fromCborObj( e );
        });
    }
    return elems.map( e => {
        if(!( e instanceof CborBytes && e.bytes.length === 28 )) throw new InvalidCborFormatError("guards: expected a 28-byte key hash");
        return PubKeyHash.fromCborObj( e );
    });
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
        (guards as CanBeHash28[]).map( g => g instanceof PubKeyHash ? g : new PubKeyHash( g as any ) );
}

/** key-hash guards (either encoding) as `PubKeyHash`es */
export function keyHashGuards( guards: DijkstraGuards | undefined ): PubKeyHash[] | undefined
{
    if( guards === undefined ) return undefined;
    const out: PubKeyHash[] = [];
    for( const g of guards as (PubKeyHash | Credential)[] )
    {
        if( g instanceof Credential ) { if( g.type === CredentialType.KeyHash ) out.push( new PubKeyHash( g.hash.toBuffer() ) ); }
        else out.push( g );
    }
    return out;
}

export function scriptGuardsOf( guards: DijkstraGuards | undefined ): Credential[]
{
    if( guards === undefined ) return [];
    return ( guards as (PubKeyHash | Credential)[] ).filter( ( g ): g is Credential => g instanceof Credential && g.type === CredentialType.Script );
}

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
        data: v instanceof CborSimple && v.simple === null ? null : dataFromCborObj( v )
    }));
}
