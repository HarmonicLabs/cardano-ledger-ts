[**@harmoniclabs/cardano-ledger-ts**](../README.md) • **Docs**

***

[@harmoniclabs/cardano-ledger-ts](../globals.md) / VKeyWitness

# Class: VKeyWitness

## Implements

- `ToCbor`
- `Cloneable`\<[`VKeyWitness`](VKeyWitness.md)\>
- `ToJson`

## Constructors

### new VKeyWitness()

> **new VKeyWitness**(`vkey`, `signature`): [`VKeyWitness`](VKeyWitness.md)

#### Parameters

• **vkey**: [`Hash32`](Hash32.md)

• **signature**: [`Signature`](Signature.md)

#### Returns

[`VKeyWitness`](VKeyWitness.md)

#### Defined in

[src/tx/TxWitnessSet/VKeyWitness/VKeyWitness.ts:18](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/tx/TxWitnessSet/VKeyWitness/VKeyWitness.ts#L18)

## Properties

### signature

> `readonly` **signature**: [`Signature`](Signature.md)

#### Defined in

[src/tx/TxWitnessSet/VKeyWitness/VKeyWitness.ts:16](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/tx/TxWitnessSet/VKeyWitness/VKeyWitness.ts#L16)

***

### vkey

> `readonly` **vkey**: [`VKey`](VKey.md)

#### Defined in

[src/tx/TxWitnessSet/VKeyWitness/VKeyWitness.ts:15](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/tx/TxWitnessSet/VKeyWitness/VKeyWitness.ts#L15)

## Methods

### clone()

> **clone**(): [`VKeyWitness`](VKeyWitness.md)

#### Returns

[`VKeyWitness`](VKeyWitness.md)

#### Implementation of

`Cloneable.clone`

#### Defined in

[src/tx/TxWitnessSet/VKeyWitness/VKeyWitness.ts:41](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/tx/TxWitnessSet/VKeyWitness/VKeyWitness.ts#L41)

***

### toCbor()

> **toCbor**(): `CborString`

#### Returns

`CborString`

#### Implementation of

`ToCbor.toCbor`

#### Defined in

[src/tx/TxWitnessSet/VKeyWitness/VKeyWitness.ts:49](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/tx/TxWitnessSet/VKeyWitness/VKeyWitness.ts#L49)

***

### toCborObj()

> **toCborObj**(): `CborObj`

#### Returns

`CborObj`

#### Implementation of

`ToCbor.toCborObj`

#### Defined in

[src/tx/TxWitnessSet/VKeyWitness/VKeyWitness.ts:53](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/tx/TxWitnessSet/VKeyWitness/VKeyWitness.ts#L53)

***

### toJson()

> **toJson**(): `object`

#### Returns

`object`

##### signature

> **signature**: `string`

##### vkey

> **vkey**: `string`

#### Implementation of

`ToJson.toJson`

#### Defined in

[src/tx/TxWitnessSet/VKeyWitness/VKeyWitness.ts:76](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/tx/TxWitnessSet/VKeyWitness/VKeyWitness.ts#L76)

***

### fromCbor()

> `static` **fromCbor**(`cStr`): [`VKeyWitness`](VKeyWitness.md)

#### Parameters

• **cStr**: `CanBeCborString`

#### Returns

[`VKeyWitness`](VKeyWitness.md)

#### Defined in

[src/tx/TxWitnessSet/VKeyWitness/VKeyWitness.ts:61](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/tx/TxWitnessSet/VKeyWitness/VKeyWitness.ts#L61)

***

### fromCborObj()

> `static` **fromCborObj**(`cObj`): [`VKeyWitness`](VKeyWitness.md)

#### Parameters

• **cObj**: `CborObj`

#### Returns

[`VKeyWitness`](VKeyWitness.md)

#### Defined in

[src/tx/TxWitnessSet/VKeyWitness/VKeyWitness.ts:65](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/tx/TxWitnessSet/VKeyWitness/VKeyWitness.ts#L65)
