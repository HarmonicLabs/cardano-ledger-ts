**@harmoniclabs/cardano-ledger-ts** • [Readme](../README.md) \| [API](../globals.md)

***

[@harmoniclabs/cardano-ledger-ts](../README.md) / ValidatorHash

# Class: ValidatorHash

## Extends

- [`Hash28`](Hash28.md)

## Constructors

### new ValidatorHash(bs, className)

> **new ValidatorHash**(`bs`, `className`): [`ValidatorHash`](ValidatorHash.md)

#### Parameters

• **bs**: [`CanBeHash28`](../type-aliases/CanBeHash28.md)

• **className**: `string`= `"Hash28"`

#### Returns

[`ValidatorHash`](ValidatorHash.md)

#### Inherited from

[`Hash28`](Hash28.md).[`constructor`](Hash28.md#constructors)

#### Source

[src/hashes/Hash28/Hash28.ts:25](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/hashes/Hash28/Hash28.ts#L25)

## Accessors

### \_bytes

> **`get`** **`protected`** **\_bytes**(): `Uint8Array`

#### Returns

`Uint8Array`

#### Source

[src/hashes/Hash.ts:44](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/hashes/Hash.ts#L44)

***

### \_str

> **`get`** **`protected`** **\_str**(): `string`

#### Returns

`string`

#### Source

[src/hashes/Hash.ts:66](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/hashes/Hash.ts#L66)

***

### asBytes

> **`get`** **asBytes**(): `Uint8Array`

#### Deprecated

use `toBuffer()` instead

#### Returns

`Uint8Array`

#### Source

[src/hashes/Hash.ts:137](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/hashes/Hash.ts#L137)

***

### asString

> **`get`** **asString**(): `string`

#### Deprecated

use `toString()` instead

#### Returns

`string`

#### Source

[src/hashes/Hash.ts:124](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/hashes/Hash.ts#L124)

## Methods

### clone()

> **clone**(): [`Hash28`](Hash28.md)

#### Returns

[`Hash28`](Hash28.md)

#### Inherited from

[`Hash28`](Hash28.md).[`clone`](Hash28.md#clone)

#### Source

[src/hashes/Hash28/Hash28.ts:40](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/hashes/Hash28/Hash28.ts#L40)

***

### toBuffer()

> **toBuffer**(): `Uint8Array`

#### Returns

`Uint8Array`

#### Inherited from

[`Hash28`](Hash28.md).[`toBuffer`](Hash28.md#tobuffer)

#### Source

[src/hashes/Hash.ts:142](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/hashes/Hash.ts#L142)

***

### ~~toBytes()~~

> **toBytes**(): `Uint8Array`

#### Returns

`Uint8Array`

#### Inherited from

[`Hash28`](Hash28.md).[`toBytes`](Hash28.md#tobytes)

#### Deprecated

use `toBuffer()` instead

#### Source

[src/hashes/Hash.ts:150](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/hashes/Hash.ts#L150)

***

### toCbor()

> **toCbor**(): `CborString`

#### Returns

`CborString`

#### Inherited from

[`Hash28`](Hash28.md).[`toCbor`](Hash28.md#tocbor)

#### Source

[src/hashes/Hash.ts:160](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/hashes/Hash.ts#L160)

***

### toCborObj()

> **toCborObj**(): `CborObj`

#### Returns

`CborObj`

#### Inherited from

[`Hash28`](Hash28.md).[`toCborObj`](Hash28.md#tocborobj)

#### Source

[src/hashes/Hash.ts:164](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/hashes/Hash.ts#L164)

***

### toData()

> **toData**(): `Data`

#### Returns

`Data`

#### Inherited from

[`Hash28`](Hash28.md).[`toData`](Hash28.md#todata)

#### Source

[src/hashes/Hash.ts:181](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/hashes/Hash.ts#L181)

***

### toString()

> **toString**(): `string`

#### Returns

`string`

#### Inherited from

[`Hash28`](Hash28.md).[`toString`](Hash28.md#tostring)

#### Source

[src/hashes/Hash.ts:129](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/hashes/Hash.ts#L129)

***

### valueOf()

> **valueOf**(): `string`

#### Returns

`string`

#### Inherited from

[`Hash28`](Hash28.md).[`valueOf`](Hash28.md#valueof)

#### Source

[src/hashes/Hash28/Hash28.ts:35](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/hashes/Hash28/Hash28.ts#L35)

***

### fromAscii()

> **`static`** **fromAscii**(`asciiStr`): [`Hash`](Hash.md)

#### Parameters

• **asciiStr**: `string`

#### Returns

[`Hash`](Hash.md)

#### Inherited from

[`Hash28`](Hash28.md).[`fromAscii`](Hash28.md#fromascii)

#### Source

[src/hashes/Hash.ts:186](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/hashes/Hash.ts#L186)

***

### fromCbor()

> **`static`** **fromCbor**(`cStr`): [`Hash28`](Hash28.md)

#### Parameters

• **cStr**: `CanBeCborString`

#### Returns

[`Hash28`](Hash28.md)

#### Inherited from

[`Hash28`](Hash28.md).[`fromCbor`](Hash28.md#fromcbor)

#### Source

[src/hashes/Hash28/Hash28.ts:45](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/hashes/Hash28/Hash28.ts#L45)

***

### fromCborObj()

> **`static`** **fromCborObj**(`cObj`): [`Hash28`](Hash28.md)

#### Parameters

• **cObj**: `CborObj`

#### Returns

[`Hash28`](Hash28.md)

#### Inherited from

[`Hash28`](Hash28.md).[`fromCborObj`](Hash28.md#fromcborobj)

#### Source

[src/hashes/Hash28/Hash28.ts:49](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/hashes/Hash28/Hash28.ts#L49)

***

### isStrictInstance()

> **`static`** **isStrictInstance**(`bs`): `bs is Hash`

#### Parameters

• **bs**: `any`

#### Returns

`bs is Hash`

#### Inherited from

[`Hash28`](Hash28.md).[`isStrictInstance`](Hash28.md#isstrictinstance)

#### Source

[src/hashes/Hash.ts:39](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/hashes/Hash.ts#L39)

***

### isValidHexValue()

> **`static`** **isValidHexValue**(`str`): `boolean`

#### Parameters

• **str**: `string`

#### Returns

`boolean`

#### Inherited from

[`Hash28`](Hash28.md).[`isValidHexValue`](Hash28.md#isvalidhexvalue)

#### Source

[src/hashes/Hash.ts:196](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/hashes/Hash.ts#L196)

***

### toAscii()

> **`static`** **toAscii**(`bStr`): `string`

#### Parameters

• **bStr**: [`Hash`](Hash.md)

#### Returns

`string`

#### Inherited from

[`Hash28`](Hash28.md).[`toAscii`](Hash28.md#toascii)

#### Source

[src/hashes/Hash.ts:191](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/hashes/Hash.ts#L191)
