import { Address } from "../ledger/Address";

describe("Address.fromString", () => {

    test("id", () => {
        const str = "addr_test1xrpswm9jytchpkmhm80vvk24w86dh8gycw3r736px9l8q92k9egxlxzgq2j7ck2zssryn60784kqna8qst7h20qn2dkqz2cj8g";
        const addr = Address.fromString(str);
        expect( addr.toString() ).toBe(str);
    })
});