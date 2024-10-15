[**@harmoniclabs/cardano-ledger-ts**](../README.md) • **Docs**

***

[@harmoniclabs/cardano-ledger-ts](../globals.md) / TxMetadatumBytes

# Class: TxMetadatumBytes

## Implements

- `ToCbor`
- `ToJson`

## Constructors

### new TxMetadatumBytes()

> **new TxMetadatumBytes**(`bytes`): [`TxMetadatumBytes`](TxMetadatumBytes.md)

#### Parameters

• **bytes**: `ByteString` \| `Uint8Array`

#### Returns

[`TxMetadatumBytes`](TxMetadatumBytes.md)

#### Defined in

[src/tx/metadata/TxMetadatum.ts:191](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/tx/metadata/TxMetadatum.ts#L191)

## Properties

### bytes

> `readonly` **bytes**: `Uint8Array`

#### Defined in

[src/tx/metadata/TxMetadatum.ts:189](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/tx/metadata/TxMetadatum.ts#L189)

## Methods

### toCbor()

> **toCbor**(): `CborString`

#### Returns

`CborString`

#### Implementation of

`ToCbor.toCbor`

#### Defined in

[src/tx/metadata/TxMetadatum.ts:200](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/tx/metadata/TxMetadatum.ts#L200)

***

### toCborObj()

> **toCborObj**(): `CborObj`

#### Returns

`CborObj`

#### Implementation of

`ToCbor.toCborObj`

#### Defined in

[src/tx/metadata/TxMetadatum.ts:204](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/tx/metadata/TxMetadatum.ts#L204)

***

### toJson()

> **toJson**(): `object`

#### Returns

`object`

##### bytes

> **bytes**: `string`

#### Implementation of

`ToJson.toJson`

#### Defined in

[src/tx/metadata/TxMetadatum.ts:225](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/tx/metadata/TxMetadatum.ts#L225)
