// src/ is the source of truth: this is a thin re-export of the canonical
// `src/tx/metadata/TxMetadata`. Kept so existing `eras/common` import paths
// keep working while there is a SINGLE `TxMetadata` class identity across the
// whole package (so `x instanceof TxMetadata` is reliable everywhere).
export * from "../../../../tx/metadata/TxMetadata";
