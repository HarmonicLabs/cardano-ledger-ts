import { Cbor, CborArray, CborBytes, CborObj, CborString, CborText, SubCborRef } from "@harmoniclabs/cbor";
import { isObject } from "@harmoniclabs/obj-utils";
import { CanBeHash32, Hash32, canBeHash32 } from "../hashes";
import { getSubCborRef, subCborRefOrUndef } from "../utils/getSubCborRef";

export interface IAnchor {
    url: string,
    anchorDataHash: CanBeHash32
}

export function isIAnchor( stuff: any ): stuff is IAnchor
{
    return isObject( stuff ) && (
        typeof stuff.url === "string" &&
        (stuff.url as string).length <= 128 &&
        canBeHash32( stuff.anchorDataHash )
    );
}

export class Anchor
    implements IAnchor
{
    readonly url: string;
    readonly anchorDataHash: Hash32;

    constructor(
        anchor: IAnchor,
        readonly cborRef: SubCborRef | undefined = undefined
    )
    {
        const { url, anchorDataHash } = anchor;
        this.url = String( url );
        this.anchorDataHash = new Hash32( anchorDataHash );
        this.cborRef = cborRef ?? subCborRefOrUndef( anchor );
    }

    toCborBytes(): Uint8Array
    {
        if( this.cborRef instanceof SubCborRef ) return this.cborRef.toBuffer();
        return this.toCbor().toBuffer();
    }
    toCbor(): CborString
    {
        if( this.cborRef instanceof SubCborRef )
        {
            // TODO: validate cbor structure
            // we assume correctness here
            return new CborString( this.cborRef.toBuffer() );
        }
        
        return Cbor.encode( this.toCborObj() )
    }
    toCborObj(): CborObj
    {
        if( this.cborRef instanceof SubCborRef )
        {
            // TODO: validate cbor structure
            // we assume correctness here
            return Cbor.parse( this.cborRef.toBuffer() );
        }
        return new CborArray([
            new CborText( this.url ),
            this.anchorDataHash.toCborObj()
        ]);
    }
    static fromCborObj( cbor: CborObj ): Anchor
    {
        if(!(
            cbor instanceof CborArray &&
            cbor.array.length >= 2 &&
            cbor.array[0] instanceof CborText
        )) throw new Error("invalid cbor for Anchor");

        return new Anchor({
            url: cbor.array[0].text,
            anchorDataHash: Hash32.fromCborObj( cbor.array[1] )
        }, getSubCborRef( cbor ));
    }

    toJSON() { return this.toJson(); }
    toJson()
    {
        return {
            url: this.url,
            anchorDataHash: this.anchorDataHash.toString() 
        }
    }
}