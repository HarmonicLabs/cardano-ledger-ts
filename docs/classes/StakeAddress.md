**@harmoniclabs/cardano-ledger-ts** • [Readme](../README.md) \| [API](../globals.md)

***

[@harmoniclabs/cardano-ledger-ts](../README.md) / StakeAddress

# Class: StakeAddress\<T\>

## Type parameters

• **T** extends [`StakeAddressType`](../type-aliases/StakeAddressType.md) = [`StakeAddressType`](../type-aliases/StakeAddressType.md)

## Constructors

### new StakeAddress(network, credentials, type)

> **new StakeAddress**\<`T`\>(`network`, `credentials`, `type`?): [`StakeAddress`](StakeAddress.md)\<`T`\>

#### Parameters

• **network**: [`NetworkT`](../type-aliases/NetworkT.md)

• **credentials**: [`Hash28`](Hash28.md)

• **type?**: `T`

#### Returns

[`StakeAddress`](StakeAddress.md)\<`T`\>

#### Source

[src/ledger/StakeAddress.ts:25](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/ledger/StakeAddress.ts#L25)

## Properties

### credentials

> **`readonly`** **credentials**: [`StakeAddressCredentials`](../type-aliases/StakeAddressCredentials.md)\<`T`\>

#### Source

[src/ledger/StakeAddress.ts:23](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/ledger/StakeAddress.ts#L23)

***

### network

> **`readonly`** **network**: [`NetworkT`](../type-aliases/NetworkT.md)

#### Source

[src/ledger/StakeAddress.ts:21](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/ledger/StakeAddress.ts#L21)

***

### type

> **`readonly`** **type**: `T`

#### Source

[src/ledger/StakeAddress.ts:22](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/ledger/StakeAddress.ts#L22)

## Methods

### clone()

> **clone**(): [`StakeAddress`](StakeAddress.md)\<`T`\>

#### Returns

[`StakeAddress`](StakeAddress.md)\<`T`\>

#### Source

[src/ledger/StakeAddress.ts:65](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/ledger/StakeAddress.ts#L65)

***

### toBytes()

> **toBytes**(): `byte`[]

#### Returns

`byte`[]

#### Source

[src/ledger/StakeAddress.ts:100](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/ledger/StakeAddress.ts#L100)

***

### toCredential()

> **toCredential**(): [`Credential`](Credential.md)\<`CredentialType`\>

#### Returns

[`Credential`](Credential.md)\<`CredentialType`\>

#### Source

[src/ledger/StakeAddress.ts:128](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/ledger/StakeAddress.ts#L128)

***

### toStakeCredentials()

> **toStakeCredentials**(): [`StakeCredentials`](StakeCredentials.md)\<`T`\>

#### Returns

[`StakeCredentials`](StakeCredentials.md)\<`T`\>

#### Source

[src/ledger/StakeAddress.ts:136](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/ledger/StakeAddress.ts#L136)

***

### toString()

> **toString**(): [`StakeAddressBech32`](../type-aliases/StakeAddressBech32.md)

#### Returns

[`StakeAddressBech32`](../type-aliases/StakeAddressBech32.md)

#### Source

[src/ledger/StakeAddress.ts:74](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/ledger/StakeAddress.ts#L74)

***

### fromBytes()

> **`static`** **fromBytes**(`bs`, `netwok`, `type`): [`StakeAddress`](StakeAddress.md)\<[`StakeAddressType`](../type-aliases/StakeAddressType.md)\>

#### Parameters

• **bs**: `string` \| `Uint8Array` \| `byte`[]

• **netwok**: [`NetworkT`](../type-aliases/NetworkT.md)= `"mainnet"`

• **type**: [`StakeAddressType`](../type-aliases/StakeAddressType.md)= `"stakeKey"`

#### Returns

[`StakeAddress`](StakeAddress.md)\<[`StakeAddressType`](../type-aliases/StakeAddressType.md)\>

#### Source

[src/ledger/StakeAddress.ts:105](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/ledger/StakeAddress.ts#L105)

***

### fromString()

#### fromString(str)

> **`static`** **fromString**(`str`): [`StakeAddress`](StakeAddress.md)\<[`StakeAddressType`](../type-aliases/StakeAddressType.md)\>

##### Parameters

• **str**: `string`

##### Returns

[`StakeAddress`](StakeAddress.md)\<[`StakeAddressType`](../type-aliases/StakeAddressType.md)\>

##### Source

[src/ledger/StakeAddress.ts:82](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/ledger/StakeAddress.ts#L82)

#### fromString(str, type)

> **`static`** **fromString**\<`T`\>(`str`, `type`): [`StakeAddress`](StakeAddress.md)\<`T`\>

##### Type parameters

• **T** extends [`StakeAddressType`](../type-aliases/StakeAddressType.md) = [`StakeAddressType`](../type-aliases/StakeAddressType.md)

##### Parameters

• **str**: `string`

• **type**: `T`

##### Returns

[`StakeAddress`](StakeAddress.md)\<`T`\>

##### Source

[src/ledger/StakeAddress.ts:83](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/ledger/StakeAddress.ts#L83)
