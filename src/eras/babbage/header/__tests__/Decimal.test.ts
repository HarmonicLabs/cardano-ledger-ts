class Decimal {
    constructor(
        public num: bigint,
        public den: bigint
    ) {}
    static from( n: bigint ): Decimal {
        return new Decimal( n, BigInt(1) );
    }
    static mul( a: Decimal, b: Decimal ): Decimal {
        return new Decimal(
            a.num * b.num,
            a.den * b.den
        );
    }
    mul( b: Decimal ): Decimal {
        return Decimal.mul( this, b );
    }
    static div( a: Decimal, b: Decimal ): Decimal {
        return new Decimal(
            a.num * b.den,
            a.den * b.num
        );
    }
    div( b: Decimal ): Decimal {
        return Decimal.div( this, b );
    }

    static add( a: Decimal, b: Decimal ): Decimal {
        return new Decimal(
            a.num * b.den + b.num * a.den,
            a.den * b.den
        );
    }
    add( b: Decimal ): Decimal {
        return Decimal.add( this, b );
    }

    neg(): Decimal {
        return new Decimal(
            -this.num,
            this.den
        );
    }

    sub( b: Decimal ): Decimal {
        return this.add( b.neg() );
    }

    round(): bigint {
        return this.num / this.den;
    }
}

test.skip("wrong invariant", () => {

    const y = Decimal.from( 100n );
    const x = Decimal.from( 100n );
    let actualY = Decimal.from( 100n );
    let actualX = Decimal.from( 100n );

    function k(): bigint {
        return actualY.mul( actualX ).round();
    }

    function invariant(): void {
        console.log( y, x )
        expect( k() ).toBeGreaterThanOrEqual( 10000n );
    }
    invariant();

    function swap( _xin: bigint ): void {
        const xin = Decimal.from( _xin );
        const delta = y.mul( xin ).div( x.add( xin ) );
        actualY = actualY.sub( delta );
        actualX = actualX.add( xin );
    }

    swap( 10n );
    invariant();

    swap( 10n );
    invariant(); // fails
    
});


test.skip("yes invariant", () => {

    const y = Decimal.from( 1000n );
    const x = Decimal.from( 1000n );
    let actualY = Decimal.from( 1000n );
    let actualX = Decimal.from( 1000n );

    function k(): bigint {
        return actualY.mul( actualX ).round();
    }

    function invariant(): void {
        console.log( k(), actualY, actualX )
        expect( k() ).toBeGreaterThanOrEqual( 1000000n );
    }
    invariant();

    function swap( _xin: bigint ): void {
        const xin = Decimal.from( _xin );

        const scaledY = y.div( Decimal.from( 23n ) );
        const scaledX = x.div( Decimal.from( 23n ) );

        const delta = scaledY.mul( xin ).div( scaledX.add( xin ) );
        actualY = actualY.sub( delta );
        actualX = actualX.add( xin );
    }

    for(let i = 0; i < 23; i++ ) {
        console.log("swap", i);
        swap( 23n );
        invariant();
    }
    
});