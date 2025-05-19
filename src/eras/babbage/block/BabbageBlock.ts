import { CborArray, CborBytes, ToCbor, SubCborRef, CborString, Cbor, CborObj, CborMap, CborUInt, CborMapEntry, CanBeCborString, forceCborString, isCborObj} from "@harmoniclabs/cbor";
import { toHex } from "@harmoniclabs/uint8array-utils";
import { InvalidCborFormatError } from "../../../utils/InvalidCborFormatError";
import { IBabbageHeader, BabbageHeader, isIBabbageHeader } from "../header/BabbageHeader";
import { IBabbageTxBody, BabbageTxBody } from "../tx/BabbageTxBody";
import { IBabbageTxWitnessSet, BabbageTxWitnessSet } from "../tx/BabbageTxWitnessSet";
import { IBabbageAuxiliaryData, BabbageAuxiliaryData } from "../tx/BabbageAuxiliaryData";
import { ToJson } from "../../../utils/ToJson"
import { getSubCborRef } from "../../../utils/getSubCborRef";
import { canBeUInteger, CanBeUInteger } from "@harmoniclabs/cbor/dist/utils/ints";
import { isObject } from "@harmoniclabs/obj-utils";
import { canBeHash32, CanBeHash32, hash32bytes } from "../../../hashes";
import { U8Arr, U8Arr32 } from "../../../utils/U8Arr";
import { forceBigUInt, u32 } from "../../../utils/ints";
/*
    CDDL
    block = [header
        , transaction_bodies : [* transaction_body]
        , transaction_witness_sets : [* transaction_witness_set]
        , auxiliary_data_set : {* transaction_index => auxiliary_data}
        , invalid_transactions : [* transaction_index]]
*/

export interface IBabbageBlock {
    header: IBabbageHeader;
    transactionBodies: IBabbageTxBody[];
    transactionWitnessSets: IBabbageTxWitnessSet[];
    auxiliaryDataSet: { [transactionIndex: number]: IBabbageAuxiliaryData };
    invalidTransactions: (number | bigint)[] | undefined;
  }
export class BabbageBlock implements 
    IBabbageBlock, ToCbor, ToJson 
{
    readonly header: BabbageHeader;
    readonly transactionBodies: BabbageTxBody[];
    readonly transactionWitnessSets: BabbageTxWitnessSet[];
    readonly auxiliaryDataSet: { [transactionIndex: number]: BabbageAuxiliaryData };
    readonly invalidTransactions: (number | bigint)[] | undefined;
  
    constructor(
        block: IBabbageBlock,
        readonly cborRef: SubCborRef | undefined = undefined
    ) 
    {
        // make transactionBodies and transactionWitnessSets have same length
        if (block.transactionBodies.length !== block.transactionWitnessSets.length) {
            throw new Error("Transaction bodies and witness sets must have the same length");
        }
        this.header = new BabbageHeader(block.header);
        this.transactionBodies = block.transactionBodies.map(tb => new BabbageTxBody(tb));
        this.transactionWitnessSets = block.transactionWitnessSets.map(tws => new BabbageTxWitnessSet(tws));
        this.auxiliaryDataSet = Object.fromEntries(
            Object.entries(block.auxiliaryDataSet).map(([key, value]) => [key, new BabbageAuxiliaryData(value)])
        );
        this.invalidTransactions = block.invalidTransactions;
    }

    toCborBytes(): Uint8Array
    {
        if( this.cborRef instanceof SubCborRef ) return this.cborRef.toBuffer();
        return this.toCbor().toBuffer();
    }
  
    toCbor(): CborString
    {
        if( this.cborRef instanceof SubCborRef ) return new CborString( this.cborRef.toBuffer() );
        return Cbor.encode( this.toCborObj() );
    }

    toCborObj(): CborArray {
        if (this.cborRef instanceof SubCborRef) {
            return Cbor.parse(this.cborRef.toBuffer()) as CborArray;
        }
        return new CborArray([
            this.header.toCborObj(),
            new CborArray(this.transactionBodies.map(tb => tb.toCborObj())),
            new CborArray(this.transactionWitnessSets.map(tws => tws.toCborObj())),
            new CborMap(
                Object.entries(this.auxiliaryDataSet).map(([k, v]) => ({
                    k: new CborUInt(BigInt(k)),
                    v: v.toCborObj()
                }))
            ),
            new CborArray(
                (this.invalidTransactions || []).map(it => new CborUInt(BigInt(it)))
            )
        ]);
    };

    static fromCbor( cbor: CanBeCborString ): BabbageBlock
    {   
        // console.log("BabbageBlock.fromCbor", cbor);
        const bytes = cbor instanceof Uint8Array ? cbor : forceCborString( cbor ).toBuffer();
        return BabbageBlock.fromCborObj(
            Cbor.parse( bytes, { keepRef: true } ),
            bytes
        );
    };

    static fromCborObj( cObj: CborObj, _originalBytes?: Uint8Array ): BabbageBlock 
    {
        // console.log("Babbage.fromCborObj", cObj);
        if (!(cObj instanceof CborArray && cObj.array.length >= 5)) {
            throw new InvalidCborFormatError("Babbage Block must be a CBOR array with at least 5 elements");
        }

        const _header = cObj.array[0];
        const _txBodies = cObj.array[1];
        const _txWitnessSets = cObj.array[2];
        const _auxDataSet = cObj.array[3];
        const _invalidTxs = cObj.array[4];
               
        // Header
        if (!(
            _header instanceof CborArray
        ))throw new InvalidCborFormatError("Header CBOR must be a CborArray");
        
        const header = BabbageHeader.fromCborObj(_header);
        // console.log("header", header);


        // Transaction bodies
        if(!(
            _txBodies instanceof CborArray
        ))throw new InvalidCborFormatError("transaction_bodies must be a CBOR array");
        
        const transactionBodies = _txBodies.array.map((tbCbor, index) => {
            return BabbageTxBody.fromCborObj(tbCbor);
        });
        // console.log("transactionBodies", transactionBodies);

        // Transaction witness sets
        if(!(
            _txWitnessSets instanceof CborArray
        ))throw new InvalidCborFormatError("transaction_witness_sets must be a CBOR array");
        
        const transactionWitnessSets = _txWitnessSets.array.map((twsCbor, index) => {
            if (!isCborObj(twsCbor)) {
                throw new InvalidCborFormatError(`Invalid CBOR object at transaction_witness_sets[${index}]`);
            }
            return BabbageTxWitnessSet.fromCborObj(twsCbor);
        });
        // console.log("transactionWitnessSets", transactionWitnessSets);

        // Auxiliary data set
        if(!(
            _auxDataSet instanceof CborMap
        ))throw new InvalidCborFormatError("BabbageAuxiliaryData");
        
        const auxiliaryDataSet: { [transactionIndex: number]: BabbageAuxiliaryData } = {};
        for (const entry of _auxDataSet.map) {
            const { k, v } = entry;
            if(!(
                k instanceof CborUInt
            ))throw new InvalidCborFormatError("Invalid Keys in auxiliary_data_set");
            
            const txIndex = Number(k.num);
            if (!Number.isSafeInteger(txIndex)) {
                throw new InvalidCborFormatError(`Transaction index ${k.num}`);
            }
            if (!isCborObj(v)) {
                throw new InvalidCborFormatError(`Invalid AUX data CBOR object ${txIndex}`);
            }
            auxiliaryDataSet[txIndex] = BabbageAuxiliaryData.fromCborObj(v);
           //  console.log("auxiliaryDataSet", auxiliaryDataSet);
        };
        

        // Invalid transactions
        if(!(
            _invalidTxs instanceof CborArray
        ))throw new InvalidCborFormatError("invalid_transactions must be a CBOR array");
        
        const invalidTransactions = _invalidTxs.array.map((itCbor, index) => {
            if(!(
                itCbor instanceof CborUInt
            ))throw new InvalidCborFormatError(`Invalid type for transaction_index at invalid_transactions[${index}]`);
            
            return itCbor.num;
        });
        // console.log("invalidTransactions", invalidTransactions);

        const conwayBlock = new BabbageBlock({
            header,
            transactionBodies,
            transactionWitnessSets,
            auxiliaryDataSet,
            invalidTransactions
        }, getSubCborRef( cObj ));

        console.log("conwayBlock", conwayBlock );
        return conwayBlock
    }

    toJSON() 
    { 
        return this.toJson(); 
    };
  
    toJson()
    {
        return {
            header: this.header,
            transactionBodies: this.transactionBodies.map( txBody => txBody.toJson() ),
            transactionWitnessSets: this.transactionWitnessSets.map( txWitSet => txWitSet.toJson() ),
            auxiliaryDataSet: Object.entries( this.auxiliaryDataSet ).reduce(
                ( acc, [ k, v ] ) => ({
                    ...acc,
                    [ k ]: v.toJson()
                }),
                {}
            ),
            invalidTransactions: this.invalidTransactions
        };
    };
  }