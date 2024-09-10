export type U8Arr<Length extends number> = Uint8Array & { length: Length };
export type U8Arr80 = U8Arr<80>;
export type U8Arr32 = U8Arr<32>;        // equivalent to Hash32 (?)
export type U8Arr28 = U8Arr<28>;        // equivalent to Hash28 (?)

export type Byte = number;              // u8
export type Word16 = number;            // u16
export type Word32 = number;            // u32
export type Word64 = bigint;            // u64

export type BlockNo = bigint;
export type SlotNo = bigint;
export type BlockBodySize = bigint;

export type TransactionIndexN = number;
