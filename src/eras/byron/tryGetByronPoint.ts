import { tryGetByronEBBPoint } from "./tryGetByronPoints/tryGetByronEBBPoint";
import { tryGetByronMainPoint } from "./tryGetByronPoints/tryGetByronMainPoint";

export function tryGetByronPoint ( headerBytes: Uint8Array ) : /**RealPoint**/ | undefined 
{
    // TO FIX
    let tmpEBB = tryGetByronEBBPoint( headerBytes )
    if ( !( tmpEBB === undefined) ) return tmpEBB;

    let tmpNoEBB = tryGetByronMainPoint( headerBytes )
    if ( !( tmpNoEBB === undefined) ) return tmpNoEBB;

    return undefined;
}
