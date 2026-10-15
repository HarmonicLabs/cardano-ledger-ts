import { decodeAtVersion } from "../../../utils/strictCbor";
import { XPrv } from "@harmoniclabs/bip32_ed25519"
import { ToCbor, SubCborRef, CborString, Cbor, CborObj, CborArray, CborSimple, CanBeCborString, forceCborString } from "@harmoniclabs/cbor"
import { signEd25519_sync, blake2b_256 } from "@harmoniclabs/crypto"
import { toHex } from "@harmoniclabs/uint8array-utils"
import { PrivateKey, CredentialType, PubKeyHash, Credential } from "../../../credentials"
import { Signature, Hash32, Hash28 } from "../../../hashes"
import { IDijkstraTxBody, IDijkstraTxWitnessSet, DijkstraAuxiliaryData, DijkstraTxBody, DijkstraTxWitnessSet, isIDijkstraTxBody, isIDijkstraTxWitnessSet } from "./"
import { subCborRefOrUndef, getSubCborRef } from "../../../utils/getSubCborRef"
import { InvalidCborFormatError } from "../../../utils/InvalidCborFormatError"
import { ToJson } from "../../../utils/ToJson"
import { VKey } from "../../../tx/TxWitnessSet/VKey"
import { VKeyWitness } from "../../../tx/TxWitnessSet/VKeyWitness/VKeyWitness"

export interface IDijkstraTx {
    body: IDijkstraTxBody
    witnesses: IDijkstraTxWitnessSet
    isScriptValid?: boolean
    auxiliaryData?: DijkstraAuxiliaryData | null
}

export interface Cip30LikeSignDijkstraTx {
    /**
     * 
     * @param {string} txCbor receives the current transaction (`this`) cbor
     * @param {boolean} partial (standard parameter) wheather to throw or not if the wallet can not sign the entire transaction (`true` always passed)
     * @returns {string} the cbor of the `DijkstraTxWitnessSet` (!!! NOT the cbor of the signe transaction !!!)
     */
    signTx: ( txCbor: string, partial?: boolean ) => ( string | Promise<string> )
}

export class DijkstraTx
    implements IDijkstraTx, ToCbor, ToJson
{
    readonly body!: DijkstraTxBody;
    readonly witnesses!: DijkstraTxWitnessSet;
    readonly isScriptValid!: boolean;
    readonly auxiliaryData?: DijkstraAuxiliaryData | null | undefined;

    clone(): DijkstraTx
    {
        return new DijkstraTx( this );
    }

    constructor(
        tx: IDijkstraTx,
        readonly cborRef: SubCborRef | undefined = undefined
    )
    {
        const {
            body,
            witnesses,
            isScriptValid,
            auxiliaryData
        } = tx;

        if(!(
            body instanceof DijkstraTxBody ||
            isIDijkstraTxBody( body )
        )) throw new Error("invalid transaction body; must be instance of 'DijkstraTxBody'");

        if(!(
            witnesses instanceof DijkstraTxWitnessSet ||
            isIDijkstraTxWitnessSet( witnesses )
        )) throw new Error("invalid wintesses; must be instance of 'DijkstraTxWitnessSet'");

        if(!(
            isScriptValid === undefined ||
            typeof isScriptValid === "boolean"
        )) throw new Error("'isScriptValid' ('DijkstraTx' third paramter) must be a boolean");
        
        if(!(
            auxiliaryData === undefined ||
            auxiliaryData === null ||
            auxiliaryData instanceof DijkstraAuxiliaryData
        )) throw new Error("invalid transaction auxiliray data; must be instance of 'DijkstraAuxiliaryData'");

        this.body = new DijkstraTxBody( body );
        this.witnesses = new DijkstraTxWitnessSet(
            witnesses,
            subCborRefOrUndef( witnesses ),
            getAllRequiredSigners( this.body )
        );
        this.isScriptValid = isScriptValid === undefined ? true : isScriptValid;
        this.auxiliaryData = auxiliaryData;

        this.cborRef = cborRef ?? subCborRefOrUndef( tx );
    }

    /**
     * checks that the signer is needed
     * if true adds the witness
     * otherwise nothing happens (the signature is not added)
     * 
     * one might prefer to use this method instead of `signWith`
     * when signature is provided by a third party (example CIP30 wallet)
    **/
    addVKeyWitness( this: DijkstraTx, vkeyWit: VKeyWitness ): void
    {
        this.witnesses.addVKeyWitness( vkeyWit )
    }
    /**
     * checks that the signer is needed
     * if true signs the transaction with the specified key
     * otherwise nothing happens (the signature is not added)
    **/
    signWith( signer: PrivateKey | Uint8Array | XPrv ): void
    {
        if( signer instanceof Uint8Array && signer.length >= 64 )
        {
            signer = XPrv.fromExtended(
                signer.slice( 0, 64 ),
                new Uint8Array( 32 )
            );
        }

        if( signer instanceof XPrv )
        {
            const { pubKey, signature } = signer.sign( this.body.hash.toBuffer() );
            this.addVKeyWitness(
                new VKeyWitness({
                    vkey: new VKey( pubKey ),
                    signature: new Signature( signature )
                })
            );
            return;
        }
        const { pubKey, signature } = signEd25519_sync(
            this.body.hash.toBuffer(),
            signer instanceof Uint8Array ? signer : signer.toBuffer()
        );

        this.addVKeyWitness(
            new VKeyWitness({
                vkey: new VKey( pubKey ),
                signature: new Signature( signature )
            })
        );
    }

    /**
     * signs the transaction using any browser wallet 
     * that follows the [CIP-0030 standard]
     * (https://github.com/cardano-foundation/CIPs/tree/master/CIP-0030#apisigntxtx-cbortransaction-partialsign-bool--false-promisecbortransaction_witness_set)
    **/
    async signWithCip30Wallet( cip30: Cip30LikeSignDijkstraTx ): Promise<void>
    {
        const wits = DijkstraTxWitnessSet.fromCbor(
            await cip30.signTx(
                // signDijkstraTx expects the entire transaction by standard (not only the body ¯\_(ツ)_/¯)
                toHex(this.toCbor()),
                true
            )
        );

        const vkeys = wits.vkeyWitnesses ?? [];
        for( const wit of vkeys ) this.addVKeyWitness( wit );
    }
    /**
     * @returns {boolean}
     *  `true` if all the signers needed
     *  have signed the transaction; `false` otherwise
     * 
     * signers needed are:
     *  - required to spend an utxo
     *  - required by certificate
     *  - required by withdrawals
     *  - additional spefified in the `requiredSigners` field
     */
    get isComplete(): boolean
    {
        return this.witnesses.isComplete
    }
    
    get hash(): Hash32 
    { 
        return this.body.hash; 
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
        if( this.cborRef instanceof SubCborRef ) return Cbor.parse( this.cborRef.toBuffer() );
        // Dijkstra `transaction = [transaction_body, transaction_witness_set, auxiliary_data/ nil]`
        // The Conway `is_valid` flag is deprecated and is NOT emitted: once a transaction is in a
        // block the flag is stripped, so the canonical serialization is the 3-element form.
        return new CborArray([
            this.body.toCborObj(),
            this.witnesses.toCborObj(),
            this.auxiliaryData === undefined || this.auxiliaryData === null ?
                new CborSimple( null ) :
                this.auxiliaryData.toCborObj()
        ]);
    }

    /**
     * Dijkstra `hashTx` (Tx.hs): blake2b-256 of
     * `hash(body) || hash(witness_set) || hash(auxiliary_data)? || cbor(is_valid)`.
     * Unlike the tx id (hash of the body only) it identifies the complete
     * transaction; Leios endorser blocks reference transactions by it.
     * Component bytes come from the original encoding when the tx was decoded.
     */
    hashTx(): Uint8Array
    {
        if( this.cborRef instanceof SubCborRef ) return DijkstraTx.hashTxBytes( this.cborRef.toBuffer(), this.isScriptValid );
        return dijkstraHashTxParts(
            this.body.toCborBytes(),
            this.witnesses.toCborBytes(),
            this.auxiliaryData === undefined || this.auxiliaryData === null ? undefined : this.auxiliaryData.toCborBytes(),
            this.isScriptValid
        );
    }

    /**
     * `hashTx` straight from the bytes of a mempool (`[b, w, aux]`, `[b, w, true, aux]`)
     * or block (`[b, w, aux, bool]`) transaction, without decoding it.
     */
    static hashTxBytes( txBytes: Uint8Array, isValid?: boolean ): Uint8Array
    {
        const parts: Uint8Array[] = ( Cbor.parseLazy( txBytes ) as any ).array;
        if(!( parts.length === 3 || parts.length === 4 )) throw new InvalidCborFormatError("DijkstraTx.hashTxBytes: not a transaction");
        // auxiliary data is never a bool, so a `true` at index 2 means the mempool form
        const mempoolFlag = parts.length === 4 && parts[2].length === 1 && parts[2][0] === 0xf5;
        const auxPart = mempoolFlag ? parts[3] : parts[2];
        const flag = isValid ?? ( parts.length === 4 && !mempoolFlag ? parts[3][0] === 0xf5 : true );
        return dijkstraHashTxParts( parts[0], parts[1], auxPart.length === 1 && auxPart[0] === 0xf6 ? undefined : auxPart, flag );
    }

    /** `block_transaction` form: `[body, witness_set, auxiliary_data/ nil, is_valid]` (ignores any mempool cborRef) */
    toBlockTransactionCborObj(): CborArray
    {
        return new CborArray([
            this.body.toCborObj(),
            this.witnesses.toCborObj(),
            this.auxiliaryData === undefined || this.auxiliaryData === null ?
                new CborSimple( null ) :
                this.auxiliaryData.toCborObj(),
            new CborSimple( this.isScriptValid )
        ]);
    }

    static fromCbor( cStr: CanBeCborString ): DijkstraTx
    {
        const bytes = cStr instanceof Uint8Array ? cStr : forceCborString( cStr );
        return DijkstraTx.fromCborObj( Cbor.parse( bytes, { keepRef: true }), bytes );
    }
    /**
     * `mempool_transaction` (cardano-ledger Dijkstra CDDL):
     *   [body, wits, auxiliary_data/ nil]            (preferred)
     *   [body, wits, true, auxiliary_data/ nil]      (legacy flag, only `true` accepted)
     */
    static fromCborObj( cObj: CborObj, _originalBytes?: Uint8Array ): DijkstraTx
    {
        if(!(
            cObj instanceof CborArray &&
            ( cObj.array.length === 3 || cObj.array.length === 4 )
        ))throw new InvalidCborFormatError("DijkstraTx: expected 3 or 4 elements");

        if( cObj.array.length === 4 && !(
            cObj.array[2] instanceof CborSimple &&
            (cObj.array[2] as CborSimple).simple === true
        )) throw new InvalidCborFormatError("DijkstraTx: a mempool transaction may only carry is_valid = true");

        const _body = cObj.array[0];
        const _wits = cObj.array[1];
        const _aux = cObj.array.length === 4 ? cObj.array[3] : cObj.array[2];

        const noDijkstraAuxiliaryData = _aux instanceof CborSimple && _aux.simple === null;

        return new DijkstraTx({
            body: DijkstraTxBody.fromCborObj( _body ),
            witnesses: DijkstraTxWitnessSet.fromCborObj( _wits ),
            isScriptValid: true,
            auxiliaryData: noDijkstraAuxiliaryData ? undefined : DijkstraAuxiliaryData.fromCborObj( _aux )
        }, getSubCborRef( cObj, _originalBytes ));
    }

    /**
     * `block_transaction = [transaction_body, transaction_witness_set, auxiliary_data/ nil, bool]`:
     * inside a block the producer-set `is_valid` flag trails the author's fields.
     */
    static fromBlockTransactionCborObj( cObj: CborObj, _originalBytes?: Uint8Array ): DijkstraTx
    {
        if(!(
            cObj instanceof CborArray &&
            cObj.array.length === 4 &&
            cObj.array[3] instanceof CborSimple &&
            typeof (cObj.array[3] as CborSimple).simple === "boolean"
        )) throw new InvalidCborFormatError("Dijkstra block_transaction must be [body, witness_set, auxiliary_data/nil, bool]");

        const [ _body, _wits, _aux, _isValid ] = cObj.array;
        const noAux = _aux instanceof CborSimple && _aux.simple === null;

        return new DijkstraTx({
            body: DijkstraTxBody.fromCborObj( _body ),
            witnesses: DijkstraTxWitnessSet.fromCborObj( _wits ),
            isScriptValid: (_isValid as CborSimple).simple as boolean,
            auxiliaryData: noAux ? undefined : DijkstraAuxiliaryData.fromCborObj( _aux )
        }, getSubCborRef( cObj, _originalBytes ));
    }

    toJSON() { 
        return this.toJson(); 
    }
    toJson()
    {
        return {
            body: this.body.toJson(),
            witnesses: this.witnesses.toJson(),
            isScriptValid: this.isScriptValid,
            auxiliaryData: this.auxiliaryData?.toJson()
        };
    }

}

/**
 * signers needed are:
 *  - required to spend an utxo
 *  - required by certificate
 *  - required by withdrawals
 *  - additional specified in the `requiredSigners` field
 */
function getAllRequiredSigners( body: Readonly<DijkstraTxBody> ): Hash28[]
{
    return (
        // required for spending pubKey utxo
        body.inputs.reduce(
            ( acc, _in ) => {

                const { type, hash } =  _in.resolved.address.paymentCreds;

                if( type === CredentialType.KeyHash ) acc.push( new PubKeyHash( hash ) );

                return acc;
            },
            [] as Hash28[]
        )
        // required to sign certificate
        .concat(
            body.certs?.reduce(
                (acc, cert) => acc.concat( cert.getRequiredSigners() ),
                [] as Hash28[]
            ) ?? []
        )
        // requred for withdrawal
        .concat(
            body.withdrawals?.map
            .map( ({ rewardAccount }) => rewardAccount.credentials.clone() )
            ?? []
        )
        // required signers expressed via guards (key 14; replaces required_signers).
        // only key-hash guards (bare hashes, or credentials of KeyHash type) are signers;
        // script-credential guards are guard scripts, not signers.
        .concat(
            ...( body.guards?.flatMap( g =>
                g instanceof Credential ?
                    ( g.type === CredentialType.KeyHash ? [ g.hash.clone() ] : [] ) :
                    [ g.clone() ]
            ) ?? [] )
        )
    // remove duplicates
    ).filter( ( elem, i, thisArr ) => thisArr.indexOf( elem ) === i );
}

function getNSignersNeeded( body: Readonly<DijkstraTxBody> ): number
{
    const n = getAllRequiredSigners( body ).length
    return n === 0 ? 1 : n;
}

/** blake2b-256( hash(body) || hash(wits) || hash(aux)? || cbor(is_valid) ) (Dijkstra Tx.hs `hashTx`) */
export function dijkstraHashTxParts( body: Uint8Array, wits: Uint8Array, aux: Uint8Array | undefined, isValid: boolean ): Uint8Array
{
    const chunks = [ blake2b_256( body ), blake2b_256( wits ) ];
    if( aux !== undefined ) chunks.push( blake2b_256( aux ) );
    chunks.push( new Uint8Array([ isValid ? 0xf5 : 0xf4 ]) );
    const cat = new Uint8Array( chunks.reduce( ( n, c ) => n + c.length, 0 ) );
    let off = 0;
    for( const c of chunks ) { cat.set( c, off ); off += c.length; }
    return blake2b_256( cat );
}

// cardano-ledger decodes the Dijkstra era at protocol version 12
decodeAtVersion( 12, DijkstraTx );
