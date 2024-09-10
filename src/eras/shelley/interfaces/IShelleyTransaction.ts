import { isITxBody, isITxMetadata, isITxWitnessSet, TxBody, TxMetadata, TxWitnessSet } from "../../../tx";
import { mapFromCborObj, mapToCborObj } from "../../../utils/mapFromToCbor";
import { CborArray, CborMap, CborObj } from "@harmoniclabs/cbor";
import { TransactionIndex } from "../utils/types";
import { isMap } from "util/types";

export interface IShelleyTransaction {
    transactionBodies: TxBody[];
    transactionWitnessSets: TxWitnessSet[];
    transactionMetadatas: Map<TransactionIndex, TxMetadata>;
}

export function isIShelleyTransaction( stuff: any ): stuff is IShelleyTransaction
{
    return (
        Array.isArray( stuff.transactionBodies ) &&
        stuff.transactionBodies.every( isITxBody ) &&
        Array.isArray( stuff.transactionWitnessSets ) &&
        stuff.transactionWitnessSets.every( isITxWitnessSet ) &&
        stuff.transactionMetadatas instanceof Map &&
        isMap( stuff.transactionMetadatas ) &&
        Array.from( stuff.transactionMetadatas.values() ).every( isITxMetadata )
    );
}

export function transactionToCborObj( transaction: IShelleyTransaction ): CborArray
{
    return new CborArray([
        new CborArray( transaction.transactionBodies.map(( tBody ) => ( tBody.toCborObj() ))),
        new CborArray( transaction.transactionWitnessSets.map(( twSet ) => ( twSet.toCborObj() ))),
        mapToCborObj( transaction.transactionMetadatas )
    ]);
}

export function transactionFromCborObj( cbor: CborArray ): IShelleyTransaction
{
    if (!(
        cbor instanceof CborArray &&
        cbor.array.length >= 3
    )) throw new Error( "invalid `ShelleyTransaction` cbor" );

    const [ 
        cborTransactionBodies, 
        cborTransactionWitnessSets, 
        cborTransactionMetadatas 
    ] = cbor.array;

    if (!(
        cborTransactionBodies instanceof CborArray &&
        cborTransactionWitnessSets instanceof CborArray &&
        cborTransactionMetadatas instanceof CborMap
    )) throw new Error( "invalid `ShelleyTransaction` cbor" );

    return {
        transactionBodies: cborTransactionBodies.array.map(( tCborBody ) => ( TxBody.fromCborObj( tCborBody ) )) as TxBody[],
        transactionWitnessSets: cborTransactionWitnessSets.array.map(( twCborSet ) => ( TxWitnessSet.fromCborObj( twCborSet ) )) as TxWitnessSet[],
        transactionMetadatas: getMapFromCborObj( mapFromCborObj( cborTransactionMetadatas ) ) as Map<TransactionIndex, TxMetadata>
    };
}

function getMapFromCborObj( mapToBeFixed: Map<TransactionIndex, CborObj> ): Map<TransactionIndex, TxMetadata> {
    const fixedMap = new Map<TransactionIndex, TxMetadata>();

    mapToBeFixed.forEach(( value, key ) => {
        fixedMap.set( key, TxMetadata.fromCborObj( value ) );
    });

    return fixedMap;
}
