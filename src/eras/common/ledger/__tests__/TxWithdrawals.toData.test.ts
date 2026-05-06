import { DataB, DataConstr, DataI } from "@harmoniclabs/plutus-data";
import { TxWithdrawals } from "../TxWithdrawals";
import { StakeAddress } from "../StakeAddress";
import { Address } from "../Address";
import { Credential, CredentialType } from "../../../../credentials/Credential";
import { StakeCredentials, StakeCredentialsType, StakeValidatorHash } from "../../../../credentials/StakeCredentials";
import { Hash28 } from "../../../../hashes/Hash28/Hash28";

describe("TxWithdrawals.toData", () => {

    const scriptHashHex = "ab".repeat(28);
    const rewardAccount = new StakeAddress({
        network: "mainnet",
        type: "script",
        credentials: new StakeValidatorHash( scriptHashHex )
    });
    const withdrawals = new TxWithdrawals([
        { rewardAccount, amount: 1_000_000n }
    ]);

    test("v1 key is StakingHash wrapping ScriptCredential", () => {
        const k = withdrawals.toData("v1").map[0].fst;
        expect( k ).toBeInstanceOf( DataConstr );
        expect( k.constr ).toBe( BigInt(0) ); // PStakingHash
        const inner = k.fields[0] as DataConstr;
        expect( inner ).toBeInstanceOf( DataConstr );
        expect( inner.constr ).toBe( BigInt(1) ); // PScriptCredential
        expect( inner.fields[0] ).toBeInstanceOf( DataB );
    });

    test("v2 key is StakingHash wrapping ScriptCredential", () => {
        const k = withdrawals.toData("v2").map[0].fst;
        expect( k.constr ).toBe( BigInt(0) ); // PStakingHash
        const inner = k.fields[0] as DataConstr;
        expect( inner.constr ).toBe( BigInt(1) ); // PScriptCredential
    });

    test("v3 key is bare ScriptCredential (no StakingHash wrap)", () => {
        const k = withdrawals.toData("v3").map[0].fst;
        expect( k ).toBeInstanceOf( DataConstr );
        expect( k.constr ).toBe( BigInt(1) ); // PScriptCredential directly
        expect( k.fields[0] ).toBeInstanceOf( DataB );
    });

    test("v3 value is the lovelace amount", () => {
        const v = withdrawals.toData("v3").map[0].snd;
        expect( v ).toBeInstanceOf( DataI );
        expect( v.int ).toBe( BigInt(1_000_000) );
    });

    test("Address.toData(\"v3\") still wraps stake credential in StakingHash (invariant)", () => {
        // The v3 fix is scoped to TxWithdrawals only; the address path must
        // still emit Just(StakingHash(Credential)) so that on-chain
        // address.eq(ownAddr) comparisons keep working.
        const address = new Address({
            network: "mainnet",
            paymentCreds: new Credential({
                type: CredentialType.Script,
                hash: new Hash28( "cd".repeat(28) )
            }),
            stakeCreds: new StakeCredentials({
                type: StakeCredentialsType.Script,
                hash: new StakeValidatorHash( scriptHashHex )
            })
        });

        const data = address.toData("v3") as DataConstr;
        expect( data.constr ).toBe( BigInt(0) );

        const just = data.fields[1] as DataConstr;
        expect( just.constr ).toBe( BigInt(0) ); // Just

        const stakingHash = just.fields[0] as DataConstr;
        expect( stakingHash.constr ).toBe( BigInt(0) ); // PStakingHash wrap is preserved

        const inner = stakingHash.fields[0] as DataConstr;
        expect( inner.constr ).toBe( BigInt(1) ); // PScriptCredential
    });
});
