import { CborString, Cbor, CborArray, CanBeCborString, forceCborString, CborObj, CborMap } from "@harmoniclabs/cbor";
import { attributesMapToCborObj } from "../utils/objToCbor";
import { cborMapToAttributes } from "../utils/cbortoObj";
import { isObject } from "@harmoniclabs/obj-utils";
import { isAttributes } from "../utils/isThatType";
import { ByronEBBHeader } from "../headers";
import { Attributes } from "../utils/types";
import { ByronEBBBody } from "../bodies";

export interface IByronEBBBlock {
    readonly header: ByronEBBHeader;
    readonly body: ByronEBBBody;
    readonly extra: Attributes;
}

export function isIByronEBBBlock( stuff: any ): stuff is IByronEBBBlock
{
    return (
        isObject( stuff ) &&
        stuff.header instanceof ByronEBBHeader &&
        stuff.body instanceof ByronEBBBody &&
        isAttributes( stuff.extra )
    );
}

export class ByronEBBBlock
    implements IByronEBBBlock
{
    readonly header: ByronEBBHeader;
    readonly body: ByronEBBBody;
    readonly extra: Attributes;

    constructor( stuff: any ){
        if( !isIByronEBBBlock( stuff ) ) throw new Error( "invalid `ByronEBBBlock` data provided" );

        this.header = stuff.header;
        this.body = stuff.body;
        this.extra = stuff.extra;
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
        if (!( isIByronEBBBlock( this ) )) throw new Error( "invalid `ByronEBBBlock` data provided" );

        return new CborArray([
            this.header.toCborObj(),
            this.body.toCborObj(),
            attributesMapToCborObj( this.extra )
        ]);
    }

    static fromCbor( cbor: CanBeCborString ): ByronEBBBlock 
    {
        const bytes = cbor instanceof Uint8Array ? cbor : forceCborString( cbor ).toBuffer();
        return ByronEBBBlock.fromCborObj( Cbor.parse( bytes ) );
    }
    static fromCborObj( cbor: CborObj ): ByronEBBBlock 
    {
        if (!(
            cbor instanceof CborArray &&
            cbor.array.length >= 3
        )) throw new Error( "invalid cbor for `ByronEBBBlock`" );

        const [
            cborHeader,
            cborBody,
            cborExtra
        ] = cbor.array;

        if (!(
            cborHeader instanceof CborArray &&
            cborBody instanceof CborArray &&
            cborExtra instanceof CborMap
        )) throw new Error( "invalid cbor for `ByronEBBBlock`" );

        return new ByronEBBBlock({
            header: ByronEBBHeader.fromCborObj( cborHeader ) as ByronEBBHeader,
            body: ByronEBBBody.fromCborObj( cborBody ) as ByronEBBBody,
            extra: cborMapToAttributes( cborExtra ) as Attributes
        });
    }

}
