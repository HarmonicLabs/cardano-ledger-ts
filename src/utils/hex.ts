// A regex instead of Array.from(str).every(includes): every Hash constructor calls this for
// the hash it is built from (2 % of Gerolamo's applier thread on a fast sync).
const hexRe = /^[0-9a-f]*$/;

export function isHex( str: string ): boolean 
{
    if(!( typeof str === "string" ))  return false;

    return hexRe.test( str );
}