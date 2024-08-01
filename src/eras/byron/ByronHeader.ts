import { isIByronEBBHeader, ByronEBBHeader } from "./ByronHeaders/ByronEBBHeader";
import { isIByronNoEBBHeader, ByronNoEBBHeader } from "./ByronHeaders/ByronNoEBBHeader";

export type ByronHeader = ByronEBBHeader | ByronNoEBBHeader;

export function isValidByronHeader( stuff: any ): stuff is ByronHeader 
{
    if( stuff instanceof ByronEBBHeader ) return isIByronEBBHeader( stuff );
    if( stuff instanceof ByronNoEBBHeader ) return isIByronNoEBBHeader( stuff );
    
    return false;
}