# Empty-`outputs` `TxBody` Decode Fix

> Patch handoff. A full-chain replay of a real **preprod** `cardano-node` ChainDB (5633 chunks,
> ~4.65M blocks, Byron → Conway) through `@harmoniclabs/cardano-ledger-ts` found **139 Babbage
> blocks** that fail to decode with `Error: invald 'outputs' field`. Root cause: every era's
> `TxBody` decoder required `outputs.length > 0`, but the CDDL allows **zero** outputs. Every
> other block on chain (all eras, byte-exact round-trip) passed — this was the only decode
> failure. Kept in-place in the working tree (no version bump / not committed; per project policy).

## TL;DR

The ledger CDDL defines the transaction outputs field as **zero-or-more**:

```
transaction_body = { ... , 1 : [* transaction_output] , ... }
```

`[* transaction_output]` (`*` = zero or more) — an empty `outputs` array is grammatically valid.
The offending blocks are in the node's **immutable** DB, i.e. they were validated and accepted by
a real `cardano-node`, so a zero-output transaction is legitimate on-chain (e.g. a tx whose entire
input value is consumed by fee / treasury donation).

Each era's `TxBody` constructor, however, enforced `outputs.length > 0` and threw
`invald 'outputs' field` on any tx with no outputs. The one-line clause was removed in all eight
`TxBody` files so the decoder matches the CDDL. Decode-level validation should follow the grammar;
ledger-rule minimums (if any) are a separate concern from CBOR deserialization.

## Evidence (isolated block)

- First failing block: **slot 10884250**, chunk 503, Babbage (era 6), 2914 bytes.
- The block has 3 transactions; **`tx[1]` has an empty `outputs` array** (CBOR `80`).
- Before the fix: `MultiEraBlock.fromCbor(...)` → `BabbageTxBody` constructor → throws
  `invald 'outputs' field`.
- After the fix: block decodes (era 6) and the whole chunk round-trips byte-exact (1036/1036).

## The patch

Identical one-line deletion in each of the eight `TxBody` decoders — the `outputs.length > 0 &&`
clause inside the outputs-validation guard:

```diff
         if(!(
             Array.isArray( outputs )  &&
-            outputs.length > 0 &&
             outputs.every( isI<Era>TxOut )
         )) throw new Error("invald 'outputs' field");
```

### Files changed (line numbers are the removed line, pre-edit)

| File | Removed line (pre-edit) | Guard now ends at (post-edit throw line) |
|---|---|---|
| [src/tx/body/TxBody.ts](../../src/tx/body/TxBody.ts) | 213 (`outputs.length > 0 &&`) | 214 |
| [src/eras/shelley/tx/ShelleyTxBody.ts](../../src/eras/shelley/tx/ShelleyTxBody.ts) | 128 | 129 |
| [src/eras/allegra/tx/AllegraTxBody.ts](../../src/eras/allegra/tx/AllegraTxBody.ts) | 132 | 133 |
| [src/eras/mary/tx/MaryTxBody.ts](../../src/eras/mary/tx/MaryTxBody.ts) | 136 | 137 |
| [src/eras/alonzo/tx/AlonzoTxBody.ts](../../src/eras/alonzo/tx/AlonzoTxBody.ts) | 151 | 152 |
| [src/eras/babbage/tx/BabbageTxBody.ts](../../src/eras/babbage/tx/BabbageTxBody.ts) | 175 | 176 |
| [src/eras/conway/tx/ConwayTxBody.ts](../../src/eras/conway/tx/ConwayTxBody.ts) | 207 | 208 |
| [src/eras/dijkstra/tx/DijkstraTxBody.ts](../../src/eras/dijkstra/tx/DijkstraTxBody.ts) | 235 | 236 |

Total diff: **8 files changed, 8 deletions(-)**. No other lines touched.

### Why all eras (not just Babbage)

The 139 observed failures were all Babbage, but the CDDL uses `[* transaction_output]` in **every**
era (shelley/allegra/mary/alonzo/babbage/conway/dijkstra) and the base `TxBody`. The identical
faulty `length > 0` check existed in all of them, so the fix is applied consistently across all
eras to match the grammar. The remaining guard (`Array.isArray(outputs) && outputs.every(isI…TxOut)`)
still rejects a non-array or malformed outputs.

> Note: the `inputs` field guard still keeps `inputs.length > 0`; it was **not** changed. No
> empty-inputs tx exists on chain and an input-less tx is not meaningful — left as-is deliberately.

## Follow-up: the same check survived in the `isI…TxBody` type guards (fix completed)

The original patch above was **correct but incomplete**. Each `TxBody` file carries the
`outputs.length > 0` logic in **two** places, and the first patch only removed one:

1. **The constructor's inline validation** (the `throw new Error("invald 'outputs' field")`
   guard) — removed in the original patch. This is the **decode path**
   (`fromCborObj → new *TxBody({...})`), so removing it is what fixed the 139 blocks.
2. **The `isI…TxBody(body)` type-guard predicate** (a standalone `export function` near the top
   of each file) — **still** had `Array.isArray( b.outputs ) && b.outputs.length > 0 && …`.

Because guard #2 was left in place, the decoder and the type guard disagreed:
`(new *TxBody(zeroOutputBody))` succeeds, but `isI*TxBody(sameZeroOutputBodyObject)` returns
`false` — even though a zero-output body is valid per the CDDL.

**Why the harness didn't catch it.** Guard #2 is only reached on the *construct-from-plain-object*
path, e.g. `new BabbageTx({ body: { …outputs: [] } })`, where the `*Tx` constructor validates via
`body instanceof *TxBody || isI*TxBody(body)`
([BabbageTx.ts:56-59](../../src/eras/babbage/tx/BabbageTx.ts#L56-L59)). On the **decode** path the
body is always a real `*TxBody` **instance**, so `instanceof` is `true` and the `||` short-circuits
before `isI*TxBody` ever runs. The replay harness only decodes (producing instances), so it never
exercises guard #2 — the inconsistency was invisible to it.

**Completing fix.** The identical `&& b.outputs.length > 0` clause was removed from the
`isI…TxBody` predicate in all eight files (base `TxBody` + shelley/allegra/mary/alonzo/babbage/
conway/dijkstra), so the type guards now agree with the decoder and the CDDL. `inputs.length > 0`
is again kept in the `isI…TxBody` predicates for the same reason as above. The predicates still
reject a non-array or malformed `outputs` (`Array.isArray(b.outputs) && b.outputs.every(isI…TxOut)`).

Total for this follow-up: **8 files changed, 8 deletions(-)** (the `isI…TxBody` guards).

## Verification

- Isolated block (slot 10884250 / chunk 503): decodes + byte-exact round-trip after fix.
- Harness on chunk 503: `RESULT: PASS — 1036/1036` round-trip / header-hash / deep-decode.
- Ledger Jest suite (`npx jest`): **173 passed, 0 failed** (10 suites skipped as before).
- Full-chain replay re-run: in progress to confirm all 139 blocks pass with no regressions.
- After the follow-up `isI…TxBody` removal: `npm run build` clean, `npx jest` still **173 passed,
  0 failed** — the type guards now accept zero-output bodies, matching the decoder.

## Provenance

Found by the `cardano-ai-node-testing-harness` full-chain replay (decode → byte-exact round-trip →
deep decode against every block on preprod). See that repo's `AGENT_INSTRUCTIONS.md`.
