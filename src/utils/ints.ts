export type CanBeUInteger
    = bigint
    | number;

const _0n = BigInt( 0 );

export function canBeUInteger( something: any ): something is (number | bigint)
{
    return (
        (typeof something === "number" && something === ( something >>> 0 ) )
        || (typeof something === "bigint" && something >= _0n )
    );
}

export function maybeBigUint( toForce: CanBeUInteger | undefined ): bigint | undefined
{
    return toForce === undefined ? undefined : forceBigUInt( toForce );
}

export function forceBigUInt( toForce: CanBeUInteger ): bigint
{
    return typeof toForce === "number" ? BigInt( toForce >>> 0 ) : (
        toForce >= _0n ? toForce : -toForce
    );
};

export function unsafeForceUInt( toForce: CanBeUInteger ): number
{
    if( !canBeUInteger( toForce ) )
    {
        // console.error( toForce );
        throw new Error( "trying to convert an integer to an unsigned Integer, the number was negative" );
    }

    return Number( toForce ); 
}

export function u32( uint: CanBeUInteger ): number
{
    return Number( uint ) >>> 0;
}