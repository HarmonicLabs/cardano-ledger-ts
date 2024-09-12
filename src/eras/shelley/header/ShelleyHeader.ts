import { headerBodyFromCborObj, headerBodyToCborObj, IHeaderBodyV1, isIHeaderBodyV1 } from "../../../interfaces/IHeaderBodies/IHeaderBodyV1";
import { CanBeCborString, Cbor, CborArray, CborBytes, CborObj, CborString, forceCborString } from "@harmoniclabs/cbor";
import { canBeHash32, Hash32, Signature } from "../../../hashes";
import { SlotNo, U8Arr32 } from "../../../utils/types";
import { IHeader } from "../../../interfaces/IHeader";
import { isSlotNo } from "../../../utils/isThatType";
import { blake2b_256 } from "../../../utils/crypto";

export interface IShelleyHeader extends IHeader {
    readonly headerBody: IHeaderBodyV1;
    readonly bodySignature: Signature;
}

export function isIShelleyHeader( stuff: any ): stuff is IShelleyHeader 
{
    return (
        canBeHash32( stuff.hash ) &&
        isSlotNo( stuff.slotNo ) &&
        canBeHash32( stuff.prevBlock ) &&
        isIHeaderBodyV1( stuff.headerBody ) &&
        canBeHash32( stuff.bodySignature )
    );
}

export class ShelleyHeader
    implements IShelleyHeader
{
    readonly hash: Hash32;

    // required by common IHeader interface
    readonly slotNo: SlotNo;
    readonly prevBlock: Hash32;

    readonly headerBody: IHeaderBodyV1;
    readonly bodySignature: Signature;

    readonly cborBytes?: U8Arr32;

    constructor( stuff: any )
    {
        if(!( isIShelleyHeader( stuff ) )) throw new Error( "invalid new `IShelleyHeader` data provided" );

        this.hash = stuff.hash;
        this.slotNo = stuff.slotNo;
        this.prevBlock = stuff.prevBlock;
        this.headerBody = stuff.headerBody;
        this.bodySignature = stuff.bodySignature;
    }

    toCbor(): CborString
    {
        return new CborString( this.toCborBytes() );
    }
    toCborObj(): CborArray
    {
        return new CborArray([
            headerBodyToCborObj( this.headerBody ),
            this.bodySignature.toCborObj(),
        ]);
    }
    toCborBytes(): Uint8Array
    {
        if(!( this.cborBytes instanceof Uint8Array ))
        {
            // @ts-ignore Cannot assign to 'cborBytes' because it is a read-only property.
            this.cborBytes = Cbor.encode( this.toCborObj() ).toBuffer();
        }

        return Uint8Array.prototype.slice.call( this.cborBytes );
    }

    static fromCbor( cbor: CanBeCborString ): ShelleyHeader
    {
        const bytes = cbor instanceof Uint8Array ? cbor : forceCborString( cbor ).toBuffer();
        return ShelleyHeader.fromCborObj( Cbor.parse( bytes ), bytes );
    }
    static fromCborObj( cbor: CborObj, _originalBytes?: Uint8Array ): ShelleyHeader
    {
        if(!(
            cbor instanceof CborArray &&
            cbor.array.length >= 2
        )) throw new Error( "invalid cbor for ShelleyHeader" );

        const [
            cborHeaderBody,
            cborBodySignature
        ] = cbor.array;

        if(!(
            cborHeaderBody instanceof CborArray &&
            cborBodySignature instanceof CborBytes
        )) throw new Error( "invalid cbor for ShelleyHeader" );

        const originalWerePresent = _originalBytes instanceof Uint8Array;
        _originalBytes = _originalBytes instanceof Uint8Array ? _originalBytes : Cbor.encode( cbor ).toBuffer();
        
        let newHeader = headerBodyFromCborObj( cborHeaderBody );
        let newSlotNo = newHeader.slotNo;
        let newPrevBlock = newHeader.prevBlock;

        const hdr = new ShelleyHeader({
            hash: blake2b_256( new Uint8Array([ 0x82, 0x00, ..._originalBytes ]) ) as U8Arr32,
            slotNo: newSlotNo as SlotNo,
            prevBlock: newPrevBlock as Hash32,
            headerBody: newHeader as IHeaderBodyV1,
            bodySignature: Signature.fromCborObj( cborBodySignature ) as Signature,
        });

        if( originalWerePresent )
        {
            // @ts-ignore Cannot assign to 'cborBytes' because it is a read-only property.
            hdr.cborBytes = _originalBytes;
        }

        return hdr;
    }

}
