# Harmonic Labs van Rossem (Protocol Version 11) — hard fork support

Note: # nasty transactions are (CIP-118) sub-treansactions.

The real updates are on the Plutus side — a batch of new and expanded builtins across Plutus
V1/V2/V3 plus cheaper execution costs. So "supporting the hf" splits up pretty cleanly across the repos:

- **uplc / plutus-machine** — teach the evaluator the new builtins (the bulk of the work)
- **cardano-costmodels-ts** — price the new builtins
- **cardano-ledger-ts** — mostly has to *not break* (no new tx shape), carry the updated cost
  models through, and accept protocol version 11
- **buildooor** — same story, plus pick up the evaluator + cost model changes so ex-unit
  estimation stays correct

Quick status:

| repo | what was needed | status |
|---|---|---|
| uplc | new PV11 Plutus builtins + UPLC case expressions | done  |
| plutus-machine | evaluate the new builtins, updated machine costs | done |
| cardano-costmodels-ts | cost model entries for the new builtins | done |
| cardano-ledger-ts | verify PV11 support, ship Conway fixes, no tx-shape change | done |
| buildooor | no code change; dependency currency + tests | verified |

---

## uplc + plutus-machine

This is where most of the van Rossem work lives, because PV11 is basically "more Plutus".
The new builtins and UPLC features were added to **uplc** and **plutus-machine**:

- UPLC case expressions for `Bool`, `Integer`, and `Data`
- new builtins: `Array` type + operations, `MaryEraValue` operations, modular
  exponentiation (`expModInteger`), `dropList`, and BLS12-381 multi-scalar multiplication

The machine had to be able to actually run these so we can compute execution units, and the
machine step/builtin costs were updated to match PV11.

---

## cardano-costmodels-ts

New builtins need a price, so the cost models had to be extended to cover them. The V3 cost
model has gone 251 → 297 → 350 entries across the Chang/Plomin updates, and PV11 extends it again.

The design point that matters: nothing downstream hardcodes the cost model list length, so a
longer cost model just flows through. We rely on this in both cardano-ledger-ts and buildooor (see below).

---

## cardano-ledger-ts

Because van Rossem is intra-Conway with no new transaction shape, the existing Conway types
are what actually serve the hard fork. So the work here was three things:

### 1. Updated supports for van Rossem

- **Protocol version 11 is accepted.** `ProtocolVersion.major` is an unbounded `u32` — nothing
  in the codebase caps the major version, so PV11 headers, `hard_fork_initiation_action`, and
  protocol-parameter updates all parse.
- **No new transaction shape** → the Conway tx / block / governance encoders and decoders handle
  van-Rossem transactions unchanged. No changes needed till the actual Dijkstra era.

### 2. Conway-level correctness fixes

While we were in here we fixed real bugs in the Conway path — these matter for anything running
on mainnet today, van Rossem included:

- **AuxiliaryData decode bugs** (issue #18, PRs #19 and #20 from Max, merged). The default
  `AuxiliaryData.fromCborObj` had an off-by-one in the field loop (`new Array(4)` / `i < 4`) that
  dropped the plutus-v3 scripts key and made the strict "all script arrays required" check throw
  on *every* tag-259 aux data. Plus a `TxMetadata` dual-class problem where the package exported
  one `TxMetadata` identity but `AuxiliaryData` checked `instanceof` against a different one, so
  every metadata/memo build threw.
- **De-duplicated `TxMetadata`** so there's a single class identity, with `src/` as the source of
  truth and `eras/common` re-exporting it. That removes the "fix it in two places" fragility for good.

### 3. Dijkstra era implementation (forward work)

van Rossem is the first step towards **Dijkstra** (the one that eventually brings Leios). To stay
ahead of it, we implemented the full Dijkstra era against the IntersectMBO `cardano-ledger` CDDL
and cross-referenced it with Dingo (gOuroboros), since it's one of the complete nodes running on
the Musashi testnet:

- none segregated block body (CIP-0176)
- nasty transactions (CIP-118)
- guard scripts that are native script variant 6 and are replacing `required_signers`
- Plutus V4 (script ref tag 4, witness set key 8, aux data key 5)
- peras certificate, direct deposits, account balance intervals, guards

This part is not required for van Rossem, van Rossem stays in Conway. 
It's groundwork for the next hard fork, done now while the spec is fresh.

### Tests

- full suite green: **100 tests passing**, `npm run build` clean
- Dijkstra era specifically: 25 tests passing (block, tx body fields, nasty transactions, guard scripts, Plutus V4, golden tx), 
  5 placeholders instead of testing against Conway data.
- cross-checked our works against three independent sources. 
  IntersectMBO `cardano-ledger`
  CDDL (byte-identical for header/block bodies), 
  the official `cardano-node` Dijkstra wiring, and
  gOuroboros (the Go ledger lib that Blink Labs' Dingo node runs on the Musashi/Leios testnet)

---

## Buildooor

No source changes were needed for van Rossem. It's an intra-Conway fork with no new tx shape, and
buildooor already builds on `cardano-ledger-ts@^0.5.3` (Conway types + unbounded protocol version),
so its build / balance / serialize path is unchanged.

The one van-Rossem-sensitive spot is **script evaluation** — buildooor runs the CEK `Machine`
(`plutus-machine` + `uplc`) to estimate execution units. That's a dependency-currency thing, not a
code change:

- bump `uplc` + `plutus-machine` to the PV11 releases so the builder can evaluate scripts that use
  the new builtins
- bump / use PV11 cost models so ex-unit and fee estimates are correct — best practice is to feed
  chain-fetched protocol parameters into the builder rather than relying on the bundled defaults; if
  you do use the bundled defaults, bump `cardano-costmodels-ts`
- evidence: `TxBuilder.build.fee` and `TxBuilder.build.balanced` tests re-run green against the updated deps

If a script only uses pre-existing builtins, buildooor works as-is even without the bump — the bump
only matters for scripts that actually use the new PV11 builtins.

### What Buildooor needs for the Dijkstra ERA (next fork, not van Rossem)

Heads up for later — Dijkstra is a real builder effort, not a dep bump like van Rossem:

- **build Dijkstra tx types** — the core change: construct `DijkstraTxBody`/`DijkstraTx` instead of
  the default. Touches every `new TxBody(...)` site.
- **guards instead of requiredSigners** — Dijkstra replaces `required_signers` (key 14) with `guards`.
  Map the existing `requiredSigners` build arg onto `guards`, and update the script-context builder
  (`getTxInfos.ts`) to source signers from guards.
- **Plutus V4 end-to-end** — attach V4 scripts to the witness set (key 8), include V4 in the language
  views for `scriptDataHash`, use V4 cost models (costmodels-ts `v4` module) for ex-unit estimation,
  and evaluate V4 scripts (uplc/plutus-machine).
- **guard scripts + new redeemer tag** — native script variant 6 (`script_require_guard`) and the new
  `6 = guarding` redeemer tag. buildooor only handles 0–5 today.
- **tiered reference-script fee** — Dijkstra's `refScriptCostStride`/`refScriptCostMultiplier` change
  ref-script pricing from Conway's linear model to a tiered/exponential one. buildooor's min-fee calc
  needs the Dijkstra formula (worth a close read of its current refScript fee path).
- **direct deposits (25) + account balance intervals (26)** — new build-arg surface, if we want to expose them.
- **nasty transactions (CIP-118)** — the big one. A whole new construction API + balancing +
  `required_top_level_guards`.

### In Progress
Seperate Dijkstra buildoor branch that evolves as we get closer to the Era release/hf.

---

## Summary

The van Rossem upgrade is Plutus-side, so most of the work is in uplc + plutus-machine (new builtins)
and cardano-costmodels-ts (pricing them). On the ledger / buildooor side the fork is deliberately
low-burden — no new transaction shape — so cardano-ledger-ts and buildooor needed verification and
dependency currency rather than new wire-format code, and we used the opportunity to fix some real
Conway aux-data bugs and to build the Dijkstra era ahead of the next fork.

On cardano-ledger-ts specifically: only the Dijkstra era was added, with barrel exports. But none of
the new Dijkstra changes were made the default — the default types stay Conway until the actual era release.
