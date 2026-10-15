# Conway Certs `TxBody` Validation Fix

> Patch handoff. A consumer of `@harmoniclabs/cardano-ledger-ts` (via `@harmoniclabs/buildooor`) reported that `TxBody` constructor and the `isITxBody` type guard reject every Conway-era certificate with `Error: invalid 'certs' field`. Root cause is two divergent `isCertificate` guards in this repo; `TxBody` was wired to the wrong one. Patched in `0.5.2` (bundled with the Conway barrel re-export fix in [CONWAY_CERTS_BARREL_EXPORT_FIX.md](CONWAY_CERTS_BARREL_EXPORT_FIX.md); both ship in the same commit).

## TL;DR

The repo has two parallel `Certificate.ts` files — a legacy one at [src/ledger/certs/Certificate.ts](src/ledger/certs/Certificate.ts) and an eras one at [src/eras/common/ledger/certs/Certificate.ts](src/eras/common/ledger/certs/Certificate.ts). They share the same skeleton but reference disjoint sets of class identities for the 13 Conway-era cert types:

| File | Conway certs reference… |
|---|---|
| Legacy | `CertRegistrationDeposit`, `CertVoteDeleg`, … (un-prefixed, defined under `src/ledger/certs/`) |
| Eras | `ConwayCertRegistrationDeposit`, `ConwayCertVoteDeleg`, … (defined under `src/eras/conway/governance/certs/`) |

The package's top-level barrel [src/index.ts](src/index.ts) exports `./eras` (line 5) before `./ledger` (line 6). Under `__exportStar`'s first-wins semantics, the **eras** `certificateFromCertificateLike` is what consumers reach via the public API. Every cert reaching `TxBody` after public-API normalization is therefore a `Conway*` instance.

But `TxBody` itself imported `isCertificate` from the **legacy** path, bypassing the barrel. JS `instanceof` is class-identity-based — a `ConwayCertRegistrationDeposit` is *not* a `CertRegistrationDeposit` even though their class bodies are byte-for-byte equivalent. The legacy guard's `instanceof` list contained zero `Conway*` classes, so it rejected every Conway instance.

Fix: repoint the import in `TxBody.ts` from the legacy path to the eras path. Released in `0.5.2`.

## Symptom

```ts
import { CertRegistrationDeposit, Credential } from "@harmoniclabs/cardano-ledger-ts";
import { TxBuilder } from "@harmoniclabs/buildooor";

txBuilder.buildSync({
    inputs: [...],
    certificates: [{
        cert: new CertRegistrationDeposit({ stakeCredential, deposit: 2_000_000n }),
        script: { ref: refUtxo, redeemer: someData },
    }],
    changeAddress: ...,
    requiredSigners: [...],
});
```

Throws:

```
Error: invalid 'certs' field
    at new TxBody (dist/tx/body/TxBody.js:118)
    at TxBuilder.initTxBuild (...)
    at TxBuilder.buildSync (...)
```

The same throw fires for any other Conway cert type: `ConwayCertVoteDeleg`, `ConwayCertRegistrationDrep`, `ConwayCertUnRegistrationDeposit`, etc.

### Reproducer (verified before the fix)

```js
const cardanoLedger = require("@harmoniclabs/cardano-ledger-ts");
const legacyCert = require("@harmoniclabs/cardano-ledger-ts/dist/ledger/certs/Certificate");
const erasCert   = require("@harmoniclabs/cardano-ledger-ts/dist/eras/common/ledger/certs/Certificate");

const cert = cardanoLedger.certificateFromCertificateLike({
    certType: 7,
    stakeCredential: { type: 1, hash: { toBuffer: () => new Uint8Array(28) } },
    deposit: 2_000_000n,
});

console.log(cert.constructor.name);            // "ConwayCertRegistrationDeposit"
console.log(legacyCert.isCertificate(cert));   // false  ← TxBody used this
console.log(erasCert.isCertificate(cert));     // true
```

## Diagnosis

### The two `isCertificate` guards

[src/ledger/certs/Certificate.ts](src/ledger/certs/Certificate.ts) (legacy) — `instanceof` list at lines 44-67 contains only un-prefixed classes:

```
CertStakeRegistration, CertStakeDeRegistration, CertStakeDelegation,
CertPoolRegistration, CertPoolRetirement, CertGenesisKeyDelegation,
MoveInstantRewardsCert,
CertRegistrationDeposit, CertUnRegistrationDeposit,
CertVoteDeleg, CertStakeVoteDeleg, CertStakeRegistrationDeleg,
CertVoteRegistrationDeleg, CertStakeVoteRegistrationDeleg,
CertAuthCommitteeHot, CertResignCommitteeCold,
CertRegistrationDrep, CertUnRegistrationDrep, CertUpdateDrep
```

[src/eras/common/ledger/certs/Certificate.ts](src/eras/common/ledger/certs/Certificate.ts) (eras) — same skeleton, but the 13 Conway-era classes are `Conway*`-prefixed and resolved from `src/eras/conway/governance/certs/`. The 6 base classes (`CertStakeRegistration` etc.) are imported from the *same* place in both files (`src/eras/common/ledger/certs/`) — they're protocol-version-stable.

`diff` between the two files shows only class-name swaps — no logic differences.

### How the wires got crossed

1. `src/index.ts` order: `./eras` before `./ledger`. So `certificateFromCertificateLike` from eras wins at the top-level export.
2. `certificateFromCertificateLike` (eras) constructs `Conway*` instances for Conway-era cert types.
3. Every era-specific `TxBody` (Shelley, Mary, Allegra, Alonzo, Babbage, Conway) imports from `../../common/ledger` — they get the eras (Conway-aware) guard. ✅
4. The unified [src/tx/body/TxBody.ts](src/tx/body/TxBody.ts) imported from `../../ledger/certs/Certificate` — the legacy path. ❌
5. Consumer hands a `Conway*` instance to `TxBody` → legacy guard rejects → throw at [src/tx/body/TxBody.ts:233-235](src/tx/body/TxBody.ts#L233-L235), and `isITxBody` returns `false` at [src/tx/body/TxBody.ts:71](src/tx/body/TxBody.ts#L71).

### Why the legacy file exists at all

[src/ledger/certs/](src/ledger/certs/) contains its own copies of all 13 Conway-era cert classes (`CertRegistrationDeposit.ts`, `CertVoteDeleg.ts`, etc.) — orphaned duplicates of the `ConwayCert*` classes in `src/eras/conway/governance/certs/`. `grep` confirms those legacy classes are referenced **only** by the legacy `Certificate.ts` itself and the barrel — nothing in the codebase consumes them directly.

They're effectively dead code, kept around as a public-API back-compat surface: external consumers who do `import { CertRegistrationDeposit } from "@harmoniclabs/cardano-ledger-ts"` still resolve to those legacy classes via the `./ledger` barrel.

## The Fix (`0.5.2`)

One line. [src/tx/body/TxBody.ts:9](src/tx/body/TxBody.ts#L9):

```diff
-import { Certificate, isCertificate,  certificateFromCborObj } from "../../ledger/certs/Certificate";
+import { Certificate, isCertificate, certificateFromCborObj } from "../../eras/common/ledger/certs/Certificate";
```

Both call sites in TxBody — the `isITxBody` type guard at line 71 and the constructor validation at line 233 — pick up the eras-flavored guard automatically. `certificateFromCborObj` is symmetric across the two files (both cover all 20 `CertificateType` keys; per-cert `toCborObj` shapes match), so CBOR round-trip is unaffected.

[package.json](package.json) bumped: `0.5.1` → `0.5.2` (bundled with barrel fix; both ship in the same commit).

### Verification

- Full Jest suite: 39 suites, 63 passing tests, 0 regressions.
- `npm pack` produced `harmoniclabs-cardano-ledger-ts-0.5.2.tgz`.
- The downstream reproducer no longer throws.

## Long-term Solution

The root smell isn't `TxBody`'s import — it's that **two parallel `Certificate.ts` files exist at all**. They've already drifted in class-identity once; the next consumer who imports from the legacy path can hit the same bug, and the next cert type added to the protocol has to be added in both places to avoid it.

### Phase 1 — Unify at the source (`0.6.0`)

Replace [src/ledger/certs/Certificate.ts](src/ledger/certs/Certificate.ts) with a single line:

```ts
export * from "../../eras/common/ledger/certs/Certificate";
```

What this does:
- Aliases `Certificate` (type), `isCertificate`, `certificateFromCborObj`, `CertificateLike`, `certificateFromCertificateLike` to the eras (Conway-aware) versions for *every* importer of the legacy path. Future consumers of `../../ledger/certs/Certificate` can't drift again.
- Doesn't touch the legacy `Cert*` class files (`CertRegistrationDeposit.ts` and 12 siblings under `src/ledger/certs/`). They remain exported via [src/ledger/certs/index.ts](src/ledger/certs/index.ts), so `import { CertRegistrationDeposit } from "@harmoniclabs/cardano-ledger-ts"` still resolves for downstream users.

#### Why a minor version bump

The `Certificate` *type alias* on the legacy path now refers to the union with `ConwayCert*` members. Downstream code like:

```ts
import { Certificate, CertRegistrationDeposit } from "@harmoniclabs/cardano-ledger-ts";
const c: Certificate = new CertRegistrationDeposit({ ... });  // legacy-class instance
```

would now produce a TS error, because the legacy `CertRegistrationDeposit` class is no longer a member of the `Certificate` union. This is technically a type-level breaking change, but it surfaces a real bug — those instances were *already* silently rejected by `TxBody` at runtime before the patch. The minor bump signals it.

### Phase 2 — Remove the orphaned legacy classes (`0.7.0`, optional)

Audit downstream consumers for `import { CertRegistrationDeposit, ... } from "@harmoniclabs/cardano-ledger-ts"` (and the other 12 Conway-era class names). If clear, delete:

- [src/ledger/certs/CertRegistrationDeposit.ts](src/ledger/certs/CertRegistrationDeposit.ts)
- [src/ledger/certs/CertUnRegistrationDeposit.ts](src/ledger/certs/CertUnRegistrationDeposit.ts)
- [src/ledger/certs/CertVoteDeleg.ts](src/ledger/certs/CertVoteDeleg.ts)
- [src/ledger/certs/CertStakeVoteDeleg.ts](src/ledger/certs/CertStakeVoteDeleg.ts)
- [src/ledger/certs/CertStakeRegistrationDeleg.ts](src/ledger/certs/CertStakeRegistrationDeleg.ts)
- [src/ledger/certs/CertVoteRegistrationDeleg.ts](src/ledger/certs/CertVoteRegistrationDeleg.ts)
- [src/ledger/certs/CertStakeVoteRegistrationDeleg.ts](src/ledger/certs/CertStakeVoteRegistrationDeleg.ts)
- [src/ledger/certs/CertAuthCommitteeHot.ts](src/ledger/certs/CertAuthCommitteeHot.ts)
- [src/ledger/certs/CertResignCommitteeCold.ts](src/ledger/certs/CertResignCommitteeCold.ts)
- [src/ledger/certs/CertRegistrationDrep.ts](src/ledger/certs/CertRegistrationDrep.ts)
- [src/ledger/certs/CertUnRegistrationDrep.ts](src/ledger/certs/CertUnRegistrationDrep.ts)
- [src/ledger/certs/CertUpdateDrep.ts](src/ledger/certs/CertUpdateDrep.ts)
- [src/ledger/certs/MoveInstantRewardsCert.ts](src/ledger/certs/MoveInstantRewardsCert.ts)

…and the corresponding entries in [src/ledger/certs/index.ts](src/ledger/certs/index.ts). After the cleanup, only the 6 protocol-stable base classes remain under `src/ledger/certs/` (or that directory could become a pure re-export shim too).

This is a public-API breaking change, hence the major-ish bump on a `0.x` line. Don't ship until downstream `buildooor` and known consumers are confirmed using the `Conway*`-prefixed names (or going through `certificateFromCertificateLike`).

## What NOT to do

Two tempting "fixes" that were considered and rejected:

- **Patch the legacy `isCertificate` to also accept `Conway*` classes.** Keeps the bug-runaway active — both guards exist, both must be kept in sync, and the next cert addition will drift again.
- **Reorder `src/index.ts` to put `./ledger` before `./eras`.** Other parts of the package depend on eras winning at the public-API surface (e.g. `Value`, `TxOutRef`, `Address`). Don't touch the export order.

## File map

| File | Role |
|---|---|
| [src/tx/body/TxBody.ts:9](src/tx/body/TxBody.ts#L9) | The fix — import path swap |
| [src/tx/body/TxBody.ts:71](src/tx/body/TxBody.ts#L71) | `isITxBody` call site for `isCertificate` |
| [src/tx/body/TxBody.ts:233-235](src/tx/body/TxBody.ts#L233-L235) | Constructor validation that throws `"invalid 'certs' field"` |
| [src/ledger/certs/Certificate.ts](src/ledger/certs/Certificate.ts) | Legacy guard — orphaned, target for Phase 1 cleanup |
| [src/eras/common/ledger/certs/Certificate.ts](src/eras/common/ledger/certs/Certificate.ts) | Eras (Conway-aware) guard — single source of truth |
| [src/eras/conway/governance/certs/](src/eras/conway/governance/certs/) | The 13 `ConwayCert*` class definitions |
| [src/index.ts](src/index.ts) | Top-level barrel; eras-before-ledger order is load-bearing |
| [package.json](package.json) | `0.5.1` → `0.5.2` |

---

## What was actually implemented (2026-05-05)

### Bundle decision: shipped with `CONWAY_CERTS_BARREL_EXPORT_FIX.md` in a single `0.5.2` release

This fix and the companion barrel re-export fix in [CONWAY_CERTS_BARREL_EXPORT_FIX.md](CONWAY_CERTS_BARREL_EXPORT_FIX.md) were authored in independent sessions and originally targeted separate releases (`0.5.3` here, `0.5.4` for the barrel fix). Both numbers were stale relative to the working tree (most recent commit at the time was `7bd5b3d 0.5.1`).

The buildooor agent applied the barrel fix locally, then immediately hit this `TxBody` guard bug — the deposit-balancing code in `_initBuild` couldn't even run because `TxBody`'s constructor was throwing `"invalid 'certs' field"` on every `Conway*` instance. Both fixes were therefore bundled into a single `0.5.2` commit (per project preference for no commit ↔ release gap), so buildooor only has to bump its `cardano-ledger-ts` dep once.

### Files changed (this fix)

1. [src/tx/body/TxBody.ts:9](src/tx/body/TxBody.ts#L9) — repointed the `Certificate, isCertificate, certificateFromCborObj` import from the legacy `../../ledger/certs/Certificate` to the eras `../../eras/common/ledger/certs/Certificate`. Verified API-compatible: both files export the same three names with identical signatures (`Certificate` type, `isCertificate` function, `certificateFromCborObj` function) plus a matching `CertificateLike` and `CertificateType`. The two files diverge only in the class identities referenced in their `instanceof` lists — the eras file knows about `Conway*` classes, the legacy file does not.
2. [package.json](package.json) — `0.5.1` → `0.5.2` (covers both this fix and the barrel re-export fix; same commit).
3. `dist/` — regenerated via `npm run build`.

### Files NOT changed (intentional)

- [src/ledger/certs/Certificate.ts](src/ledger/certs/Certificate.ts) — left in place. The Phase 1 / Phase 2 unification (replace with re-export shim, then delete orphan legacy classes) called out in the "Long-term Solution" section above is **not** part of this release; it carries type-level breaking-change implications and is gated on a downstream-consumer audit. Tracked as separate work for a later `0.6.0` / `0.7.0` cycle.
- All other call sites of `isCertificate` / `certificateFromCborObj` across the era-specific `TxBody`s — they already imported from `../../common/ledger`, which is the eras path. Only the unified [src/tx/body/TxBody.ts](src/tx/body/TxBody.ts) was wired wrong; the era-specific bodies were correct already.

### Verification

- `npx tsc --noEmit -p tsconfig.json` → exit 0.
- `npm run build` → exit 0.
- Runtime guard cross-check (the original reproducer):
  ```js
  cl.certificateFromCertificateLike({ certType: 7, … }).constructor.name  // → "ConwayCertRegistrationDeposit"
  legacy.isCertificate(cert)                                              // → false  (still — file unchanged)
  eras.isCertificate(cert)                                                // → true
  cl.isCertificate(cert)                                                  // → true   (via barrel)
  ```
- `new TxBody({ inputs, outputs, fee, certs: [conwayCert] })` constructs successfully (was throwing `"invalid 'certs' field"` before this fix).
- `npm test`: 38 suites pass, 1 unrelated pre-existing failure (`TxWithdrawals.toData` from the orphaned [V3_WITHDRAWAL_ENCODING_FIX.md](V3_WITHDRAWAL_ENCODING_FIX.md) workstream — its source-side patch was never committed; out of scope here).
- `npm pack` produced `harmoniclabs-cardano-ledger-ts-0.5.2.tgz` for buildooor consumption.

### Why this matters for buildooor

The `_initBuild` cert-deposit balance fix in [`buildooor/CONWAY_CERT_DEPOSITS_TXBUILDER_FIX.md`](../buildooor/CONWAY_CERT_DEPOSITS_TXBUILDER_FIX.md) walks `certificates` and uses `instanceof Conway*` checks to decide which certs add a deposit. That patch had **two** prerequisites in this repo:

1. The `Conway*` classes reachable via the public barrel — closed by [CONWAY_CERTS_BARREL_EXPORT_FIX.md](CONWAY_CERTS_BARREL_EXPORT_FIX.md).
2. `TxBody`'s constructor accepting `Conway*` cert instances — closed by this fix.

Without (2), the deposit-balancing code never runs, because `TxBuilder._initBuild` calls `new TxBody(...)` before reaching the balance computation. The buildooor blocker is now closed.
