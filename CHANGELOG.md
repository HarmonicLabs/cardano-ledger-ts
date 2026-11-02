# Changelog

## 0.6.1

The DijkstraNet/Leios overlay surfaces, plus the decoder strictness and golden refresh driven by live dingo/gouroboros data.

### Added
- Dijkstra protocol parameters keys 34–56: ref-script limits, pledge leverage/pool margin, the Leios announcement/vote/diffusion periods, committee/quorum, EB limits, Peras phase-1 fields, and ref-input fees. Dijkstra genesis (`plutusV4CostModel` exactly 251 values at cost-model language key 3).
- `DijkstraEbReferences`/`DijkstraEndorserBlock`: canonical ordered map `hash32 -> uint32`, 1..17142 references, unique non-zero entries, announcement hash/size over canonical bytes.
- `DijkstraLeiosCertificate` bitfield/signature and certification-window helpers; `DijkstraBlock.validate()` for body hash/size, the certified flag ↔ certificate, zero-transaction certifying bodies, announcement/PP bounds and Peras gating.

### Changed
- Dijkstra `hashTx` is cardano-ledger's `hashAnnotated`: blake2b-256 of the stored block-format transaction bytes (`[body, witness_set, auxiliary_data, is_valid]`), which is also the Leios endorser-block reference hash. The old component-hash helper remains exported as `dijkstraHashTxParts`.
- Dijkstra `header_version_info` decodes as `BlockHeaderVersionInfo`: arbitrary uint32 major/tag, not the `ProtVer` supported-version cap.
- Goldens refreshed to cardano-ledger master `tx.cbor`/`hashtx` (3bd42ad/ae4013) and `pparams` JSON (6d57bb), plus gouroboros current tx (e1a985) and Dingo musashi block provenance (0a0096).

### Fixed
- `vrf_cert` decoding is exactly `[bytes .size 64, bytes .size 80]` and exactly two elements; extra fields and wrong hash/proof lengths are rejected.
- Dijkstra header version decoding no longer rejects a future major (> 13).

## 0.6.0

The Dijkstra era, and decoders that accept and re-encode exactly what cardano-ledger does, made for pragma-org's
[node-diversity-conformance](https://github.com/pragma-org/node-diversity-conformance) scenarios (Gerolamo scores
9 200 / 9 200 on `cbor-decoding` and 277 / 277 on `ledger-rules` with this release). Merged with 0.5.6. Requires
`@harmoniclabs/cbor` 2.1.0, `@harmoniclabs/plutus-data` 2.1.0 and `@harmoniclabs/cardano-costmodels-ts` 1.7.0.

### Added
- The Dijkstra era, per the CDDL of cardano-ledger-dijkstra 0.4.0.0: 12-field header, `[txs, leios, peras]` body,
  sub-transactions, guards, direct deposits, balance intervals, BLS pool keys, `hashTx`.
- Conway body keys 19–22 with decoders for all seven governance actions; MIR certificate decoding.
- `ByronAddress.computeRootHash`, `fromPublicKey`, `fromRedeemPublicKey` (rebuilding the Byron genesis UTxO set).
- Opt-in lenient decoding: `withLenientDecoding(fn)`, `withDecodeStrictness(strictness, fn)`,
  `setDefaultDecodeStrictness(strictness)`, `getDecodeStrictness()`, `isLenientDecoding()`; and the decode-version
  context (`getDecodeVersion`, `withDecodeVersion`, `withDefaultDecodeVersion`) exported from the package root.

### Changed
- Decoders follow cardano-ledger: definite-length strings and records where it requires them (before protocol 12),
  bignums rejected in fixed-width integers, Word16 / Word32 / Word64 ranges, CDDL size bounds, exact arities, tag
  checks, trailing bytes rejected; from protocol 9 duplicate map and set keys, empty asset maps and zero quantities
  rejected; certificates gated by era.
- Decoded values re-emit their source bytes where cardano-ledger keeps bytes; Value, withdrawals, redeemers, scripts
  and transaction outputs re-encode as cardano-ledger does (compact array output when there is no inline datum and
  no script reference).
- The era-agnostic `TxOut.fromCbor` decodes at protocol 7 unless an era context is set, so stored outputs of every
  era decode.
- `StakeCredentials.toData` returns the `StakingCredential` in every Plutus version, so `Address.toData` carries
  `StakingHash` for V1/V2 as the ledger does.

### Fixed
- Pre-protocol-9 multi-asset maps with duplicate keys decode (later entry wins) instead of failing.
- An empty transaction input set decodes (the ledger rule rejects it later, not the decoder).
- V1/V2 withdrawal keys in script contexts were wrapped in `StakingHash` twice.
- A CommonJS import cycle kept the Dijkstra modules from loading under Node / jest.
- `partialProtocolParametersToCborObj` checked `'PlutusV1'` instead of `'PlutusScriptV1'`, so cost models were
  never re-encoded.

### Compatibility
- Valid chain bytes decode as before; hand-built or non-canonical CBOR may be rejected unless the caller opts into
  lenient decoding. Never use lenient decoding to judge validity.
- V1/V2 script contexts of staked addresses change bytes (now correct).
- `ByronAddress` keeps the 0.5.6 API (`type` is `"byron"`, `byronType`, `toBuffer()`).

### Known gap
- The Dijkstra balance-interval fields follow an earlier draft of the CDDL (reward-account keys); cardano-ledger
  master keys them by credential. Dijkstra is on no network yet.
