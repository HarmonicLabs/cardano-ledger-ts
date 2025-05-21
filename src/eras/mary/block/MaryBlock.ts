import { CborArray, ToCbor, SubCborRef, CborString, Cbor, CborObj, CborMap, CborUInt, CanBeCborString, forceCborString, isCborObj} from "@harmoniclabs/cbor";
import { InvalidCborFormatError } from "../../../utils/InvalidCborFormatError";
import { IMaryHeader, MaryHeader, isIMaryHeader } from "../header/MaryHeader";
import { IMaryTxBody, MaryTxBody } from "../tx/MaryTxBody";
import { IMaryTxWitnessSet, MaryTxWitnessSet } from "../tx/MaryTxWitnessSet";
import { IMaryAuxiliaryData, MaryAuxiliaryData } from "../tx/MaryAuxiliaryData";
import { ToJson } from "../../../utils/ToJson"
import { getSubCborRef } from "../../../utils/getSubCborRef";
/*
    CDDL

    block = [header
        , transaction_bodies : [* transaction_body]
        , transaction_witness_sets : [* transaction_witness_set]
        , auxiliary_data_set : {* transaction_index => auxiliary_data}]
*/

export interface IMaryBlock {
    header: IMaryHeader;
    transactionBodies: IMaryTxBody[];
    transactionWitnessSets: IMaryTxWitnessSet[];
    auxiliaryDataSet: { [transactionIndex: number]: IMaryAuxiliaryData };

  }
export class MaryBlock implements 
    IMaryBlock, ToCbor, ToJson 
{
    readonly header: MaryHeader;
    readonly transactionBodies: MaryTxBody[];
    readonly transactionWitnessSets: MaryTxWitnessSet[];
    readonly auxiliaryDataSet: { [transactionIndex: number]: MaryAuxiliaryData };
  
    constructor(
        block: IMaryBlock,
        readonly cborRef: SubCborRef | undefined = undefined
    ) 
    {
        // make transactionBodies and transactionWitnessSets have same length
        if (block.transactionBodies.length !== block.transactionWitnessSets.length) {
            throw new Error("Transaction bodies and witness sets must have the same length");
        }
        this.header = new MaryHeader(block.header);
        this.transactionBodies = block.transactionBodies.map(tb => new MaryTxBody(tb));
        this.transactionWitnessSets = block.transactionWitnessSets.map(tws => new MaryTxWitnessSet(tws));
        this.auxiliaryDataSet = Object.fromEntries(
            Object.entries(block.auxiliaryDataSet).map(([key, value]) => [key, new MaryAuxiliaryData(value)])
        );
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
        ]);
    };

    static fromCbor( cbor: CanBeCborString ): MaryBlock
    {   
        // console.log("MaryBlock.fromCbor", cbor);
        const bytes = cbor instanceof Uint8Array ? cbor : forceCborString( cbor ).toBuffer();
        return MaryBlock.fromCborObj(
            Cbor.parse( bytes, { keepRef: true } ),
            bytes
        );
    };

    static fromCborObj(cObj: CborObj, _originalBytes?: Uint8Array): MaryBlock {
        // console.log("MaryBlock.fromCborObj", cObj);
        if (!(
            cObj instanceof CborArray 
        ))throw new InvalidCborFormatError("Mary Block must be a CBOR array with at least 5 elements");
        
        // console.log("cObj Mary: ", cObj);

        const _header = cObj.array[0];
        const _txBodies = cObj.array[1];
        const _txWitnessSets = cObj.array[2];
        const _auxDataSet = cObj.array[3];

        // console.log("_txWitnessSets Mary: ", _txWitnessSets);

        // Process header
        if (!(
            _header instanceof CborArray 
            && _header.array.length >= 2
        ))throw new InvalidCborFormatError("Header must be a CBOR array with at least 2 elements");
        
        const header = MaryHeader.fromCborObj(_header); // Assuming MaryHeader expects [header_body, body_signature]

        // Process transaction bodies
        if (!(
            _txBodies instanceof CborArray
        ))throw new InvalidCborFormatError("Transaction bodies must be a CBOR array");
        
        const transactionBodies = _txBodies.array.map((tb, index) => {
            if(!
                isCborObj(tb)
            )throw new InvalidCborFormatError(`Invalid CBOR object at transaction_bodies[${index}]`);
            
            return MaryTxBody.fromCborObj(tb);
        });

        // Process transaction witness sets
        if(!(
            _txWitnessSets instanceof CborArray
        ))throw new InvalidCborFormatError("Transaction witness sets must be a CBOR array");
        
        const transactionWitnessSets = _txWitnessSets.array.map((tws, index) => {
            if (!isCborObj(tws)) {
                throw new InvalidCborFormatError(`Invalid CBOR object at transaction_witness_sets[${index}]`);
            }
            // console.log("tws", tws);
            return MaryTxWitnessSet.fromCborObj(tws);
        });

        // Process auxiliary data set
        if (!(
            _auxDataSet instanceof CborMap
        ))throw new InvalidCborFormatError("Auxiliary data set must be a CBOR map");
        
        const auxiliaryDataSet: { [transactionIndex: number]: MaryAuxiliaryData } = {};
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
            
            auxiliaryDataSet[txIndex] = MaryAuxiliaryData.fromCborObj(v);
        }

        const conwayBlock = new MaryBlock({
            header,
            transactionBodies,
            transactionWitnessSets,
            auxiliaryDataSet
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
                })
            )
        };
    };
  }