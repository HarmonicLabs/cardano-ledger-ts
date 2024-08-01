export type U8Arr<Length extends number> = Uint8Array & { length: Length };
export type U8Arr32 = U8Arr<32>;
export type U8Arr28 = U8Arr<28>;
export type U8Arr80 = U8Arr<80>;

export type EpochId = bigint;