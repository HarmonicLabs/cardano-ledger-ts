# FINDING (not yet fixed): `Value` rejects duplicate policy keys in a mint

> Status: **investigation write-up for review. No code has been changed.** Awaiting direction on
> the fix. Found by the `harmoniclabs-testing-harness` full-chain preprod replay — this was the
> 2nd, distinct decode failure it surfaced, previously hidden behind the empty-outputs error on
> the same block (see [EMPTY_OUTPUTS_TXBODY_FIX.md](EMPTY_OUTPUTS_TXBODY_FIX.md)).

## What was found

One preprod block fails to decode:

```
slot 44967049  chunk 2081  Babbage (era 6)  3226 bytes
decode threw: invalid value interface passed to contruct a 'value' instance
```

The transaction's **mint** field (`transaction_body` key 9) is a CBOR map with a **duplicate
policy key** — the same policy id appears as two separate map entries:

```
mint = {
  f923673e7bc027eba929a9086b7b04a126a18ef524b41db6fb014a26 : { "ALAL_TEST"(414c414c415f54455354)     : 1 },
  f923673e7bc027eba929a9086b7b04a126a18ef524b41db6fb014a26 : { "GAGAGA_TEST2"(4741474147415f5445535432) : 1 }
}                                                          ^^^ same policy id, second map entry
```

Canonically this would be one entry `{ policy : { ALAL_TEST:1, GAGAGA_TEST2:1 } }`, but the minter
emitted two entries under the same key. The block is in the node's **immutable** DB, so a real
`cardano-node` accepted it — duplicate CBOR map keys are tolerated on-chain here.

## Root cause

- `mint` decodes via `Value.fromCborObj`
  ([src/eras/babbage/tx/BabbageTxBody.ts](../../src/eras/babbage/tx/BabbageTxBody.ts), `mint: Value.fromCborObj(_mint)`).
- `valueFromCborObj` faithfully builds an `IValue` with **two entries sharing the same policy**.
- The `Value` constructor validates via `isIValue`, which rejects duplicate policies at
  [src/eras/common/ledger/Value/IValue.ts:288](../../src/eras/common/ledger/Value/IValue.ts#L288):
  ```ts
  // duplicate entry
  if( policies.includes( policyAsStr ) ) return false;
  ```
  → `isIValue` returns false → the constructor throws at
  [src/eras/common/ledger/Value/Value.ts:53](../../src/eras/common/ledger/Value/Value.ts#L53):
  `throw new Error("invalid value interface passed to contruct a 'value' instance")`.

Decode-path stack:
```
new Value                (Value.ts:53)
  ← valueFromCborObj      (Value.ts)
  ← BabbageTxBody.fromCborObj  (mint field, key 9)
  ← BabbageBlock.fromCborObj ← MultiEraBlock.fromCbor
```

The same limitation applies to any `Value` (mint or output) whose CBOR carries a duplicate policy
id, and — by the same shape — likely a duplicate **asset name** within a policy.

## How it was found

1. Full-chain replay of preprod (5633 chunks, 4,651,390 blocks) via the harness `ledger`
   validator: decode → byte-exact round-trip → deep decode. After the empty-outputs fix, exactly
   **one** block still failed, reported as `slot 44967049 [era-1] … invalid value interface`.
2. Grepped the message → `Value.ts:53` (the `isIValue` guard in the `Value` constructor).
3. Read-only probe: binary-searched chunks by slot to locate the block (chunk 2081), parsed the
   raw CBOR generically, captured the decode stack (→ mint field), then dumped the mint map:
   two policy entries with the **identical** 28-byte policy id → duplicate key confirmed.

## Impact / scope

- Blocks decode of this real preprod block (and any value/mint with duplicate policy or asset-name
  keys). A validator/indexer built on `cardano-ledger-ts` would throw here.
- It is the **only** remaining decode failure in the full preprod replay after the empty-outputs
  fix (every other block byte-exact across all eras).

## Fix options (for decision — NOT applied)

The harness also asserts a **byte-exact round-trip**, and the on-disk bytes are the *non-canonical
duplicate-key* form, so a fix must decode it **and** be able to reproduce the original bytes.

1. **Merge on decode + preserve `cborRef` (recommended).** In `valueFromCborObj`, merge duplicate
   policy keys (and duplicate asset names) into one logical entry so `isIValue` passes; keep the
   original bytes in `Value.cborRef` (`SubCborRef`) so `toCbor` reproduces the exact on-disk bytes.
   Correct logical value *and* byte-exact round-trip. (Open question: merge semantics — sum
   quantities vs. concatenate assets. On-chain a mint sums, so summing is likely correct for the
   logical model, while `cborRef` guarantees the bytes.)
2. **Relax `isIValue` to allow duplicates.** Simplest, but changes `Value`'s invariant everywhere
   and leaves same-policy duplicates in the in-memory model (downstream may assume uniqueness).
3. **Tolerate only on the decode path**, leaving the public `Value` constructor strict.

## Reproduction (read-only)

Chunk 2081, slot 44967049; `mint` (key 9) of `tx[1]` has policy `f923673e…014a26` twice.
`MultiEraBlock.fromCbor(block)` throws the error above.

## Provenance

`harmoniclabs-testing-harness` full-chain replay (ledger validator).
