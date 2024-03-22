**@harmoniclabs/cardano-ledger-ts** • [Readme](../README.md) \| [API](../globals.md)

***

[@harmoniclabs/cardano-ledger-ts](../README.md) / TxMetadatumMap

# Class: TxMetadatumMap

## Implements

- `ToCbor`
- `ToJson`

## Constructors

### new TxMetadatumMap(map)

> **new TxMetadatumMap**(`map`): [`TxMetadatumMap`](TxMetadatumMap.md)

#### Parameters

• **map**: [`TxMetadatumMapEntry`](../type-aliases/TxMetadatumMapEntry.md)[]

#### Returns

[`TxMetadatumMap`](TxMetadatumMap.md)

#### Source

[src/tx/metadata/TxMetadatum.ts:82](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/tx/metadata/TxMetadatum.ts#L82)

## Properties

### map

> **`readonly`** **map**: [`TxMetadatumMapEntry`](../type-aliases/TxMetadatumMapEntry.md)[]

#### Source

[src/tx/metadata/TxMetadatum.ts:80](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/tx/metadata/TxMetadatum.ts#L80)

## Methods

### toCbor()

> **toCbor**(): `CborString`

#### Returns

`CborString`

#### Implementation of

`ToCbor.toCbor`

#### Source

[src/tx/metadata/TxMetadatum.ts:96](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/tx/metadata/TxMetadatum.ts#L96)

***

### toCborObj()

> **toCborObj**(): `CborObj`

#### Returns

`CborObj`

#### Implementation of

`ToCbor.toCborObj`

#### Source

[src/tx/metadata/TxMetadatum.ts:100](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/tx/metadata/TxMetadatum.ts#L100)

***

### toJson()

> **toJson**(): `Object`[]

#### Returns

`Object`[]

#### Implementation of

`ToJson.toJson`

#### Source

[src/tx/metadata/TxMetadatum.ts:112](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/tx/metadata/TxMetadatum.ts#L112)
