import { fromHex } from "@harmoniclabs/uint8array-utils";
import { Hash28 } from "../../../../../hashes";
import { Value } from "../Value";

describe("Value.add", () => {

    const policyB_bytes = fromHex("37556484666c756cbc194a421b806026b2ada71a5cf6af34f6db1d6c");
    const nameB = new Uint8Array([ 0x42 ]);

    const policyIdx = fromHex("f31a058100f80f5cfc280af762a788e4d0287b2337a9ac6ffbc28c2f");

    const policyA_bytes = fromHex("f3be2cfbdc92b19488ee406e746e78680658e196e5d04f924f6f859b");
    const nameA = fromHex("41");

    test("swap", () => {
        const swpInputValue = Value.add(
            Value.lovelaces( 8_000_000n ),
            Value.singleAsset(
                policyB_bytes,
                nameB,
                1_875_000_000n
            ),
            Value.singleAsset(
                policyIdx,
                fromHex("00"),
                1n
            )
        );

        const valueOutput = Value.singleAsset(
            new Hash28( policyB_bytes ),
            nameB,
            2_424_552n
        );
        const valueInput = Value.singleAsset(
            new Hash28( policyA_bytes ),
            nameA,
            5_000_000n
        );
        const valueLovelaces = Value.lovelaces( 599_482n );

        const nextSwappableValue = (
            Value.add(
                Value.sub(
                    swpInputValue,
                    valueOutput
                ),
                valueInput,
                valueLovelaces
            )
        );

        console.log(
            JSON.stringify(nextSwappableValue, null, 2)
        );

    });
});