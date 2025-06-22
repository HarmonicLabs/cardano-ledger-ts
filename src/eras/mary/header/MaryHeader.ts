import { CanBeCborString, Cbor, CborArray, CborBytes, CborObj, CborString, CborUInt, forceCborString, SubCborRef, ToCbor } from "@harmoniclabs/cbor";
import { isObject } from "@harmoniclabs/obj-utils";
import { isKesSignature, KesSignature, KesSignatureBytes } from "../../common/ledger/Kes";
import { MaryHeaderBody, IMaryHeaderBody, isIMaryHeaderBody } from "./MaryHeaderBody";
import { getSubCborRef } from "../../../utils/getSubCborRef";
import { IPraosHeader } from "../../common/interfaces/IPraosHeader";

export interface IMaryHeader
{
    body: IMaryHeaderBody;
    kesSignature: KesSignatureBytes;
}

export interface IMaryHeaderChecked
{
    body: IMaryHeaderBody;
    kesSignature: KesSignature;
}

export function isIMaryHeader( thing: any ): thing is IMaryHeaderChecked
{
    return isObject( thing ) && (
        isIMaryHeaderBody( thing.body ) &&
        isKesSignature( thing.kesSignature )
    );
}

export class MaryHeader
    implements IMaryHeader, ToCbor, IPraosHeader
{
    readonly body: MaryHeaderBody;
    readonly kesSignature: KesSignature;

    constructor(
        hdr: IMaryHeader,
        readonly cborRef: SubCborRef | undefined = undefined
    )
    {
        if(!isIMaryHeader(hdr)) throw new Error("Invalid MaryHeader");
        this.body = new MaryHeaderBody( hdr.body );
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

    static fromCbor( cbor: CanBeCborString ): MaryHeader
    {
        const bytes = cbor instanceof Uint8Array ? cbor : forceCborString( cbor ).toBuffer();
        return MaryHeader.fromCborObj(
            Cbor.parse( bytes, { keepRef: true } ),
            bytes
        );
    }
    static fromCborObj( cbor: CborObj, _originalBytes?: Uint8Array ): MaryHeader
    {
        if(!(
            cbor instanceof CborArray &&
            cbor.array.length >= 2
        )) throw new Error("invalid cbor for MaryHeader");

        const [
            cHdrBody,
            cBodySignature
        ] = cbor.array;

        if(!(
            cBodySignature instanceof CborBytes
        )) throw new Error("invalid cbor for MaryHeader");

        return new MaryHeader({
            body: MaryHeaderBody.fromCborObj( cHdrBody ),
            kesSignature: cBodySignature.bytes
        }, getSubCborRef( cbor, _originalBytes ));
    }
}