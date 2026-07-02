// Cloned from the Conway era scaffold. The original fixtures were generic
// Praos (Babbage/Conway-shaped, 10-field) header CBOR — NOT real Dijkstra
// header data. No genuine Dijkstra header vectors exist yet in the canonical
// format. (Note: the live Leios *prototype* testnet header carries an extra
// 11th "Leios extension" field that is NOT part of the cardano-ledger /
// ouroboros-consensus blueprint — see the note in cddl-files/dijkstra.cddl.)
// Re-enable with real canonical Dijkstra header CBOR once available.
test.todo("DijkstraHeader.fromCbor — no real Dijkstra header data available yet");
