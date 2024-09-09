import { CborString, Cbor, CborArray, CanBeCborString, forceCborString, CborObj, CborMap } from "@harmoniclabs/cbor";
import { attributesMapToCborObj } from "../utils/objToCbor";
import { cborMapToAttributes } from "../utils/cbortoObj";
import { isObject } from "@harmoniclabs/obj-utils";
import { isAttributes } from "../utils/isThatType";
import { ByronMainHeader } from "../headers";
import { Attributes } from "../utils/types";
import { ByronMainBody } from "../bodies";

export interface IByronMainBlock {
    readonly header: ByronMainHeader;
    readonly body: ByronMainBody;
    readonly extra: Attributes;
}

export function isIByronMainBlock( stuff: any ): stuff is IByronMainBlock
{
    return (
        isObject( stuff ) &&
        stuff.header instanceof ByronMainHeader &&
        stuff.body instanceof ByronMainBody &&
        isAttributes( stuff.extra )
    );
}

export class ByronMainBlock 
    implements IByronMainBlock
{
    readonly header: ByronMainHeader;
    readonly body: ByronMainBody;
    readonly extra: Attributes;

    constructor( stuff: any ){
        if( !isIByronMainBlock( stuff ) ) throw new Error( "invalid `ByronMainBlock` data provided" );

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
        if (!( isIByronMainBlock( this ) )) throw new Error( "invalid `ByronMainBlock` data provided" );

        return new CborArray([
            this.header.toCborObj(),
            this.body.toCborObj(),
            attributesMapToCborObj( this.extra )
        ]);
    }

    static fromCbor( cbor: CanBeCborString ): ByronMainBlock 
    {
        const bytes = cbor instanceof Uint8Array ? cbor : forceCborString( cbor ).toBuffer();
        return ByronMainBlock.fromCborObj( Cbor.parse( bytes ) );
    }
    static fromCborObj( cbor: CborObj ): ByronMainBlock 
    {
        if (!(
            cbor instanceof CborArray &&
            cbor.array.length >= 3
        )) throw new Error( "invalid cbor for `ByronMainBlock`" );

        const [
            cborHeader,
            cborBody,
            cborExtra
        ] = cbor.array;

        if (!(
            cborHeader instanceof CborArray &&
            cborBody instanceof CborArray &&
            cborExtra instanceof CborMap
        )) throw new Error( "invalid cbor for `ByronMainBlock`" );

        return new ByronMainBlock({
            header: ByronMainHeader.fromCborObj( cborHeader ) as ByronMainHeader,
            body: ByronMainBody.fromCborObj( cborBody ) as ByronMainBody,
            extra: cborMapToAttributes( cborExtra ) as Attributes
        });
    }

}
