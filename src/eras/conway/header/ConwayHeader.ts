import { CanBeCborString, Cbor, CborArray, CborBytes, CborObj, CborString, CborUInt, forceCborString, SubCborRef, ToCbor } from "@harmoniclabs/cbor";
import { isObject } from "@harmoniclabs/obj-utils";
import { isKesSignature, KesSignature, KesSignatureBytes } from "../../common/Kes";
import { ConwayHeaderBody, IConwayHeaderBody, isIConwayHeaderBody } from "./ConwayHeaderBody";
import { getSubCborRef } from "../../../utils/getSubCborRef";
import { IPraosHeader } from "../../common/interfaces/IPraosHeader";

export interface IConwayHeader
{
    body: IConwayHeaderBody;
    kesSignature: KesSignatureBytes;
}

export interface IConwayHeaderChecked
{
    body: IConwayHeaderBody;
    kesSignature: KesSignature;
}

export function isIConwayHeader( thing: any ): thing is IConwayHeaderChecked
{
    return isObject( thing ) && (
        isIConwayHeaderBody( thing.body ) &&
        isKesSignature( thing.kesSignature )
    );
}

export class ConwayHeader
    implements IConwayHeader, ToCbor , IPraosHeader
{
    readonly body: ConwayHeaderBody;
    readonly kesSignature: KesSignature;

    constructor(
        hdr: IConwayHeader,
        readonly cborRef: SubCborRef | undefined = undefined
    )
    {
        if(!isIConwayHeader(hdr)) throw new Error("Invalid ConwayHeader");
        this.body = new ConwayHeaderBody( hdr.body );
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

    static fromCbor( cbor: CanBeCborString ): ConwayHeader
    {
        const bytes = cbor instanceof Uint8Array ? cbor : forceCborString( cbor ).toBuffer();
        return ConwayHeader.fromCborObj(
            Cbor.parse( bytes, { keepRef: true } ),
            bytes
        );
    }
    static fromCborObj( cbor: CborObj, _originalBytes?: Uint8Array ): ConwayHeader
    {
        if(!(
            cbor instanceof CborArray &&
            cbor.array.length >= 2
        )) throw new Error("invalid cbor for ConwayHeader");

        const [
            cHdrBody,
            cBodySignature
        ] = cbor.array;

        if(!(
            cBodySignature instanceof CborBytes
        )) throw new Error("invalid cbor for ConwayHeader");

        return new ConwayHeader({
            body: ConwayHeaderBody.fromCborObj( cHdrBody ),
            kesSignature: cBodySignature.bytes
        }, getSubCborRef( cbor, _originalBytes ));
    }
}