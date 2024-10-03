[**@harmoniclabs/cardano-ledger-ts**](../README.md) • **Docs**

***

[@harmoniclabs/cardano-ledger-ts](../globals.md) / BootstrapWitness

# Class: BootstrapWitness

## Implements

- `ToCbor`
- `Cloneable`\<[`BootstrapWitness`](BootstrapWitness.md)\>
- `ToJson`

## Constructors

### new BootstrapWitness()

> **new BootstrapWitness**(`pubKey`, `signature`, `chainCode`, `attributes`): [`BootstrapWitness`](BootstrapWitness.md)

#### Parameters

• **pubKey**: [`Hash32`](Hash32.md)

• **signature**: [`Signature`](Signature.md)

• **chainCode**: [`Hash32`](Hash32.md)

• **attributes**: `Uint8Array`

#### Returns

[`BootstrapWitness`](BootstrapWitness.md)

#### Defined in

[src/tx/TxWitnessSet/BootstrapWitness.ts:20](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/tx/TxWitnessSet/BootstrapWitness.ts#L20)

## Properties

### attributes

> `readonly` **attributes**: `Uint8Array`

#### Defined in

[src/tx/TxWitnessSet/BootstrapWitness.ts:18](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/tx/TxWitnessSet/BootstrapWitness.ts#L18)

***

### chainCode

> `readonly` **chainCode**: [`Hash32`](Hash32.md)

#### Defined in

[src/tx/TxWitnessSet/BootstrapWitness.ts:17](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/tx/TxWitnessSet/BootstrapWitness.ts#L17)

***

### pubKey

> `readonly` **pubKey**: [`VKey`](VKey.md)

#### Defined in

[src/tx/TxWitnessSet/BootstrapWitness.ts:15](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/tx/TxWitnessSet/BootstrapWitness.ts#L15)

***

### signature

> `readonly` **signature**: [`Signature`](Signature.md)

#### Defined in

[src/tx/TxWitnessSet/BootstrapWitness.ts:16](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/tx/TxWitnessSet/BootstrapWitness.ts#L16)

## Methods

### clone()

> **clone**(): [`BootstrapWitness`](BootstrapWitness.md)

#### Returns

[`BootstrapWitness`](BootstrapWitness.md)

#### Implementation of

`Cloneable.clone`

#### Defined in

[src/tx/TxWitnessSet/BootstrapWitness.ts:63](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/tx/TxWitnessSet/BootstrapWitness.ts#L63)

***

### toCbor()

> **toCbor**(): `CborString`

#### Returns

`CborString`

#### Implementation of

`ToCbor.toCbor`

#### Defined in

[src/tx/TxWitnessSet/BootstrapWitness.ts:73](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/tx/TxWitnessSet/BootstrapWitness.ts#L73)

***

### toCborObj()

> **toCborObj**(): `CborObj`

#### Returns

`CborObj`

#### Implementation of

`ToCbor.toCborObj`

#### Defined in

[src/tx/TxWitnessSet/BootstrapWitness.ts:77](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/tx/TxWitnessSet/BootstrapWitness.ts#L77)

***

### toJson()

> **toJson**(): `object`

#### Returns

`object`

##### attributes

> **attributes**: `string`

##### chainCode

> **chainCode**: `string`

##### pubKey

> **pubKey**: `string`

##### signature

> **signature**: `string`

#### Implementation of

`ToJson.toJson`

#### Defined in

[src/tx/TxWitnessSet/BootstrapWitness.ts:107](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/tx/TxWitnessSet/BootstrapWitness.ts#L107)

***

### fromCbor()

> `static` **fromCbor**(`cStr`): [`BootstrapWitness`](BootstrapWitness.md)

#### Parameters

• **cStr**: `CanBeCborString`

#### Returns

[`BootstrapWitness`](BootstrapWitness.md)

#### Defined in

[src/tx/TxWitnessSet/BootstrapWitness.ts:87](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/tx/TxWitnessSet/BootstrapWitness.ts#L87)

***

### fromCborObj()

> `static` **fromCborObj**(`cObj`): [`BootstrapWitness`](BootstrapWitness.md)

#### Parameters

• **cObj**: `CborObj`

#### Returns

[`BootstrapWitness`](BootstrapWitness.md)

#### Defined in

[src/tx/TxWitnessSet/BootstrapWitness.ts:91](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/tx/TxWitnessSet/BootstrapWitness.ts#L91)
