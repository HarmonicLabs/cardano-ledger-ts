Dijkstra test vectors (copied verbatim, hex):

- musashi_type8_dijkstra_block.hex / _header.hex: a block captured from the
  ouroboros-leios "musashi" testnet in the current 3-field body format
  (Dingo 14f789e ouroboros/testdata).
- musashi_legacy_4field_block.hex: an older musashi block with the
  pre-respin 4-field body; peers must not deliver it (gouroboros v0.210.0
  ledger/dijkstra/testdata/musashi_dijkstra_block.hex).
- cardano_ledger_golden_tx.hex / _hashtx.hex: IntersectMBO/cardano-ledger
  eras/dijkstra/impl/golden/tx.cbor and hashtx.hex at 5b31cdd (2026-10-08),
  the same as tag cardano-ledger-dijkstra-0.4.0.0 for the CDDL.
- gouroboros_current_tx.hex: gouroboros v0.210.0
  ledger/dijkstra/testdata/cardano_ledger_dijkstra_current_tx.hex
  (cardano-ledger golden at c2114bd).
