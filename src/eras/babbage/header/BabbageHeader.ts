import { isObject } from "@harmoniclabs/obj-utils";
import { CanBeCborString, Cbor, CborArray, CborBytes, CborObj, CborString, CborUInt, forceCborString, SubCborRef, ToCbor } from "@harmoniclabs/cbor";
import { IPraosHeader } from "../../common/interfaces/IPraosHeader";
import { isKesSignature, KesSignature, KesSignatureBytes } from "../../common/Kes";
import { BabbageHeaderBody, IBabbageHeaderBody, isIBabbageHeaderBody } from "./BabbageHeaderBody";
import { getSubCborRef } from "../../../utils/getSubCborRef";


export interface IBabbageHeader
{
    body: IBabbageHeaderBody;
    kesSignature: KesSignatureBytes;
}

export interface IBabbageHeaderChecked
{
    body: IBabbageHeaderBody;
    kesSignature: KesSignature;
}

export function isIBabbageHeader( thing: any ): thing is IBabbageHeaderChecked
{
    return isObject( thing ) && (
        isIBabbageHeaderBody( thing.body ) &&
        isKesSignature( thing.kesSignature )
    );
}

export class BabbageHeader
    implements IBabbageHeader, ToCbor
{
    readonly body: BabbageHeaderBody;
    readonly kesSignature: KesSignature;

    constructor(
        hdr: IBabbageHeader,
        readonly cborRef: SubCborRef | undefined = undefined
    )
    {
        if(!isIBabbageHeader(hdr)) throw new Error("Invalid BabbageHeader");
        this.body = new BabbageHeaderBody( hdr.body );
        this.kesSignature = hdr.kesSignature;
    }

    toCborBytes(): Uint8Array
    {
        if( this.cborRef instanceof SubCborRef ) return this.cborRef.toBuffer();
        return this.toCbor().toBuffer();
    }
    toCbor(): CborString
    {
        if( this.cborRef instanceof SubCborRef ) return new CborString( this.cborRef.toBuffer() );
        return Cbor.encode( this.toCborObj() );
    }
    /* header = [header_body, body_signature : $kes_signature] */
    toCborObj(): CborArray
    {
        if( this.cborRef instanceof SubCborRef ) return Cbor.parse( this.cborRef.toBuffer() ) as CborArray;
        
        return new CborArray([
            this.body.toCborObj(),
            new CborBytes( this.kesSignature )
        ]);
    }

    static fromCbor( cbor: CanBeCborString ): BabbageHeader
    {
        const bytes = cbor instanceof Uint8Array ? cbor : forceCborString( cbor ).toBuffer();
        return BabbageHeader.fromCborObj(
            Cbor.parse( bytes, { keepRef: true } ),
            bytes
        );
    }
    static fromCborObj( cbor: CborObj, _originalBytes?: Uint8Array ): BabbageHeader
    {
        if(!(
            cbor instanceof CborArray &&
            cbor.array.length >= 2
        )) throw new Error("invalid cbor for BabbageHeader");

        const [
            cHdrBody,
            cBodySignature
        ] = cbor.array;

        if(!(
            cBodySignature instanceof CborBytes
        )) throw new Error("invalid cbor for BabbageHeader");

        return new BabbageHeader({
            body: BabbageHeaderBody.fromCborObj( cHdrBody ),
            kesSignature: cBodySignature.bytes
        }, getSubCborRef( cbor, _originalBytes ));
    }
}