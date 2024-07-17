import { CredentialType, PrivateKey, PubKeyHash } from "../credentials";
import { Hash28, Hash32, Signature } from "../hashes";
import { VKeyWitness, VKey, ITxWitnessSet, TxWitnessSet, isITxWitnessSet } from "./TxWitnessSet";
import { ToCbor, CborString, Cbor, CborObj, CborArray, CborSimple, CanBeCborString, forceCborString } from "@harmoniclabs/cbor";
import { signEd25519 } from "@harmoniclabs/crypto";
import { defineReadOnlyProperty, definePropertyIfNotPresent } from "@harmoniclabs/obj-utils";
import { InvalidCborFormatError } from "../utils/InvalidCborFormatError";
import { ToJson } from "../utils/ToJson";
import { assert } from "../utils/assert";
import { AuxiliaryData } from "./AuxiliaryData";
import { ITxBody, TxBody, isITxBody } from "./body";
import { XPrv } from "@harmoniclabs/bip32_ed25519";

export interface ITx {
    body: ITxBody
    witnesses: ITxWitnessSet
    isScriptValid?: boolean
    auxiliaryData?: AuxiliaryData | null
}

export interface Cip30LikeSignTx {
    /**
     * 
     * @param {string} txCbor receives the current transaction (`this`) cbor
     * @param {boolean} partial (standard parameter) wheather to throw or not if the wallet can not sign the entire transaction (`true` always passed)
     * @returns {string} the cbor of the `TxWitnessSet` (!!! NOT the cbor of the signe transaction !!!)
     */
    signTx: ( txCbor: string, partial?: boolean ) => ( string | Promise<string> )
}

export class Tx
    implements ITx, ToCbor, ToJson
{
    readonly body!: TxBody
    readonly witnesses!: TxWitnessSet
    readonly isScriptValid!: boolean
    readonly auxiliaryData?: AuxiliaryData | null

    /**
     * checks that the signer is needed
     * if true adds the witness
     * otherwise nothing happens (the signature is not added)
     * 
     * one might prefer to use this method instead of `signWith`
     * when signature is provided by a third party (example CIP30 wallet)
    **/
    readonly addVKeyWitness!: ( vkeyWit: VKeyWitness ) => void
    /**
     * checks that the signer is needed
     * if true signs the transaction with the specified key
     * otherwise nothing happens (the signature is not added)
    **/
    readonly signWith!: ( signer: PrivateKey | XPrv ) => void

    /**
     * signs the transaction using any browser wallet 
     * that follows the [CIP-0030 standard]
     * (https://github.com/cardano-foundation/CIPs/tree/master/CIP-0030#apisigntxtx-cbortransaction-partialsign-bool--false-promisecbortransaction_witness_set)
    **/
    readonly signWithCip30Wallet!: ( cip30wallet: Cip30LikeSignTx ) => Promise<void>

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
    readonly isComplete!: boolean
    /**
     * getter
     */
    readonly hash!: Hash32;

    constructor(tx: ITx)
    {
        const {
            body,
            witnesses,
            isScriptValid,
            auxiliaryData
        } = tx;

        assert(
            body instanceof TxBody || isITxBody( body ),
            "invalid transaction body; must be instance of 'TxBody'"
        );
        assert(
            isITxWitnessSet( witnesses ),
            "invalid wintesses; must be instance of 'TxWitnessSet'"
        );
        assert(
            isScriptValid === undefined || typeof isScriptValid === "boolean",
            "'isScriptValid' ('Tx' third paramter) must be a boolean"
        );
        assert(
            auxiliaryData === undefined ||
            auxiliaryData === null ||
            auxiliaryData instanceof AuxiliaryData,
            "invalid transaction auxiliray data; must be instance of 'AuxiliaryData'"
        );

        defineReadOnlyProperty(
            this,
            "body",
            new TxBody( body )
        );
        defineReadOnlyProperty(
            this,
            "witnesses",
            new TxWitnessSet( witnesses, getAllRequiredSigners( this.body ) )
        );
        defineReadOnlyProperty(
            this,
            "isScriptValid",
            isScriptValid === undefined ? true : isScriptValid
        );
        defineReadOnlyProperty(
            this,
            "auxiliaryData",
            auxiliaryData
        );

        definePropertyIfNotPresent(
            this, "hash",
            {
                // needs to be a getter because `this.body.hash` is a getter
                get: (): Hash32 => this.body.hash,
                set: () => {},
                enumerable: true,
                configurable: false
            }
        );

        //*
        defineReadOnlyProperty(
            this, "addVKeyWitness",
            ( vkeyWit: VKeyWitness ) => this.witnesses.addVKeyWitness( vkeyWit )
        );

        defineReadOnlyProperty(
            this, "signWith",
            ( signer: PrivateKey | Uint8Array | XPrv ): void => {

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
                        new VKeyWitness(
                            new VKey( pubKey ),
                            new Signature( signature )
                        )
                    );
                    return;
                }

                const { pubKey, signature } = signEd25519(
                    this.body.hash.toBuffer(),
                    signer instanceof Uint8Array ? signer : signer.toBuffer()
                );

                this.addVKeyWitness(
                    new VKeyWitness(
                        new VKey( pubKey ),
                        new Signature( signature )
                    )
                );
            }
        );

        defineReadOnlyProperty(
            this, "signWithCip30Wallet",
            async ( cip30: Cip30LikeSignTx ): Promise<void> => {
                
                const wits = TxWitnessSet.fromCbor(
                    await cip30.signTx(
                        // signTx expects the entire transaction by standard (not only the body ¯\_(ツ)_/¯)
                        this.toCbor().toString(),
                        true
                    )
                );

                for( const wit of wits.vkeyWitnesses! )
                {
                    this.addVKeyWitness( wit );
                }
            }
        );

        Object.defineProperty(
            this, "isComplete",
            {
                // calls the `TxWitnessSet` getter
                get: () => this.witnesses.isComplete,
                set: () => {},
                configurable: false,
                enumerable: true
            }
        );
        //*/
    }

    toCbor(): CborString
    {
        return Cbor.encode( this.toCborObj() );
    }
    toCborObj(): CborObj
    {
        return new CborArray([
            this.body.toCborObj(),
            this.witnesses.toCborObj(),
            new CborSimple( this.isScriptValid ),
            this.auxiliaryData === undefined || this.auxiliaryData === null ?
                new CborSimple( null ) :
                this.auxiliaryData.toCborObj()
        ])
    }

    static fromCbor( cStr: CanBeCborString ): Tx
    {
        return Tx.fromCborObj( Cbor.parse( forceCborString( cStr ) ) );
    }
    static fromCborObj( cObj: CborObj ): Tx
    {
        if( !(cObj instanceof CborArray) )
        throw new InvalidCborFormatError("Tx");
        
        const [ _body, _wits, _isValid, _aux ] = cObj.array;

        if(!(
            _isValid instanceof CborSimple &&
            typeof (_isValid.simple) === "boolean"
        ))
        throw new InvalidCborFormatError("Tx","isScriptValid is not a boolean")

        const noAuxiliaryData = _aux instanceof CborSimple && (_aux.simple === null || _aux.simple === undefined);

        return new Tx({
            body: TxBody.fromCborObj( _body ),
            witnesses: TxWitnessSet.fromCborObj( _wits ),
            isScriptValid: _isValid.simple,
            auxiliaryData: noAuxiliaryData ? undefined : AuxiliaryData.fromCborObj( _aux )
        })
    }

    toJson()
    {
        return {
            body: this.body.toJson(),
            witnesses: this.witnesses.toJson(),
            isScriptValid: this.isScriptValid,
            auxiliaryData: this.auxiliaryData?.toJson()
        }
    }

}

/**
 * signers needed are:
 *  - required to spend an utxo
 *  - required by certificate
 *  - required by withdrawals
 *  - additional specified in the `requiredSigners` field
 */
export function getAllRequiredSigners( body: Readonly<TxBody> ): Hash28[]
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
        // requred signers explicitly specified by the tx
        .concat(
            ...body.requiredSigners
            ?.map( sig => sig.clone() ) ?? []
        )
    // remove duplicates
    ).filter( ( elem, i, thisArr ) => thisArr.indexOf( elem ) === i );
}

export function getNSignersNeeded( body: Readonly<TxBody> ): number
{
    const n = getAllRequiredSigners( body ).length
    return n === 0 ? 1 : n;
}