[**@harmoniclabs/cardano-ledger-ts**](../README.md) • **Docs**

***

[@harmoniclabs/cardano-ledger-ts](../globals.md) / StakeAddress

# Class: StakeAddress\<T\>

## Type Parameters

• **T** *extends* [`StakeAddressType`](../type-aliases/StakeAddressType.md) = [`StakeAddressType`](../type-aliases/StakeAddressType.md)

## Constructors

### new StakeAddress()

> **new StakeAddress**\<`T`\>(`network`, `credentials`, `type`?): [`StakeAddress`](StakeAddress.md)\<`T`\>

#### Parameters

• **network**: [`NetworkT`](../type-aliases/NetworkT.md)

• **credentials**: [`Hash28`](Hash28.md)

• **type?**: `T`

#### Returns

[`StakeAddress`](StakeAddress.md)\<`T`\>

#### Defined in

[src/ledger/StakeAddress.ts:26](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/StakeAddress.ts#L26)

## Properties

### credentials

> `readonly` **credentials**: [`StakeAddressCredentials`](../type-aliases/StakeAddressCredentials.md)\<`T`\>

#### Defined in

[src/ledger/StakeAddress.ts:24](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/StakeAddress.ts#L24)

***

### network

> `readonly` **network**: [`NetworkT`](../type-aliases/NetworkT.md)

#### Defined in

[src/ledger/StakeAddress.ts:22](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/StakeAddress.ts#L22)

***

### type

> `readonly` **type**: `T`

#### Defined in

[src/ledger/StakeAddress.ts:23](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/StakeAddress.ts#L23)

## Methods

### clone()

> **clone**(): [`StakeAddress`](StakeAddress.md)\<`T`\>

#### Returns

[`StakeAddress`](StakeAddress.md)\<`T`\>

#### Defined in

[src/ledger/StakeAddress.ts:66](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/StakeAddress.ts#L66)

***

### toBytes()

> **toBytes**(): `Uint8Array`

#### Returns

`Uint8Array`

#### Defined in

[src/ledger/StakeAddress.ts:101](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/StakeAddress.ts#L101)

***

### toCborObj()

> **toCborObj**(): `CborObj`

#### Returns

`CborObj`

#### Defined in

[src/ledger/StakeAddress.ts:129](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/StakeAddress.ts#L129)

***

### toCredential()

> **toCredential**(): [`Credential`](Credential.md)\<[`CredentialType`](../enumerations/CredentialType.md)\>

#### Returns

[`Credential`](Credential.md)\<[`CredentialType`](../enumerations/CredentialType.md)\>

#### Defined in

[src/ledger/StakeAddress.ts:146](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/StakeAddress.ts#L146)

***

### toStakeCredentials()

> **toStakeCredentials**(): [`StakeCredentials`](StakeCredentials.md)\<`T`\>

#### Returns

[`StakeCredentials`](StakeCredentials.md)\<`T`\>

#### Defined in

[src/ledger/StakeAddress.ts:154](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/StakeAddress.ts#L154)

***

### toString()

> **toString**(): [`StakeAddressBech32`](../type-aliases/StakeAddressBech32.md)

#### Returns

[`StakeAddressBech32`](../type-aliases/StakeAddressBech32.md)

#### Defined in

[src/ledger/StakeAddress.ts:75](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/StakeAddress.ts#L75)

***

### fromBytes()

> `static` **fromBytes**(`bs`, `netwok`, `type`): [`StakeAddress`](StakeAddress.md)\<[`StakeAddressType`](../type-aliases/StakeAddressType.md)\>

#### Parameters

• **bs**: `string` \| `Uint8Array` \| `byte`[]

• **netwok**: [`NetworkT`](../type-aliases/NetworkT.md) = `"mainnet"`

• **type**: [`StakeAddressType`](../type-aliases/StakeAddressType.md) = `"stakeKey"`

#### Returns

[`StakeAddress`](StakeAddress.md)\<[`StakeAddressType`](../type-aliases/StakeAddressType.md)\>

#### Defined in

[src/ledger/StakeAddress.ts:106](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/StakeAddress.ts#L106)

***

### fromCbor()

> `static` **fromCbor**(`cStr`): [`StakeAddress`](StakeAddress.md)\<[`StakeAddressType`](../type-aliases/StakeAddressType.md)\>

#### Parameters

• **cStr**: `CanBeCborString`

#### Returns

[`StakeAddress`](StakeAddress.md)\<[`StakeAddressType`](../type-aliases/StakeAddressType.md)\>

#### Defined in

[src/ledger/StakeAddress.ts:134](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/StakeAddress.ts#L134)

***

### fromCborObj()

> `static` **fromCborObj**(`cObj`): [`StakeAddress`](StakeAddress.md)\<[`StakeAddressType`](../type-aliases/StakeAddressType.md)\>

#### Parameters

• **cObj**: `CborObj`

#### Returns

[`StakeAddress`](StakeAddress.md)\<[`StakeAddressType`](../type-aliases/StakeAddressType.md)\>

#### Defined in

[src/ledger/StakeAddress.ts:138](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/StakeAddress.ts#L138)

***

### fromString()

#### fromString(str)

> `static` **fromString**(`str`): [`StakeAddress`](StakeAddress.md)\<[`StakeAddressType`](../type-aliases/StakeAddressType.md)\>

##### Parameters

• **str**: `string`

##### Returns

[`StakeAddress`](StakeAddress.md)\<[`StakeAddressType`](../type-aliases/StakeAddressType.md)\>

##### Defined in

[src/ledger/StakeAddress.ts:83](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/StakeAddress.ts#L83)

#### fromString(str, type)

> `static` **fromString**\<`T`\>(`str`, `type`): [`StakeAddress`](StakeAddress.md)\<`T`\>

##### Type Parameters

• **T** *extends* [`StakeAddressType`](../type-aliases/StakeAddressType.md) = [`StakeAddressType`](../type-aliases/StakeAddressType.md)

##### Parameters

• **str**: `string`

• **type**: `T`

##### Returns

[`StakeAddress`](StakeAddress.md)\<`T`\>

##### Defined in

[src/ledger/StakeAddress.ts:84](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/StakeAddress.ts#L84)
