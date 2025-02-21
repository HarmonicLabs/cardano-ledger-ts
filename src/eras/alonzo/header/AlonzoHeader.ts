import { isObject } from "@harmoniclabs/obj-utils";
import { IPraosHeader } from "../../common/interfaces/IPraosHeader";
import { isKesSignature, KesSignature, KesSignatureBytes } from "../../common/Kes";
import { AlonzoHeaderBody, IAlonzoHeaderBody, isIAlonzoHeaderBody } from "./AlonzoHeaderBody";
import { CanBeCborString, Cbor, CborArray, CborBytes, CborObj, CborString, CborUInt, forceCborString, SubCborRef, ToCbor } from "@harmoniclabs/cbor";
import { getSubCborRef } from "../../../utils/getSubCborRef";


export interface IAlonzoHeader
{
    body: IAlonzoHeaderBody;
    kesSignature: KesSignatureBytes;
}

export interface IAlonzoHeaderChecked
{
    body: IAlonzoHeaderBody;
    kesSignature: KesSignature;
}

export function isIAlonzoHeader( thing: any ): thing is IAlonzoHeaderChecked
{
    return isObject( thing ) && (
        isIAlonzoHeaderBody( thing.body ) &&
        isKesSignature( thing.kesSignature )
    );
}

export class AlonzoHeader
    implements IPraosHeader, IAlonzoHeader, ToCbor
{
    readonly body: AlonzoHeaderBody;
    readonly kesSignature: KesSignature;

    constructor(
        hdr: IAlonzoHeader,
        readonly cborRef: SubCborRef | undefined = undefined
    )
    {
        if(!isIAlonzoHeader(hdr)) throw new Error("Invalid AlonzoHeader");
        this.body = new AlonzoHeaderBody( hdr.body );
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

    static fromCbor( cbor: CanBeCborString ): AlonzoHeader
    {
        const bytes = cbor instanceof Uint8Array ? cbor : forceCborString( cbor ).toBuffer();
        return AlonzoHeader.fromCborObj(
            Cbor.parse( bytes, { keepRef: true } ),
            bytes
        );
    }
    static fromCborObj( cbor: CborObj, _originalBytes?: Uint8Array ): AlonzoHeader
    {
        if(!(
            cbor instanceof CborArray &&
            cbor.array.length >= 2
        )) throw new Error("invalid cbor for AlonzoHeader");

        const [
            cHdrBody,
            cBodySignature
        ] = cbor.array;

        if(!(
            cBodySignature instanceof CborBytes
        )) throw new Error("invalid cbor for AlonzoHeader");

        return new AlonzoHeader({
            body: AlonzoHeaderBody.fromCborObj( cHdrBody ),
            kesSignature: cBodySignature.bytes
        }, getSubCborRef( cbor, _originalBytes ));
    }
}