export function isWord64( n: number | bigint ): boolean {
    if( typeof n === "bigint" ) {
        return( n >= 0 && n <= 18446744073709551615 );
    }

    return( Number.isSafeInteger( n ) && ( n >= 0 && n <= 18446744073709551615 ) );
}