import { DijkstraTxBody } from "../DijkstraTxBody";
import { DijkstraSubTransaction, DijkstraSubTransactionBody } from "../DijkstraSubTransaction";
import { DijkstraTxWitnessSet } from "../DijkstraTxWitnessSet";
import { DijkstraTxOut } from "../DijkstraTxOut";
import { DijkstraUTxO } from "../DijkstraUTxO";
import { Credential } from "../../../../credentials";
import { DataI } from "@harmoniclabs/plutus-data";

function fakeInput( id = "ab".repeat(32), index = 0 )
{
    return new DijkstraUTxO({ utxoRef: { id, index }, resolved: DijkstraTxOut.fake });
}

function fakeSubTx( extra: any = {} ): DijkstraSubTransaction
{
    return new DijkstraSubTransaction({
        body: new DijkstraSubTransactionBody({
            inputs: [ fakeInput() ],
            outputs: [ DijkstraTxOut.fake ],
            ...extra
        }),
        witnessSet: new DijkstraTxWitnessSet({}),
        auxiliaryData: null
    });
}

function bodyWith( nastyTransactions: DijkstraSubTransaction[] ): DijkstraTxBody
{
    return new DijkstraTxBody({
        inputs: [ fakeInput("cd".repeat(32), 1) ],
        outputs: [ DijkstraTxOut.fake ],
        fee: 200_000,
        nastyTransactions
    });
}

function roundtrips( body: DijkstraTxBody ): boolean
{
    const cbor = body.toCbor();
    return DijkstraTxBody.fromCbor( cbor ).toCbor().toString() === cbor.toString();
}

describe("DijkstraSubTransaction (CIP-118 nasty transactions, key 23)", () => {

    test("module wiring: DijkstraSubTransaction loads (no circular-import breakage)", () => {
        expect( typeof DijkstraSubTransaction ).toBe( "function" );
        expect( typeof DijkstraSubTransactionBody ).toBe( "function" );
    });

    test("sub_transaction is a 3-tuple (no fee, no is_valid)", () => {
        const arr = fakeSubTx().toCborObj();
        expect( arr.array.length ).toBe( 3 );
        // sub_transaction_body has no key 2 (fee)
        const bodyMap = fakeSubTx().body.toCborObj();
        expect( bodyMap.map.find( e => (e.k as any).num === 2n ) ).toBeUndefined();
    });

    test("tx body with one nasty transaction round-trips", () => {
        const body = bodyWith([ fakeSubTx() ]);
        expect( roundtrips( body ) ).toBe( true );
        const decoded = DijkstraTxBody.fromCbor( body.toCbor() );
        expect( decoded.nastyTransactions?.length ).toBe( 1 );
    });

    test("tx body with multiple nasty transactions round-trips", () => {
        const body = bodyWith([ fakeSubTx(), fakeSubTx({ ttl: 999 }) ]);
        expect( roundtrips( body ) ).toBe( true );
        expect( DijkstraTxBody.fromCbor( body.toCbor() ).nastyTransactions?.length ).toBe( 2 );
    });

    test("required_top_level_guards (key 24) round-trips, incl. nil data", () => {
        const sub = fakeSubTx({
            requiredTopLevelGuards: [
                { credential: Credential.keyHash("11".repeat(28)), data: new DataI( 42 ) },
                { credential: Credential.script("22".repeat(28)), data: null }
            ]
        });
        const body = bodyWith([ sub ]);
        expect( roundtrips( body ) ).toBe( true );

        const decodedSub = DijkstraTxBody.fromCbor( body.toCbor() ).nastyTransactions![0];
        expect( decodedSub.body.requiredTopLevelGuards?.length ).toBe( 2 );
        expect( decodedSub.body.requiredTopLevelGuards?.[1].data ).toBe( null );
    });
});
