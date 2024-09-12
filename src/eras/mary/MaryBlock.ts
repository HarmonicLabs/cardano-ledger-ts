import { CborObj, CborString, Cbor, CborArray, CanBeCborString, forceCborString, CborMap } from "@harmoniclabs/cbor";
import { TxBody, TxWitnessSet, AuxiliaryData, isITxBody, isITxWitnessSet, isIAuxiliaryData } from "../../tx";
import { BlockHeaderV1, isIBlockHeaderV1 } from "../../interfaces/IBlockHeaders/IBlockHeaderV1";
import { mapToCborObj, mapFromCborObj } from "../../utils/mapFromToCbor";
import { TransactionIndexN } from "../../utils/types";
import { isMap } from "util/types";

export interface IMaryBlock
{
    header: BlockHeaderV1;
    transactionBodies: TxBody[];    // not totally sure about TxBody.outputs.value -> transaction_output = [address, amount : value]
    transactionWitnessSets: TxWitnessSet[];
    transactionMetadatas: Map<TransactionIndexN, AuxiliaryData>;
}

export function isIMaryBlock( stuff: any ): stuff is IMaryBlock
{
    return (
        isIBlockHeaderV1( stuff.header ) &&
        Array.isArray( stuff.transactionBodies ) &&
        stuff.transactionBodies.every( isITxBody ) &&
        Array.isArray( stuff.transactionWitnessSets ) &&
        stuff.transactionWitnessSets.every( isITxWitnessSet ) &&
        stuff.transactionMetadatas instanceof Map &&
        isMap( stuff.transactionMetadatas ) &&
        Array.from( stuff.transactionMetadatas.values() ).every( isIAuxiliaryData )
    );
}

function getMapFromCborObj( mapToBeFixed: Map<TransactionIndexN, CborObj> ): Map<TransactionIndexN, AuxiliaryData> {
    const fixedMap = new Map<TransactionIndexN, AuxiliaryData>();

    mapToBeFixed.forEach(( value, key ) => {
        fixedMap.set( key, AuxiliaryData.fromCborObj( value ) );
    });

    return fixedMap;
}

export class MaryBlock 
    implements IMaryBlock
{
    readonly header: BlockHeaderV1;
    readonly transactionBodies: TxBody[];
    readonly transactionWitnessSets: TxWitnessSet[];
    readonly transactionMetadatas: Map<TransactionIndexN, AuxiliaryData>;

    constructor( stuff: any )
    {
        if( !isIMaryBlock( stuff ) ) throw new Error( "invalid `MaryBlock` data provided" );

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
        if (!( isIMaryBlock( this ) )) throw new Error( "invalid `MaryBlock` data provided" );

        return new CborArray([
            this.header.toCborObj(),
            new CborArray( this.transactionBodies.map(( tBody ) => ( tBody.toCborObj() ))),
            new CborArray( this.transactionWitnessSets.map(( twSet ) => ( twSet.toCborObj() ))),
            mapToCborObj( this.transactionMetadatas )
        ]);
    }

    static fromCbor( cbor: CanBeCborString ): MaryBlock 
    {
        const bytes = cbor instanceof Uint8Array ? cbor : forceCborString( cbor ).toBuffer();
        return MaryBlock.fromCborObj( Cbor.parse( bytes ) );
    }
    static fromCborObj( cbor: CborObj ): MaryBlock 
    {
        if (!(
            cbor instanceof CborArray &&
            cbor.array.length >= 2
        )) throw new Error( "invalid `MaryBlock` cbor" );

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
        )) throw new Error( "invalid `MaryBlock` cbor" );

        return new MaryBlock({
            header: BlockHeaderV1.fromCborObj( cborHeader ) as BlockHeaderV1,
            transactionBodies: cborTransactionBodies.array.map(( tCborBody ) => ( TxBody.fromCborObj( tCborBody ) )) as TxBody[],
            transactionWitnessSets: cborTransactionWitnessSets.array.map(( twCborSet ) => ( TxWitnessSet.fromCborObj( twCborSet ) )) as TxWitnessSet[],
            transactionMetadatas: getMapFromCborObj( mapFromCborObj( cborTransactionMetadatas ) ) as Map<TransactionIndexN, AuxiliaryData>
        });
    }

}
