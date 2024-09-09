import { ByronEBBBlock, ByronMainBlock } from "./blocks";

export type ByronBlock 
    = { id: 0, block: ByronEBBBlock }
    | { id: 1, block: ByronMainBlock };