import { CanBeCborString, Cbor, CborArray, CborBytes, CborObj, CborString, CborUInt, forceCborString, SubCborRef, ToCbor } from "@harmoniclabs/cbor";
import { isObject } from "@harmoniclabs/obj-utils";
import { isKesSignature, KesSignature, KesSignatureBytes } from "../../common/ledger/Kes";
import { DijkstraHeaderBody, IDijkstraHeaderBody, isIDijkstraHeaderBody } from "./DijkstraHeaderBody";
import { getSubCborRef } from "../../../utils/getSubCborRef";
import { IPraosHeader } from "../../common/interfaces/IPraosHeader";
import { InvalidCborFormatError } from "../../../utils/InvalidCborFormatError"

export interface IDijkstraHeader
{
    body: IDijkstraHeaderBody;
    kesSignature: KesSignatureBytes;
}

export interface IDijkstraHeaderChecked
{
    body: IDijkstraHeaderBody;
    kesSignature: KesSignature;
}

export function isIDijkstraHeader( thing: any ): thing is IDijkstraHeaderChecked
{
    return isObject( thing ) && (
        isIDijkstraHeaderBody( thing.body ) &&
        isKesSignature( thing.kesSignature )
    );
}

export class DijkstraHeader
    implements IDijkstraHeader, ToCbor , IPraosHeader
{
    readonly body: DijkstraHeaderBody;
    readonly kesSignature: KesSignature;

    constructor(
        hdr: IDijkstraHeader,
        readonly cborRef: SubCborRef | undefined = undefined
    )
    {
        if(!isIDijkstraHeader(hdr)) throw new Error("Invalid DijkstraHeader");
        this.body = new DijkstraHeaderBody( hdr.body );
        this.kesSignature = hdr.kesSignature;
    }

    toCborBytes(): Uint8Array
    {
        if( this.cborRef instanceof SubCborRef ) return this.cborRef.toBuffer();
        return this.toCbor();
    }
    toCbor(): CborString
    {
        if( this.cborRef instanceof SubCborRef ) return this.cborRef.toBuffer();
        return Cbor.encode( this.toCborObj() );
    }
    /* header = [header_body, body_signature : $kes_signature] */
    toCborObj(): CborArray
    {
        if( 
            this.cborRef instanceof SubCborRef 
        ) return Cbor.parse( this.cborRef.toBuffer() ) as CborArray;
        
        return new CborArray([
            this.body.toCborObj(),
            new CborBytes( this.kesSignature )
        ]);
    }

    static fromCbor( cbor: CanBeCborString ): DijkstraHeader
    {
        const bytes = cbor instanceof Uint8Array ? cbor : forceCborString( cbor );
        return DijkstraHeader.fromCborObj(
            Cbor.parse( bytes, { keepRef: true } ),
            bytes
        );
    }
    static fromCborObj( cbor: CborObj, _originalBytes?: Uint8Array ): DijkstraHeader
    {
        // console.log("DijkstraHeader.fromCborObj", cbor)
        if(!(
            cbor instanceof CborArray 
            // && cbor.array.length >= 2
        )) throw new InvalidCborFormatError("invalid cbor for DijkstraHeader");

        const [
            cHdrBody,
            cBodySignature
        ] = cbor.array;
        // console.log("DijkstraHeader cHdrBody", cHdrBody);
        // console.log("DijkstraHeader cBodySignature", cBodySignature);

        if(!(
            cBodySignature instanceof CborBytes
        )) throw new InvalidCborFormatError("invalid cbor for DijkstraHeader cBodySignature");

        const dijkstraHeader = new DijkstraHeader({
            body: DijkstraHeaderBody.fromCborObj( cHdrBody ),
            kesSignature: cBodySignature.bytes
        }, getSubCborRef( cbor, _originalBytes ))

        // console.log("DijkstraHeader", dijkstraHeader);

        return dijkstraHeader;
    }
}