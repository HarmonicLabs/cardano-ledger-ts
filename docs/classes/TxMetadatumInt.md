[**@harmoniclabs/cardano-ledger-ts**](../README.md) • **Docs**

***

[@harmoniclabs/cardano-ledger-ts](../globals.md) / TxMetadatumInt

# Class: TxMetadatumInt

## Implements

- `ToCbor`
- `ToJson`

## Constructors

### new TxMetadatumInt()

> **new TxMetadatumInt**(`n`): [`TxMetadatumInt`](TxMetadatumInt.md)

#### Parameters

• **n**: `number` \| `bigint`

#### Returns

[`TxMetadatumInt`](TxMetadatumInt.md)

#### Defined in

[src/tx/metadata/TxMetadatum.ts:162](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/tx/metadata/TxMetadatum.ts#L162)

## Properties

### n

> `readonly` **n**: `bigint`

#### Defined in

[src/tx/metadata/TxMetadatum.ts:160](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/tx/metadata/TxMetadatum.ts#L160)

## Methods

### toCbor()

> **toCbor**(): `CborString`

#### Returns

`CborString`

#### Implementation of

`ToCbor.toCbor`

#### Defined in

[src/tx/metadata/TxMetadatum.ts:171](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/tx/metadata/TxMetadatum.ts#L171)

***

### toCborObj()

> **toCborObj**(): `CborObj`

#### Returns

`CborObj`

#### Implementation of

`ToCbor.toCborObj`

#### Defined in

[src/tx/metadata/TxMetadatum.ts:175](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/tx/metadata/TxMetadatum.ts#L175)

***

### toJson()

> **toJson**(): `object`

#### Returns

`object`

##### int

> **int**: `string`

#### Implementation of

`ToJson.toJson`

#### Defined in

[src/tx/metadata/TxMetadatum.ts:180](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/tx/metadata/TxMetadatum.ts#L180)
