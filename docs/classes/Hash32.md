**@harmoniclabs/cardano-ledger-ts** • [Readme](../README.md) \| [API](../globals.md)

***

[@harmoniclabs/cardano-ledger-ts](../README.md) / Hash32

# Class: Hash32

## Extends

- [`Hash`](Hash.md)

## Constructors

### new Hash32(bs, className)

> **new Hash32**(`bs`, `className`): [`Hash32`](Hash32.md)

#### Parameters

• **bs**: `string` \| `Uint8Array` \| [`Hash32`](Hash32.md)

• **className**: `string`= `"Hash32"`

#### Returns

[`Hash32`](Hash32.md)

#### Overrides

[`Hash`](Hash.md).[`constructor`](Hash.md#constructors)

#### Source

[src/hashes/Hash32/Hash32.ts:25](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/hashes/Hash32/Hash32.ts#L25)

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

> **clone**(): [`Hash`](Hash.md)

#### Returns

[`Hash`](Hash.md)

#### Inherited from

[`Hash`](Hash.md).[`clone`](Hash.md#clone)

#### Source

[src/hashes/Hash.ts:155](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/hashes/Hash.ts#L155)

***

### toBuffer()

> **toBuffer**(): `Uint8Array`

#### Returns

`Uint8Array`

#### Inherited from

[`Hash`](Hash.md).[`toBuffer`](Hash.md#tobuffer)

#### Source

[src/hashes/Hash.ts:142](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/hashes/Hash.ts#L142)

***

### ~~toBytes()~~

> **toBytes**(): `Uint8Array`

#### Returns

`Uint8Array`

#### Inherited from

[`Hash`](Hash.md).[`toBytes`](Hash.md#tobytes)

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

[`Hash`](Hash.md).[`toCbor`](Hash.md#tocbor)

#### Source

[src/hashes/Hash.ts:160](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/hashes/Hash.ts#L160)

***

### toCborObj()

> **toCborObj**(): `CborObj`

#### Returns

`CborObj`

#### Inherited from

[`Hash`](Hash.md).[`toCborObj`](Hash.md#tocborobj)

#### Source

[src/hashes/Hash.ts:164](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/hashes/Hash.ts#L164)

***

### toData()

> **toData**(): `Data`

#### Returns

`Data`

#### Inherited from

[`Hash`](Hash.md).[`toData`](Hash.md#todata)

#### Source

[src/hashes/Hash.ts:181](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/hashes/Hash.ts#L181)

***

### toString()

> **toString**(): `string`

#### Returns

`string`

#### Inherited from

[`Hash`](Hash.md).[`toString`](Hash.md#tostring)

#### Source

[src/hashes/Hash.ts:129](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/hashes/Hash.ts#L129)

***

### fromAscii()

> **`static`** **fromAscii**(`asciiStr`): [`Hash`](Hash.md)

#### Parameters

• **asciiStr**: `string`

#### Returns

[`Hash`](Hash.md)

#### Inherited from

[`Hash`](Hash.md).[`fromAscii`](Hash.md#fromascii)

#### Source

[src/hashes/Hash.ts:186](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/hashes/Hash.ts#L186)

***

### fromCbor()

> **`static`** **fromCbor**(`cStr`): [`Hash32`](Hash32.md)

#### Parameters

• **cStr**: `CanBeCborString`

#### Returns

[`Hash32`](Hash32.md)

#### Overrides

[`Hash`](Hash.md).[`fromCbor`](Hash.md#fromcbor)

#### Source

[src/hashes/Hash32/Hash32.ts:35](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/hashes/Hash32/Hash32.ts#L35)

***

### fromCborObj()

> **`static`** **fromCborObj**(`cObj`): [`Hash32`](Hash32.md)

#### Parameters

• **cObj**: `CborObj`

#### Returns

[`Hash32`](Hash32.md)

#### Overrides

[`Hash`](Hash.md).[`fromCborObj`](Hash.md#fromcborobj)

#### Source

[src/hashes/Hash32/Hash32.ts:39](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/hashes/Hash32/Hash32.ts#L39)

***

### isStrictInstance()

> **`static`** **isStrictInstance**(`bs`): `bs is Hash`

#### Parameters

• **bs**: `any`

#### Returns

`bs is Hash`

#### Inherited from

[`Hash`](Hash.md).[`isStrictInstance`](Hash.md#isstrictinstance)

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

[`Hash`](Hash.md).[`isValidHexValue`](Hash.md#isvalidhexvalue)

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

[`Hash`](Hash.md).[`toAscii`](Hash.md#toascii)

#### Source

[src/hashes/Hash.ts:191](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/hashes/Hash.ts#L191)
