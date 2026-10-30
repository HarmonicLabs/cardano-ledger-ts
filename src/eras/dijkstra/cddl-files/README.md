# Dijkstra CDDL vendoring

`dijkstra.cddl` is a verbatim copy of the IntersectMBO cardano-ledger Dijkstra era
data CDDL. Do not hand-edit it: upstream generates it with `generate-cddl`.

| Field | Value |
|---|---|
| Upstream repo | `IntersectMBO/cardano-ledger` |
| Upstream path | `eras/dijkstra/impl/cddl/data/dijkstra.cddl` |
| Pinned commit | `9d20aed5ebeca80c89d8882bd9e58c620a0cff92` |
| Commit date | 2026-10-22 ("Encode EbReferences as a nonempty omap.") |
| Fetched | 2026-10-30 |
| Size | 29,542 bytes |
| SHA-256 | `da7afe637c3d52321c667cc5a5919a2f62bbef64bd2d1bc27bf1bb2539b03dc9` |
| Previous pin | tag `cardano-ledger-dijkstra-0.4.0.0` (2026-10-02) |

The pinned master is an unreleased `0.5.0.0` line; pin a commit, not `master`, so
the vendored bytes stay reproducible until the next Dijkstra tag.

## Deltas from the previous copy

- Header: `header_version_info` replaces `protocol_version`,
  `block_body_contains_leios_cert : bool`, `eb_references_announcement / nil`.
- Block body: `[transactions : [* block_transaction], leios_certificate/ nil,
  peras_certificate/ nil]`; `invalid_transactions` is gone.
- Transactions: `block_transaction` carries a trailing `is_valid`; mempool form is
  `[transaction_body, transaction_witness_set, auxiliary_data/ nil]`.
- PlutusV4: `transaction_witness_set` key 8 is now generated upstream.
- Pool certificates: optional `bls_key = [bytes .size 96, bytes .size 48]`.
- Account balances: `account_balance_intervals` keyed by `reward_account`; a bare
  `coin` is a valid exact balance interval.
- Leios/Peras: `leios_certificate` (`signers` bitfield + 48-byte signature),
  `peras_certificate` (bytes), `eb_references = nonempty_omap<hash32, uint .size 4>`.
- Protocol params: keys 38–56, including `max_pledge_leverage`, `min_pool_margin`,
  the 10 Leios parameters, 6 Peras parameters and the 2 reference-input fee parameters.
- Generics/rules: `nonempty_omap`, `slot_interval`, `max_pledge_leverage`.

## Rule → TS landing map

| CDDL rule / field | TS module | Phase |
|---|---|---|
| `header_version_info`, `eb_references_announcement` | `src/eras/dijkstra/header/DijkstraHeaderBody.ts` | A/D |
| `nonempty_omap`, `eb_references` | `src/eras/dijkstra/block/DijkstraEndorserBlock.ts` (new) | C |
| `leios_certificate` signer bitfield | `src/eras/dijkstra/block/DijkstraBlock.ts` helper | C |
| `protocol_param_update` keys 38–56 | `src/eras/dijkstra/protocol/DijkstraProtocolParameters.ts` | B |
| Dijkstra genesis fields | `src/eras/dijkstra/protocol/DijkstraGenesis.ts` (new) | B |
| `slot_interval`, `max_pledge_leverage` | `DijkstraProtocolParameters.ts` / genesis | B |

Re-vendor when cardano-ledger publishes the next Dijkstra tag, then update this
table and rerun `npx jest src/eras/dijkstra`.
