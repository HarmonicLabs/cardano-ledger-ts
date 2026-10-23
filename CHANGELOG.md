# Changelog

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
