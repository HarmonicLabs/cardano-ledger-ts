import { CborArray, CborBytes, ToCbor, SubCborRef, CborString, Cbor, CborObj, CborMap, CborUInt, CborMapEntry, CanBeCborString, forceCborString, isCborObj } from "@harmoniclabs/cbor";
import { InvalidCborFormatError } from "../../../utils/InvalidCborFormatError";
import { IConwayHeader, ConwayHeader } from "../header/ConwayHeader";
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

export interface IConwayBlock
{
    header: IConwayHeader;
    transactionBodies: [ IConwayTxBody ];
    transactionWitnessSets: [ IConwayTxWitnessSet ];
    auxiliaryDataSet: { [ txIndex: number ]: IConwayAuxiliaryData };
    invalidTransactions: number[] | CanBeUInteger[] | undefined;
}

export class ConwayBlock 
    implements IConwayBlock, ToCbor, ToJson
{
    header: ConwayHeader;
    transactionBodies: [ ConwayTxBody];
    transactionWitnessSets: [ ConwayTxWitnessSet ];
    auxiliaryDataSet: { [ txIndex: number ]: ConwayAuxiliaryData };
    invalidTransactions: [ txIndex: number ];

    constructor(
        block: IConwayBlock,
        readonly cborRef: SubCborRef | undefined = undefined
    )
    {

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
        return new CborMap([] as CborMapEntry[]);
    }

    static fromCbor( cStr: CanBeCborString ): ConwayBlock
    {
        return ConwayBlock.fromCborObj( Cbor.parse( forceCborString( cStr ), { keepRef: true } ) );
    }


    static fromCborObj( cObj: CborObj ): ConwayBlock
    {

        if(!( 
            cObj instanceof CborMap &&
            cObj.map.length >= 8
        ))throw new InvalidCborFormatError("ConwayTxWitnessSet");

        let fields: (CborObj | undefined)[] = new Array( 8 ).fill( undefined );

        for( let i = 0; i < 8; i++)
        {
            const { v } = cObj.map.find(
                ({ k }) => k instanceof CborUInt && Number( k.num ) === i
            ) ?? { v: undefined };

            if( v === undefined || !isCborObj( v ) ) continue;

            fields[i] = v;
        }

        const [
            _header,
            _txBodies,
            _txWitnessSets,
            _auxDataSet,
            _invalidTransactions
        ] = fields;        

        return new ConwayBlock({
            header: _header,
            transactionBodies: [ ConwayTxBody.fromCborObj( cObj ) ],
            transactionWitnessSets: [ ConwayTxWitnessSet.fromCborObj( cObj ) ],
            auxiliaryDataSet: { [ 0 ]: ConwayAuxiliaryData.fromCborObj( cObj ) },
            invalidTransactions:  _invalidTransactions.array.map( ConwayTxOut.fromCborObj ),
        
        }, getSubCborRef( cObj ));
    }

    toJSON() { 
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