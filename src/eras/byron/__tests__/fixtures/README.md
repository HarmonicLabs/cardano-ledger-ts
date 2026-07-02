# Byron real block fixtures

`byron1.block` … `byron8.block` are hex-encoded, genuine Byron-era blocks taken
verbatim from the TxPipe/Pallas test corpus:
<https://github.com/txpipe/pallas/tree/main/test_data>

Each file is a `block = [0, ebblock] / [1, mainblock]` (all 8 here are main blocks).
They collectively exercise every Byron payload variant:

| file | net | txs | sscProof/ssc tag | update |
|------|-----|-----|------------------|--------|
| byron1 | mainnet | 0 | 3 | — |
| byron2 | mainnet | 2 | 0 | — |
| byron3 | mainnet | 0 | 0 | — |
| byron4 | mainnet | 1 | 2 | — |
| byron5 | mainnet | 1 | 1 | proposal + 1 vote |
| byron6 | mainnet | 1 | 2 | — |
| byron7 | testnet | 6 | 2 | — |
| byron8 | mainnet | 0 | 3 | proposal + 7 votes |

Every main-block header carries a `blocksig` tag-2 (heavyweight delegation `dlgsig`).

Used by the Byron test suites to assert byte-exact `fromCbor → toCbor` round-trips
against real chain data. Not shipped in the npm package (`files: ["dist"]`).
