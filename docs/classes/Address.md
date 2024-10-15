[**@harmoniclabs/cardano-ledger-ts**](../README.md) • **Docs**

***

[@harmoniclabs/cardano-ledger-ts](../globals.md) / Address

# Class: Address

shelley specification in cardano-ledger; page 113

## Implements

- `ToData`
- `ToCbor`

## Constructors

### new Address()

> **new Address**(`network`, `paymentCreds`, `stakeCreds`?, `type`?): [`Address`](Address.md)

#### Parameters

• **network**: [`NetworkT`](../type-aliases/NetworkT.md)

• **paymentCreds**: [`Credential`](Credential.md)\<[`CredentialType`](../enumerations/CredentialType.md)\>

• **stakeCreds?**: [`StakeCredentials`](StakeCredentials.md)\<[`StakeCredentialsType`](../type-aliases/StakeCredentialsType.md)\>

• **type?**: [`AddressType`](../type-aliases/AddressType.md)

#### Returns

[`Address`](Address.md)

#### Defined in

[src/ledger/Address.ts:75](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/Address.ts#L75)

## Properties

### network

> `readonly` **network**: [`NetworkT`](../type-aliases/NetworkT.md)

#### Defined in

[src/ledger/Address.ts:42](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/Address.ts#L42)

***

### paymentCreds

> `readonly` **paymentCreds**: [`Credential`](Credential.md)\<[`CredentialType`](../enumerations/CredentialType.md)\>

#### Defined in

[src/ledger/Address.ts:43](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/Address.ts#L43)

***

### stakeCreds?

> `readonly` `optional` **stakeCreds**: [`StakeCredentials`](StakeCredentials.md)\<[`StakeCredentialsType`](../type-aliases/StakeCredentialsType.md)\>

#### Defined in

[src/ledger/Address.ts:44](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/Address.ts#L44)

***

### type

> `readonly` **type**: [`AddressType`](../type-aliases/AddressType.md)

#### Defined in

[src/ledger/Address.ts:45](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/Address.ts#L45)

## Accessors

### fake

> `get` `static` **fake**(): [`Address`](Address.md)

#### Returns

[`Address`](Address.md)

#### Defined in

[src/ledger/Address.ts:132](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/Address.ts#L132)

## Methods

### clone()

> **clone**(): [`Address`](Address.md)

#### Returns

[`Address`](Address.md)

#### Defined in

[src/ledger/Address.ts:122](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/Address.ts#L122)

***

### toBuffer()

> **toBuffer**(): `Uint8Array`

#### Returns

`Uint8Array`

#### Defined in

[src/ledger/Address.ts:269](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/Address.ts#L269)

***

### toBytes()

> **toBytes**(): `byte`[]

#### Returns

`byte`[]

#### Defined in

[src/ledger/Address.ts:153](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/Address.ts#L153)

***

### toCbor()

> **toCbor**(): `CborString`

#### Returns

`CborString`

#### Implementation of

`ToCbor.toCbor`

#### Defined in

[src/ledger/Address.ts:337](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/Address.ts#L337)

***

### toCborObj()

> **toCborObj**(): `CborObj`

#### Returns

`CborObj`

#### Implementation of

`ToCbor.toCborObj`

#### Defined in

[src/ledger/Address.ts:324](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/Address.ts#L324)

***

### toData()

> **toData**(): `Data`

#### Returns

`Data`

#### Implementation of

`ToData.toData`

#### Defined in

[src/ledger/Address.ts:140](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/Address.ts#L140)

***

### toJson()

> **toJson**(): \`addr1$\{string\}\` \| \`addr\_test1$\{string\}\`

#### Returns

\`addr1$\{string\}\` \| \`addr\_test1$\{string\}\`

#### Defined in

[src/ledger/Address.ts:384](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/Address.ts#L384)

***

### toString()

> **toString**(): \`addr1$\{string\}\` \| \`addr\_test1$\{string\}\`

Returns a string representation of an object.

#### Returns

\`addr1$\{string\}\` \| \`addr\_test1$\{string\}\`

#### Defined in

[src/ledger/Address.ts:347](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/Address.ts#L347)

***

### fromBuffer()

> `static` **fromBuffer**(`buff`): [`Address`](Address.md)

#### Parameters

• **buff**: `string` \| `Uint8Array`

#### Returns

[`Address`](Address.md)

#### Defined in

[src/ledger/Address.ts:274](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/Address.ts#L274)

***

### fromBytes()

> `static` **fromBytes**(`bs`): [`Address`](Address.md)

#### Parameters

• **bs**: `string` \| `Uint8Array` \| `byte`[]

#### Returns

[`Address`](Address.md)

#### Defined in

[src/ledger/Address.ts:192](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/Address.ts#L192)

***

### fromCbor()

> `static` **fromCbor**(`cbor`): [`Address`](Address.md)

#### Parameters

• **cbor**: `CanBeCborString`

#### Returns

[`Address`](Address.md)

#### Defined in

[src/ledger/Address.ts:342](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/Address.ts#L342)

***

### fromCborObj()

> `static` **fromCborObj**(`buff`): [`Address`](Address.md)

#### Parameters

• **buff**: `CborObj`

#### Returns

[`Address`](Address.md)

#### Defined in

[src/ledger/Address.ts:329](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/Address.ts#L329)

***

### fromEntropy()

> `static` **fromEntropy**(`entropy`, `network`): [`Address`](Address.md)

generates an `XPrv` from entropy and calls `Addres.fromXPrv`

gets the standard address for single address wallets

payment key at path "m/1852'/1815'/0'/0/0"
stake key at path   "m/1852'/1815'/0'/2/0"

#### Parameters

• **entropy**: `string` \| `Uint8Array`

• **network**: [`NetworkT`](../type-aliases/NetworkT.md) = `"mainnet"`

#### Returns

[`Address`](Address.md)

#### Defined in

[src/ledger/Address.ts:319](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/Address.ts#L319)

***

### fromString()

> `static` **fromString**(`addr`): [`Address`](Address.md)

#### Parameters

• **addr**: `string`

#### Returns

[`Address`](Address.md)

#### Defined in

[src/ledger/Address.ts:355](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/Address.ts#L355)

***

### fromXPrv()

> `static` **fromXPrv**(`xprv`, `network`): [`Address`](Address.md)

gets the standard address for single address wallets

payment key at path "m/1852'/1815'/0'/0/0"
stake key at path   "m/1852'/1815'/0'/2/0"

#### Parameters

• **xprv**: `XPrv`

• **network**: [`NetworkT`](../type-aliases/NetworkT.md) = `"mainnet"`

#### Returns

[`Address`](Address.md)

#### Defined in

[src/ledger/Address.ts:289](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/Address.ts#L289)

***

### mainnet()

> `static` **mainnet**(`paymentCreds`, `stakeCreds`?, `type`?): [`Address`](Address.md)

#### Parameters

• **paymentCreds**: [`Credential`](Credential.md)\<[`CredentialType`](../enumerations/CredentialType.md)\>

• **stakeCreds?**: [`StakeCredentials`](StakeCredentials.md)\<[`StakeCredentialsType`](../type-aliases/StakeCredentialsType.md)\>

• **type?**: [`AddressType`](../type-aliases/AddressType.md)

#### Returns

[`Address`](Address.md)

#### Defined in

[src/ledger/Address.ts:47](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/Address.ts#L47)

***

### testnet()

> `static` **testnet**(`paymentCreds`, `stakeCreds`?, `type`?): [`Address`](Address.md)

#### Parameters

• **paymentCreds**: [`Credential`](Credential.md)\<[`CredentialType`](../enumerations/CredentialType.md)\>

• **stakeCreds?**: [`StakeCredentials`](StakeCredentials.md)\<[`StakeCredentialsType`](../type-aliases/StakeCredentialsType.md)\>

• **type?**: [`AddressType`](../type-aliases/AddressType.md)

#### Returns

[`Address`](Address.md)

#### Defined in

[src/ledger/Address.ts:61](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/Address.ts#L61)
