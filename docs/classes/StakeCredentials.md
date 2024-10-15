[**@harmoniclabs/cardano-ledger-ts**](../README.md) • **Docs**

***

[@harmoniclabs/cardano-ledger-ts](../globals.md) / StakeCredentials

# Class: StakeCredentials\<T\>

## Type Parameters

• **T** *extends* [`StakeCredentialsType`](../type-aliases/StakeCredentialsType.md) = [`StakeCredentialsType`](../type-aliases/StakeCredentialsType.md)

## Implements

- `ToCbor`
- `ToData`

## Constructors

### new StakeCredentials()

> **new StakeCredentials**\<`T`\>(`type`, `hash`): [`StakeCredentials`](StakeCredentials.md)\<`T`\>

#### Parameters

• **type**: `T`

• **hash**: [`StakeHash`](../type-aliases/StakeHash.md)\<`T`\>

#### Returns

[`StakeCredentials`](StakeCredentials.md)\<`T`\>

#### Defined in

[src/credentials/StakeCredentials.ts:27](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/credentials/StakeCredentials.ts#L27)

## Properties

### hash

> `readonly` **hash**: [`StakeHash`](../type-aliases/StakeHash.md)\<`T`\>

#### Defined in

[src/credentials/StakeCredentials.ts:25](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/credentials/StakeCredentials.ts#L25)

***

### type

> `readonly` **type**: `T`

#### Defined in

[src/credentials/StakeCredentials.ts:24](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/credentials/StakeCredentials.ts#L24)

## Methods

### clone()

> **clone**(): [`StakeCredentials`](StakeCredentials.md)\<`T`\>

#### Returns

[`StakeCredentials`](StakeCredentials.md)\<`T`\>

#### Defined in

[src/credentials/StakeCredentials.ts:74](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/credentials/StakeCredentials.ts#L74)

***

### toCbor()

> **toCbor**(): `CborString`

#### Returns

`CborString`

#### Implementation of

`ToCbor.toCbor`

#### Defined in

[src/credentials/StakeCredentials.ts:112](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/credentials/StakeCredentials.ts#L112)

***

### toCborObj()

> **toCborObj**(): `CborObj`

#### Returns

`CborObj`

#### Implementation of

`ToCbor.toCborObj`

#### Defined in

[src/credentials/StakeCredentials.ts:117](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/credentials/StakeCredentials.ts#L117)

***

### toData()

> **toData**(`version`?): `DataConstr`

#### Parameters

• **version?**: `ToDataVersion`

#### Returns

`DataConstr`

#### Implementation of

`ToData.toData`

#### Defined in

[src/credentials/StakeCredentials.ts:82](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/credentials/StakeCredentials.ts#L82)

***

### toJson()

> **toJson**(): `object` \| `object`

#### Returns

`object` \| `object`

#### Defined in

[src/credentials/StakeCredentials.ts:164](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/credentials/StakeCredentials.ts#L164)

***

### fromCbor()

> `static` **fromCbor**(`cObj`): [`StakeCredentials`](StakeCredentials.md)\<[`StakeCredentialsType`](../type-aliases/StakeCredentialsType.md)\>

#### Parameters

• **cObj**: `CanBeCborString`

#### Returns

[`StakeCredentials`](StakeCredentials.md)\<[`StakeCredentialsType`](../type-aliases/StakeCredentialsType.md)\>

#### Defined in

[src/credentials/StakeCredentials.ts:130](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/credentials/StakeCredentials.ts#L130)

***

### fromCborObj()

> `static` **fromCborObj**(`cObj`): [`StakeCredentials`](StakeCredentials.md)\<[`StakeCredentialsType`](../type-aliases/StakeCredentialsType.md)\>

#### Parameters

• **cObj**: `CborObj`

#### Returns

[`StakeCredentials`](StakeCredentials.md)\<[`StakeCredentialsType`](../type-aliases/StakeCredentialsType.md)\>

#### Defined in

[src/credentials/StakeCredentials.ts:134](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/credentials/StakeCredentials.ts#L134)
