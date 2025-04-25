import { CanBeCborString, Cbor, CborArray, CborBytes, CborObj, CborString, CborUInt, forceCborString, SubCborRef, ToCbor } from "@harmoniclabs/cbor";
import { isObject } from "@harmoniclabs/obj-utils";
import { isKesSignature, KesSignature, KesSignatureBytes } from "../../common/Kes";
import { ShelleyHeaderBody, IShelleyHeaderBody, isIShelleyHeaderBody } from "./ShelleyHeaderBody";
import { getSubCborRef } from "../../../utils/getSubCborRef";
import { IPraosHeader } from "../../common/interfaces/IPraosHeader";

export interface IShelleyHeader
{
    body: IShelleyHeaderBody;
    kesSignature: KesSignatureBytes;
}

export interface IShelleyHeaderChecked
{
    body: IShelleyHeaderBody;
    kesSignature: KesSignature;
}

export function isIShelleyHeader( thing: any ): thing is IShelleyHeaderChecked
{
    return isObject( thing ) && (
        isIShelleyHeaderBody( thing.body ) &&
        isKesSignature( thing.kesSignature )
    );
}

export class ShelleyHeader
    implements IShelleyHeader, ToCbor, IPraosHeader
{
    readonly body: ShelleyHeaderBody;
    readonly kesSignature: KesSignature;

    constructor(
        hdr: IShelleyHeader,
        readonly cborRef: SubCborRef | undefined = undefined
    )
    {
        if(!isIShelleyHeader(hdr)) throw new Error("Invalid ShelleyHeader");
        this.body = new ShelleyHeaderBody( hdr.body );
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

    static fromCbor( cbor: CanBeCborString ): ShelleyHeader
    {
        const bytes = cbor instanceof Uint8Array ? cbor : forceCborString( cbor ).toBuffer();
        return ShelleyHeader.fromCborObj(
            Cbor.parse( bytes, { keepRef: true } ),
            bytes
        );
    }
    static fromCborObj( cbor: CborObj, _originalBytes?: Uint8Array ): ShelleyHeader
    {
        if(!(
            cbor instanceof CborArray &&
            cbor.array.length >= 2
        )) throw new Error("invalid cbor for ShelleyHeader");

        const [
            cHdrBody,
            cBodySignature
        ] = cbor.array;

        if(!(
            cBodySignature instanceof CborBytes
        )) throw new Error("invalid cbor for ShelleyHeader");

        return new ShelleyHeader({
            body: ShelleyHeaderBody.fromCborObj( cHdrBody ),
            kesSignature: cBodySignature.bytes
        }, getSubCborRef( cbor, _originalBytes ));
    }
}