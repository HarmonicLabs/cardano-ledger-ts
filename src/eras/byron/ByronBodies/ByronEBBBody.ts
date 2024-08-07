import { CanBeCborString, Cbor, CborArray, CborBytes, CborObj, CborString, forceCborString } from "@harmoniclabs/cbor";
import { getCborBytesDescriptor } from "../../../utils/getCborBytesDescriptor";
import { isBoolean, isHash32 } from "../../../utils/isThatType";
import { blake2b_256 } from "../../../utils/crypto";
import { IBody } from "../../../interfaces/IBody";
import { roDescr } from "../../../utils/roDescr";
import { StakeholderId } from "../utils/types";
import { U8Arr32 } from "../../../utils/types";

export interface IByronEBBBody extends IBody
{
    readonly attributes: StakeholderId[]
}

export function isIByronEBBBody( stuff: any ): stuff is IByronEBBBody 
{
    return ( 
        isHash32( stuff.hash ) &&
        ( isBoolean( stuff.isEBB ) &&  !stuff.isEBB ) &&
        stuff.attributes.every( isHash32 )
    );
}

export class ByronEBBBody
    implements IByronEBBBody
{
    readonly hash: U8Arr32;
    readonly isEBB: boolean;

    readonly attributes: StakeholderId[];

    readonly cborBytes?: Uint8Array;

    constructor( body: IByronEBBBody )
    {
        if(!( isIByronEBBBody( body ) ))
            throw new Error( "invalid new `IByronEBBBody` data provided" );

        const hash = Uint8Array.prototype.slice.call( body.hash, 0, 32 );
        Object.defineProperties(
            this, {
                hash: {
                    get: () => Uint8Array.prototype.slice.call( hash ),
                    set: (arg) => arg,
                    enumerable: true,
                    configurable: false  
                },
                isEBB: { value: body.isEBB, ...roDescr },
                attributes: { value: body.attributes, ...roDescr },
                cborBytes: getCborBytesDescriptor(),
            }
        );
    }

    toCbor(): CborString
    {
        return new CborString( this.toCborBytes() );
    }

    toCborObj(): CborArray
    {
        return new CborArray(
            this.attributes.map( attribute => new CborBytes( attribute ) )
        );
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

    static fromCbor( cbor: CanBeCborString ): ByronEBBBody
    {
        const bytes = cbor instanceof Uint8Array ? cbor : forceCborString( cbor ).toBuffer();
        return ByronEBBBody.fromCborObj( Cbor.parse( bytes ), bytes );
    }

    static fromCborObj( cbor: CborObj, _originalBytes?: Uint8Array | undefined ): ByronEBBBody
    {
        if(!(
            cbor instanceof CborArray &&
            cbor.array.length >= 1
        )) throw new Error("invalid cbor for ByronEBBBody");

        const cborAttributes = cbor.array;

        if(!(
            cborAttributes instanceof CborArray &&
            cborAttributes.array.every( attribute => attribute instanceof CborBytes )
        )) throw new Error("invalid cbor for ByronEBBBody");

        const originalWerePresent = _originalBytes instanceof Uint8Array; 
        _originalBytes = _originalBytes instanceof Uint8Array ? _originalBytes : Cbor.encode( cbor ).toBuffer();

        const hdr = new ByronEBBBody({
            // byron is a pain
            // the hash is calculated wrapping the header in the second slot of an array
            // the first slot is uint(0) for EBB and uint(1) for normal byron blocks
            hash: blake2b_256( new Uint8Array([ 0x82, 0x00, ..._originalBytes ]) ) as U8Arr32,
            isEBB: false,
            attributes: cborAttributes.map( ( cborData: CborBytes ) => {
                return cborData.bytes as StakeholderId;
            })
        });

        if( originalWerePresent )
        {
            // @ts-ignore Cannot assign to 'cborBytes' because it is a read-only property.
            hdr.cborBytes = _originalBytes;
        }

        return hdr;
    }
}