/**
 * Base58 codec using the Bitcoin alphabet.
 *
 * Byron-era (bootstrap) Cardano addresses are base58-encoded CBOR, so we need
 * a plain base58 codec (no checksum layer of its own; Byron carries a CRC32).
 */

const ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
const BASE = BigInt( ALPHABET.length ); // 58

const ZERO = BigInt( 0 );
const EIGHT = BigInt( 8 );
const BYTE_MASK = BigInt( 0xff );

// char -> value lookup
const ALPHABET_MAP: Record<string, number> = (() => {
    const map: Record<string, number> = {};
    for( let i = 0; i < ALPHABET.length; i++ ) map[ ALPHABET[i] ] = i;
    return map;
})();

export function base58Encode( bytes: Uint8Array ): string
{
    if( bytes.length === 0 ) return "";

    // count leading zero bytes -> leading "1"s
    let zeros = 0;
    while( zeros < bytes.length && bytes[zeros] === 0 ) zeros++;

    let num = ZERO;
    for( let i = 0; i < bytes.length; i++ )
    {
        num = ( num << EIGHT ) + BigInt( bytes[i] );
    }

    let out = "";
    while( num > ZERO )
    {
        const rem = Number( num % BASE );
        num = num / BASE;
        out = ALPHABET[ rem ] + out;
    }

    return "1".repeat( zeros ) + out;
}

export function base58Decode( str: string ): Uint8Array
{
    if( str.length === 0 ) return new Uint8Array( 0 );

    // count leading "1"s -> leading zero bytes
    let zeros = 0;
    while( zeros < str.length && str[zeros] === "1" ) zeros++;

    let num = ZERO;
    for( let i = 0; i < str.length; i++ )
    {
        const val = ALPHABET_MAP[ str[i] ];
        if( val === undefined )
        throw new Error("invalid base58 character: '" + str[i] + "'");
        num = num * BASE + BigInt( val );
    }

    const bytes: number[] = [];
    while( num > ZERO )
    {
        bytes.unshift( Number( num & BYTE_MASK ) );
        num = num >> EIGHT;
    }

    const result = new Uint8Array( zeros + bytes.length );
    result.set( bytes, zeros ); // leading `zeros` entries stay 0
    return result;
}
