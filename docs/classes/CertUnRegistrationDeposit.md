[**@harmoniclabs/cardano-ledger-ts**](../README.md) • **Docs**

***

[@harmoniclabs/cardano-ledger-ts](../globals.md) / CertUnRegistrationDeposit

# Class: CertUnRegistrationDeposit

## Implements

- [`ICert`](../interfaces/ICert.md)
- [`ICertUnRegistrationDeposit`](../interfaces/ICertUnRegistrationDeposit.md)

## Constructors

### new CertUnRegistrationDeposit()

> **new CertUnRegistrationDeposit**(`__namedParameters`): [`CertUnRegistrationDeposit`](CertUnRegistrationDeposit.md)

#### Parameters

• **\_\_namedParameters**: [`ICertUnRegistrationDeposit`](../interfaces/ICertUnRegistrationDeposit.md)

#### Returns

[`CertUnRegistrationDeposit`](CertUnRegistrationDeposit.md)

#### Defined in

[src/ledger/certs/CertUnRegistrationDeposit.ts:25](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/certs/CertUnRegistrationDeposit.ts#L25)

## Properties

### certType

> `readonly` **certType**: [`UnRegistrationDeposit`](../enumerations/CertificateType.md#unregistrationdeposit)

#### Implementation of

[`ICert`](../interfaces/ICert.md).[`certType`](../interfaces/ICert.md#certtype)

#### Defined in

[src/ledger/certs/CertUnRegistrationDeposit.ts:21](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/certs/CertUnRegistrationDeposit.ts#L21)

***

### deposit

> `readonly` **deposit**: `bigint`

#### Implementation of

[`ICertUnRegistrationDeposit`](../interfaces/ICertUnRegistrationDeposit.md).[`deposit`](../interfaces/ICertUnRegistrationDeposit.md#deposit)

#### Defined in

[src/ledger/certs/CertUnRegistrationDeposit.ts:23](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/certs/CertUnRegistrationDeposit.ts#L23)

***

### stakeCredential

> `readonly` **stakeCredential**: [`Credential`](Credential.md)\<[`CredentialType`](../enumerations/CredentialType.md)\>

#### Implementation of

[`ICertUnRegistrationDeposit`](../interfaces/ICertUnRegistrationDeposit.md).[`stakeCredential`](../interfaces/ICertUnRegistrationDeposit.md#stakecredential)

#### Defined in

[src/ledger/certs/CertUnRegistrationDeposit.ts:22](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/certs/CertUnRegistrationDeposit.ts#L22)

## Methods

### getRequiredSigners()

> **getRequiredSigners**(): [`Hash28`](Hash28.md)[]

#### Returns

[`Hash28`](Hash28.md)[]

#### Implementation of

[`ICert`](../interfaces/ICert.md).[`getRequiredSigners`](../interfaces/ICert.md#getrequiredsigners)

#### Defined in

[src/ledger/certs/CertUnRegistrationDeposit.ts:60](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/certs/CertUnRegistrationDeposit.ts#L60)

***

### toCbor()

> **toCbor**(): `CborString`

#### Returns

`CborString`

#### Defined in

[src/ledger/certs/CertUnRegistrationDeposit.ts:65](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/certs/CertUnRegistrationDeposit.ts#L65)

***

### toCborObj()

> **toCborObj**(): `CborArray`

#### Returns

`CborArray`

#### Defined in

[src/ledger/certs/CertUnRegistrationDeposit.ts:69](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/certs/CertUnRegistrationDeposit.ts#L69)

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

[src/ledger/certs/CertUnRegistrationDeposit.ts:36](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/certs/CertUnRegistrationDeposit.ts#L36)

***

### toJson()

> **toJson**(): `object`

#### Returns

`object`

##### certType

> **certType**: `"UnRegistrationDeposit"`

##### deposit

> **deposit**: `string`

##### stakeCredential

> **stakeCredential**: `object`

##### stakeCredential.credentialType

> **credentialType**: `string`

##### stakeCredential.hash

> **hash**: `string`

#### Defined in

[src/ledger/certs/CertUnRegistrationDeposit.ts:96](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/certs/CertUnRegistrationDeposit.ts#L96)

***

### fromCborObj()

> `static` **fromCborObj**(`cbor`): [`CertUnRegistrationDeposit`](CertUnRegistrationDeposit.md)

#### Parameters

• **cbor**: `CborObj`

#### Returns

[`CertUnRegistrationDeposit`](CertUnRegistrationDeposit.md)

#### Defined in

[src/ledger/certs/CertUnRegistrationDeposit.ts:78](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/certs/CertUnRegistrationDeposit.ts#L78)
