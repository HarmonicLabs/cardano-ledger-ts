import { CborArray, CborBytes, ToCbor, SubCborRef, CborString, Cbor, CborObj, CborMap, CborUInt, CborMapEntry, CanBeCborString, forceCborString, isCborObj} from "@harmoniclabs/cbor";
import { IConwayHeader, ConwayHeader, isIConwayHeader } from "../header/ConwayHeader";
import { IConwayTxBody, ConwayTxBody } from "../tx/ConwayTxBody";
import { IConwayTxWitnessSet, ConwayTxWitnessSet } from "../tx/ConwayTxWitnessSet";
import { IConwayAuxiliaryData, ConwayAuxiliaryData } from "../tx/ConwayAuxiliaryData";
import { ToJson } from "../../../utils/ToJson"
import { getSubCborRef } from "../../../utils/getSubCborRef";
import { InvalidCborFormatError } from "../../../utils/InvalidCborFormatError"

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
        const bytes = cbor instanceof Uint8Array ? cbor : forceCborString( cbor ).toBuffer();
        return ConwayBlock.fromCborObj(
            Cbor.parse( bytes, { keepRef: true } ),
            bytes
        );
    };

    static fromCborObj(cObj: CborObj, _originalBytes?: Uint8Array): ConwayBlock {
        if (!(
            cObj instanceof CborArray && 
            cObj.array.length >= 5
        ))throw new InvalidCborFormatError("Conway Block must be a CBOR array with at least 5 elements");
        
        const _header = cObj.array[0];
        const _txBodies = cObj.array[1];
        const _txWitnessSets = cObj.array[2];
        const _auxDataSet = cObj.array[3];
        const _invalidTxs = cObj.array[4];

        // Process header
        if (!(
            _header instanceof CborArray 
            && _header.array.length >= 2
        ))throw new InvalidCborFormatError("Header must be a CBOR array with at least 2 elements");
        
        const header = ConwayHeader.fromCborObj(_header);

        // Process transaction bodies
        if (!(
            _txBodies instanceof CborArray
        ))throw new InvalidCborFormatError("Transaction bodies must be a CBOR array");
        
        const transactionBodies = _txBodies.array.map((tb, index) => {
            if(!
                isCborObj(tb)
            )throw new InvalidCborFormatError(`Invalid CBOR object at transaction_bodies[${index}]`);
            
            return ConwayTxBody.fromCborObj(tb);
        });

        // Process transaction witness sets
        if(!(
            _txWitnessSets instanceof CborArray
        ))throw new InvalidCborFormatError("Transaction witness sets must be a CBOR array");
        
        const transactionWitnessSets = _txWitnessSets.array.map((tws, index) => {
            if (!isCborObj(tws)) {
                throw new InvalidCborFormatError(`Invalid CBOR object at transaction_witness_sets[${index}]`);
            }
            return ConwayTxWitnessSet.fromCborObj(tws);
        });

        // Process auxiliary data set
        if (!(
            _auxDataSet instanceof CborMap
        ))throw new InvalidCborFormatError("Auxiliary data set must be a CBOR map");
        
        const auxiliaryDataSet: { [transactionIndex: number]: ConwayAuxiliaryData } = {};
        for (const entry of _auxDataSet.map) {
            const { k, v } = entry;
            if(!(
                k instanceof CborUInt
            ))throw new InvalidCborFormatError("Invalid key in auxiliary_data_set");
            
            const txIndex = Number(k.num);
            if(!(
                Number.isSafeInteger(txIndex)
            ))throw new InvalidCborFormatError(`Invalid transaction index: ${k.num}`);
            
            if (!(
                isCborObj(v)
            ))throw new InvalidCborFormatError(`Invalid AUX data CBOR object at index ${txIndex}`);
            
            auxiliaryDataSet[txIndex] = ConwayAuxiliaryData.fromCborObj(v);
        }

        // Process invalid transactions
        if (!(
            _invalidTxs instanceof CborArray
        ))throw new InvalidCborFormatError("Invalid transactions must be a CBOR array");
        
        const invalidTransactions = _invalidTxs.array.map((it, index) => {
            if(!(
                it instanceof CborUInt
            ))throw new InvalidCborFormatError(`Invalid type for transaction_index at invalid_transactions[${index}]`);
            
            return it.num;
        });

        const conwayBlock = new ConwayBlock({
            header,
            transactionBodies,
            transactionWitnessSets,
            auxiliaryDataSet,
            invalidTransactions
        }, getSubCborRef(cObj));

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