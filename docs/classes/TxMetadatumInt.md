**@harmoniclabs/cardano-ledger-ts** • [Readme](../README.md) \| [API](../globals.md)

***

[@harmoniclabs/cardano-ledger-ts](../README.md) / TxMetadatumInt

# Class: TxMetadatumInt

## Implements

- `ToCbor`
- `ToJson`

## Constructors

### new TxMetadatumInt(n)

> **new TxMetadatumInt**(`n`): [`TxMetadatumInt`](TxMetadatumInt.md)

#### Parameters

• **n**: `number` \| `bigint`

#### Returns

[`TxMetadatumInt`](TxMetadatumInt.md)

#### Source

[src/tx/metadata/TxMetadatum.ts:162](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/tx/metadata/TxMetadatum.ts#L162)

## Properties

### n

> **`readonly`** **n**: `bigint`

#### Source

[src/tx/metadata/TxMetadatum.ts:160](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/tx/metadata/TxMetadatum.ts#L160)

## Methods

### toCbor()

> **toCbor**(): `CborString`

#### Returns

`CborString`

#### Implementation of

`ToCbor.toCbor`

#### Source

[src/tx/metadata/TxMetadatum.ts:171](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/tx/metadata/TxMetadatum.ts#L171)

***

### toCborObj()

> **toCborObj**(): `CborObj`

#### Returns

`CborObj`

#### Implementation of

`ToCbor.toCborObj`

#### Source

[src/tx/metadata/TxMetadatum.ts:175](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/tx/metadata/TxMetadatum.ts#L175)

***

### toJson()

> **toJson**(): `Object`

#### Returns

`Object`

##### int

> **int**: `string`

#### Implementation of

`ToJson.toJson`

#### Source

[src/tx/metadata/TxMetadatum.ts:180](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/tx/metadata/TxMetadatum.ts#L180)
