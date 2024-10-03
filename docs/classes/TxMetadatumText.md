[**@harmoniclabs/cardano-ledger-ts**](../README.md) • **Docs**

***

[@harmoniclabs/cardano-ledger-ts](../globals.md) / TxMetadatumText

# Class: TxMetadatumText

## Implements

- `ToCbor`
- `ToJson`

## Constructors

### new TxMetadatumText()

> **new TxMetadatumText**(`text`): [`TxMetadatumText`](TxMetadatumText.md)

#### Parameters

• **text**: `string`

#### Returns

[`TxMetadatumText`](TxMetadatumText.md)

#### Defined in

[src/tx/metadata/TxMetadatum.ts:236](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/tx/metadata/TxMetadatum.ts#L236)

## Properties

### text

> `readonly` **text**: `string`

#### Defined in

[src/tx/metadata/TxMetadatum.ts:234](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/tx/metadata/TxMetadatum.ts#L234)

## Methods

### toCbor()

> **toCbor**(): `CborString`

#### Returns

`CborString`

#### Implementation of

`ToCbor.toCbor`

#### Defined in

[src/tx/metadata/TxMetadatum.ts:250](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/tx/metadata/TxMetadatum.ts#L250)

***

### toCborObj()

> **toCborObj**(): `CborObj`

#### Returns

`CborObj`

#### Implementation of

`ToCbor.toCborObj`

#### Defined in

[src/tx/metadata/TxMetadatum.ts:254](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/tx/metadata/TxMetadatum.ts#L254)

***

### toJson()

> **toJson**(): `object`

#### Returns

`object`

##### text

> **text**: `string`

#### Implementation of

`ToJson.toJson`

#### Defined in

[src/tx/metadata/TxMetadatum.ts:275](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/tx/metadata/TxMetadatum.ts#L275)
