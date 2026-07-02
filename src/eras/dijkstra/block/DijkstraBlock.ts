import { CborArray, CborBytes, CborSimple, ToCbor, SubCborRef, CborString, Cbor, CborObj, CborUInt, CanBeCborString, forceCborString, isCborObj} from "@harmoniclabs/cbor";
import { IDijkstraHeader, DijkstraHeader, isIDijkstraHeader } from "../header/DijkstraHeader";
import { IDijkstraTxBody, DijkstraTxBody } from "../tx/DijkstraTxBody";
import { IDijkstraTxWitnessSet, DijkstraTxWitnessSet } from "../tx/DijkstraTxWitnessSet";
import { IDijkstraAuxiliaryData, DijkstraAuxiliaryData } from "../tx/DijkstraAuxiliaryData";
import { ToJson } from "../../../utils/ToJson"
import { getSubCborRef } from "../../../utils/getSubCborRef";
import { getCborSet } from "../../../utils/getCborSet";
import { InvalidCborFormatError } from "../../../utils/InvalidCborFormatError"

/*
    CDDL (Dijkstra — CIP-0176 non-segregated block body)

    block = [header, block_body]

    block_body =
      [ invalid_transactions : invalid_transactions/ nil
      , transactions         : [* transaction]
      , peras_certificate    : peras_certificate
      ]

    transaction          = [transaction_body, transaction_witness_set, auxiliary_data/ nil]
    invalid_transactions = nonempty_set<transaction_index>
    peras_certificate    = bytes/ nil

    Unlike Conway, the body/witness/auxiliary-data are no longer carried as parallel
    segregated arrays: each transaction is a self-contained triple. The Conway `is_valid`
    flag is deprecated and is never present on a transaction once it is inside a block.
*/

export interface IDijkstraBlockTransaction {
    body: IDijkstraTxBody;
    witnessSet: IDijkstraTxWitnessSet;
    auxiliaryData?: IDijkstraAuxiliaryData | null;
}

export interface IDijkstraBlock {
    header: IDijkstraHeader;
    /** `nonempty_set<transaction_index>` or absent (encoded as `nil`) */
    invalidTransactions?: (number | bigint)[] | undefined;
    transactions: IDijkstraBlockTransaction[];
    /** `peras_certificate = bytes/ nil` */
    perasCertificate?: Uint8Array | null;
}

export class DijkstraBlockTransaction implements IDijkstraBlockTransaction, ToCbor, ToJson {
    readonly body: DijkstraTxBody;
    readonly witnessSet: DijkstraTxWitnessSet;
    readonly auxiliaryData?: DijkstraAuxiliaryData | null;

    constructor(
        tx: IDijkstraBlockTransaction,
        readonly cborRef: SubCborRef | undefined = undefined
    )
    {
        this.body = tx.body instanceof DijkstraTxBody ? tx.body : new DijkstraTxBody( tx.body );
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
                new CborSimple( null ) :
                this.auxiliaryData.toCborObj()
        ]);
    }

    static fromCborObj( cObj: CborObj ): DijkstraBlockTransaction
    {
        if(!(
            cObj instanceof CborArray &&
            cObj.array.length >= 2
        )) throw new InvalidCborFormatError("DijkstraBlockTransaction must be a CBOR array of [body, witnessSet, auxiliaryData/nil]");

        const [ _body, _wits, _aux ] = cObj.array;

        return new DijkstraBlockTransaction({
            body: DijkstraTxBody.fromCborObj( _body ),
            witnessSet: DijkstraTxWitnessSet.fromCborObj( _wits ),
            auxiliaryData: ( _aux === undefined || _aux instanceof CborSimple ) ? null : DijkstraAuxiliaryData.fromCborObj( _aux )
        });
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

export class DijkstraBlock implements
    IDijkstraBlock, ToCbor, ToJson
{
    readonly header: DijkstraHeader;
    readonly invalidTransactions: (number | bigint)[] | undefined;
    readonly transactions: DijkstraBlockTransaction[];
    readonly perasCertificate: Uint8Array | null;

    constructor(
        block: IDijkstraBlock,
        readonly cborRef: SubCborRef | undefined = undefined
    )
    {
        this.header = new DijkstraHeader( block.header );
        this.transactions = block.transactions.map( tx => new DijkstraBlockTransaction( tx ) );
        // nonempty_set or nil: empty list normalizes to undefined (-> nil)
        this.invalidTransactions = (
            block.invalidTransactions === undefined || block.invalidTransactions.length === 0 ?
            undefined : block.invalidTransactions
        );
        this.perasCertificate = block.perasCertificate ?? null;
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

    toCborObj(): CborArray
    {
        if( this.cborRef instanceof SubCborRef ) return Cbor.parse( this.cborRef.toBuffer() ) as CborArray;

        return new CborArray([
            this.header.toCborObj(),
            // block_body
            new CborArray([
                // invalid_transactions/ nil
                this.invalidTransactions === undefined || this.invalidTransactions.length === 0 ?
                    new CborSimple( null ) :
                    new CborArray( this.invalidTransactions.map( it => new CborUInt( BigInt( it ) ) ) ),
                // transactions
                new CborArray( this.transactions.map( tx => tx.toCborObj() ) ),
                // peras_certificate = bytes/ nil
                this.perasCertificate === null || this.perasCertificate === undefined ?
                    new CborSimple( null ) :
                    new CborBytes( this.perasCertificate )
            ])
        ]);
    }

    static fromCbor( cbor: CanBeCborString ): DijkstraBlock
    {
        const bytes = cbor instanceof Uint8Array ? cbor : forceCborString( cbor );
        return DijkstraBlock.fromCborObj(
            Cbor.parse( bytes, { keepRef: true } ),
            bytes
        );
    }

    static fromCborObj( cObj: CborObj, _originalBytes?: Uint8Array ): DijkstraBlock
    {
        if(!(
            cObj instanceof CborArray &&
            cObj.array.length >= 2
        )) throw new InvalidCborFormatError("Dijkstra Block must be a CBOR array [header, block_body]");

        const [ _header, _blockBody ] = cObj.array;

        if(!(
            _header instanceof CborArray &&
            _header.array.length >= 2
        )) throw new InvalidCborFormatError("Header must be a CBOR array with at least 2 elements");

        const header = DijkstraHeader.fromCborObj( _header );

        if(!(
            _blockBody instanceof CborArray &&
            _blockBody.array.length >= 3
        )) throw new InvalidCborFormatError("block_body must be [invalid_transactions/nil, [* transaction], peras_certificate]");

        const [ _invalidTxs, _transactions, _peras ] = _blockBody.array;

        // invalid_transactions/ nil
        const invalidTransactions = ( _invalidTxs === undefined || _invalidTxs instanceof CborSimple ) ?
            undefined :
            getCborSet( _invalidTxs ).map( ( it, index ) => {
                if(!( it instanceof CborUInt ))
                throw new InvalidCborFormatError(`Invalid transaction_index at invalid_transactions[${index}]`);
                return it.num;
            });

        // transactions
        if(!( _transactions instanceof CborArray ))
        throw new InvalidCborFormatError("block_body.transactions must be a CBOR array");

        const transactions = _transactions.array.map( ( tx, index ) => {
            if(!isCborObj( tx ))
            throw new InvalidCborFormatError(`Invalid CBOR object at transactions[${index}]`);
            return DijkstraBlockTransaction.fromCborObj( tx );
        });

        // peras_certificate = bytes/ nil
        const perasCertificate = _peras instanceof CborBytes ? _peras.bytes : null;

        return new DijkstraBlock({
            header,
            invalidTransactions,
            transactions,
            perasCertificate
        }, getSubCborRef( cObj ));
    }

    toJSON() { return this.toJson(); }
    toJson()
    {
        return {
            header: this.header,
            invalidTransactions: this.invalidTransactions,
            transactions: this.transactions.map( tx => tx.toJson() ),
            perasCertificate: this.perasCertificate === null ? null : Buffer.from( this.perasCertificate ).toString("hex")
        };
    }
}
