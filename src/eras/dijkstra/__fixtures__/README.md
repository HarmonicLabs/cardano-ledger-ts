Dijkstra test vectors (copied verbatim, hex):

- musashi_type8_dijkstra_block.hex / _header.hex: a block captured from the
  ouroboros-leios "musashi" testnet in the current 3-field body format
  (Dingo `ouroboros/testdata/musashi_type8_dijkstra_{block,header}.hex` at
  0a0096, 2026-09-27); sha256 6bb3f7d3… (block), 87643c0f… (header). Bytes
  unchanged since the earlier 14f789e pin.
- musashi_legacy_4field_block.hex: an older musashi block with the
  pre-respin 4-field body; peers must not deliver it (gouroboros
  ledger/dijkstra/testdata/musashi_dijkstra_block.hex at 267610).
- cardano_ledger_golden_tx.hex / _hashtx.hex: IntersectMBO/cardano-ledger
  eras/dijkstra/impl/golden/tx.cbor at 3bd42ad (2026-10-16) and hashtx.hex at
  ae4013 (2026-10-16); sha256 2626a87f… and 86ce4682….
- cardano_ledger_dijkstra_pparams.json / pparams_update.json: cardano-ledger
  eras/dijkstra/impl/golden/{pparams,pparams-update}.json at 6d57bb
  (2026-09-29); sha256 9c15e370… and 2b9aa7a6….
- gouroboros_current_tx.hex: gouroboros `ledger/dijkstra/testdata/
  cardano_ledger_dijkstra_current_tx.hex` at e1a985 (2026-09-24); sha256
  71766a31… (cardano-ledger golden at c2114bd in the older pin).
- dingo_dijkstra_genesis.json: Blink Labs Dingo
  config/cardano/dijkstra/dijkstra-genesis.json at c776031 (2026-10-24,
  "feat: support DijkstraNet" #5573); sha256
  c7f7760ba5491cb31bff548f880410e0bf288e016e2b1646bd978d9d490a9bb7.
- dingo_musashi_dijkstra_genesis.json: Dingo
  config/cardano/musashi/dijkstra-genesis.json at d4572ed (2026-10-20); sha256
  9895c096a45225e99630b3fb866e5b115ce3d28c6ecd45ceda8feb0e29306127.
  Both carry the initial 251-value plutusV4CostModel (language key 3).
- gouroboros_leios_rc_2026w41_announcing_block.hex: gouroboros
  ledger/leios/testdata/rc-2026w41-announcing-block.hex at 5f854bb
  (2026-10-14, the same commit as the Leios endorser-block tests); sha256
  e25627652b82583786708b2995605e6b2f533e15ee020252d18e859e3eee83f9. Block 42
  in slot 459, header announces eb hash 9674ce55... size 38.
- gouroboros_leios_rc_2026w41_certifying_block.hex: gouroboros
  ledger/leios/testdata/rc-2026w41-certifying-block.hex at 5f854bb; sha256
  886a51f374d35c904c1daf6fbe94a1e9bdca1c4c30a307e84001712a9305c0d8. Block 43
  in slot 478, certified, zero transactions, leios_certificate signers c0 and
  a 48-byte signature. The eb_references map hash/one-entry vector comes from
  gouroboros ledger/common/leios_endorser_block_test.go at the same commit.
