import { CborObj, CborString, Cbor, CborArray, CanBeCborString, forceCborString, CborMap, CborUInt } from "@harmoniclabs/cbor";
import { TxBody, TxWitnessSet, AuxiliaryData, isITxBody, isITxWitnessSet, isIAuxiliaryData } from "../../tx";
import { mapToCborObj, mapFromCborObj } from "../../utils/mapFromToCbor";
import { isTransactionIndexN } from "../../utils/isThatType";
import { AlonzoHeader, isIAlonzoHeader } from "./header";
import { TransactionIndexN } from "../../utils/types";
import { isMap } from "util/types";

export interface IAlonzoBlock
{
    header: AlonzoHeader;
    transactionBodies: TxBody[];    // not totally sure about TxBody.outputs.value -> transaction_output = [address, amount : value]
    transactionWitnessSets: TxWitnessSet[];
    transactionMetadatas: Map<TransactionIndexN, AuxiliaryData>;
    invalidTransactions: TransactionIndexN[];
}

export function isIAlonzoBlock( stuff: any ): stuff is IAlonzoBlock
{
    return (
        isIAlonzoHeader( stuff.header ) &&
        Array.isArray( stuff.transactionBodies ) &&
        stuff.transactionBodies.every( isITxBody ) &&
        Array.isArray( stuff.transactionWitnessSets ) &&
        stuff.transactionWitnessSets.every( isITxWitnessSet ) &&
        stuff.transactionMetadatas instanceof Map &&
        isMap( stuff.transactionMetadatas ) &&
        Array.from( stuff.transactionMetadatas.values() ).every( isIAuxiliaryData ) &&
        Array.isArray( stuff.invalidTransactions ) &&
        stuff.invalidTransactions.every( isTransactionIndexN )
    );
}

function getMapFromCborObj( mapToBeFixed: Map<TransactionIndexN, CborObj> ): Map<TransactionIndexN, AuxiliaryData> {
    const fixedMap = new Map<TransactionIndexN, AuxiliaryData>();

    mapToBeFixed.forEach(( value, key ) => {
        fixedMap.set( key, AuxiliaryData.fromCborObj( value ) );
    });

    return fixedMap;
}

export class AlonzoBlock 
    implements IAlonzoBlock
{
    readonly header: AlonzoHeader;
    readonly transactionBodies: TxBody[];
    readonly transactionWitnessSets: TxWitnessSet[];
    readonly transactionMetadatas: Map<TransactionIndexN, AuxiliaryData>;
    readonly invalidTransactions: TransactionIndexN[];

    constructor( stuff: any )
    {
        if( !isIAlonzoBlock( stuff ) ) throw new Error( "invalid `AlonzoBlock` data provided" );

        this.header = stuff.header;
        this.transactionBodies = stuff.transactionBodies;
        this.transactionWitnessSets = stuff.transactionWitnessSets;
        this.transactionMetadatas = stuff.transactionMetadatas;
        this.invalidTransactions = stuff.invalidTransactions;
    }

    toCborBytes(): Uint8Array 
    {
        return this.toCbor().toBuffer();
    }
    toCbor(): CborString 
    {
        return Cbor.encode( this.toCborObj() );
    }
    toCborObj(): CborArray 
    {
        if (!( isIAlonzoBlock( this ) )) throw new Error( "invalid `AlonzoBlock` data provided" );

        return new CborArray([
            this.header.toCborObj(),
            new CborArray( this.transactionBodies.map(( tBody ) => ( tBody.toCborObj() ))),
            new CborArray( this.transactionWitnessSets.map(( twSet ) => ( twSet.toCborObj() ))),
            mapToCborObj( this.transactionMetadatas ),
            new CborArray( this.invalidTransactions.map(( iTx ) => ( new CborUInt( iTx ) )) )
        ]);
    }

    static fromCbor( cbor: CanBeCborString ): AlonzoBlock 
    {
        const bytes = cbor instanceof Uint8Array ? cbor : forceCborString( cbor ).toBuffer();
        return AlonzoBlock.fromCborObj( Cbor.parse( bytes ) );
    }
    static fromCborObj( cbor: CborObj ): AlonzoBlock 
    {
        if (!(
            cbor instanceof CborArray &&
            cbor.array.length >= 2
        )) throw new Error( "invalid `AlonzoBlock` cbor" );

        const [ 
            cborHeader, 
            cborTransactionBodies, 
            cborTransactionWitnessSets, 
            cborTransactionMetadatas,
            cborInvalidTransactions
        ] = cbor.array;

        if (!(
            cborHeader instanceof CborArray &&
            cborTransactionBodies instanceof CborArray &&
            cborTransactionWitnessSets instanceof CborArray &&
            cborTransactionMetadatas instanceof CborMap &&
            cborInvalidTransactions instanceof CborArray &&
            cborInvalidTransactions.array.every(( iTx ) => ( iTx instanceof CborUInt ))
        )) throw new Error( "invalid `AlonzoBlock` cbor" );

        return new AlonzoBlock({
            header: AlonzoHeader.fromCborObj( cborHeader ) as AlonzoHeader,
            transactionBodies: cborTransactionBodies.array.map(( tCborBody ) => ( TxBody.fromCborObj( tCborBody ) )) as TxBody[],
            transactionWitnessSets: cborTransactionWitnessSets.array.map(( twCborSet ) => ( TxWitnessSet.fromCborObj( twCborSet ) )) as TxWitnessSet[],
            transactionMetadatas: getMapFromCborObj( mapFromCborObj( cborTransactionMetadatas ) ) as Map<TransactionIndexN, AuxiliaryData>,
            invalidTransactions: cborInvalidTransactions.array.map(( iTx ) => ( Number( iTx.num ) )) as TransactionIndexN[]
        });
    }

}
