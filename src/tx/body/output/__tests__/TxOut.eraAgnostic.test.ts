import { TxOut } from "../TxOut";
import { ConwayTxOut } from "../../../../eras/conway/tx/ConwayTxOut";
import { withDecodeVersion } from "../../../../utils/strictCbor";
import { fromHex } from "@harmoniclabs/uint8array-utils";

// A Mary-era output (legacy array) holding a zero quantity of an asset: legal before protocol 9, so
// such outputs exist in the UTxO set and must decode when read back through the era-agnostic TxOut.
// [addr, [coin, {policy: {name: 0}}]]
const ADDR = "581d61" + "11".repeat(28);
const ZERO_ASSET_OUT = "82" + ADDR + "82" + "1a000f4240" + "a1" + "581c" + "22".repeat(28) + "a1" + "41" + "61" + "00";

describe("era-agnostic TxOut decodes stored outputs of every era", () => {
    test("a zero-quantity asset (legal before protocol 9) decodes through TxOut.fromCbor", () => {
        expect(() => TxOut.fromCbor(ZERO_ASSET_OUT)).not.toThrow();
    });
    test("the Conway output decoder still rejects it", () => {
        expect(() => ConwayTxOut.fromCbor(ZERO_ASSET_OUT)).toThrow();
    });
    test("inside an era context the enclosing version is kept", () => {
        expect(() => withDecodeVersion(9, () => TxOut.fromCbor(fromHex(ZERO_ASSET_OUT)))).toThrow();
    });
});
