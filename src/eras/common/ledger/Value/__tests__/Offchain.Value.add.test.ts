import { Hash28 } from "../../../../../hashes/";
import { Value } from "../Value";

describe.skip("Value.add", () => {

    test("0 + 0 = 0", () => {

        expect(
            Value.add(
                Value.zero,
                Value.zero
            )
        ).toEqual( Value.zero );

    });

    test("0 + 1 = 1", () => {

        expect(
            Value.add(
                Value.zero,
                Value.lovelaces( 1 )
            )
        ).toEqual( Value.lovelaces( 1n ) );

    });

    test("2 + 1 = 3", () => {

        expect(
            Value.add(
                Value.lovelaces( 2 ),
                Value.lovelaces( 1 )
            )
        ).toEqual( Value.lovelaces( 3n ) );

    });

    test("2 + (-1) = 1", () => {

        expect(
            Value.add(
                Value.lovelaces( 2 ),
                Value.lovelaces( -1 )
            )
        ).toEqual( Value.lovelaces( 1n ) );

    });

    test("(-1) + 2 = 1", () => {

        expect(
            Value.add(
                Value.lovelaces( -1 ),
                Value.lovelaces( 2 )
            )
        ).toEqual( Value.lovelaces( 1n ) );

    });

    describe("unrelated assets", () => {

        test("1a + 2b = 1a2b (policy)", () => {

            expect(
                Value.add(
                    new Value([
                        {
                            policy: new Hash28( "aa".repeat(28) ),
                            assets: [{ name: "a", quantity: 1 }]
                        }
                    ]),
                    new Value([
                        {
                            policy: new Hash28( "bb".repeat(28) ),
                            assets: [{ name: "b", quantity: 2 }]
                        }
                    ])
                )
            ).toEqual(
                new Value([
                    {
                        policy: new Hash28( "aa".repeat(28) ),
                        assets: [{ name: "a", quantity: 1 }]
                    },
                    {
                        policy: new Hash28( "bb".repeat(28) ),
                        assets: [{ name: "b", quantity: 2 }]
                    }
                ])
            );

        })

    });

    describe("multiple assets", () => {

        test("1a3b + 2b = 1a5b (policy)", () => {

            expect(
                Value.add(
                    new Value([
                        {
                            policy: new Hash28( "aa".repeat(28) ),
                            assets: [{ name: "a", quantity: 1 }]
                        },
                        {
                            policy: new Hash28( "bb".repeat(28) ),
                            assets: [{ name: "b", quantity: 3 }]
                        }
                    ]),
                    new Value([
                        {
                            policy: new Hash28( "bb".repeat(28) ),
                            assets: [{ name: "b", quantity: 2 }]
                        }
                    ])
                )
            ).toEqual(
                new Value([
                    {
                        policy: new Hash28( "bb".repeat(28) ),
                        assets: [{ name: "b", quantity: 5n }]
                    },
                    {
                        policy: new Hash28( "aa".repeat(28) ),
                        assets: [{ name: "a", quantity: 1 }]
                    }
                ])
            );

        });

        test("1a.a 3b.a + 2b.b = 1a.a b{ 2b, 3a } (different names)", () => {

            expect(
                Value.add(
                    new Value([
                        {
                            policy: new Hash28( "aa".repeat(28) ),
                            assets: [{ name: "a", quantity: 1 }]
                        },
                        {
                            policy: new Hash28( "bb".repeat(28) ),
                            assets: [{ name: "a", quantity: 3 }]
                        }
                    ]),
                    new Value([
                        {
                            policy: new Hash28( "bb".repeat(28) ),
                            assets: [{ name: "b", quantity: 2 }]
                        }
                    ])
                )
            ).toEqual(
                new Value([
                    {
                        policy: new Hash28( "bb".repeat(28) ),
                        assets: [
                            { name: "b", quantity: 2 },
                            { name: "a", quantity: 3 }
                        ]
                    },
                    {
                        policy: new Hash28( "aa".repeat(28) ),
                        assets: [{ name: "a", quantity: 1 }]
                    }
                ])
            );

        })

    })

})