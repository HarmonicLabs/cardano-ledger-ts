import { ToCbor, SubCborRef, CborString, Cbor, CborObj, CborArray, CborSimple, CanBeCborString, forceCborString } from "@harmoniclabs/cbor";
import { blake2b_256 } from "@harmoniclabs/crypto";
import { Credential, PubKeyHash } from "../../../credentials";
import { VotingProcedures, ProposalProcedure } from "../../../governance";
import { AuxiliaryDataHash, ScriptDataHash, Hash32 } from "../../../hashes";
import { TxWithdrawals, Value, NetworkT, Certificate } from "../../common/ledger";
import { getSubCborRef } from "../../../utils/getSubCborRef";
import { InvalidCborFormatError } from "../../../utils/InvalidCborFormatError";
import { ToJson } from "../../../utils/ToJson";
import { DijkstraUTxO } from "./DijkstraUTxO";
import { DijkstraTxOut } from "./DijkstraTxOut";
import { DijkstraTxWitnessSet, IDijkstraTxWitnessSet } from "./DijkstraTxWitnessSet";
import { DijkstraAuxiliaryData, IDijkstraAuxiliaryData } from "./DijkstraAuxiliaryData";
import { DijkstraAccountBalanceIntervalsEntry } from "./DijkstraAccountBalanceInterval";
import {
    DijkstraGuards, IDijkstraCommonBodyFields, IDijkstraRequiredTopLevelGuardsEntry,
    normalizeCommonBodyFields, commonBodyJson, decodeDijkstraBodyFields, encodeDijkstraBodyFields,
    keyHashGuards, scriptGuardsOf, DijkstraBodyDecodedFields
} from "./DijkstraTxBody";

export type { IDijkstraRequiredTopLevelGuardsEntry } from "./DijkstraTxBody";

/*
    Sub-transactions (CIP-118, "nested transactions"), key 23 of a top-level body.

    sub_transactions = nonempty_oset<sub_transaction>
    sub_transaction  = [sub_transaction_body, transaction_witness_set, auxiliary_data/ nil]

    A sub-transaction body has no fee (2), no collateral (13/16/17), no
    sub-transactions (23) and no starting balance intervals (27). Its id is the
    blake2b-256 of the body bytes, like any transaction id.
*/

export type IDijkstraSubTransactionBody = IDijkstraCommonBodyFields;

export class DijkstraSubTransactionBody implements ToCbor, ToJson {
    readonly inputs!: DijkstraUTxO[];
    readonly outputs!: DijkstraTxOut[];
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

    /** sub-transactions pay no fee */
    get fee(): bigint { return BigInt( 0 ); }

    get requiredSigners(): PubKeyHash[] | undefined { return keyHashGuards( this.guards ); }
    get scriptGuards(): Credential[] { return scriptGuardsOf( this.guards ); }

    private _hash: Hash32 | undefined = undefined;
    get hash(): Hash32
    {
        if( this._hash === undefined ) this._hash = new Hash32( new Uint8Array( blake2b_256( this.toCborBytes() ) ) );
        return this._hash;
    }

    constructor(
        body: IDijkstraSubTransactionBody,
        readonly cborRef: SubCborRef | undefined = undefined
    )
    {
        Object.assign( this, normalizeCommonBodyFields( body ) );
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
        return encodeDijkstraBodyFields( this as DijkstraBodyDecodedFields, "sub" );
    }

    static fromCbor( cStr: CanBeCborString ): DijkstraSubTransactionBody
    {
        const bytes = cStr instanceof Uint8Array ? cStr : forceCborString( cStr );
        return DijkstraSubTransactionBody.fromCborObj( Cbor.parse( bytes, { keepRef: true } ), bytes );
    }
    static fromCborObj( cObj: CborObj, _originalBytes?: Uint8Array ): DijkstraSubTransactionBody
    {
        return new DijkstraSubTransactionBody( decodeDijkstraBodyFields( cObj, "sub" ), getSubCborRef( cObj, _originalBytes ) );
    }

    toJSON() { return this.toJson(); }
    toJson() { return commonBodyJson( this ); }
}

export interface IDijkstraSubTransaction {
    body: IDijkstraSubTransactionBody | DijkstraSubTransactionBody;
    witnessSet: IDijkstraTxWitnessSet | DijkstraTxWitnessSet;
    auxiliaryData?: IDijkstraAuxiliaryData | DijkstraAuxiliaryData | null;
}

export class DijkstraSubTransaction implements ToCbor, ToJson {
    readonly body: DijkstraSubTransactionBody;
    readonly witnessSet: DijkstraTxWitnessSet;
    readonly auxiliaryData: DijkstraAuxiliaryData | null;

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

    /** the sub-transaction id (hash of its body) */
    get hash(): Hash32 { return this.body.hash; }

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
    toCborObj(): CborArray
    {
        if( this.cborRef instanceof SubCborRef ) return Cbor.parse( this.cborRef.toBuffer() ) as CborArray;
        return new CborArray([
            this.body.toCborObj(),
            this.witnessSet.toCborObj(),
            this.auxiliaryData === null ? new CborSimple( null ) : this.auxiliaryData.toCborObj()
        ]);
    }

    static fromCbor( cStr: CanBeCborString ): DijkstraSubTransaction
    {
        const bytes = cStr instanceof Uint8Array ? cStr : forceCborString( cStr );
        return DijkstraSubTransaction.fromCborObj( Cbor.parse( bytes, { keepRef: true } ), bytes );
    }
    static fromCborObj( cObj: CborObj, _originalBytes?: Uint8Array ): DijkstraSubTransaction
    {
        if(!( cObj instanceof CborArray && cObj.array.length === 3 ))
        throw new InvalidCborFormatError("DijkstraSubTransaction must be [sub_transaction_body, witness_set, auxiliary_data/nil]");

        const [ _body, _wits, _aux ] = cObj.array;
        return new DijkstraSubTransaction({
            body: DijkstraSubTransactionBody.fromCborObj( _body ),
            witnessSet: DijkstraTxWitnessSet.fromCborObj( _wits ),
            auxiliaryData: ( _aux instanceof CborSimple && _aux.simple === null ) ? null : DijkstraAuxiliaryData.fromCborObj( _aux )
        }, getSubCborRef( cObj, _originalBytes ));
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
