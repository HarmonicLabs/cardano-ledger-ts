import { XPrv } from "@harmoniclabs/bip32_ed25519"
import { ToCbor, SubCborRef, CborString, Cbor, CborObj, CborArray, CborSimple, CanBeCborString, forceCborString } from "@harmoniclabs/cbor"
import { signEd25519_sync } from "@harmoniclabs/crypto"
import { PrivateKey, CredentialType, PubKeyHash } from "../../../credentials"
import { Signature, Hash32, Hash28 } from "../../../hashes"
import { IShelleyTxBody, IShelleyTxWitnessSet, ShelleyTxBody, ShelleyTxWitnessSet, isIShelleyTxBody, isIShelleyTxWitnessSet} from "./";
import { subCborRefOrUndef, getSubCborRef } from "../../../utils/getSubCborRef"
import { InvalidCborFormatError } from "../../../utils/InvalidCborFormatError"
import { ToJson } from "../../../utils/ToJson"
import { VKey } from "../../../tx/TxWitnessSet/VKey"
import { VKeyWitness } from "../../../tx/TxWitnessSet/VKeyWitness/VKeyWitness"
import { TxMetadata } from "../../common"

export interface IShelleyTx {
    body: IShelleyTxBody
    witnesses: IShelleyTxWitnessSet
    metadata?: TxMetadata | null
}

export interface Cip30LikeSignShelleyTx {
    /**
     * 
     * @param {string} txCbor receives the current transaction (`this`) cbor
     * @param {boolean} partial (standard parameter) wheather to throw or not if the wallet can not sign the entire transaction (`true` always passed)
     * @returns {string} the cbor of the `ShelleyTxWitnessSet` (!!! NOT the cbor of the signe transaction !!!)
     */
    signTx: ( txCbor: string, partial?: boolean ) => ( string | Promise<string> )
}

export class ShelleyTx
    implements IShelleyTx, ToCbor, ToJson
{
    readonly body!: ShelleyTxBody;
    readonly witnesses!: ShelleyTxWitnessSet;
    readonly metadata?: TxMetadata | null | undefined;

    clone(): ShelleyTx
    {
        return new ShelleyTx( this );
    }

    constructor(
        tx: IShelleyTx,
        readonly cborRef: SubCborRef | undefined = undefined
    )
    {
        const {
            body,
            witnesses,
            metadata
        } = tx;

        if(!(
            body instanceof ShelleyTxBody ||
            isIShelleyTxBody( body )
        )) throw new Error("invalid transaction body; must be instance of 'ShelleyTxBody'");

        if(!(
            witnesses instanceof ShelleyTxWitnessSet ||
            isIShelleyTxWitnessSet( witnesses )
        )) throw new Error("invalid wintesses; must be instance of 'ShelleyTxWitnessSet'");
        
        if(!(
            metadata === undefined ||
            metadata === null ||
            metadata instanceof TxMetadata
        )) throw new Error("invalid transaction metadata data; must be instance of 'TxMetadata'");

        this.body = new ShelleyTxBody( body );
        this.witnesses = new ShelleyTxWitnessSet(
            witnesses,
            subCborRefOrUndef( witnesses ),
            getAllRequiredSigners( this.body )
        );
        this.metadata = metadata;

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
    addVKeyWitness( this: ShelleyTx, vkeyWit: VKeyWitness ): void
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
    async signWithCip30Wallet( cip30: Cip30LikeSignShelleyTx ): Promise<void>
    {
        const wits = ShelleyTxWitnessSet.fromCbor(
            await cip30.signTx(
                // signShelleyTx expects the entire transaction by standard (not only the body ¯\_(ツ)_/¯)
                this.toCbor().toString(),
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
        if( this.cborRef instanceof SubCborRef ) return Cbor.parse( this.cborRef.toBuffer() );

        return new CborArray([
            this.body.toCborObj(),
            this.witnesses.toCborObj(),
            this.metadata === undefined || this.metadata === null ?
                new CborSimple( null ) :
                this.metadata.toCborObj()
        ]);
    }

    static fromCbor( cStr: CanBeCborString ): ShelleyTx
    {
        return ShelleyTx.fromCborObj( Cbor.parse( forceCborString( cStr ), { keepRef: true }) );
    }
    static fromCborObj( cObj: CborObj ): ShelleyTx
    {
        if(!(
            cObj instanceof CborArray
            && cObj.array.length >= 3
        ))throw new InvalidCborFormatError("ShelleyTx");
        
        const [ 
            _body, 
            _wits, 
            _metadata 
        ] = cObj.array;


        const noMetadataData = _metadata instanceof CborSimple && (_metadata.simple === null || _metadata.simple === undefined);

        return new ShelleyTx({
            body: ShelleyTxBody.fromCborObj( _body ),
            witnesses: ShelleyTxWitnessSet.fromCborObj( _wits ),
            metadata: noMetadataData ? undefined : TxMetadata.fromCborObj( _metadata )
        }, getSubCborRef( cObj ))
    }

    toJSON() { 
        return this.toJson(); 
    }
    toJson()
    {
        return {
            body: this.body.toJson(),
            witnesses: this.witnesses.toJson(),
            metadata: this.metadata?.toJson()
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
function getAllRequiredSigners( body: Readonly<ShelleyTxBody> ): Hash28[]
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
    // remove duplicates
    ).filter( ( elem, i, thisArr ) => thisArr.indexOf( elem ) === i );
}

function getNSignersNeeded( body: Readonly<ShelleyTxBody> ): number
{
    const n = getAllRequiredSigners( body ).length
    return n === 0 ? 1 : n;
}