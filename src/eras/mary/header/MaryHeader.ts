import { IMaryHeaderBody, isIMaryHeaderBody, headerBodyToCborObj, headerBodyFromCborObj } from "../interfaces/IMaryHeaderBody";
import { CborString, CborArray, CanBeCborString, forceCborString, Cbor, CborObj, CborBytes } from "@harmoniclabs/cbor";
import { Signature, canBeHash32, Hash32 } from "../../../hashes";
import { SlotNo, U8Arr32 } from "../../../utils/types";
import { isSlotNo } from "../../../utils/isThatType";
import { blake2b_256 } from "@harmoniclabs/crypto";
import { IHeader } from "../../../interfaces";

export interface IMaryHeader extends IHeader {
    readonly headerBody: IMaryHeaderBody;
    readonly bodySignature: Signature;
}

export function isIMaryHeader( stuff: any ): stuff is IMaryHeader 
{
    return (
        canBeHash32( stuff.hash ) &&
        isSlotNo( stuff.slotNo ) &&
        canBeHash32( stuff.prevBlock ) &&
        isIMaryHeaderBody( stuff.headerBody ) &&
        canBeHash32( stuff.bodySignature )
    );
}

export class MaryHeader
    implements IMaryHeader
{
    readonly hash: Hash32;

    // required by common IHeader interface
    readonly slotNo: SlotNo;
    readonly prevBlock: Hash32;

    readonly headerBody: IMaryHeaderBody;
    readonly bodySignature: Signature;

    readonly cborBytes?: U8Arr32;

    constructor( stuff: any )
    {
        if(!( isIMaryHeader( stuff ) )) throw new Error( "invalid new `IMaryHeader` data provided" );

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

    static fromCbor( cbor: CanBeCborString ): MaryHeader
    {
        const bytes = cbor instanceof Uint8Array ? cbor : forceCborString( cbor ).toBuffer();
        return MaryHeader.fromCborObj( Cbor.parse( bytes ), bytes );
    }
    static fromCborObj( cbor: CborObj, _originalBytes?: Uint8Array ): MaryHeader
    {
        if(!(
            cbor instanceof CborArray &&
            cbor.array.length >= 2
        )) throw new Error( "invalid cbor for MaryHeader" );

        const [
            cborHeaderBody,
            cborBodySignature
        ] = cbor.array;

        if(!(
            cborHeaderBody instanceof CborArray &&
            cborBodySignature instanceof CborBytes
        )) throw new Error( "invalid cbor for MaryHeader" );

        const originalWerePresent = _originalBytes instanceof Uint8Array;
        _originalBytes = _originalBytes instanceof Uint8Array ? _originalBytes : Cbor.encode( cbor ).toBuffer();
        
        let newHeader = headerBodyFromCborObj( cborHeaderBody );
        let newSlotNo = newHeader.slotNo;
        let newPrevBlock = newHeader.prevBlock;

        const hdr = new MaryHeader({
            hash: blake2b_256( new Uint8Array([ 0x82, 0x00, ..._originalBytes ]) ) as U8Arr32,
            slotNo: newSlotNo as SlotNo,
            prevBlock: newPrevBlock as Hash32,
            headerBody: newHeader as IMaryHeaderBody,
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