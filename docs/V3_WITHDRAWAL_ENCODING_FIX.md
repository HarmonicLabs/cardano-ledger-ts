# V3 Withdrawal Encoding Fix — Handoff

> Patch handoff from a separate debugging session in `gravity-dex/gravity-monorepo/gravity-sdk`. This session diagnosed a bug in this library that causes Plutus V3 on-chain withdrawal validators to fail with `explicit error from uplc` and empty logs. A local `node_modules` patch verified the fix; this document describes the upstream change to apply here.

## TL;DR

`TxWithdrawals.toData("v3")` produces map keys in the **V1/V2 wire format** (`Constr 0 [Credential]` — i.e., `StakingHash Credential`) instead of the **V3 wire format** (`Credential` directly, no wrap). On-chain V3 validators destructure `tx.withdrawals.head.fst` as a `Credential` (matching `PScriptCredential`/`PPubKeyCredential` constructors), see the outer `Constr 0` (which is the V1/V2 `StakingHash` wrapper), interpret it as `PPubKeyCredential`, and fire whatever the validator does on the key branch (often `perror`).

The fix is a small change in `TxWithdrawals.toData` that strips the StakingHash wrap when serializing for V3 only. V1/V2 are left alone.

## What Plutus expects vs. what the library emits

**Plutus V3** (Conway era) — `TxInfo`:
```haskell
txInfoWdrl :: AssocMap.Map V2.Credential V2.Lovelace
```
Keys are `Credential` (`PubKeyCredential ByteString | ScriptCredential ScriptHash`).

**Plutus V1/V2** — `TxInfo`:
```haskell
txInfoWdrl :: [(StakingCredential, Integer)]
```
Keys are `StakingCredential` (`StakingHash Credential | StakingPtr ...`), which wraps `Credential` in `StakingHash`.

When the script context is built, `tx.withdrawals.toData(version)` emits the map. For each entry:

| `version` | Plutus expects | Library currently emits | Correct? |
|---|---|---|---|
| `"v3"` | `Credential` (e.g. `Constr 1 [hash]`) | `Constr 0 [Constr 1 [hash]]` | ❌ wrong (extra StakingHash wrap) |
| `"v2"` | `StakingCredential` (`Constr 0 [Credential]`) | `Constr 0 [Constr 1 [hash]]` | ✅ |
| `"v1"` | `StakingCredential` (`Constr 0 [Credential]`) | `Constr 0 [Constr 1 [hash]]` | ✅ |

V3 is wrong because the chain `TxWithdrawals.toData(version)` → `StakeAddress.toStakeCredentials()` → `StakeCredentials.toData(version)` ends in [`src/credentials/StakeCredentials.ts:131-159`](src/credentials/StakeCredentials.ts#L131-L159), which **always** wraps the `Credential` in `Constr 0` for V3:

```ts
toData( version?: ToDataVersion ): DataConstr
{
    const isOldVersion = version !== "v1" && version !== "v2";  // ← misleadingly named: TRUE for "v3"

    if( this.type === "pointer" )
    {
        if( isOldVersion )                                       // V3: pointer is deprecated → throw ✓
        throw new Error("staking pointer was deprecated in conway, can't convert to data");

        return new DataConstr( 1, /* PStakingPtr */ ... );        // V1/V2: PStakingPtr ✓
    }

    const credData = new Credential({...}).toData( version );

    if( isOldVersion )                                           // V3
    return new DataConstr( 0, [ credData ] );                    // ← wraps in PStakingHash (Constr 0)

    return credData;                                             // V1/V2: bare Credential
}
```

Note `StakeCredentials.toData("v3")` returning `Constr 0 [Credential]` is **correct** for the `Address.addressStakingCredential` field (V3 still uses `Maybe<StakingCredential>` with `StakingHash` wrapping there). It's only wrong for the *withdrawal map key* path.

In other words: `StakeCredentials.toData` is shared by two consumers with conflicting V3 needs. The fix should live at the consumer that wants the bare `Credential` (i.e., `TxWithdrawals.toData`) — **not** in `StakeCredentials.toData`. (We tried fixing it in `StakeCredentials.toData` first and it broke the address-stake-field encoding everywhere, which cascaded into changing parameterized script hashes and breaking pool spend validators that compare `swappableOutput.address.eq( ownAddr )`. Don't do that.)

## Files to change

There are two mirrors of `TxWithdrawals.toData`. Patch both identically.

### 1. `src/eras/common/ledger/TxWithdrawals.ts` — lines 120-131

Current:

```ts
toData( version?: ToDataVersion | undefined): DataMap<DataConstr,DataI>
{
    return new DataMap(
        this.map
        .map( ({ rewardAccount, amount }) =>
            new DataPair(
                rewardAccount.toStakeCredentials().toData( version ),
                new DataI( amount )
            )
        )
    );
}
```

Replace with:

```ts
toData( version?: ToDataVersion | undefined): DataMap<DataConstr,DataI>
{
    return new DataMap(
        this.map
        .map( ({ rewardAccount, amount }) => {
            // Plutus V1/V2 keys withdrawals by `StakingCredential`
            // (`StakingHash Credential | StakingPtr ...`).
            //
            // Plutus V3 keys withdrawals by `Credential` directly:
            //   txInfoWdrl :: AssocMap.Map V2.Credential V2.Lovelace
            //
            // `StakeCredentials.toData("v3")` returns the address-shape
            // `Constr 0 [Credential]` (PStakingHash) so it stays correct for
            // `Address.addressStakingCredential` serialization. For V3
            // withdrawals we strip that StakingHash wrap to emit a bare
            // `Credential`. V1/V2 keep the wrap.
            let keyData: DataConstr = rewardAccount.toStakeCredentials().toData( version );
            if (
                version === "v3"
                && keyData.constr === BigInt(0)
                && Array.isArray( keyData.fields )
                && keyData.fields.length === 1
            ) {
                keyData = keyData.fields[0] as DataConstr;
            }
            return new DataPair( keyData, new DataI( amount ) );
        })
    );
}
```

### 2. `src/ledger/TxWithdrawals.ts` — lines 118-129

Same change as above. Body of the method is byte-identical between the two files.

## What I verified

The patch was applied to the compiled `.js` outputs of both mirrors in the consuming project's `node_modules` (4 files in total — 2 per consumer), then:

1. The on-chain `pmatch` on the withdrawal credential now correctly hits `onPScriptCredential` (was hitting `onPPubKeyCredential` before).
2. `Address.toData("v3")` is unaffected — the V3 address `stakingCredential` field still serializes as `Just(StakingHash(Credential))`, which on-chain validators that build their own expected address (e.g., `swappableOutput.address.eq( ownAddr )` patterns) require.
3. Parameterized script hashes are unaffected — the SDK's parameter encoding helpers also call `StakeCredentials.toData(version)` directly, and that method's behavior is unchanged. Existing on-chain UTxOs at the parameterized script addresses remain valid.

After the patch, account-driven swaps that previously failed with `explicit error from uplc` (empty logs, account spend script firing the withdrawal-credential `perror` branch) submitted and validated end-to-end.

## Suggested testing

A unit test exercising `TxWithdrawals.toData` for each version:

```ts
// V1: StakingHash wrap
const k1 = txWithdrawals.toData("v1").map[0].k;
expect(k1.constr).toBe( BigInt(0) );                         // PStakingHash
expect((k1.fields[0] as DataConstr).constr).toBe( BigInt(1) ); // PScriptCredential

// V2: same wrap shape
const k2 = txWithdrawals.toData("v2").map[0].k;
expect(k2.constr).toBe( BigInt(0) );                         // PStakingHash
expect((k2.fields[0] as DataConstr).constr).toBe( BigInt(1) ); // PScriptCredential

// V3: bare Credential, NO StakingHash wrap
const k3 = txWithdrawals.toData("v3").map[0].k;
expect(k3.constr).toBe( BigInt(1) );                         // PScriptCredential directly
```

(Adjust constructor indexes if the test fixture uses `stakeKey` instead of `script`.)

## Out-of-scope notes

- **Do NOT change `StakeCredentials.toData`.** It is correct for the `Address.addressStakingCredential` path which V3 still uses with the StakingHash wrap. We tried this first and it broke parameterized script compilation and on-chain address comparisons across multiple consumers. The proper boundary is the `TxWithdrawals` consumer itself.
- The variable name `isOldVersion` in `StakeCredentials.toData` is misleading (it's `true` for `"v3"`, the *newest* version). Renaming it for clarity (e.g., `isV3OrNewer`) would help future readers but is purely cosmetic — leave for a separate change.
- `pointer`-credentialed withdrawals are deprecated in Conway; `StakeCredentials.toData("v3")` already throws on them, so no special-casing is needed in the patched `TxWithdrawals.toData`.

## Severity / blast radius

Any V3 Plutus validator that reads `tx.withdrawals.head.fst` and `pmatch`es it as `Credential` would have been broken when called via this library. Consumers who never inspect withdrawal map keys on-chain wouldn't notice. This affects validators that use the `withdraw-0` defer-to-staking-script pattern (a common pattern for amortized account-style validation), which is how the bug surfaced in the gravity-dex account validator.

The fix is purely off-chain serialization; no Plutus version changes, no breaking ABI changes for downstream consumers. V1 and V2 behavior is byte-identical to before.

---

## What was actually implemented (2026-05-03)

### Deviation from the handoff: V1/V2 was also wrong

While implementing the fix and writing a regression test, a direct dump of `StakeCredentials.toData` per version revealed that the handoff's "What Plutus expects vs. what the library emits" table was wrong about V1/V2. Actual current behavior of `StakeCredentials.toData` (before this patch):

| `version` | What `StakeCredentials.toData` returned | Plutus actually expects (withdrawal key) |
|---|---|---|
| `"v1"` | bare `Credential` (`Constr X [hash]`) | `StakingCredential` = `Constr 0 [Credential]` (PStakingHash wrap) |
| `"v2"` | bare `Credential` | `Constr 0 [Credential]` (PStakingHash wrap) |
| `"v3"` | `Constr 0 [Credential]` (PStakingHash wrap) | bare `Credential` |

The branching in `StakeCredentials.toData` is `if (version !== "v1" && version !== "v2") return new DataConstr(0, [credData])` — so V3 is the one that gets the wrap, not V1/V2. The handoff's table inverted this. The on-chain symptom only surfaced in V3 because few V1/V2 validators `pmatch` withdrawal map keys directly, but per Plutus spec (`StakingCredential = StakingHash Credential | StakingPtr ...`), V1/V2 was just as wrong.

### Fix: normalize the wrap shape inside `TxWithdrawals.toData`

The fix was applied at the `TxWithdrawals` consumer (as the handoff recommended — `StakeCredentials.toData` is left alone because the address path depends on its current behavior), but it now handles **both directions**:

- `v1` / `v2` → wrap `StakeCredentials.toData(version)` in `Constr 0 [...]` (PStakingHash) so the withdrawal key matches `StakingCredential` shape.
- `v3` → strip the `Constr 0 [...]` wrap that `StakeCredentials.toData("v3")` emits, so the withdrawal key matches bare `Credential` shape.

Reward accounts never carry pointer credentials (`StakeAddress.type` is `"stakeKey" | "script"` only), so the V1/V2 wrap branch never has to distinguish `PStakingPtr` from `PStakingHash` — it can always wrap unconditionally.

### Files changed

1. [src/eras/common/ledger/TxWithdrawals.ts](src/eras/common/ledger/TxWithdrawals.ts) — `toData` rewritten to normalize the key shape per version. `DataConstr` was already imported.
2. [src/ledger/TxWithdrawals.ts](src/ledger/TxWithdrawals.ts) — byte-identical change in the mirror file.
3. [src/eras/common/ledger/__tests__/TxWithdrawals.toData.test.ts](src/eras/common/ledger/__tests__/TxWithdrawals.toData.test.ts) — new Jest spec (5 cases) covering:
   - V1 key is `Constr 0 [Constr 1 [hash]]` (PStakingHash wrapping PScriptCredential)
   - V2 key is the same shape as V1
   - V3 key is `Constr 1 [hash]` directly (no PStakingHash wrap)
   - V3 value is `DataI(amount)`
   - Invariant: `Address.toData("v3")` still emits `Just(StakingHash(Credential))` for the `addressStakingCredential` field — confirms we did not break the address path.
4. [package.json](package.json) — version bumped `0.5.1` → `0.5.2`.

### Files NOT changed (intentional)

- [src/credentials/StakeCredentials.ts](src/credentials/StakeCredentials.ts) — left alone per the handoff's warning. It serves both `Address.toData` and `TxWithdrawals.toData`, and its current shape is what `Address.addressStakingCredential` requires for V3 round-trips and parameterized-script-hash stability.
- `Address.toData` — out of scope. Note that `Address.toData("v1")` / `("v2")` likely has the same spec-divergence (emits `Maybe Credential` instead of `Maybe StakingCredential`), but changing it would alter address encodings used by parameterized scripts and `address.eq(ownAddr)` comparisons. Worth a separate investigation.

### Verification

- New spec (`TxWithdrawals.toData.test.ts`) — 5/5 pass.
- Full `npm test` suite — 10 pre-existing failures (`MaryBlock.fromCbor`, `Script.hash`, `Offchain.Value.new`, `MultiEraBlock.fromCbor`, `ConwayTx.fromCbor`, `Tx.fromCbor`); these all fail in the unmodified baseline and are unrelated to this change. Verified by stashing the patch and re-running: identical failure set.

### Risk to be aware of for V1/V2

The handoff said "V1 and V2 behavior is byte-identical to before." That is **no longer true** in this patch — V1/V2 withdrawal keys now go from bare `Credential` to `Constr 0 [Credential]`. This is the spec-correct shape for Plutus V1/V2, but downstream validators (especially in plu-ts-based stacks) that were authored against the previous bare-`Credential` off-chain encoding may see an on-chain ↔ off-chain mismatch after upgrading. If your V1/V2 validators only inspect the `Integer` value side of withdrawals (or do not introspect the map at all), nothing changes for them.
