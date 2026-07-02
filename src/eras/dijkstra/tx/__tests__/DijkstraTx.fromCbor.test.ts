// Cloned from the Conway era scaffold. The original fixtures here were
// Conway-era transaction CBOR decoded through DijkstraTx — NOT real Dijkstra
// data. No genuine Dijkstra transaction vectors exist yet:
//   - the era is not deployed to any network, and
//   - the only upstream golden (gOuroboros / Leios prototype) is in the
//     experimental prototype wire format, not the canonical cardano-ledger CDDL.
// Re-enable with real Dijkstra tx CBOR once available.
//
// Dijkstra-specific SHAPE behaviors (3-element tx, mempool is_valid, etc.) are
// covered with synthetic data in golden.tx.test.ts and DijkstraTxBody.dijkstraFields.test.ts.
test.todo("DijkstraTx.fromCbor — no real Dijkstra tx data available yet");
