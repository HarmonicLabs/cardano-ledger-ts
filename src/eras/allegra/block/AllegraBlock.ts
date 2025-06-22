import { CborArray, ToCbor, SubCborRef, CborString, Cbor, CborObj, CborMap, CborUInt, CanBeCborString, forceCborString, isCborObj} from "@harmoniclabs/cbor";
import { InvalidCborFormatError } from "../../../utils/InvalidCborFormatError";
import { IAllegraHeader, AllegraHeader, isIAllegraHeader } from "../header/AllegraHeader";
import { IAllegraTxBody, AllegraTxBody } from "../tx/AllegraTxBody";
import { IAllegraTxWitnessSet, AllegraTxWitnessSet } from "../tx/AllegraTxWitnessSet";
import { IAllegraAuxiliaryData, AllegraAuxiliaryData } from "../tx/AllegraAuxiliaryData";
import { ToJson } from "../../../utils/ToJson"
import { getSubCborRef } from "../../../utils/getSubCborRef";
/*
    CDDL

    block = [header
        , transaction_bodies : [* transaction_body]
        , transaction_witness_sets : [* transaction_witness_set]
        , auxiliary_data_set : {* transaction_index => auxiliary_data}]
*/

export interface IAllegraBlock {
    header: IAllegraHeader;
    transactionBodies: IAllegraTxBody[];
    transactionWitnessSets: IAllegraTxWitnessSet[];
    auxiliaryDataSet: { [transactionIndex: number]: IAllegraAuxiliaryData };

  }
export class AllegraBlock implements 
    IAllegraBlock, ToCbor, ToJson 
{
    readonly header: AllegraHeader;
    readonly transactionBodies: AllegraTxBody[];
    readonly transactionWitnessSets: AllegraTxWitnessSet[];
    readonly auxiliaryDataSet: { [transactionIndex: number]: AllegraAuxiliaryData };
  
    constructor(
        block: IAllegraBlock,
        readonly cborRef: SubCborRef | undefined = undefined
    ) 
    {
        // make transactionBodies and transactionWitnessSets have same length
        if (block.transactionBodies.length !== block.transactionWitnessSets.length) {
            throw new Error("Transaction bodies and witness sets must have the same length");
        }
        this.header = new AllegraHeader(block.header);
        this.transactionBodies = block.transactionBodies.map(tb => new AllegraTxBody(tb));
        this.transactionWitnessSets = block.transactionWitnessSets.map(tws => new AllegraTxWitnessSet(tws));
        this.auxiliaryDataSet = Object.fromEntries(
            Object.entries(block.auxiliaryDataSet).map(([key, value]) => [key, new AllegraAuxiliaryData(value)])
        );
    }

    toCborBytes(): Uint8Array
    {
        if( this.cborRef instanceof SubCborRef ) return this.cborRef.toBuffer();
        return this.toCbor().toBuffer();
    }
  
    toCbor(): CborString
    {
        if( 
            this.cborRef instanceof SubCborRef 
        ) return new CborString( this.cborRef.toBuffer() );

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

    static fromCbor( cbor: CanBeCborString ): AllegraBlock
    {   
        // console.log("AllegraBlock.fromCbor", cbor);
        const bytes = cbor instanceof Uint8Array ? cbor : forceCborString( cbor ).toBuffer();
        return AllegraBlock.fromCborObj(
            Cbor.parse( bytes, { keepRef: true } ),
            bytes
        );
    };

    static fromCborObj(cObj: CborObj, _originalBytes?: Uint8Array): AllegraBlock {
        // console.log("AllegraBlock.fromCborObj", cObj);
        if (!(
            cObj instanceof CborArray 
        ))throw new InvalidCborFormatError("Allegra Block must be a CBOR array with at least 5 elements");
        
        // console.log("cObj Allegra: ", cObj);

        const _header = cObj.array[0];
        const _txBodies = cObj.array[1];
        const _txWitnessSets = cObj.array[2];
        const _auxDataSet = cObj.array[3];

        // console.log("_txWitnessSets Allegra: ", _txWitnessSets);

        // Process header
        if (!(
            _header instanceof CborArray 
            && _header.array.length >= 2
        ))throw new InvalidCborFormatError("Header must be a CBOR array with at least 2 elements");
        
        const header = AllegraHeader.fromCborObj(_header); // Assuming AllegraHeader expects [header_body, body_signature]

        // Process transaction bodies
        if (!(
            _txBodies instanceof CborArray
        ))throw new InvalidCborFormatError("Transaction bodies must be a CBOR array");
        
        const transactionBodies = _txBodies.array.map((tb, index) => {
            if(!
                isCborObj(tb)
            )throw new InvalidCborFormatError(`Invalid CBOR object at transaction_bodies[${index}]`);
            
            return AllegraTxBody.fromCborObj(tb);
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
            return AllegraTxWitnessSet.fromCborObj(tws);
        });

        // Process auxiliary data set
        if (!(
            _auxDataSet instanceof CborMap
        ))throw new InvalidCborFormatError("Auxiliary data set must be a CBOR map");
        
        const auxiliaryDataSet: { [transactionIndex: number]: AllegraAuxiliaryData } = {};
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
            
            auxiliaryDataSet[txIndex] = AllegraAuxiliaryData.fromCborObj(v);
        }

        const conwayBlock = new AllegraBlock({
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