import { Address } from "../ledger/Address";
import { ByronAddress } from "../../byron/ByronAddress";

describe("Address.fromString", () => {

    test("id", () => {
        const str = "addr_test1xrpswm9jytchpkmhm80vvk24w86dh8gycw3r736px9l8q92k9egxlxzgq2j7ck2zssryn60784kqna8qst7h20qn2dkqz2cj8g";
        const addr = Address.fromString(str);
        expect( addr ).toBeInstanceOf( Address );
        expect( (addr as Address).toString() ).toBe(str);
    });

    test("parses a Byron address instead of throwing", () => {
        const str = "Ae2tdPwUPEZG5vXaeYjSJJNuFzZ2cgAhJe7AaVGFW4epbC1h8nFeaxhgzR3";
        const addr = Address.fromString(str);
        expect( addr ).toBeInstanceOf( ByronAddress );
        expect( (addr as ByronAddress).toBase58() ).toBe( str );
        expect( addr ).not.toBeInstanceOf( Address );
    });

    test("still throws on non-addresses", () => {
        expect( () => Address.fromString("definitely not an address") ).toThrow();
    });
});
