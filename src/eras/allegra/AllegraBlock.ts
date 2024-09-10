import { CborObj, CborString, Cbor, CborArray, CanBeCborString, forceCborString, CborMap } from "@harmoniclabs/cbor";
import { TxBody, TxWitnessSet, TxMetadata, isITxBody, isITxWitnessSet, isITxMetadata } from "../../tx";
import { mapToCborObj, mapFromCborObj } from "../../utils/mapFromToCbor";
import { AllegraHeader, isIAllegraHeader } from "./header";
import { TransactionIndexN } from "../../utils/types";
import { isMap } from "util/types";

export interface IAllegraBlock
{
    header: AllegraHeader;
    transactionBodies: TxBody[];
    transactionWitnessSets: TxWitnessSet[];
    transactionMetadatas: Map<TransactionIndexN, TxMetadata>;
}

export function isIAllegraBlock( stuff: any ): stuff is IAllegraBlock
{
    return (
        isIAllegraHeader( stuff.header ) &&
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

export class AllegraBlock 
    implements IAllegraBlock
{
    readonly header: AllegraHeader;
    readonly transactionBodies: TxBody[];
    readonly transactionWitnessSets: TxWitnessSet[];
    readonly transactionMetadatas: Map<TransactionIndexN, TxMetadata>;

    constructor( stuff: any )
    {
        if( !isIAllegraBlock( stuff ) ) throw new Error( "invalid `AllegraBlock` data provided" );

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
        if (!( isIAllegraBlock( this ) )) throw new Error( "invalid `AllegraBlock` data provided" );

        return new CborArray([
            this.header.toCborObj(),
            new CborArray( this.transactionBodies.map(( tBody ) => ( tBody.toCborObj() ))),
            new CborArray( this.transactionWitnessSets.map(( twSet ) => ( twSet.toCborObj() ))),
            mapToCborObj( this.transactionMetadatas )
        ]);
    }

    static fromCbor( cbor: CanBeCborString ): AllegraBlock 
    {
        const bytes = cbor instanceof Uint8Array ? cbor : forceCborString( cbor ).toBuffer();
        return AllegraBlock.fromCborObj( Cbor.parse( bytes ) );
    }
    static fromCborObj( cbor: CborObj ): AllegraBlock 
    {
        if (!(
            cbor instanceof CborArray &&
            cbor.array.length >= 2
        )) throw new Error( "invalid `AllegraBlock` cbor" );

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
        )) throw new Error( "invalid `AllegraBlock` cbor" );

        return new AllegraBlock({
            header: AllegraHeader.fromCborObj( cborHeader ) as AllegraHeader,
            transactionBodies: cborTransactionBodies.array.map(( tCborBody ) => ( TxBody.fromCborObj( tCborBody ) )) as TxBody[],
            transactionWitnessSets: cborTransactionWitnessSets.array.map(( twCborSet ) => ( TxWitnessSet.fromCborObj( twCborSet ) )) as TxWitnessSet[],
            transactionMetadatas: getMapFromCborObj( mapFromCborObj( cborTransactionMetadatas ) ) as Map<TransactionIndexN, TxMetadata>
        });
    }

}
