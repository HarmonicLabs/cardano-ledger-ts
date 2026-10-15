import { Cbor, CborArray, CborBytes, CborObj, CborString, CborText, SubCborRef } from "@harmoniclabs/cbor";
import { boundedText, cborArray, urlMaxBytes } from "../../../utils/strictCbor";
import { CanBeHash32, Hash32, canBeHash32 } from "../../../hashes";
import { roDescr } from "../../../utils/roDescr";
import { isObject } from "@harmoniclabs/obj-utils";
import { getSubCborRef, subCborRefOrUndef } from "../../../utils/getSubCborRef";

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
        return this.toCbor();
    }
    toCbor(): CborString
    {
        if( this.cborRef instanceof SubCborRef )
        {
            // TODO: validate cbor structure
            // we assume correctness here
            return this.cborRef.toBuffer();
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
    /**
     * cardano-ledger `DecCBOR Anchor`: below protocol version 12 `RecD Anchor`, a
     * definite-length array of exactly two (indefinite from 12): a `Url` (definite
     * text of at most 128 bytes, 64 below version 9) and a 32-byte hash.
     */
    static fromCborObj( cbor: CborObj ): Anchor
    {
        const [ url, hash ] = cborArray( cbor, "Anchor", { len: 2, definite: true } );

        return new Anchor({
            url: boundedText( url, urlMaxBytes(), "Anchor url" ),
            anchorDataHash: Hash32.fromCborObj( hash )
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