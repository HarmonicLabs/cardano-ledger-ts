import { tryGetByronEBBPoint } from "./tryGetByronPoints/tryGetByronEBBPoint";
import { tryGetByronNoEBBPoint } from "./tryGetByronPoints/tryGetByronNoEBBPoint";

export function tryGetByronPoint ( headerBytes: Uint8Array ) : /**RealPoint**/ | undefined 
{
    // TO FIX
    let tmpEBB = tryGetByronEBBPoint( headerBytes )
    if ( !( tmpEBB === undefined) ) return tmpEBB;

    let tmpNoEBB = tryGetByronNoEBBPoint( headerBytes )
    if ( !( tmpNoEBB === undefined) ) return tmpNoEBB;

    return undefined;
}