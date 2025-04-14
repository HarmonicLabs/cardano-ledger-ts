import { fromAscii } from "@harmoniclabs/uint8array-utils";
import { Value } from "../Value";
import { Hash28 } from "../../../../hashes";
import { IValueToJson } from "../IValue";

test("sorted", () => {

    const v = new Value([
        {
            policy: new Hash28("ff".repeat(28)),
            assets: [
                {
                    name: fromAscii("hello_there"),
                    quantity: 88
                },
                {
                    name: fromAscii("hello"),
                    quantity: 1 
                },
            ]
        }
    ]);

    const assets = v.map[1].assets;

    expect( assets.length ).toBe( 2 )
    expect( assets[0] )
    .toEqual({
        name: fromAscii("hello"),
        quantity: 1n
    });
    expect( assets[1] )
    .toEqual({
        name: fromAscii("hello_there"),
        quantity: 88n
    });
})