import { IShelleyTransaction, isIShelleyTransaction, transactionFromCborObj, transactionToCborObj } from "./interfaces/IShelleyTransaction";
import { CborString, Cbor, CborArray, CanBeCborString, forceCborString, CborObj } from "@harmoniclabs/cbor";
import { isIShelleyHeader, ShelleyHeader } from "./header/ShelleyHeader";

export interface IShelleyBlock
{
    header: ShelleyHeader;
    transaction: IShelleyTransaction;
}

export function isIShelleyBlock( stuff: any ): stuff is IShelleyBlock
{
    return (
        isIShelleyHeader( stuff.header ) &&
        isIShelleyTransaction( stuff.transaction )
    );
}

export class ShelleyBlock 
    implements IShelleyBlock
{
    readonly header: ShelleyHeader;
    readonly transaction: IShelleyTransaction;

    constructor( stuff: any )
    {
        if( !isIShelleyBlock( stuff ) ) throw new Error( "invalid `ShelleyBlock` data provided" );

        this.header = stuff.header;
        this.transaction = stuff.transaction;
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
            transactionToCborObj( this.transaction )
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
            cborTransaction 
        ] = cbor.array;

        if (!(
            cborHeader instanceof CborArray &&
            cborTransaction instanceof CborArray
        )) throw new Error( "invalid `ShelleyBlock` cbor" );

        return new ShelleyBlock({
            header: ShelleyHeader.fromCborObj( cborHeader ) as ShelleyHeader,
            transaction: transactionFromCborObj( cborTransaction ) as IShelleyTransaction
        });
    }

}
