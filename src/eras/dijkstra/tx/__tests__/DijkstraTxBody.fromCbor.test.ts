// Cloned from the Conway era scaffold. The original "mutexo" fixture was a
// Conway-era transaction_body decoded through DijkstraTxBody — NOT real Dijkstra
// data. No genuine Dijkstra transaction_body vectors exist yet (era undeployed;
// the only upstream golden is the experimental Leios-prototype format).
// Re-enable with real Dijkstra CBOR once available.
//
// Dijkstra-specific tx_body fields (guards@14, sub_transactions@23,
// direct_deposits@25, account_balance_intervals@26, key-6 removal) are covered
// with synthetic round-trips in DijkstraTxBody.dijkstraFields.test.ts.
test.todo("DijkstraTxBody.fromCbor — no real Dijkstra tx_body data available yet");
