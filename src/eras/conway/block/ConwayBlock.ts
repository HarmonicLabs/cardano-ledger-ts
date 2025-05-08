import { CborArray, CborBytes, ToCbor, SubCborRef, CborString, Cbor, CborObj, CborMap, CborUInt, CborMapEntry, CanBeCborString, forceCborString, isCborObj } from "@harmoniclabs/cbor";
import { InvalidCborFormatError } from "../../../utils/InvalidCborFormatError";
import { IConwayHeader, ConwayHeader, isIConwayHeader } from "../header/ConwayHeader";
import { IConwayTxWitnessSet, ConwayTxWitnessSet } from "../tx/ConwayTxWitnessSet";
import { IConwayTxBody, ConwayTxBody } from "../tx/ConwayTxBody";
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
      // Validate inputs, e.g., ensure transactionBodies and transactionWitnessSets have same length
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

    toCborObj(): CborObj 
    {
        if( this.cborRef instanceof SubCborRef )return Cbor.parse( this.cborRef.toBuffer() );
        return new CborMap(
            ([

            ].filter( elem => elem !== undefined ) as CborMapEntry[])
        )

    };

    toJSON() 
    { 
        return this.toJson(); 
    }
  
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
    }

  }