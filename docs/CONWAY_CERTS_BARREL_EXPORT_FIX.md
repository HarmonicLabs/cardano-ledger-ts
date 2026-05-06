# Bug: `ConwayCert*` classes are unreachable from the public barrel

> Patch handoff. The `Conway*`-prefixed cert classes (e.g. `ConwayCertRegistrationDeposit`, `ConwayCertVoteDeleg`, `ConwayCertRegistrationDrep`) live under `src/eras/conway/governance/certs/` and are correctly exported from there, but the chain of re-exports up to the top-level `src/index.ts` barrel is broken at `src/eras/conway/index.ts`. As a result, every `Conway*` cert class evaluates to `undefined` when consumers `require("@harmoniclabs/cardano-ledger-ts").ConwayCert…`. Block any consumer that wants to do `instanceof Conway*` checks at runtime.
>
> Released as `0.5.2` (bundled with the `TxBody` guard fix in [CONWAY_CERTS_TXBODY_FIX.md](CONWAY_CERTS_TXBODY_FIX.md); both ship in the same commit).

## Symptom

```js
const cl = require("@harmoniclabs/cardano-ledger-ts");

console.log(cl.ConwayCertRegistrationDeposit);           // → undefined
console.log(cl.ConwayCertUnRegistrationDeposit);         // → undefined
console.log(cl.ConwayCertStakeRegistrationDeleg);        // → undefined
console.log(cl.ConwayCertVoteRegistrationDeleg);         // → undefined
console.log(cl.ConwayCertStakeVoteRegistrationDeleg);    // → undefined
console.log(cl.ConwayCertRegistrationDrep);              // → undefined
console.log(cl.ConwayCertUnRegistrationDrep);            // → undefined
// … and every other Conway-prefixed class
```

The `.d.ts` files exist down the dist tree, so TypeScript happily lets a consumer write `import { ConwayCertRegistrationDeposit } from "@harmoniclabs/cardano-ledger-ts"`. But at runtime it's `undefined`. Any `cert instanceof ConwayCertRegistrationDeposit` then throws `TypeError: Right-hand side of instanceof is not callable`.

This blocks the buildooor `_initBuild` cert-deposit fix (separate handoff at [`buildooor/CONWAY_CERT_DEPOSITS_TXBUILDER_FIX.md`](../buildooor/CONWAY_CERT_DEPOSITS_TXBUILDER_FIX.md)), which needs to do `instanceof Conway*` checks to decide which certs add a deposit.

## Diagnosis

Trace the re-export chain from the top-level barrel:

```
src/index.ts:
    export * from "./eras";

src/eras/index.ts:
    export * from "./conway";

src/eras/conway/index.ts:           ← BREAK IS HERE
    export * from "./block";
    export * from "./header";
    export * from "./protocol";
    export * from "./tx";
    // export * from "./governance";    ← LINE 5, COMMENTED OUT

src/eras/conway/governance/index.ts:
    export * from "./certs";            (would re-export ./certs)

src/eras/conway/governance/certs/index.ts:
    export * from "./ConwayCertRegistrationDeposit";
    export * from "./ConwayCertUnRegistrationDeposit";
    export * from "./ConwayCertVoteDeleg";
    … (13 Conway-prefixed cert classes total)
```

`src/eras/conway/index.ts:5` is commented out, so the `governance` subtree never reaches `eras/conway/index.ts` and therefore never reaches the top-level barrel. The classes exist on disk but aren't published on the package's public surface.

## Why the obvious fix doesn't work

It's tempting to just uncomment the line:

```diff
-// export * from "./governance";
+export * from "./governance";
```

Don't. That introduces ~50 `TS2308` ambiguous-name errors during the package's own `tsc` compile:

```
src/index.ts(5,1): error TS2308: Module "./governance" has already exported a member named 'Anchor'.
src/index.ts(5,1): error TS2308: Module "./governance" has already exported a member named 'Constitution'.
src/index.ts(5,1): error TS2308: Module "./governance" has already exported a member named 'DRep'.
src/index.ts(5,1): error TS2308: Module "./governance" has already exported a member named 'GovAction'.
src/index.ts(5,1): error TS2308: Module "./governance" has already exported a member named 'Vote'.
src/index.ts(5,1): error TS2308: Module "./governance" has already exported a member named 'Voter'.
src/index.ts(5,1): error TS2308: Module "./governance" has already exported a member named 'VotingProcedure'.
… 47 more
```

There's a **top-level** `src/governance/` directory and an **eras-nested** `src/eras/conway/governance/` directory. Both export `Anchor`, `Constitution`, `DRep`, `DRepKeyHash`, `DRepScript`, `DRepAlwaysAbstain`, `DRepAlwaysNoConfidence`, `GovAction` (and ~15 variants), `ProposalProcedure`, `Vote`, `Voter`, `VoterKind`, `VotingProcedure`, `VotingProcedures`, plus their `I*` interface counterparts. The top-level barrel already pulls in `src/governance/*` via `export * from "./governance"` — uncommenting the eras-nested `governance` re-export wires the same names in a second time, and TypeScript flags the ambiguity.

There's also a smaller collision: `rewardSourceToStr` is exported by both `src/ledger/certs/MoveInstantRewardsCert.ts` and `src/eras/conway/governance/certs/ConwayMoveInstantRewardsCert.ts`.

That's why this was commented out in the first place — commit `e03b246`, "fixing tests".

## Fix: named re-export of the Conway cert classes only

Replace the wildcard with a named re-export that picks only the Conway-prefixed cert classes (their names are already disambiguated by the `Conway*` prefix, so they never collide with `src/governance/*` or `src/ledger/certs/*`).

```diff
 // src/eras/conway/index.ts
 export * from "./block";
 export * from "./header";
 export * from "./protocol";
 export * from "./tx";
-// export * from "./governance";
+
+// Conway-prefixed cert classes only.
+// Broad `export * from "./governance"` would collide with `src/governance/*`
+// (Anchor / DRep / Vote / GovAction / VotingProcedure / etc.) and with
+// `src/ledger/certs/MoveInstantRewardsCert` (rewardSourceToStr). The
+// `Conway*` prefix is unique, so re-exporting the cert classes by name is
+// safe.
+export {
+    ConwayCertRegistrationDeposit,
+    ConwayCertUnRegistrationDeposit,
+    ConwayCertStakeRegistrationDeleg,
+    ConwayCertVoteRegistrationDeleg,
+    ConwayCertStakeVoteRegistrationDeleg,
+    ConwayCertRegistrationDrep,
+    ConwayCertUnRegistrationDrep,
+    ConwayCertVoteDeleg,
+    ConwayCertStakeVoteDeleg,
+    ConwayCertAuthCommitteeHot,
+    ConwayCertResignCommitteeCold,
+    ConwayCertUpdateDrep,
+    ConwayMoveInstantRewardsCert,
+} from "./governance/certs";
```

Re-export the corresponding `I*` interface types too if downstream consumers need to construct cert instances by structural literal:

```ts
export type {
    IConwayCertRegistrationDeposit,
    IConwayCertUnRegistrationDeposit,
    IConwayCertStakeRegistrationDeleg,
    IConwayCertVoteRegistrationDeleg,
    IConwayCertStakeVoteRegistrationDeleg,
    IConwayCertRegistrationDrep,
    IConwayCertUnRegistrationDrep,
    IConwayCertVoteDeleg,
    IConwayCertStakeVoteDeleg,
    IConwayCertAuthCommitteeHot,
    IConwayCertResignCommitteeCold,
    IConwayCertUpdateDrep,
    IConwayMoveInstantRewardsCert,
} from "./governance/certs";
```

(Use `export type` so they're erased at compile time and don't pollute the runtime barrel.)

## Verify after fix

`tsc` exits 0 — no TS2308 errors:

```bash
npx tsc --noEmit -p tsconfig.json
echo "exit=$?"   # → exit=0
```

Runtime resolution works:

```bash
npm pack
# in any consumer:
node -e 'console.log(typeof require("@harmoniclabs/cardano-ledger-ts").ConwayCertRegistrationDeposit)'
# → function   (was undefined before this fix)
```

`instanceof` checks pass:

```js
const cl = require("@harmoniclabs/cardano-ledger-ts");
const cert = cl.certificateFromCertificateLike({
    certType: 7,
    stakeCredential: { type: 1, hash: { toBuffer: () => new Uint8Array(28) } },
    deposit: 2_000_000n,
});
console.log(cert instanceof cl.ConwayCertRegistrationDeposit);   // → true
```

## Don't

- **Don't uncomment `export * from "./governance"`** — it triggers the TS2308 storm. Use the named re-export above.
- **Don't try to dedupe `src/governance/` vs `src/eras/conway/governance/`** in this PR. They're duplicated classes with the same names but different module identities; consolidating them is a separate, larger refactor with breaking-change implications. This patch is purely additive: it surfaces classes that already existed but weren't reachable.
- **Don't forget the dist build.** Run `npm run build` after the source edit so `dist/eras/conway/index.js` re-exports the same set. Don't manually patch `dist/`.

## Bump version + release

| File | Change |
|---|---|
| `src/eras/conway/index.ts` | Add the named re-export block (above) |
| `package.json` | `0.5.1` → `0.5.2` |
| `dist/` | Regenerated by `npm run build` |

After this lands and is consumed by `@harmoniclabs/buildooor`, the cert-deposit balance fix in [`buildooor/CONWAY_CERT_DEPOSITS_TXBUILDER_FIX.md`](../buildooor/CONWAY_CERT_DEPOSITS_TXBUILDER_FIX.md) becomes applicable. The buildooor patch's `import { ConwayCertRegistrationDeposit, … } from "@harmoniclabs/cardano-ledger-ts"` resolves cleanly at runtime, the `instanceof Conway*` chain works, and `_initBuild` can fold cert deposits into change calc.

## Out of scope

- Deduping `src/governance/` vs `src/eras/conway/governance/`. Real architectural debt; tackle separately.
- Re-exporting non-cert classes from `src/eras/conway/governance/` (Anchor, DRep, Vote, etc.). They duplicate top-level `src/governance/*`; not safely re-exportable until the dedup above happens.
- Changes to `isCertificate` in either `src/ledger/certs/Certificate.ts` (legacy) or `src/eras/common/ledger/certs/Certificate.ts` (eras). Both already check the right class identities; the gap was just the barrel-level reachability.

---

## What was actually implemented (2026-05-05)

### Bundle decision: shipped with `CONWAY_CERTS_TXBODY_FIX.md` in a single `0.5.2` release

While verifying this fix landed correctly, the buildooor agent reported a follow-on blocker: even with the `Conway*` classes reachable, `TxBody`'s constructor was rejecting them with `"invalid 'certs' field"` because [src/tx/body/TxBody.ts:9](src/tx/body/TxBody.ts#L9) imported `isCertificate` from the **legacy** path (`../../ledger/certs/Certificate`), whose `instanceof` list contains zero `Conway*` classes. That second bug is documented in the companion handoff [CONWAY_CERTS_TXBODY_FIX.md](CONWAY_CERTS_TXBODY_FIX.md).

Originally the two handoffs each declared their own version (`0.5.4` and `0.5.3` respectively), but those numbers were stale — the working tree's most recent commit was `7bd5b3d 0.5.1`. Per project preference (no commit ↔ release gap), both fixes were bundled into a single `0.5.2` commit instead of shipping `0.5.2` and `0.5.3` back-to-back. Single fix surface from buildooor's perspective, single bisect-point in this repo's history.

### Files changed (this fix)

1. [src/eras/conway/index.ts](src/eras/conway/index.ts) — replaced the commented `// export * from "./governance";` with a named `export { ConwayCert… }` block of all 13 `Conway*` cert classes (collision-safe because the `Conway*` prefix is unique vs. `src/governance/*` and `src/ledger/certs/MoveInstantRewardsCert`), plus an `export type { IConwayCert… }` block for their 13 `I*` interface counterparts (erased at compile time so they don't pollute the runtime barrel).
2. [package.json](package.json) — `0.5.1` → `0.5.2` (covers both this fix and the `TxBody` guard fix).
3. `dist/` — regenerated via `npm run build`.

### Files NOT changed (intentional)

- The wildcard `export * from "./governance"` is **still commented out**. The named re-export only surfaces the cert classes; the underlying name collision with `src/governance/*` (Anchor, DRep, Vote, GovAction, ProposalProcedure, Voter, VotingProcedure, VotingProcedures, plus `I*` counterparts) and `rewardSourceToStr` between `src/ledger/certs/MoveInstantRewardsCert.ts` and `src/eras/conway/governance/certs/ConwayMoveInstantRewardsCert.ts` is unresolved — the proper fix is the dedup work called out in "Out of scope" above, separate effort.

### Verification

- `npx tsc --noEmit -p tsconfig.json` → exit 0 (no `TS2308` ambiguous-export errors).
- `npm run build` → exit 0; `dist/eras/conway/index.js` re-exports all 13 cert classes.
- Runtime: all 13 `Conway*` cert classes resolve to `function` from the top-level barrel (was `undefined`).
- `cert instanceof cl.ConwayCertRegistrationDeposit` returns `true` after `cl.certificateFromCertificateLike({ certType: 7, … })`.
- `npm test`: 38 suites pass, 1 unrelated pre-existing failure (`TxWithdrawals.toData` from the orphaned [V3_WITHDRAWAL_ENCODING_FIX.md](V3_WITHDRAWAL_ENCODING_FIX.md) workstream — its source-side patch was never committed; out of scope here).
- `npm pack` produced `harmoniclabs-cardano-ledger-ts-0.5.2.tgz` for buildooor consumption.
