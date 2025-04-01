import { ToCbor, SubCborRef, CborString, Cbor, CborObj, CborMap, CborUInt, CborArray, CborMapEntry, CanBeCborString, forceCborString } from "@harmoniclabs/cbor";
import { CanBeUInteger, canBeUInteger, forceBigUInt } from "@harmoniclabs/cbor/dist/utils/ints";
import { blake2b_256 } from "@harmoniclabs/crypto";
import { hasOwn, isObject } from "@harmoniclabs/obj-utils";
import { Certificate } from "crypto";
import { PubKeyHash } from "../../../credentials";
import { AuxiliaryDataHash, ScriptDataHash, CanBeHash28, Hash32, canBeHash28 } from "../../../hashes";
import { Coin, TxWithdrawals, ITxWithdrawals, LegacyPPUpdateProposal, Value, NetworkT, isCertificate, canBeTxWithdrawals, isLegacyPPUpdateProposal, forceTxWithdrawals, isIValue, LegacyPPUpdateProposalToCborObj, certificateFromCborObj, LegacyPPUpdateProposalFromCborObj, protocolUpdateToJson, certificatesToDepositLovelaces } from "../../../ledger";
import { ShelleyTxOut, isIShelleyTxOut} from "./";
import { UTxO, isIUTxO, TxOutRef  } from "../../common"
import { getCborSet } from "../../../utils/getCborSet";
import { subCborRefOrUndef, getSubCborRef } from "../../../utils/getSubCborRef";
import { maybeBigUint } from "../../../utils/ints";
import { InvalidCborFormatError } from "../../../utils/InvalidCborFormatError";
import { ToJson } from "../../../utils/ToJson";

//** TO DO: Should AUX data here be replaced with the simple TxMetadata.ts from common */
export interface IShelleyTxBody {
    inputs: [ UTxO, ...UTxO[] ],
    outputs: ShelleyTxOut[],
    fee: Coin,
    ttl?: CanBeUInteger,
    certs?: Certificate[],
    withdrawals?: TxWithdrawals | ITxWithdrawals,
    protocolUpdate?: LegacyPPUpdateProposal,
    auxDataHash?: AuxiliaryDataHash, // hash 32
}

export function isIShelleyTxBody( body: Readonly<object> ): body is IShelleyTxBody
{
    if( !isObject( body ) ) return false;

    const fields = Object.keys( body );
    const b = body as IShelleyTxBody;

    return (
        fields.length >= 3 &&
        
        hasOwn( b, "inputs" ) &&
        Array.isArray( b.inputs ) && b.inputs.length > 0 &&
        b.inputs.every( _in => _in instanceof UTxO || isIUTxO( _in ) ) &&
        
        hasOwn( b, "outputs" ) &&
        Array.isArray( b.outputs ) && b.outputs.length > 0 &&
        b.outputs.every( out => out instanceof ShelleyTxOut || isIShelleyTxOut( out ) ) &&

        hasOwn( b, "fee" ) && canBeUInteger( b.fee ) &&

        ( b.ttl === undefined || canBeUInteger( b.ttl ) ) &&
        ( b.certs === undefined || b.certs.every( isCertificate ) ) &&
        ( b.withdrawals === undefined || canBeTxWithdrawals( b.withdrawals ) ) &&
        ( b.protocolUpdate === undefined || isLegacyPPUpdateProposal( b.protocolUpdate ) ) &&
        ( b.auxDataHash === undefined || b.auxDataHash instanceof Hash32 ) &&
    )
}

export class ShelleyTxBody
    implements IShelleyTxBody, ToCbor, ToJson
{
    readonly inputs!: [ UTxO, ...UTxO[] ];
    readonly outputs!: ShelleyTxOut[];
    readonly fee!: bigint;
    readonly ttl?: bigint;
    readonly certs?: Certificate[];
    readonly withdrawals?: TxWithdrawals;
    readonly protocolUpdate?: LegacyPPUpdateProposal; // babbage only; removed in conway
    readonly auxDataHash?: AuxiliaryDataHash; // hash 32

    /**
     * getter
     */
    get hash(): Hash32
    {
        if(
            this._isHashValid === true
            && this._hash !== undefined
            && this._hash instanceof Hash32
        ) return this._hash;

        this._hash = new Hash32(
            new Uint8Array(
                blake2b_256( this.toCbor().toBuffer() )
            )
        );
        this._isHashValid = true;

        return this._hash;
    }

    private _isHashValid = false;
    private _hash: Hash32 | undefined = undefined;

    /**
     * 
     * @param body object describing the transaction
     * @throws only if the the `body` parameter does not respect the `IConwayShelleyTxBody` interface
     *      **DOES NOT THROW** if the transaction is unbalanced; that needs to be checked using `ConwayShelleyTxBody.isValueConserved` static method
     */
    constructor(
        body: IShelleyTxBody,
        readonly cborRef: SubCborRef | undefined = undefined
    )
    {
        const {
            inputs,
            outputs,
            fee,
            ttl,
            certs,
            withdrawals,
            protocolUpdate,
            auxDataHash,
        } = body;

        // -------------------------------------- inputs -------------------------------------- //
        if(!(
            Array.isArray( inputs )  &&
            inputs.length > 0 &&
            inputs.every( isIUTxO )
        )) throw new Error("invalid 'inputs' field");

        this.inputs = inputs.map( i => i instanceof UTxO ? i : new UTxO( i ) ) as [ UTxO, ...UTxO[] ];

        // -------------------------------------- outputs -------------------------------------- //

        if(!(
            Array.isArray( outputs )  &&
            outputs.length > 0 &&
            outputs.every( isIShelleyTxOut )
        )) throw new Error("invald 'outputs' field");

        this.outputs = outputs.map( out => out instanceof ShelleyTxOut ? out : new ShelleyTxOut( out ) );

        // -------------------------------------- fee -------------------------------------- //
        if( !canBeUInteger( fee ) ) throw new Error("invald 'fee' field");

        this.fee = forceBigUInt( fee );

        // -------------------------------------- ttl -------------------------------------- //

        this.ttl = ttl === undefined ? undefined : forceBigUInt( ttl );

        // -------------------------------------- certs -------------------------------------- //
        if(!(
            certs === undefined ||
            (
                Array.isArray( certs )
                && certs.every( isCertificate )
            )
        )) throw new Error("invalid 'certs' field");

        if(
            certs === undefined
            || certs.length <= 0
        ) this.certs = undefined
        else this.certs = certs;

        // -------------------------------------- withdrawals -------------------------------------- //
        
        if(!(
            withdrawals === undefined ||
            canBeTxWithdrawals( withdrawals )
        )) throw new Error("invalid 'withdrawals' field");

        this.withdrawals = (
            withdrawals === undefined ? undefined :
            forceTxWithdrawals( withdrawals )
        ); 
        
        // -------------------------------------- protocolUpdate -------------------------------------- //
        
        if(!(
            protocolUpdate === undefined ||
            isLegacyPPUpdateProposal( protocolUpdate )
        ))

        this.protocolUpdate = protocolUpdate;
        
        // -------------------------------------- auxDataHash -------------------------------------- //
        
        if(!(
            auxDataHash === undefined ||
            auxDataHash instanceof Hash32
        )) throw new Error("invalid 'auxDataHash' field");

        this.auxDataHash = auxDataHash === undefined ? undefined : new AuxiliaryDataHash( auxDataHash );
        
        this.cborRef = cborRef ?? subCborRefOrUndef( body );

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
        if( this.cborRef instanceof SubCborRef )
        {
            // TODO: validate cbor structure
            // we assume correctness here
            return Cbor.parse( this.cborRef.toBuffer() );
        }
        return new CborMap(([
            {
                k: new CborUInt( 0 ),
                v: new CborArray( this.inputs.map( input => input.utxoRef.toCborObj() ) )
            },
            {
                k: new CborUInt( 1 ),
                v: new CborArray( this.outputs.map( out => out.toCborObj() ) )
            },
            {
                k: new CborUInt( 2 ),
                v: new CborUInt( this.fee )
            },
            this.ttl === undefined ? undefined :
            {
                k: new CborUInt( 3 ),
                v: new CborUInt( this.ttl )
            },
            this.certs === undefined || this.certs.length === 0 ? undefined :
            {
                k: new CborUInt( 4 ),
                v: new CborArray( this.certs.map( cert => cert.toCborObj() ) )
            },
            this.withdrawals === undefined ? undefined :
            {
                k: new CborUInt( 5 ),
                v: this.withdrawals.toCborObj()
            },
            this.protocolUpdate === undefined ? undefined :
            {
                k: new CborUInt( 6 ),
                v: LegacyPPUpdateProposalToCborObj( this.protocolUpdate )
            },
            this.auxDataHash === undefined ? undefined :
            {
                k: new CborUInt( 7 ),
                v: this.auxDataHash.toCborObj()
            },
        ].filter( entry => entry !== undefined ) as CborMapEntry[]))
    }

    static fromCbor( cStr: CanBeCborString ): ShelleyTxBody
    {
        return ShelleyTxBody.fromCborObj( Cbor.parse( forceCborString( cStr ), { keepRef: true } ) );
    }
    static fromCborObj( cObj: CborObj ): ShelleyTxBody
    {
        if(!(cObj instanceof CborMap))
        throw new InvalidCborFormatError("ShelleyTxBody")

        let fields: (CborObj | undefined)[] = new Array( 8 ).fill( undefined );

        for( let i = 0; i < 8; i++)
        {
            const { v } = cObj.map.find(
                ({ k }) => k instanceof CborUInt && Number( k.num ) === i
            ) ?? { v: undefined };

            if( v === undefined ) continue;

            fields[i] = v;
        }

        const [
            _ins_,                  // 0 // set
            _outs,                  // 1
            _fee,                   // 2
            _ttl,                   // 3
            _certs_,                // 4
            _withdrawals,           // 5
            _pUp,                   // 6
            _auxDataHash,           // 7
        ] = fields;

        if( _ins_ === undefined || _outs === undefined || _fee === undefined )
        throw new InvalidCborFormatError("ShelleyTxBody");

        if(!(
            // _ins  instanceof CborArray &&
            _outs instanceof CborArray &&
            _fee  instanceof CborUInt
        ))
        throw new InvalidCborFormatError("ShelleyTxBody");

        let ttl: bigint | undefined = undefined;
        if( _ttl !== undefined )
        {
            if(!( _ttl instanceof CborUInt ))
            throw new InvalidCborFormatError("ShelleyTxBody");

            ttl = _ttl.num;
        }
        
        //** TO DO: add votingProcedures, proposalProcedures, currentTreasuryValue, donation */
        return new ShelleyTxBody({
            inputs: getCborSet( _ins_ ).map( txOutRefAsUTxOFromCborObj ) as [UTxO, ...UTxO[]],
            outputs: _outs.array.map( ShelleyTxOut.fromCborObj ),
            fee: _fee.num,
            ttl,
            certs:                      _certs_ !== undefined ? getCborSet( _certs_ ).map( certificateFromCborObj ) : undefined,
            withdrawals:                _withdrawals === undefined ? undefined : TxWithdrawals.fromCborObj( _withdrawals ),
            protocolUpdate:             _pUp === undefined ? undefined : LegacyPPUpdateProposalFromCborObj( _pUp ),
            auxDataHash:                _auxDataHash === undefined ? undefined : AuxiliaryDataHash.fromCborObj( _auxDataHash ),
        }, getSubCborRef( cObj ));
    }

    toJSON() { return this.toJson(); }
    
    //** TO DO: add votingProcedures, proposalProcedures, currentTreasuryValue, donation */
    toJson()
    {
        return {
            inputs: this.inputs.map( i => i.toJson() ),
            outputs: this.outputs.map( o => o.toJson() ),
            fee: this.fee.toString(),
            ttl: this.ttl?.toString(),
            certs: this.certs?.map( c => c.toJson() ),
            withdrawals: this.withdrawals?.toJson() ,
            protocolUpdate: this.protocolUpdate === undefined ? undefined : protocolUpdateToJson( this.protocolUpdate ),
            auxDataHash: this.auxDataHash?.toString() , // hash 32
        }
    }

    /**
     * tests that
     * inputs + withdrawals + refund + mints === outputs + burns + deposit + fee
     * 
     * @todo add mints and burns
     * @deprecated until mints and burns are added
     */
    static isValueConserved( tx: ShelleyTxBody ): boolean
    {
        const {
            inputs,
            withdrawals,
            outputs,
            certs,
            fee
        } = tx;

        // withdrawals
        let tot = withdrawals === undefined ? Value.zero : withdrawals.toTotalWitdrawn();

        // + inputs
        tot = inputs.reduce( (a,b) => Value.add( a, b.resolved.value ) , tot );
        
        // - (outputs + fee)
        // - outputs - fee
        tot = Value.sub(
            tot,
            outputs.reduce( (a,b) => Value.add( a, b.value ), Value.lovelaces( fee ) )
        );

        return Value.isZero(
            certs === undefined ?
            tot :
            Value.add(
                tot,
                Value.lovelaces( certificatesToDepositLovelaces( certs ) )
            )
        );
    }

};


function txOutRefAsUTxOFromCborObj( cObj: CborObj ): UTxO
{
    return new UTxO({
        utxoRef: TxOutRef.fromCborObj( cObj ),
        resolved: ShelleyTxOut.fake
    });
}