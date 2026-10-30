import { ToCbor, Cbor, CborObj, CborString, CanBeCborString, forceCborString, SubCborRef } from "@harmoniclabs/cbor";
import { DijkstraTx, IDijkstraTx } from "../tx/DijkstraTx";
import { DijkstraEbReferences, IEbReference, IEbReferences } from "./DijkstraEbReferences";
import { hash32bytes } from "../../../hashes";
import { parseCborFull } from "../../../utils/strictCbor";
import { getSubCborRef } from "../../../utils/getSubCborRef";

/**
 * A Dijkstra endorser block (the Leios "EB") is a transaction list plus the
 * `eb_references` manifest announced in the previous block's header.
 *
 * On the wire only the references map is an omap; the transaction bodies
 * travel separately (gouroboros `LeiosEndorserBlock`). This class keeps the
 * two together and can check that every reference matches the complete
 * block-format transaction bytes it points at.
 */
export interface IDijkstraEndorserBlock
{
    references: IEbReferences | DijkstraEbReferences;
    transactions?: ( IDijkstraTx | DijkstraTx )[];
}

export class DijkstraEndorserBlock implements ToCbor
{
    readonly references: DijkstraEbReferences;
    readonly transactions: DijkstraTx[];
    readonly cborRef: SubCborRef | undefined;

    constructor( block: IDijkstraEndorserBlock, cborRef?: SubCborRef )
    {
        this.references = block.references instanceof DijkstraEbReferences ?
            block.references :
            new DijkstraEbReferences( block.references );
        this.transactions = ( block.transactions ?? [] ).map( tx =>
            tx instanceof DijkstraTx ? tx : new DijkstraTx( tx )
        );
        this.cborRef = cborRef;
        if( block.transactions !== undefined && this.transactions.length > 0 ) this.validateTransactions();
    }

    get hash(): Uint8Array
    {
        return this.references.hash;
    }

    get size(): number
    {
        return this.references.size;
    }

    get announcement(): { hash: Uint8Array, size: number }
    {
        return this.references.announcement;
    }

    /**
     * `references` must cover exactly the transactions in the EB: same count,
     * every complete block-format transaction hash and byte length present,
     * no extras. Reference order is independent (the manifest is an omap).
     */
    validateTransactions(): void
    {
        if( this.transactions.length !== this.references.count )
            throw new Error(
                "endorser block references cover " + this.references.count +
                " transactions, block carries " + this.transactions.length
            );
        const byHash = new Map<string, number>();
        for( const ref of this.references.references )
            byHash.set( Buffer.from( ref.hash ).toString("hex"), ref.size );
        const seen = new Set<string>();
        for( const tx of this.transactions )
        {
            const hash = tx.blockTransactionHash();
            const size = tx.blockTransactionSize;
            const hex = Buffer.from( hash ).toString("hex");
            if( seen.has( hex ) )
                throw new Error("endorser block contains duplicate transaction " + hex);
            seen.add( hex );
            const refSize = byHash.get( hex );
            if( refSize === undefined )
                throw new Error("endorser block reference missing transaction " + hex);
            if( refSize !== size )
                throw new Error(
                    "endorser block reference size " + refSize +
                    " != transaction bytes " + size + " for " + hex
                );
        }
    }

    toCborObj(): CborObj
    {
        return this.references.toCborObj();
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

    static fromTransactions( transactions: ( IDijkstraTx | DijkstraTx )[] ): DijkstraEndorserBlock
    {
        const txs = transactions.map( tx => tx instanceof DijkstraTx ? tx : new DijkstraTx( tx ) );
        if( txs.length === 0 ) throw new Error("endorser block must reference at least one transaction");
        const references: IEbReference[] = txs.map( tx => ({
            hash: tx.blockTransactionHash(),
            size: tx.blockTransactionSize
        }) );
        references.sort( ( a, b ) => Buffer.compare( Buffer.from( hash32bytes( a.hash ) ), Buffer.from( hash32bytes( b.hash ) ) ) );
        return new DijkstraEndorserBlock(
            { references: new DijkstraEbReferences({ references }), transactions: txs }
        );
    }

    static fromCbor( cStr: CanBeCborString, transactions: ( IDijkstraTx | DijkstraTx )[] = [] ): DijkstraEndorserBlock
    {
        const bytes = cStr instanceof Uint8Array ? cStr : forceCborString( cStr );
        return DijkstraEndorserBlock.fromCborObj(
            parseCborFull( bytes, "DijkstraEndorserBlock" ),
            bytes,
            transactions
        );
    }

    static fromCborObj(
        cObj: CborObj,
        _originalBytes?: Uint8Array,
        transactions: ( IDijkstraTx | DijkstraTx )[] = []
    ): DijkstraEndorserBlock
    {
        return new DijkstraEndorserBlock(
            {
                references: DijkstraEbReferences.fromCborObj( cObj, _originalBytes ),
                transactions
            },
            getSubCborRef( cObj, _originalBytes )
        );
    }
}
