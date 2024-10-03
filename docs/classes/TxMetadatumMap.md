[**@harmoniclabs/cardano-ledger-ts**](../README.md) • **Docs**

***

[@harmoniclabs/cardano-ledger-ts](../globals.md) / TxMetadatumMap

# Class: TxMetadatumMap

## Implements

- `ToCbor`
- `ToJson`

## Constructors

### new TxMetadatumMap()

> **new TxMetadatumMap**(`map`): [`TxMetadatumMap`](TxMetadatumMap.md)

#### Parameters

• **map**: [`TxMetadatumMapEntry`](../type-aliases/TxMetadatumMapEntry.md)[]

#### Returns

[`TxMetadatumMap`](TxMetadatumMap.md)

#### Defined in

[src/tx/metadata/TxMetadatum.ts:82](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/tx/metadata/TxMetadatum.ts#L82)

## Properties

### map

> `readonly` **map**: [`TxMetadatumMapEntry`](../type-aliases/TxMetadatumMapEntry.md)[]

#### Defined in

[src/tx/metadata/TxMetadatum.ts:80](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/tx/metadata/TxMetadatum.ts#L80)

## Methods

### toCbor()

> **toCbor**(): `CborString`

#### Returns

`CborString`

#### Implementation of

`ToCbor.toCbor`

#### Defined in

[src/tx/metadata/TxMetadatum.ts:96](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/tx/metadata/TxMetadatum.ts#L96)

***

### toCborObj()

> **toCborObj**(): `CborObj`

#### Returns

`CborObj`

#### Implementation of

`ToCbor.toCborObj`

#### Defined in

[src/tx/metadata/TxMetadatum.ts:100](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/tx/metadata/TxMetadatum.ts#L100)

***

### toJson()

> **toJson**(): `object`[]

#### Returns

`object`[]

#### Implementation of

`ToJson.toJson`

#### Defined in

[src/tx/metadata/TxMetadatum.ts:112](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/tx/metadata/TxMetadatum.ts#L112)
