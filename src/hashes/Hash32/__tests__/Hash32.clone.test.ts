import { Hash32 } from "../Hash32";
import { TxOut } from "../../../tx/body/output/TxOut";
import { Address } from "../../../eras/common/ledger/Address";
import { Value } from "../../../eras/common/ledger/Value/Value";

// Regression: Hash32 inherited Hash.clone(), which returns a plain Hash. TxOut accepts a datum only
// if it is a Hash32 or Data, so cloning an output locked with a datum hash threw "invalid 'datum' field".
describe("Hash32 clone", () => {
    const hex = "92".repeat(32);

    test("keeps the Hash32 type and the bytes", () => {
        const original = new Hash32(hex);
        const clone = original.clone();
        expect(clone).toBeInstanceOf(Hash32);
        expect(clone.toString()).toBe(hex);
    });

    test("does not share the byte buffer with the original", () => {
        const original = new Hash32(hex);
        const clone = original.clone();
        expect(clone.toBuffer()).not.toBe(original.toBuffer());
        clone.toBuffer()[0] = 0;
        expect(original.toString()).toBe(hex);
    });

    test("an output with a datum hash can be cloned", () => {
        const out = new TxOut({
            address: Address.fromString("addr_test1vqm5vyp8xztmxyl6mcr2xr5schajvsq8fjs8gn8g2zu0pgg8gckcp"),
            value: Value.lovelaces(2_000_000),
            datum: new Hash32(hex),
        });
        const clone = out.clone();
        expect(clone.datum).toBeInstanceOf(Hash32);
        expect((clone.datum as Hash32).toString()).toBe(hex);
    });
});
