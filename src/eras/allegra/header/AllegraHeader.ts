import { CanBeCborString, Cbor, CborArray, CborBytes, CborObj, CborString, CborUInt, forceCborString, SubCborRef, ToCbor } from "@harmoniclabs/cbor";
import { isObject } from "@harmoniclabs/obj-utils";
import { isKesSignature, KesSignature, KesSignatureBytes } from "../../common/Kes";
import { AllegraHeaderBody, IAllegraHeaderBody, isIAllegraHeaderBody } from "./AllegraHeaderBody";
import { getSubCborRef } from "../../../utils/getSubCborRef";
import { IPraosHeader } from "../../common/interfaces/IPraosHeader";

export interface IAllegraHeader
{
    body: IAllegraHeaderBody;
    kesSignature: KesSignatureBytes;
}

export interface IAllegraHeaderChecked
{
    body: IAllegraHeaderBody;
    kesSignature: KesSignature;
}

export function isIAllegraHeader( thing: any ): thing is IAllegraHeaderChecked
{
    return isObject( thing ) && (
        isIAllegraHeaderBody( thing.body ) &&
        isKesSignature( thing.kesSignature )
    );
}

export class AllegraHeader
    implements IAllegraHeader, ToCbor, IPraosHeader
{
    readonly body: AllegraHeaderBody;
    readonly kesSignature: KesSignature;

    constructor(
        hdr: IAllegraHeader,
        readonly cborRef: SubCborRef | undefined = undefined
    )
    {
        if(!isIAllegraHeader(hdr)) throw new Error("Invalid AllegraHeader");
        this.body = new AllegraHeaderBody( hdr.body );
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

    static fromCbor( cbor: CanBeCborString ): AllegraHeader
    {
        const bytes = cbor instanceof Uint8Array ? cbor : forceCborString( cbor ).toBuffer();
        return AllegraHeader.fromCborObj(
            Cbor.parse( bytes, { keepRef: true } ),
            bytes
        );
    }
    static fromCborObj( cbor: CborObj, _originalBytes?: Uint8Array ): AllegraHeader
    {
        if(!(
            cbor instanceof CborArray &&
            cbor.array.length >= 2
        )) throw new Error("invalid cbor for AllegraHeader");

        const [
            cHdrBody,
            cBodySignature
        ] = cbor.array;

        if(!(
            cBodySignature instanceof CborBytes
        )) throw new Error("invalid cbor for AllegraHeader");

        return new AllegraHeader({
            body: AllegraHeaderBody.fromCborObj( cHdrBody ),
            kesSignature: cBodySignature.bytes
        }, getSubCborRef( cbor, _originalBytes ));
    }
}