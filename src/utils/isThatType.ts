const hexChars = Object.freeze( Array.from( "0123456789abcdef" ) );

export function isBoolean( stuff: any ): boolean 
{
    return( typeof stuff === "boolean" );
}

export function isHash( stuff: any, n?: number ): boolean 
{
    if( n === undefined ) return stuff instanceof Uint8Array;
    else return( 
        stuff instanceof Uint8Array &&
        stuff.length === n
    );
}

export function isHex( str: string ): boolean 
{
    if(!( typeof str === "string" ))  return false;

    return Array.from(str).every( ch => hexChars.includes( ch ) );
}

export function isByte( n: number | bigint ): boolean {
    if( typeof n === "bigint" ) {
        return( n >= 0 && n <= 255 );
    }
    
    return( Number.isSafeInteger( n ) && ( n >= 0 && n <= 255 ) );
}

export function isWord16( n: number | bigint ): boolean
{
    if( typeof n === "bigint" )
    {
        return( n >= 0 && n <= 65535 );
    }

    return(
        Number.isSafeInteger( n ) && 
        ( n >= 0 && n <= 65535 )
    );
}

export function isWord32( n: number | bigint ): boolean 
{
    if( typeof n === "bigint" ) 
    {
        return( n >= 0 && n <= 4294967295 );
    }

    return( 
        Number.isSafeInteger( n ) && 
        ( n >= 0 && n <= 4294967295 ) 
    );
}

export function isWord64( n: number | bigint ): boolean 
{
    if( typeof n === "bigint" ) 
    {
        return( n >= 0 && n <= 18446744073709551615 );
    }

    return( 
        Number.isSafeInteger( n ) && 
        ( n >= 0 && n <= 18446744073709551615 ) 
    );
}

export function isBigInt( stuff: any ): boolean
{
    return ( typeof stuff === "bigint" );
}
