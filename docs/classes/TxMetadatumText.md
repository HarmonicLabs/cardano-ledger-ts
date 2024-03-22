**@harmoniclabs/cardano-ledger-ts** • [Readme](../README.md) \| [API](../globals.md)

***

[@harmoniclabs/cardano-ledger-ts](../README.md) / TxMetadatumText

# Class: TxMetadatumText

## Implements

- `ToCbor`
- `ToJson`

## Constructors

### new TxMetadatumText(text)

> **new TxMetadatumText**(`text`): [`TxMetadatumText`](TxMetadatumText.md)

#### Parameters

• **text**: `string`

#### Returns

[`TxMetadatumText`](TxMetadatumText.md)

#### Source

[src/tx/metadata/TxMetadatum.ts:236](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/tx/metadata/TxMetadatum.ts#L236)

## Properties

### text

> **`readonly`** **text**: `string`

#### Source

[src/tx/metadata/TxMetadatum.ts:234](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/tx/metadata/TxMetadatum.ts#L234)

## Methods

### toCbor()

> **toCbor**(): `CborString`

#### Returns

`CborString`

#### Implementation of

`ToCbor.toCbor`

#### Source

[src/tx/metadata/TxMetadatum.ts:250](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/tx/metadata/TxMetadatum.ts#L250)

***

### toCborObj()

> **toCborObj**(): `CborObj`

#### Returns

`CborObj`

#### Implementation of

`ToCbor.toCborObj`

#### Source

[src/tx/metadata/TxMetadatum.ts:254](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/tx/metadata/TxMetadatum.ts#L254)

***

### toJson()

> **toJson**(): `Object`

#### Returns

`Object`

##### text

> **text**: `string`

#### Implementation of

`ToJson.toJson`

#### Source

[src/tx/metadata/TxMetadatum.ts:275](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/tx/metadata/TxMetadatum.ts#L275)
