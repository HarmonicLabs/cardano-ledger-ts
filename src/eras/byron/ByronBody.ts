import { isIByronEBBBody, ByronEBBBody } from "./ByronBodies/ByronEBBBody";
import { isIByronNoEBBBody, ByronNoEBBBody } from "./ByronBodies/ByronNoEBBBody";

export type ByronBody = ByronEBBBody | ByronNoEBBBody;

export function isValidByronHeader( stuff: any ): stuff is ByronBody 
{
    if( stuff instanceof ByronEBBBody ) return isIByronEBBBody( stuff );
    if( stuff instanceof ByronNoEBBBody ) return isIByronNoEBBBody( stuff );
    
    return false;
}