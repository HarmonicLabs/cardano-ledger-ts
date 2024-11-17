import { Cbor, CborObj, SubCborRef } from "@harmoniclabs/cbor";

/**
 * given a @param {CborObj} cObj instance of `CborObj`
 * @returns {SubCborRef} a `SubCborRef` corresponding to the encoded object
 * 
 * if `cObj` has a `subCborRef` propery instance of `SubCborRef` it will return that property;
 * 
 * otherwise it will encode the object and return a new `SubCborRef`
 */
export function getSubCborRef( cObj: CborObj ): SubCborRef
{
    if( cObj.subCborRef instanceof SubCborRef )
    {
        return cObj.subCborRef.clone(); // does not clone bytes, only the object
    }

    const bytes = Cbor.encode( cObj ).toBuffer();

    // encoding might have created a new SubCborRef
    if( (cObj as CborObj).subCborRef instanceof SubCborRef )
    {
        return (cObj.subCborRef as unknown as SubCborRef).clone();
    }
    
    return new SubCborRef({
        _bytes: bytes,
        start: 0,
        end: bytes.length
    });
}

export function subCborRefOrUndef( thing: any ): SubCborRef | undefined
{
    if( thing instanceof SubCborRef )
    {
        return thing;
    }
    return undefined;
}