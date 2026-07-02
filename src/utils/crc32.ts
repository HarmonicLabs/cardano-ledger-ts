/**
 * CRC-32/ISO-HDLC (a.k.a. the zlib / PNG / "IEEE 802.3" CRC-32).
 *
 * reflected polynomial `0xEDB88320`, init `0xFFFFFFFF`, final XOR `0xFFFFFFFF`.
 *
 * Byron addresses append this checksum over the CBOR-serialized address payload
 * (the bytes held inside the tag-24 item).
 */

const CRC_TABLE: Uint32Array = (() => {
    const table = new Uint32Array( 256 );
    for( let n = 0; n < 256; n++ )
    {
        let c = n;
        for( let k = 0; k < 8; k++ )
        {
            c = ( c & 1 ) ? ( 0xedb88320 ^ ( c >>> 1 ) ) : ( c >>> 1 );
        }
        table[n] = c >>> 0;
    }
    return table;
})();

export function crc32( bytes: Uint8Array ): number
{
    let crc = 0xffffffff;
    for( let i = 0; i < bytes.length; i++ )
    {
        crc = ( crc >>> 8 ) ^ CRC_TABLE[ ( crc ^ bytes[i] ) & 0xff ];
    }
    return ( crc ^ 0xffffffff ) >>> 0;
}
