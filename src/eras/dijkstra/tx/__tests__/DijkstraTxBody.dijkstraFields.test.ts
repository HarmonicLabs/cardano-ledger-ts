import { DijkstraTxBody } from "../DijkstraTxBody";
import { DijkstraTxOut } from "../DijkstraTxOut";
import { DijkstraUTxO } from "../DijkstraUTxO";
import { DijkstraAccountBalanceInterval } from "../DijkstraAccountBalanceInterval";
import { Credential, PubKeyHash } from "../../../../credentials";
import { Hash28 } from "../../../../hashes";

function minimalBody( extra: any ): DijkstraTxBody
{
    return new DijkstraTxBody({
        inputs: [
            new DijkstraUTxO({
                utxoRef: { id: "ab".repeat(32), index: 0 },
                resolved: DijkstraTxOut.fake
            })
        ],
        outputs: [ DijkstraTxOut.fake ],
        fee: 200_000,
        ...extra
    });
}

function roundtrips( body: DijkstraTxBody ): boolean
{
    const cbor = body.toCbor();
    const decoded = DijkstraTxBody.fromCbor( cbor );
    return decoded.toCbor().toString() === cbor.toString();
}

describe("DijkstraTxBody new fields round-trip", () => {

    test("guards as key-hash set (key 14)", () => {
        const body = minimalBody({
            guards: [ new PubKeyHash("11".repeat(28)), new PubKeyHash("22".repeat(28)) ]
        });
        expect( body.guards?.length ).toBe( 2 );
        expect( roundtrips( body ) ).toBe( true );

        const decoded = DijkstraTxBody.fromCbor( body.toCbor() );
        expect( decoded.guards?.every( g => g instanceof PubKeyHash ) ).toBe( true );
    });

    test("guards as credential oset (key 14)", () => {
        const body = minimalBody({
            guards: [ Credential.keyHash("33".repeat(28)), Credential.script("44".repeat(28)) ]
        });
        expect( roundtrips( body ) ).toBe( true );

        const decoded = DijkstraTxBody.fromCbor( body.toCbor() );
        expect( decoded.guards?.every( g => g instanceof Credential ) ).toBe( true );
    });

    test("directDeposits (key 25)", () => {
        const body = minimalBody({
            directDeposits: [
                { rewardAccount: new Hash28("55".repeat(28)), amount: 1_000_000 }
            ]
        });
        expect( roundtrips( body ) ).toBe( true );
        expect( body.directDeposits ).toBeDefined();
    });

    test("accountBalanceIntervals (key 26)", () => {
        const body = minimalBody({
            accountBalanceIntervals: [
                {
                    credential: Credential.keyHash("66".repeat(28)),
                    interval: { inclusiveLowerBound: 10, exclusiveUpperBound: 100 }
                },
                {
                    credential: Credential.script("77".repeat(28)),
                    interval: { inclusiveLowerBound: null, exclusiveUpperBound: 50 }
                }
            ]
        });
        expect( roundtrips( body ) ).toBe( true );

        const decoded = DijkstraTxBody.fromCbor( body.toCbor() );
        expect( decoded.accountBalanceIntervals?.length ).toBe( 2 );
        expect( decoded.accountBalanceIntervals?.[1].interval.inclusiveLowerBound ).toBe( null );
    });

    test("account_balance_interval rejects both-nil bounds", () => {
        expect(() => new DijkstraAccountBalanceInterval({ inclusiveLowerBound: null, exclusiveUpperBound: null }) )
        .toThrow();
    });

    test("all new fields together round-trip", () => {
        const body = minimalBody({
            guards: [ Credential.keyHash("33".repeat(28)) ],
            directDeposits: [ { rewardAccount: new Hash28("55".repeat(28)), amount: 7 } ],
            accountBalanceIntervals: [
                { credential: Credential.keyHash("66".repeat(28)), interval: { inclusiveLowerBound: 1, exclusiveUpperBound: null } }
            ]
        });
        expect( roundtrips( body ) ).toBe( true );
    });
});
