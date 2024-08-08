import { U8Arr28, U8Arr32 } from "../../../utils/types";

export type Signature = Uint8Array;     // bytes
export type PubKey = Uint8Array;        // bytes
export type VssPubKey = Uint8Array;     // bytes
export type VssSec = Uint8Array;        // bytes
export type VssDec = Uint8Array;        // bytes
export type Issuer = PubKey;            // pubkey == bytes
export type Delegate = PubKey;          // pubkey == bytes

export type VssEnc = Uint8Array[];      // [bytes]

export type AddressId = U8Arr28;        // blake2b-224 == Hash28
export type StakeholderId = U8Arr28;    // blake2b-224 == Hash28

export type TxId = U8Arr32;             // hash == blake2b-256 == Hash32
export type DlgProof = U8Arr32;         // hash == blake2b-256 == Hash32
export type UpdProof = U8Arr32;         // hash == blake2b-256 == Hash32
export type ExtraProof = U8Arr32;       // hash == blake2b-256 == Hash32
export type BlockId = U8Arr32;          // blockid == blake2b-256 == Hash32
export type UpdId = U8Arr32;            // updid == blake2b-256 == Hash32

export type ProtocolMagic = number;     // u32

export type Difficulty = bigint;        // u64
export type EpochId = bigint;           // u64
export type SlotNo = bigint;            // u64

export type Attributes = Map<any, any>;
