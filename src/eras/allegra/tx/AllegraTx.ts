import { XPrv } from "@harmoniclabs/bip32_ed25519"
import { ToCbor, SubCborRef, CborString, Cbor, CborObj, CborArray, CborSimple, CanBeCborString, forceCborString } from "@harmoniclabs/cbor"
import { signEd25519_sync,  signEd25519 } from "@harmoniclabs/crypto"
import { PrivateKey, CredentialType, PubKeyHash } from "../../../credentials"
import { Signature, Hash32, Hash28 } from "../../../hashes"
import { IAllegraTxBody, IAllegraTxWitnessSet, AllegraAuxiliaryData, AllegraTxBody, AllegraTxWitnessSet, isIAllegraTxBody, isIAllegraTxWitnessSet } from "./"
import { subCborRefOrUndef, getSubCborRef } from "../../../utils/getSubCborRef"
import { InvalidCborFormatError } from "../../../utils/InvalidCborFormatError"
import { ToJson } from "../../../utils/ToJson"
import { VKey } from "../../../tx/TxWitnessSet/VKey"
import { VKeyWitness } from "../../../tx/TxWitnessSet/VKeyWitness/VKeyWitness"

export interface IAllegraTx {
    body: IAllegraTxBody
    witnesses: IAllegraTxWitnessSet
    auxiliaryData?: AllegraAuxiliaryData | null
}

export interface Cip30LikeSignAllegraTx {
    /**
     * 
     * @param {string} txCbor receives the current transaction (`this`) cbor
     * @param {boolean} partial (standard parameter) wheather to throw or not if the wallet can not sign the entire transaction (`true` always passed)
     * @returns {string} the cbor of the `AllegraTxWitnessSet` (!!! NOT the cbor of the signe transaction !!!)
     */
    signTx: ( txCbor: string, partial?: boolean ) => ( string | Promise<string> )
}

export class AllegraTx
    implements IAllegraTx, ToCbor, ToJson
{
    readonly body!: AllegraTxBody;
    readonly witnesses!: AllegraTxWitnessSet;
    readonly auxiliaryData?: AllegraAuxiliaryData | null | undefined;

    clone(): AllegraTx
    {
        return new AllegraTx( this );
    }

    constructor(
        tx: IAllegraTx,
        readonly cborRef: SubCborRef | undefined = undefined
    )
    {
        const {
            body,
            witnesses,
            auxiliaryData
        } = tx;

        if(!(
            body instanceof AllegraTxBody ||
            isIAllegraTxBody( body )
        )) throw new Error("invalid transaction body; must be instance of 'AllegraTxBody'");

        if(!(
            witnesses instanceof AllegraTxWitnessSet ||
            isIAllegraTxWitnessSet( witnesses )
        )) throw new Error("invalid wintesses; must be instance of 'AllegraTxWitnessSet'");
        
        if(!(
            auxiliaryData === undefined ||
            auxiliaryData === null ||
            auxiliaryData instanceof AllegraAuxiliaryData
        )) throw new Error("invalid transaction auxiliray data; must be instance of 'AllegraAuxiliaryData'");

        this.body = new AllegraTxBody( body );
        this.witnesses = new AllegraTxWitnessSet(
            witnesses,
            subCborRefOrUndef( witnesses ),
            getAllRequiredSigners( this.body )
        );
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
    addVKeyWitness( this: AllegraTx, vkeyWit: VKeyWitness ): void
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
    async signWithCip30Wallet( cip30: Cip30LikeSignAllegraTx ): Promise<void>
    {
        const wits = AllegraTxWitnessSet.fromCbor(
            await cip30.signTx(
                // signAllegraTx expects the entire transaction by standard (not only the body ¯\_(ツ)_/¯)
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
            this.auxiliaryData === undefined || this.auxiliaryData === null ?
                new CborSimple( null ) :
                this.auxiliaryData.toCborObj()
        ]);
    }

    static fromCbor( cStr: CanBeCborString ): AllegraTx
    {
        return AllegraTx.fromCborObj( Cbor.parse( forceCborString( cStr ), { keepRef: true }) );
    }
    static fromCborObj( cObj: CborObj ): AllegraTx
    {
        if(!(
            cObj instanceof CborArray
            && cObj.array.length >= 3
        ))throw new InvalidCborFormatError("AllegraTx");
        
        const [ 
            _body, 
            _wits, 
            _aux 
        ] = cObj.array;


        const noAllegraAuxiliaryData = _aux instanceof CborSimple && (_aux.simple === null || _aux.simple === undefined);

        return new AllegraTx({
            body: AllegraTxBody.fromCborObj( _body ),
            witnesses: AllegraTxWitnessSet.fromCborObj( _wits ),
            auxiliaryData: noAllegraAuxiliaryData ? undefined : AllegraAuxiliaryData.fromCborObj( _aux )
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
function getAllRequiredSigners( body: Readonly<AllegraTxBody> ): Hash28[]
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

function getNSignersNeeded( body: Readonly<AllegraTxBody> ): number
{
    const n = getAllRequiredSigners( body ).length
    return n === 0 ? 1 : n;
}