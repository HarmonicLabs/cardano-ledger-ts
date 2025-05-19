import { CborArray, CborBytes, ToCbor, SubCborRef, CborString, Cbor, CborObj, CborMap, CborUInt, CborMapEntry, CanBeCborString, forceCborString, isCborObj} from "@harmoniclabs/cbor";
import { toHex } from "@harmoniclabs/uint8array-utils";
import { InvalidCborFormatError } from "../../../utils/InvalidCborFormatError";
import { IConwayHeader, ConwayHeader, isIConwayHeader } from "../header/ConwayHeader";
import { IConwayTxBody, ConwayTxBody } from "../tx/ConwayTxBody";
import { IConwayTxWitnessSet, ConwayTxWitnessSet } from "../tx/ConwayTxWitnessSet";
import { IConwayAuxiliaryData, ConwayAuxiliaryData } from "../tx/ConwayAuxiliaryData";
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

export interface IConwayBlock {
    header: IConwayHeader;
    transactionBodies: IConwayTxBody[];
    transactionWitnessSets: IConwayTxWitnessSet[];
    auxiliaryDataSet: { [transactionIndex: number]: IConwayAuxiliaryData };
    invalidTransactions: (number | bigint)[] | undefined;
  }
export class ConwayBlock implements 
    IConwayBlock, ToCbor, ToJson 
{
    readonly header: ConwayHeader;
    readonly transactionBodies: ConwayTxBody[];
    readonly transactionWitnessSets: ConwayTxWitnessSet[];
    readonly auxiliaryDataSet: { [transactionIndex: number]: ConwayAuxiliaryData };
    readonly invalidTransactions: (number | bigint)[] | undefined;
  
    constructor(
        block: IConwayBlock,
        readonly cborRef: SubCborRef | undefined = undefined
    ) 
    {
        // make transactionBodies and transactionWitnessSets have same length
        if (block.transactionBodies.length !== block.transactionWitnessSets.length) {
            throw new Error("Transaction bodies and witness sets must have the same length");
        }
        this.header = new ConwayHeader(block.header);
        this.transactionBodies = block.transactionBodies.map(tb => new ConwayTxBody(tb));
        this.transactionWitnessSets = block.transactionWitnessSets.map(tws => new ConwayTxWitnessSet(tws));
        this.auxiliaryDataSet = Object.fromEntries(
            Object.entries(block.auxiliaryDataSet).map(([key, value]) => [key, new ConwayAuxiliaryData(value)])
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

    static fromCbor( cbor: CanBeCborString ): ConwayBlock
    {   
        // console.log("ConwayBlock.fromCbor", cbor);
        const bytes = cbor instanceof Uint8Array ? cbor : forceCborString( cbor ).toBuffer();
        return ConwayBlock.fromCborObj(
            Cbor.parse( bytes, { keepRef: true } ),
            bytes
        );
    };

    static fromCborObj( cObj: CborObj, _originalBytes?: Uint8Array ): ConwayBlock 
    {
        // console.log("cObj: ", cObj);
        
        if(!(
            cObj instanceof CborArray 
            // && cObj.map.length >= 20 
        ))throw new InvalidCborFormatError("Conway Block")

        console.log("cObj", cObj.array.length);

        const _block = cObj.array.length > 1 ? cObj.array[1] : cObj.array; //compensate if a block comes with Era in tests
       
        if (!(
            _block instanceof CborArray 
            && _block.array.length >= 5
        ))throw new InvalidCborFormatError("Block must be a CBOR array with at least five elements");

        const _headerCbor = _block.array[0];
        const _txBodiesCbor = _block.array[1];
        const _txWitnessSetsCbor = _block.array[2];
        const _auxDataSetCbor = _block.array[3];
        const _invalidTxCbor = _block.array[4];
               
        // Header
        if (!(
            _headerCbor instanceof CborArray
        ))throw new InvalidCborFormatError("Header CBOR must be a CborArray");
        
        const header = ConwayHeader.fromCborObj(_headerCbor);
        // console.log("header", header);


        // Transaction bodies
        if(!(
            _txBodiesCbor instanceof CborArray
        ))throw new InvalidCborFormatError("transaction_bodies must be a CBOR array");
        
        const transactionBodies = _txBodiesCbor.array.map((tbCbor, index) => {
            return ConwayTxBody.fromCborObj(tbCbor);
        });
        // console.log("transactionBodies", transactionBodies);

        // Transaction witness sets
        if(!(
            _txWitnessSetsCbor instanceof CborArray
        ))throw new InvalidCborFormatError("transaction_witness_sets must be a CBOR array");
        
        const transactionWitnessSets = _txWitnessSetsCbor.array.map((twsCbor, index) => {
            if (!isCborObj(twsCbor)) {
                throw new InvalidCborFormatError(`Invalid CBOR object at transaction_witness_sets[${index}]`);
            }
            return ConwayTxWitnessSet.fromCborObj(twsCbor);
        });
        // console.log("transactionWitnessSets", transactionWitnessSets);

        // Auxiliary data set
        if(!(
            _auxDataSetCbor instanceof CborMap
        ))throw new InvalidCborFormatError("ConwayAuxiliaryData");
        
        const auxiliaryDataSet: { [transactionIndex: number]: ConwayAuxiliaryData } = {};
        for (const entry of _auxDataSetCbor.map) {
            const { k, v } = entry;
            if (!(k instanceof CborUInt)) {
                throw new InvalidCborFormatError("Invalid Keys in auxiliary_data_set");
            }
            const txIndex = Number(k.num);
            if (!Number.isSafeInteger(txIndex)) {
                throw new InvalidCborFormatError(`Transaction index ${k.num}`);
            }
            if (!isCborObj(v)) {
                throw new InvalidCborFormatError(`Invalid AUX data CBOR object ${txIndex}`);
            }
            auxiliaryDataSet[txIndex] = ConwayAuxiliaryData.fromCborObj(v);
           //  console.log("auxiliaryDataSet", auxiliaryDataSet);
        };
        

        // Invalid transactions
        if(!(
            _invalidTxCbor instanceof CborArray
        ))throw new InvalidCborFormatError("invalid_transactions must be a CBOR array");
        
        const invalidTransactions = _invalidTxCbor.array.map((itCbor, index) => {
            if(!(
                itCbor instanceof CborUInt
            ))throw new InvalidCborFormatError(`Invalid type for transaction_index at invalid_transactions[${index}]`);
            
            return itCbor.num;
        });
        // console.log("invalidTransactions", invalidTransactions);

        const conwayBlock = new ConwayBlock({
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