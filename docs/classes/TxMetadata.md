[**@harmoniclabs/cardano-ledger-ts**](../README.md) • **Docs**

***

[@harmoniclabs/cardano-ledger-ts](../globals.md) / TxMetadata

# Class: TxMetadata

## Implements

- `ToCbor`
- `ToJson`

## Constructors

### new TxMetadata()

> **new TxMetadata**(`metadata`): [`TxMetadata`](TxMetadata.md)

#### Parameters

• **metadata**: [`ITxMetadata`](../type-aliases/ITxMetadata.md)

#### Returns

[`TxMetadata`](TxMetadata.md)

#### Defined in

[src/tx/metadata/TxMetadata.ts:19](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/tx/metadata/TxMetadata.ts#L19)

## Properties

### metadata

> `readonly` **metadata**: `ITxMetadataStr`

#### Defined in

[src/tx/metadata/TxMetadata.ts:17](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/tx/metadata/TxMetadata.ts#L17)

## Methods

### toCbor()

> **toCbor**(): `CborString`

#### Returns

`CborString`

#### Implementation of

`ToCbor.toCbor`

#### Defined in

[src/tx/metadata/TxMetadata.ts:49](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/tx/metadata/TxMetadata.ts#L49)

***

### toCborObj()

> **toCborObj**(): `CborObj`

#### Returns

`CborObj`

#### Implementation of

`ToCbor.toCborObj`

#### Defined in

[src/tx/metadata/TxMetadata.ts:53](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/tx/metadata/TxMetadata.ts#L53)

***

### toJson()

> **toJson**(): `any`

#### Returns

`any`

#### Implementation of

`ToJson.toJson`

#### Defined in

[src/tx/metadata/TxMetadata.ts:92](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/tx/metadata/TxMetadata.ts#L92)

***

### fromCbor()

> `static` **fromCbor**(`cStr`): [`TxMetadata`](TxMetadata.md)

#### Parameters

• **cStr**: `CanBeCborString`

#### Returns

[`TxMetadata`](TxMetadata.md)

#### Defined in

[src/tx/metadata/TxMetadata.ts:65](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/tx/metadata/TxMetadata.ts#L65)

***

### fromCborObj()

> `static` **fromCborObj**(`cObj`): [`TxMetadata`](TxMetadata.md)

#### Parameters

• **cObj**: `CborObj`

#### Returns

[`TxMetadata`](TxMetadata.md)

#### Defined in

[src/tx/metadata/TxMetadata.ts:69](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/tx/metadata/TxMetadata.ts#L69)
