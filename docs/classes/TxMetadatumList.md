[**@harmoniclabs/cardano-ledger-ts**](../README.md) • **Docs**

***

[@harmoniclabs/cardano-ledger-ts](../globals.md) / TxMetadatumList

# Class: TxMetadatumList

## Implements

- `ToCbor`
- `ToJson`

## Constructors

### new TxMetadatumList()

> **new TxMetadatumList**(`map`): [`TxMetadatumList`](TxMetadatumList.md)

#### Parameters

• **map**: [`TxMetadatum`](../type-aliases/TxMetadatum.md)[]

#### Returns

[`TxMetadatumList`](TxMetadatumList.md)

#### Defined in

[src/tx/metadata/TxMetadatum.ts:128](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/tx/metadata/TxMetadatum.ts#L128)

## Properties

### list

> `readonly` **list**: [`TxMetadatum`](../type-aliases/TxMetadatum.md)[]

#### Defined in

[src/tx/metadata/TxMetadatum.ts:126](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/tx/metadata/TxMetadatum.ts#L126)

## Methods

### toCbor()

> **toCbor**(): `CborString`

#### Returns

`CborString`

#### Implementation of

`ToCbor.toCbor`

#### Defined in

[src/tx/metadata/TxMetadatum.ts:142](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/tx/metadata/TxMetadatum.ts#L142)

***

### toCborObj()

> **toCborObj**(): `CborObj`

#### Returns

`CborObj`

#### Implementation of

`ToCbor.toCborObj`

#### Defined in

[src/tx/metadata/TxMetadatum.ts:146](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/tx/metadata/TxMetadatum.ts#L146)

***

### toJson()

> **toJson**(): `any`[]

#### Returns

`any`[]

#### Implementation of

`ToJson.toJson`

#### Defined in

[src/tx/metadata/TxMetadatum.ts:151](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/tx/metadata/TxMetadatum.ts#L151)
