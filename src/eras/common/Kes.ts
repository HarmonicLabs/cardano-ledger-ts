import { isU8Arr, U8Arr } from "../../utils/U8Arr";

/** just an alias to accepts all bytes, but still give indications **/
export type KesSignatureBytes = Uint8Array;
export type KesSignature = U8Arr<448>;

export function isKesSignature( sig: any ): sig is KesSignature
{
    return isU8Arr( sig, 448 );
}