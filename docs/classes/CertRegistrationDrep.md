[**@harmoniclabs/cardano-ledger-ts**](../README.md) • **Docs**

***

[@harmoniclabs/cardano-ledger-ts](../globals.md) / CertRegistrationDrep

# Class: CertRegistrationDrep

## Implements

- [`ICert`](../interfaces/ICert.md)
- [`ICertRegistrationDrep`](../interfaces/ICertRegistrationDrep.md)

## Constructors

### new CertRegistrationDrep()

> **new CertRegistrationDrep**(`__namedParameters`): [`CertRegistrationDrep`](CertRegistrationDrep.md)

#### Parameters

• **\_\_namedParameters**: [`ICertRegistrationDrep`](../interfaces/ICertRegistrationDrep.md)

#### Returns

[`CertRegistrationDrep`](CertRegistrationDrep.md)

#### Defined in

[src/ledger/certs/CertRegistrationDrep.ts:27](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/certs/CertRegistrationDrep.ts#L27)

## Properties

### anchor

> `readonly` **anchor**: `undefined` \| [`Anchor`](Anchor.md)

#### Implementation of

[`ICertRegistrationDrep`](../interfaces/ICertRegistrationDrep.md).[`anchor`](../interfaces/ICertRegistrationDrep.md#anchor)

#### Defined in

[src/ledger/certs/CertRegistrationDrep.ts:25](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/certs/CertRegistrationDrep.ts#L25)

***

### certType

> `readonly` **certType**: [`RegistrationDrep`](../enumerations/CertificateType.md#registrationdrep)

#### Implementation of

[`ICert`](../interfaces/ICert.md).[`certType`](../interfaces/ICert.md#certtype)

#### Defined in

[src/ledger/certs/CertRegistrationDrep.ts:22](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/certs/CertRegistrationDrep.ts#L22)

***

### coin

> `readonly` **coin**: `bigint`

#### Implementation of

[`ICertRegistrationDrep`](../interfaces/ICertRegistrationDrep.md).[`coin`](../interfaces/ICertRegistrationDrep.md#coin)

#### Defined in

[src/ledger/certs/CertRegistrationDrep.ts:24](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/certs/CertRegistrationDrep.ts#L24)

***

### drepCredential

> `readonly` **drepCredential**: [`Credential`](Credential.md)\<[`CredentialType`](../enumerations/CredentialType.md)\>

#### Implementation of

[`ICertRegistrationDrep`](../interfaces/ICertRegistrationDrep.md).[`drepCredential`](../interfaces/ICertRegistrationDrep.md#drepcredential)

#### Defined in

[src/ledger/certs/CertRegistrationDrep.ts:23](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/certs/CertRegistrationDrep.ts#L23)

## Methods

### getRequiredSigners()

> **getRequiredSigners**(): [`Hash28`](Hash28.md)[]

#### Returns

[`Hash28`](Hash28.md)[]

#### Implementation of

[`ICert`](../interfaces/ICert.md).[`getRequiredSigners`](../interfaces/ICert.md#getrequiredsigners)

#### Defined in

[src/ledger/certs/CertRegistrationDrep.ts:56](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/certs/CertRegistrationDrep.ts#L56)

***

### toCbor()

> **toCbor**(): `CborString`

#### Returns

`CborString`

#### Defined in

[src/ledger/certs/CertRegistrationDrep.ts:61](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/certs/CertRegistrationDrep.ts#L61)

***

### toCborObj()

> **toCborObj**(): `CborArray`

#### Returns

`CborArray`

#### Defined in

[src/ledger/certs/CertRegistrationDrep.ts:65](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/certs/CertRegistrationDrep.ts#L65)

***

### toData()

> **toData**(`version`?): `DataConstr`

#### Parameters

• **version?**: `ToDataVersion`

#### Returns

`DataConstr`

#### Implementation of

[`ICert`](../interfaces/ICert.md).[`toData`](../interfaces/ICert.md#todata)

#### Defined in

[src/ledger/certs/CertRegistrationDrep.ts:39](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/certs/CertRegistrationDrep.ts#L39)

***

### toJson()

> **toJson**(): `object`

#### Returns

`object`

##### anchor

> **anchor**: `null` \| `object`

##### certType

> **certType**: `"RegistrationDrep"`

##### coin

> **coin**: `string`

##### stakeCredential

> **stakeCredential**: `object`

##### stakeCredential.credentialType

> **credentialType**: `string`

##### stakeCredential.hash

> **hash**: `string`

#### Defined in

[src/ledger/certs/CertRegistrationDrep.ts:94](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/certs/CertRegistrationDrep.ts#L94)

***

### fromCborObj()

> `static` **fromCborObj**(`cbor`): [`CertRegistrationDrep`](CertRegistrationDrep.md)

#### Parameters

• **cbor**: `CborObj`

#### Returns

[`CertRegistrationDrep`](CertRegistrationDrep.md)

#### Defined in

[src/ledger/certs/CertRegistrationDrep.ts:75](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/certs/CertRegistrationDrep.ts#L75)
