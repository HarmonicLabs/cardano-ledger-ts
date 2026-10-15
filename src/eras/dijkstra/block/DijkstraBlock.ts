import { CborArray, CborBytes, CborSimple, ToCbor, SubCborRef, CborString, Cbor, CborObj, CanBeCborString, forceCborString } from "@harmoniclabs/cbor";
import { blake2b_256 } from "@harmoniclabs/crypto";
import { IDijkstraHeader, DijkstraHeader } from "../header/DijkstraHeader";
import { DijkstraTx, IDijkstraTx } from "../tx/DijkstraTx";
import { DijkstraTxBody } from "../tx/DijkstraTxBody";
import { DijkstraTxWitnessSet } from "../tx/DijkstraTxWitnessSet";
import { DijkstraAuxiliaryData } from "../tx/DijkstraAuxiliaryData";
import { ToJson } from "../../../utils/ToJson"
import { getSubCborRef } from "../../../utils/getSubCborRef";
import { InvalidCborFormatError } from "../../../utils/InvalidCborFormatError"

/*
    CDDL (cardano-ledger eras/dijkstra/impl/cddl/data/dijkstra.cddl, tag
    cardano-ledger-dijkstra-0.4.0.0 = master 2026-10-08):

    block = [header, block_body]

    block_body =
      [ transactions      : [* block_transaction]
      , leios_certificate : leios_certificate/ nil
      , peras_certificate : peras_certificate/ nil
      ]

    block_transaction =
      [transaction_body, transaction_witness_set, auxiliary_data/ nil, bool]

    leios_certificate = [ signers : bytes .size (0 .. 8192), signature : bytes .size 48 ]
    peras_certificate = bytes

    Transactions are no longer segregated into parallel arrays. The header's
    block_body_hash is blake2b-256 of the whole block_body encoding
    (BlockBody/Internal.hs `hashBlockBody` = hash of the memoised bytes), and
    block_body_size is the length of those bytes.

    For code written against the segregated Shelley..Conway blocks this class
    also exposes `transactionBodies`, `transactionWitnessSets`,
    `auxiliaryDataSet` and `invalidTransactions` (indices whose is_valid flag
    is false), all derived from `transactions`.
*/

export interface ILeiosCertificate {
    /** bitfield of the signing committee members (up to 8192 bytes) */
    signers: Uint8Array;
    /** BLS signature, 48 bytes */
    signature: Uint8Array;
}

export interface IDijkstraBlock {
    header: IDijkstraHeader | DijkstraHeader;
    transactions: (IDijkstraTx | DijkstraTx)[];
    leiosCertificate?: ILeiosCertificate | null;
    perasCertificate?: Uint8Array | null;
}

export class DijkstraBlock implements ToCbor, ToJson
{
    readonly header: DijkstraHeader;
    readonly transactions: DijkstraTx[];
    readonly leiosCertificate: ILeiosCertificate | null;
    readonly perasCertificate: Uint8Array | null;
    /** sub reference of the `block_body` array (set when decoded) */
    readonly blockBodyCborRef: SubCborRef | undefined;

    constructor(
        block: IDijkstraBlock,
        readonly cborRef: SubCborRef | undefined = undefined,
        blockBodyCborRef: SubCborRef | undefined = undefined
    )
    {
        this.header = block.header instanceof DijkstraHeader ? block.header : new DijkstraHeader( block.header );
        this.transactions = block.transactions.map( tx => tx instanceof DijkstraTx ? tx : new DijkstraTx( tx ) );
        this.leiosCertificate = block.leiosCertificate ?? null;
        this.perasCertificate = block.perasCertificate ?? null;
        if( this.leiosCertificate !== null && !(
            this.leiosCertificate.signers instanceof Uint8Array && this.leiosCertificate.signers.length <= 8192 &&
            this.leiosCertificate.signature instanceof Uint8Array && this.leiosCertificate.signature.length === 48
        )) throw new Error("invalid leios_certificate");
        this.blockBodyCborRef = blockBodyCborRef;
    }

    // ---------------------------------------------------- segregated views (Conway-compatible)

    get transactionBodies(): DijkstraTxBody[] { return this.transactions.map( tx => tx.body ); }
    get transactionWitnessSets(): DijkstraTxWitnessSet[] { return this.transactions.map( tx => tx.witnesses ); }
    get auxiliaryDataSet(): { [transactionIndex: number]: DijkstraAuxiliaryData }
    {
        const out: { [transactionIndex: number]: DijkstraAuxiliaryData } = {};
        this.transactions.forEach( ( tx, i ) => { if( tx.auxiliaryData ) out[i] = tx.auxiliaryData; } );
        return out;
    }
    /** indices of the transactions whose `is_valid` flag is false */
    get invalidTransactions(): number[]
    {
        const out: number[] = [];
        this.transactions.forEach( ( tx, i ) => { if( tx.isScriptValid === false ) out.push( i ); } );
        return out;
    }

    // ---------------------------------------------------- body bytes / hash

    /** the exact `block_body` bytes (re-encoded if the block was built, not decoded) */
    get blockBodyBytes(): Uint8Array
    {
        if( this.blockBodyCborRef instanceof SubCborRef ) return this.blockBodyCborRef.toBuffer();
        return Cbor.encode( this.blockBodyToCborObj() );
    }
    /** blake2b-256 of `block_body`: what the header's block_body_hash must equal */
    computeBlockBodyHash(): Uint8Array { return blake2b_256( this.blockBodyBytes ); }

    blockBodyToCborObj(): CborArray
    {
        if( this.blockBodyCborRef instanceof SubCborRef ) return Cbor.parse( this.blockBodyCborRef.toBuffer() ) as CborArray;
        return new CborArray([
            new CborArray( this.transactions.map( tx =>
                tx.cborRef instanceof SubCborRef && isBlockTxRef( tx.cborRef ) ?
                    Cbor.parse( tx.cborRef.toBuffer() ) :
                    tx.toBlockTransactionCborObj()
            ) ),
            this.leiosCertificate === null ? new CborSimple( null ) : new CborArray([
                new CborBytes( this.leiosCertificate.signers ),
                new CborBytes( this.leiosCertificate.signature )
            ]),
            this.perasCertificate === null ? new CborSimple( null ) : new CborBytes( this.perasCertificate )
        ]);
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
            this.blockBodyToCborObj()
        ]);
    }

    static fromCbor( cbor: CanBeCborString ): DijkstraBlock
    {
        const bytes = cbor instanceof Uint8Array ? cbor : forceCborString( cbor );
        return DijkstraBlock.fromCborObj( Cbor.parse( bytes, { keepRef: true } ), bytes );
    }

    static fromCborObj( cObj: CborObj, _originalBytes?: Uint8Array ): DijkstraBlock
    {
        if(!(
            cObj instanceof CborArray &&
            cObj.array.length === 2
        )) throw new InvalidCborFormatError("Dijkstra block must be [header, block_body]");

        const [ _header, _blockBody ] = cObj.array;

        const header = DijkstraHeader.fromCborObj( _header );

        if(!( _blockBody instanceof CborArray ))
        throw new InvalidCborFormatError("Dijkstra block_body must be an array");
        if( _blockBody.array.length !== 3 )
        throw new InvalidCborFormatError("Dijkstra block_body: expected 3 components, got " + _blockBody.array.length );

        const [ _transactions, _leios, _peras ] = _blockBody.array;

        if(!( _transactions instanceof CborArray ))
        throw new InvalidCborFormatError("Dijkstra block_body.transactions must be an array");

        const transactions = _transactions.array.map( tx => DijkstraTx.fromBlockTransactionCborObj( tx ) );

        let leiosCertificate: ILeiosCertificate | null = null;
        if(!( _leios instanceof CborSimple && _leios.simple === null ))
        {
            if(!(
                _leios instanceof CborArray &&
                _leios.array.length === 2 &&
                _leios.array[0] instanceof CborBytes && _leios.array[0].bytes.length <= 8192 &&
                _leios.array[1] instanceof CborBytes && _leios.array[1].bytes.length === 48
            )) throw new InvalidCborFormatError("Dijkstra leios_certificate must be [bytes .size (0..8192), bytes .size 48] or nil");
            leiosCertificate = { signers: _leios.array[0].bytes, signature: _leios.array[1].bytes };
        }

        let perasCertificate: Uint8Array | null = null;
        if(!( _peras instanceof CborSimple && _peras.simple === null ))
        {
            if(!( _peras instanceof CborBytes )) throw new InvalidCborFormatError("Dijkstra peras_certificate must be bytes or nil");
            perasCertificate = _peras.bytes;
        }

        return new DijkstraBlock(
            { header, transactions, leiosCertificate, perasCertificate },
            getSubCborRef( cObj, _originalBytes ),
            _blockBody.subCborRef instanceof SubCborRef ? _blockBody.subCborRef.clone() : undefined
        );
    }

    toJSON() { return this.toJson(); }
    toJson()
    {
        const hex = ( b: Uint8Array ) => Buffer.from( b ).toString("hex");
        return {
            header: this.header,
            transactions: this.transactions.map( tx => tx.toJson() ),
            invalidTransactions: this.invalidTransactions,
            leiosCertificate: this.leiosCertificate === null ? null : { signers: hex( this.leiosCertificate.signers ), signature: hex( this.leiosCertificate.signature ) },
            perasCertificate: this.perasCertificate === null ? null : hex( this.perasCertificate )
        };
    }
}

/** true if the sub reference holds a 4-element array (the `block_transaction` form) */
function isBlockTxRef( ref: SubCborRef ): boolean
{
    const bytes = ref.toBuffer();
    return bytes.length > 0 && bytes[0] === 0x84;
}
