import { TxBody } from "../TxBody";
import { UTxO } from "../output/UTxO";
import { TxOut } from "../output/TxOut";
import { Address } from "../../../eras/common/ledger/Address";
import { Value } from "../../../eras/common/ledger/Value/Value";

// Regression for the inverted `totCollateral` guard: the validation `if(!(...))` was missing its
// `throw`, so the assignment below became the if-body — a VALID totCollateral was silently dropped
// (body field 17 never serialized; parse → reconstruct round-trips lost the field and changed the
// body hash), while only INVALID input was ever assigned.
describe("TxBody totCollateral", () => {
    const addr = Address.fromString(
        "addr_test1qqetxfc069tpemq25f954mrg2rxsr9jgvqe78hvyn9zuxxdvaqvlg96unszfywdfrjwq0m8zp0m7wjza0n2pfeep5h7qw62gd8"
    );
    const utxo = new UTxO({
        utxoRef: { id: "aa".repeat(32), index: 0 },
        resolved: { address: addr, value: Value.lovelaces(10_000_000) },
    });
    const base = {
        inputs: [utxo] as [UTxO],
        outputs: [new TxOut({ address: addr, value: Value.lovelaces(9_000_000) })],
        fee: 200_000,
    };

    test("a valid totCollateral is kept (was silently dropped)", () => {
        const body = new TxBody({ ...base, totCollateral: 5_000_000 });
        expect(body.totCollateral).toBe(BigInt(5_000_000));
    });

    test("totCollateral survives a CBOR round-trip (field 17)", () => {
        const body = new TxBody({ ...base, totCollateral: 5_000_000 });
        const reparsed = TxBody.fromCbor(body.toCbor());
        expect(reparsed.totCollateral).toBe(BigInt(5_000_000));
    });

    test("undefined stays undefined", () => {
        expect(new TxBody({ ...base }).totCollateral).toBeUndefined();
    });

    test("an invalid totCollateral throws (was the only case that ever got assigned)", () => {
        expect(
            () => new TxBody({ ...base, totCollateral: -1 as unknown as number })
        ).toThrow("totCollateral");
    });
});
