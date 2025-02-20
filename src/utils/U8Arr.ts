
export type U8Arr<Len extends number> = Uint8Array & { length: Len };

export function isU8Arr<Len extends number>( arr: any, len: Len ): arr is U8Arr<Len>
{
    if(!( arr instanceof Uint8Array )) return false;
    if( !Number.isSafeInteger(len) || len < 0 ) return false;
    return arr.length === len;
}