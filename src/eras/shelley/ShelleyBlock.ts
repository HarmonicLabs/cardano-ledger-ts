import { CborString, Cbor, CborArray, CanBeCborString, forceCborString, CborObj, CborMap } from "@harmoniclabs/cbor";
import { TxBody, TxWitnessSet, TxMetadata, isITxBody, isITxWitnessSet, isITxMetadata } from "../../tx";
import { isIShelleyHeader, ShelleyHeader } from "./header/ShelleyHeader";
import { mapToCborObj, mapFromCborObj } from "../../utils/mapFromToCbor";
import { TransactionIndexN } from "./utils/types";
import { isMap } from "util/types";

export interface IShelleyBlock
{
    header: ShelleyHeader;
    transactionBodies: TxBody[];
    transactionWitnessSets: TxWitnessSet[];
    transactionMetadatas: Map<TransactionIndexN, TxMetadata>;
}

export function isIShelleyBlock( stuff: any ): stuff is IShelleyBlock
{
    return (
        isIShelleyHeader( stuff.header ) &&
        Array.isArray( stuff.transactionBodies ) &&
        stuff.transactionBodies.every( isITxBody ) &&
        Array.isArray( stuff.transactionWitnessSets ) &&
        stuff.transactionWitnessSets.every( isITxWitnessSet ) &&
        stuff.transactionMetadatas instanceof Map &&
        isMap( stuff.transactionMetadatas ) &&
        Array.from( stuff.transactionMetadatas.values() ).every( isITxMetadata )
    );
}

function getMapFromCborObj( mapToBeFixed: Map<TransactionIndexN, CborObj> ): Map<TransactionIndexN, TxMetadata> {
    const fixedMap = new Map<TransactionIndexN, TxMetadata>();

    mapToBeFixed.forEach(( value, key ) => {
        fixedMap.set( key, TxMetadata.fromCborObj( value ) );
    });

    return fixedMap;
}

export class ShelleyBlock 
    implements IShelleyBlock
{
    readonly header: ShelleyHeader;
    readonly transactionBodies: TxBody[];
    readonly transactionWitnessSets: TxWitnessSet[];
    readonly transactionMetadatas: Map<TransactionIndexN, TxMetadata>;

    constructor( stuff: any )
    {
        if( !isIShelleyBlock( stuff ) ) throw new Error( "invalid `ShelleyBlock` data provided" );

        this.header = stuff.header;
        this.transactionBodies = stuff.transactionBodies;
        this.transactionWitnessSets = stuff.transactionWitnessSets;
        this.transactionMetadatas = stuff.transactionMetadatas;
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
        if (!( isIShelleyBlock( this ) )) throw new Error( "invalid `ShelleyBlock` data provided" );

        return new CborArray([
            this.header.toCborObj(),
            new CborArray( this.transactionBodies.map(( tBody ) => ( tBody.toCborObj() ))),
            new CborArray( this.transactionWitnessSets.map(( twSet ) => ( twSet.toCborObj() ))),
            mapToCborObj( this.transactionMetadatas )
        ]);
    }

    static fromCbor( cbor: CanBeCborString ): ShelleyBlock 
    {
        const bytes = cbor instanceof Uint8Array ? cbor : forceCborString( cbor ).toBuffer();
        return ShelleyBlock.fromCborObj( Cbor.parse( bytes ) );
    }
    static fromCborObj( cbor: CborObj ): ShelleyBlock 
    {
        if (!(
            cbor instanceof CborArray &&
            cbor.array.length >= 2
        )) throw new Error( "invalid `ShelleyBlock` cbor" );

        const [ 
            cborHeader, 
            cborTransactionBodies, 
            cborTransactionWitnessSets, 
            cborTransactionMetadatas 
        ] = cbor.array;

        if (!(
            cborHeader instanceof CborArray &&
            cborTransactionBodies instanceof CborArray &&
            cborTransactionWitnessSets instanceof CborArray &&
            cborTransactionMetadatas instanceof CborMap
        )) throw new Error( "invalid `ShelleyBlock` cbor" );

        return new ShelleyBlock({
            header: ShelleyHeader.fromCborObj( cborHeader ) as ShelleyHeader,
            transactionBodies: cborTransactionBodies.array.map(( tCborBody ) => ( TxBody.fromCborObj( tCborBody ) )) as TxBody[],
            transactionWitnessSets: cborTransactionWitnessSets.array.map(( twCborSet ) => ( TxWitnessSet.fromCborObj( twCborSet ) )) as TxWitnessSet[],
            transactionMetadatas: getMapFromCborObj( mapFromCborObj( cborTransactionMetadatas ) ) as Map<TransactionIndexN, TxMetadata>
        });
    }

}
