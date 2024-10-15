[**@harmoniclabs/cardano-ledger-ts**](../README.md) • **Docs**

***

[@harmoniclabs/cardano-ledger-ts](../globals.md) / Hash32

# Class: Hash32

## Extends

- [`Hash`](Hash.md)

## Extended by

- [`PrivateKey`](PrivateKey.md)
- [`PublicKey`](PublicKey.md)
- [`AuxiliaryDataHash`](AuxiliaryDataHash.md)
- [`ScriptDataHash`](ScriptDataHash.md)
- [`VRFKeyHash`](VRFKeyHash.md)
- [`VKey`](VKey.md)

## Constructors

### new Hash32()

> **new Hash32**(`bs`, `className`): [`Hash32`](Hash32.md)

#### Parameters

• **bs**: `string` \| `Uint8Array` \| [`Hash32`](Hash32.md)

• **className**: `string` = `"Hash32"`

#### Returns

[`Hash32`](Hash32.md)

#### Overrides

[`Hash`](Hash.md).[`constructor`](Hash.md#constructors)

#### Defined in

[src/hashes/Hash32/Hash32.ts:25](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/hashes/Hash32/Hash32.ts#L25)

## Accessors

### \_bytes

> `get` `protected` **\_bytes**(): `Uint8Array`

#### Returns

`Uint8Array`

#### Inherited from

[`Hash`](Hash.md).[`_bytes`](Hash.md#_bytes)

#### Defined in

[src/hashes/Hash.ts:45](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/hashes/Hash.ts#L45)

***

### \_str

> `get` `protected` **\_str**(): `string`

#### Returns

`string`

#### Inherited from

[`Hash`](Hash.md).[`_str`](Hash.md#_str)

#### Defined in

[src/hashes/Hash.ts:67](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/hashes/Hash.ts#L67)

***

### asBytes

> `get` **asBytes**(): `Uint8Array`

#### Deprecated

use `toBuffer()` instead

#### Returns

`Uint8Array`

#### Inherited from

[`Hash`](Hash.md).[`asBytes`](Hash.md#asbytes)

#### Defined in

[src/hashes/Hash.ts:138](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/hashes/Hash.ts#L138)

***

### asString

> `get` **asString**(): `string`

#### Deprecated

use `toString()` instead

#### Returns

`string`

#### Inherited from

[`Hash`](Hash.md).[`asString`](Hash.md#asstring)

#### Defined in

[src/hashes/Hash.ts:125](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/hashes/Hash.ts#L125)

## Methods

### clone()

> **clone**(): [`Hash`](Hash.md)

#### Returns

[`Hash`](Hash.md)

#### Inherited from

[`Hash`](Hash.md).[`clone`](Hash.md#clone)

#### Defined in

[src/hashes/Hash.ts:156](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/hashes/Hash.ts#L156)

***

### toBuffer()

> **toBuffer**(): `Uint8Array`

#### Returns

`Uint8Array`

#### Inherited from

[`Hash`](Hash.md).[`toBuffer`](Hash.md#tobuffer)

#### Defined in

[src/hashes/Hash.ts:143](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/hashes/Hash.ts#L143)

***

### ~~toBytes()~~

> **toBytes**(): `Uint8Array`

#### Returns

`Uint8Array`

#### Deprecated

use `toBuffer()` instead

#### Inherited from

[`Hash`](Hash.md).[`toBytes`](Hash.md#tobytes)

#### Defined in

[src/hashes/Hash.ts:151](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/hashes/Hash.ts#L151)

***

### toCbor()

> **toCbor**(): `CborString`

#### Returns

`CborString`

#### Inherited from

[`Hash`](Hash.md).[`toCbor`](Hash.md#tocbor)

#### Defined in

[src/hashes/Hash.ts:161](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/hashes/Hash.ts#L161)

***

### toCborObj()

> **toCborObj**(): `CborObj`

#### Returns

`CborObj`

#### Inherited from

[`Hash`](Hash.md).[`toCborObj`](Hash.md#tocborobj)

#### Defined in

[src/hashes/Hash.ts:165](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/hashes/Hash.ts#L165)

***

### toData()

> **toData**(`_version`?): `Data`

#### Parameters

• **\_version?**: `ToDataVersion`

#### Returns

`Data`

#### Inherited from

[`Hash`](Hash.md).[`toData`](Hash.md#todata)

#### Defined in

[src/hashes/Hash.ts:182](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/hashes/Hash.ts#L182)

***

### toString()

> **toString**(): `string`

Returns a string representation of an object.

#### Returns

`string`

#### Inherited from

[`Hash`](Hash.md).[`toString`](Hash.md#tostring)

#### Defined in

[src/hashes/Hash.ts:130](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/hashes/Hash.ts#L130)

***

### fromAscii()

> `static` **fromAscii**(`asciiStr`): [`Hash`](Hash.md)

#### Parameters

• **asciiStr**: `string`

#### Returns

[`Hash`](Hash.md)

#### Inherited from

[`Hash`](Hash.md).[`fromAscii`](Hash.md#fromascii)

#### Defined in

[src/hashes/Hash.ts:187](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/hashes/Hash.ts#L187)

***

### fromCbor()

> `static` **fromCbor**(`cStr`): [`Hash32`](Hash32.md)

#### Parameters

• **cStr**: `CanBeCborString`

#### Returns

[`Hash32`](Hash32.md)

#### Overrides

[`Hash`](Hash.md).[`fromCbor`](Hash.md#fromcbor)

#### Defined in

[src/hashes/Hash32/Hash32.ts:35](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/hashes/Hash32/Hash32.ts#L35)

***

### fromCborObj()

> `static` **fromCborObj**(`cObj`): [`Hash32`](Hash32.md)

#### Parameters

• **cObj**: `CborObj`

#### Returns

[`Hash32`](Hash32.md)

#### Overrides

[`Hash`](Hash.md).[`fromCborObj`](Hash.md#fromcborobj)

#### Defined in

[src/hashes/Hash32/Hash32.ts:39](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/hashes/Hash32/Hash32.ts#L39)

***

### isStrictInstance()

> `static` **isStrictInstance**(`bs`): `bs is Hash`

#### Parameters

• **bs**: `any`

#### Returns

`bs is Hash`

#### Inherited from

[`Hash`](Hash.md).[`isStrictInstance`](Hash.md#isstrictinstance)

#### Defined in

[src/hashes/Hash.ts:40](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/hashes/Hash.ts#L40)

***

### isValidHexValue()

> `static` **isValidHexValue**(`str`): `boolean`

#### Parameters

• **str**: `string`

#### Returns

`boolean`

#### Inherited from

[`Hash`](Hash.md).[`isValidHexValue`](Hash.md#isvalidhexvalue)

#### Defined in

[src/hashes/Hash.ts:197](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/hashes/Hash.ts#L197)

***

### toAscii()

> `static` **toAscii**(`bStr`): `string`

#### Parameters

• **bStr**: [`Hash`](Hash.md)

#### Returns

`string`

#### Inherited from

[`Hash`](Hash.md).[`toAscii`](Hash.md#toascii)

#### Defined in

[src/hashes/Hash.ts:192](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/hashes/Hash.ts#L192)
