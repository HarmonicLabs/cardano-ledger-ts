import { Cbor, CborObj, CborTag, CborBytes } from "@harmoniclabs/cbor";

/**
 * shared helpers for Byron CBOR.
 *
 * Byron nests many structures inside a CBOR tag-24 ("encoded CBOR data item"):
 * a byte string whose content is itself CBOR. e.g. `txin = [0, #6.24(bytes .cbor [txid, u32])]`.
 */

/** wrap an inner CBOR item as a tag-24 (`#6.24`) encoded-CBOR byte string */
export function wrapTag24( inner: CborObj ): CborTag
{
    return new CborTag( 24, new CborBytes( Cbor.encode( inner ) ) );
}

/** parse the inner CBOR item out of a tag-24 (`#6.24`) wrapper */
export function unwrapTag24( cObj: CborObj ): CborObj
{
    if(!(
        cObj instanceof CborTag &&
        Number( cObj.tag ) === 24 &&
        cObj.data instanceof CborBytes
    )) throw new Error("expected a Byron CBOR tag-24 (encoded-CBOR) item");
    return Cbor.parse( cObj.data.bytes );
}

/** true if `cObj` is a tag-24 encoded-CBOR item */
export function isTag24( cObj: CborObj ): cObj is CborTag
{
    return cObj instanceof CborTag && Number( cObj.tag ) === 24 && cObj.data instanceof CborBytes;
}
