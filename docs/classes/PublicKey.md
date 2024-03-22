**@harmoniclabs/cardano-ledger-ts** • [Readme](../README.md) \| [API](../globals.md)

***

[@harmoniclabs/cardano-ledger-ts](../README.md) / PublicKey

# Class: PublicKey

## Extends

- [`Hash32`](Hash32.md)

## Constructors

### new PublicKey(pubKey)

> **new PublicKey**(`pubKey`): [`PublicKey`](PublicKey.md)

#### Parameters

• **pubKey**: `string` \| `Uint8Array` \| [`Hash32`](Hash32.md)

#### Returns

[`PublicKey`](PublicKey.md)

#### Overrides

[`Hash32`](Hash32.md).[`constructor`](Hash32.md#constructors)

#### Source

[src/credentials/PublicKey.ts:11](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/credentials/PublicKey.ts#L11)

## Properties

### hash

> **`readonly`** **hash**: [`PubKeyHash`](PubKeyHash.md)

#### Source

[src/credentials/PublicKey.ts:9](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/credentials/PublicKey.ts#L9)

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

[`Hash32`](Hash32.md).[`clone`](Hash32.md#clone)

#### Source

[src/hashes/Hash.ts:155](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/hashes/Hash.ts#L155)

***

### toBuffer()

> **toBuffer**(): `Uint8Array`

#### Returns

`Uint8Array`

#### Inherited from

[`Hash32`](Hash32.md).[`toBuffer`](Hash32.md#tobuffer)

#### Source

[src/hashes/Hash.ts:142](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/hashes/Hash.ts#L142)

***

### ~~toBytes()~~

> **toBytes**(): `Uint8Array`

#### Returns

`Uint8Array`

#### Inherited from

[`Hash32`](Hash32.md).[`toBytes`](Hash32.md#tobytes)

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

[`Hash32`](Hash32.md).[`toCbor`](Hash32.md#tocbor)

#### Source

[src/hashes/Hash.ts:160](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/hashes/Hash.ts#L160)

***

### toCborObj()

> **toCborObj**(): `CborObj`

#### Returns

`CborObj`

#### Inherited from

[`Hash32`](Hash32.md).[`toCborObj`](Hash32.md#tocborobj)

#### Source

[src/hashes/Hash.ts:164](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/hashes/Hash.ts#L164)

***

### toData()

> **toData**(): `Data`

#### Returns

`Data`

#### Inherited from

[`Hash32`](Hash32.md).[`toData`](Hash32.md#todata)

#### Source

[src/hashes/Hash.ts:181](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/hashes/Hash.ts#L181)

***

### toString()

> **toString**(): `string`

#### Returns

`string`

#### Inherited from

[`Hash32`](Hash32.md).[`toString`](Hash32.md#tostring)

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

[`Hash32`](Hash32.md).[`fromAscii`](Hash32.md#fromascii)

#### Source

[src/hashes/Hash.ts:186](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/hashes/Hash.ts#L186)

***

### fromCbor()

> **`static`** **fromCbor**(`cStr`): [`PublicKey`](PublicKey.md)

#### Parameters

• **cStr**: `CanBeCborString`

#### Returns

[`PublicKey`](PublicKey.md)

#### Overrides

[`Hash32`](Hash32.md).[`fromCbor`](Hash32.md#fromcbor)

#### Source

[src/credentials/PublicKey.ts:40](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/credentials/PublicKey.ts#L40)

***

### fromCborObj()

> **`static`** **fromCborObj**(`cObj`): [`PublicKey`](PublicKey.md)

#### Parameters

• **cObj**: `CborObj`

#### Returns

[`PublicKey`](PublicKey.md)

#### Overrides

[`Hash32`](Hash32.md).[`fromCborObj`](Hash32.md#fromcborobj)

#### Source

[src/credentials/PublicKey.ts:44](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/credentials/PublicKey.ts#L44)

***

### isStrictInstance()

> **`static`** **isStrictInstance**(`bs`): `bs is Hash`

#### Parameters

• **bs**: `any`

#### Returns

`bs is Hash`

#### Inherited from

[`Hash32`](Hash32.md).[`isStrictInstance`](Hash32.md#isstrictinstance)

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

[`Hash32`](Hash32.md).[`isValidHexValue`](Hash32.md#isvalidhexvalue)

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

[`Hash32`](Hash32.md).[`toAscii`](Hash32.md#toascii)

#### Source

[src/hashes/Hash.ts:191](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/hashes/Hash.ts#L191)
