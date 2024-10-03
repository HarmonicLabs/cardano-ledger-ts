[**@harmoniclabs/cardano-ledger-ts**](../README.md) • **Docs**

***

[@harmoniclabs/cardano-ledger-ts](../globals.md) / Credential

# Class: Credential\<T\>

## Type Parameters

• **T** *extends* [`CredentialType`](../enumerations/CredentialType.md) = [`CredentialType`](../enumerations/CredentialType.md)

## Implements

- `ToCbor`
- `ToData`
- `Cloneable`\<[`Credential`](Credential.md)\<`T`\>\>

## Constructors

### new Credential()

> **new Credential**\<`T`\>(`type`, `hash`): [`Credential`](Credential.md)\<`T`\>

#### Parameters

• **type**: `T`

• **hash**: [`Hash28`](Hash28.md)

#### Returns

[`Credential`](Credential.md)\<`T`\>

#### Defined in

[src/credentials/Credential.ts:24](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/credentials/Credential.ts#L24)

## Properties

### hash

> `readonly` **hash**: `T` *extends* [`KeyHash`](../enumerations/CredentialType.md#keyhash) ? [`PubKeyHash`](PubKeyHash.md) : [`ValidatorHash`](ValidatorHash.md)

#### Defined in

[src/credentials/Credential.ts:22](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/credentials/Credential.ts#L22)

***

### type

> `readonly` **type**: `T`

#### Defined in

[src/credentials/Credential.ts:21](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/credentials/Credential.ts#L21)

## Accessors

### fake

> `get` `static` **fake**(): [`Credential`](Credential.md)\<[`KeyHash`](../enumerations/CredentialType.md#keyhash)\>

#### Returns

[`Credential`](Credential.md)\<[`KeyHash`](../enumerations/CredentialType.md#keyhash)\>

#### Defined in

[src/credentials/Credential.ts:58](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/credentials/Credential.ts#L58)

## Methods

### clone()

> **clone**(): [`Credential`](Credential.md)\<`T`\>

#### Returns

[`Credential`](Credential.md)\<`T`\>

#### Implementation of

`Cloneable.clone`

#### Defined in

[src/credentials/Credential.ts:50](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/credentials/Credential.ts#L50)

***

### toCbor()

> **toCbor**(): `CborString`

#### Returns

`CborString`

#### Implementation of

`ToCbor.toCbor`

#### Defined in

[src/credentials/Credential.ts:100](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/credentials/Credential.ts#L100)

***

### toCborObj()

> **toCborObj**(): `CborObj`

#### Returns

`CborObj`

#### Implementation of

`ToCbor.toCborObj`

#### Defined in

[src/credentials/Credential.ts:104](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/credentials/Credential.ts#L104)

***

### toData()

> **toData**(`_v`?): `DataConstr`

#### Parameters

• **\_v?**: `any`

#### Returns

`DataConstr`

#### Implementation of

`ToData.toData`

#### Defined in

[src/credentials/Credential.ts:66](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/credentials/Credential.ts#L66)

***

### toJson()

> **toJson**(): `object`

#### Returns

`object`

##### credentialType

> **credentialType**: `string`

##### hash

> **hash**: `string`

#### Defined in

[src/credentials/Credential.ts:131](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/credentials/Credential.ts#L131)

***

### fromCbor()

> `static` **fromCbor**(`cStr`): [`Credential`](Credential.md)\<[`CredentialType`](../enumerations/CredentialType.md)\>

#### Parameters

• **cStr**: `CanBeCborString`

#### Returns

[`Credential`](Credential.md)\<[`CredentialType`](../enumerations/CredentialType.md)\>

#### Defined in

[src/credentials/Credential.ts:112](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/credentials/Credential.ts#L112)

***

### fromCborObj()

> `static` **fromCborObj**(`cObj`): [`Credential`](Credential.md)\<[`CredentialType`](../enumerations/CredentialType.md)\>

#### Parameters

• **cObj**: `CborObj`

#### Returns

[`Credential`](Credential.md)\<[`CredentialType`](../enumerations/CredentialType.md)\>

#### Defined in

[src/credentials/Credential.ts:116](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/credentials/Credential.ts#L116)

***

### keyHash()

> `static` **keyHash**(`hash`): [`Credential`](Credential.md)\<[`KeyHash`](../enumerations/CredentialType.md#keyhash)\>

#### Parameters

• **hash**: `string` \| `Uint8Array` \| [`Hash28`](Hash28.md)

#### Returns

[`Credential`](Credential.md)\<[`KeyHash`](../enumerations/CredentialType.md#keyhash)\>

#### Defined in

[src/credentials/Credential.ts:80](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/credentials/Credential.ts#L80)

***

### ~~pubKey()~~

> `static` **pubKey**(`hash`): [`Credential`](Credential.md)\<[`KeyHash`](../enumerations/CredentialType.md#keyhash)\>

#### Parameters

• **hash**: `string` \| `Uint8Array` \| [`Hash28`](Hash28.md)

#### Returns

[`Credential`](Credential.md)\<[`KeyHash`](../enumerations/CredentialType.md#keyhash)\>

#### Deprecated

use `keyHash` instead

#### Defined in

[src/credentials/Credential.ts:75](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/credentials/Credential.ts#L75)

***

### script()

> `static` **script**(`hash`): [`Credential`](Credential.md)\<[`Script`](../enumerations/CredentialType.md#script)\>

#### Parameters

• **hash**: `string` \| `Uint8Array` \| [`Hash28`](Hash28.md)

#### Returns

[`Credential`](Credential.md)\<[`Script`](../enumerations/CredentialType.md#script)\>

#### Defined in

[src/credentials/Credential.ts:90](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/credentials/Credential.ts#L90)
