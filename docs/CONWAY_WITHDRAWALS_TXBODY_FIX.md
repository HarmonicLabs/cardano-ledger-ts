# Conway Withdrawals `TxBody` Validation Fix

> Patch handoff. A consumer (`@harmoniclabs/buildooor` → `@harmoniclabs/cardano-ledger-ts`) reported that the `TxBody` constructor rejects every withdrawal-bearing tx with `Error: invalid 'withdrawals' field` when the withdrawal's `rewardAccount` is a `StakeAddress` instance imported via the public barrel. Root cause is the same dual-class identity split that [`CONWAY_CERTS_TXBODY_FIX.md`](CONWAY_CERTS_TXBODY_FIX.md) addressed for certs — and the same one-line repoint applies. Patched in `0.5.2` (no version bump; per project policy, kept in-place since not yet published).

## TL;DR

The repo has two parallel `StakeAddress.ts` and `TxWithdrawals.ts` files — a legacy pair under [src/ledger/](src/ledger/) and an eras pair under [src/eras/common/ledger/](src/eras/common/ledger/). The legacy `src/ledger/index.ts` has `// export * from "./StakeAddress"` and `// export * from "./TxWithdrawals"` commented out (lines 10–11), so the public barrel resolves to the **eras/common** classes.

But [src/tx/body/TxBody.ts](src/tx/body/TxBody.ts) lines 6 and 11 (before this patch) still imported withdrawal helpers from the **legacy** path:

```ts
import { canBeTxWithdrawals, forceTxWithdrawals } from "../../ledger/TxWithdrawals";
import { TxWithdrawals, ITxWithdrawals } from "../../ledger/TxWithdrawals";
```

The legacy [`src/ledger/TxWithdrawals.ts:1`](src/ledger/TxWithdrawals.ts#L1) imports `StakeAddress` from `./StakeAddress` — the legacy class. The validation at [`src/ledger/TxWithdrawals.ts:31–42`](src/ledger/TxWithdrawals.ts#L31-L42):

```ts
export function isTxWithdrawalsMap( stuff: any ): stuff is ITxWithdrawalsMap
{
    if( !Array.isArray( stuff ) ) return false;
    return stuff.every( ({ rewardAccount, amount }) =>
        ( canBeHash28( rewardAccount ) || rewardAccount instanceof StakeAddress )
        && canBeUInteger( amount ) );
}
```

When the consumer constructs `new StakeAddress({...})` via the public barrel, they get the **eras/common** class. `canBeHash28(<StakeAddress>)` is false (`StakeAddress` is not Hash28-shaped). `instanceof StakeAddress` against the **legacy** class returns false (different class object). Validation throws `invalid 'withdrawals' field`.

The fix in [src/tx/body/TxBody.ts](src/tx/body/TxBody.ts) is exactly the same shape the cert fix already used at line 9 (`import { Certificate, ... } from "../../eras/common/ledger/certs/Certificate"`) — but for withdrawals on lines 6 and 11.

## The patch

Two import lines in [src/tx/body/TxBody.ts](src/tx/body/TxBody.ts) repointed:

```diff
-import { canBeTxWithdrawals, forceTxWithdrawals } from "../../ledger/TxWithdrawals";
+import { canBeTxWithdrawals, forceTxWithdrawals } from "../../eras/common/ledger/TxWithdrawals";
 ...
-import { TxWithdrawals, ITxWithdrawals } from "../../ledger/TxWithdrawals";
+import { TxWithdrawals, ITxWithdrawals } from "../../eras/common/ledger/TxWithdrawals";
```

These can be combined into a single import. Both legacy and eras/common modules export `canBeTxWithdrawals`, `forceTxWithdrawals`, `TxWithdrawals`, and `ITxWithdrawals` with compatible signatures (verified at [src/eras/common/ledger/TxWithdrawals.ts:65, 227, 232](src/eras/common/ledger/TxWithdrawals.ts)).

## Why the discovery path matters

`TxBody.ts` line 9 was repointed for `Certificate` in the earlier `CONWAY_CERTS_TXBODY_FIX.md` patch. Lines 6 and 11 (withdrawals) were missed in that round because the consumer's flows in scope at the time didn't exercise withdrawals. The Gravity-DEX swap path uses a `withdraw-0` defer-to-staking idiom — every swap tx carries a withdrawal entry — which surfaced the equivalent dual-class identity gap for `StakeAddress` / `TxWithdrawals`.

## Reproducer

```ts
import { StakeAddress, TxBody, StakeValidatorHash } from "@harmoniclabs/cardano-ledger-ts";
// ... build a tx body that sets:
new TxBody({
    inputs: [...],
    outputs: [...],
    fee: 0n,
    withdrawals: [{
        rewardAccount: new StakeAddress({
            network: "testnet",
            credentials: new StakeValidatorHash(<scriptHash>),
            type: "script",
        }),
        amount: 0n,
    }],
});
// pre-patch: throws Error: invalid 'withdrawals' field
// post-patch: constructs successfully
```

## Validation

After patching:

```bash
cd cardano-ledger-ts
npx tsc --noEmit -p tsconfig.json   # passes
npm run build && npm pack            # version stays 0.5.2
```

Then re-link consumers (`buildooor`, then `gravity-sdk`, then `gravity-website`) since version 0.5.2 isn't bumped — `npm install` will skip extraction unless `node_modules/@harmoniclabs/cardano-ledger-ts` is wiped first.

## Companion

The `V3_WITHDRAWAL_ENCODING_FIX.md` patch (V3 withdrawal map key encoding for on-chain ScriptContext) is **orthogonal** to this fix. That one ensures Plutus V3 sees `PScriptCredential` directly rather than `PStakingHash → PScriptCredential`. This patch is purely about offchain TxBody constructor validation accepting the `StakeAddress` instance the consumer hands it.
