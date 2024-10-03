[**@harmoniclabs/cardano-ledger-ts**](../README.md) • **Docs**

***

[@harmoniclabs/cardano-ledger-ts](../globals.md) / CertRegistrationDeposit

# Class: CertRegistrationDeposit

## Implements

- [`ICert`](../interfaces/ICert.md)
- [`ICertRegistrationDeposit`](../interfaces/ICertRegistrationDeposit.md)

## Constructors

### new CertRegistrationDeposit()

> **new CertRegistrationDeposit**(`__namedParameters`): [`CertRegistrationDeposit`](CertRegistrationDeposit.md)

#### Parameters

• **\_\_namedParameters**: [`ICertRegistrationDeposit`](../interfaces/ICertRegistrationDeposit.md)

#### Returns

[`CertRegistrationDeposit`](CertRegistrationDeposit.md)

#### Defined in

[src/ledger/certs/CertRegistrationDeposit.ts:25](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/certs/CertRegistrationDeposit.ts#L25)

## Properties

### certType

> `readonly` **certType**: [`RegistrationDeposit`](../enumerations/CertificateType.md#registrationdeposit)

#### Implementation of

[`ICert`](../interfaces/ICert.md).[`certType`](../interfaces/ICert.md#certtype)

#### Defined in

[src/ledger/certs/CertRegistrationDeposit.ts:21](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/certs/CertRegistrationDeposit.ts#L21)

***

### deposit

> `readonly` **deposit**: `bigint`

#### Implementation of

[`ICertRegistrationDeposit`](../interfaces/ICertRegistrationDeposit.md).[`deposit`](../interfaces/ICertRegistrationDeposit.md#deposit)

#### Defined in

[src/ledger/certs/CertRegistrationDeposit.ts:23](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/certs/CertRegistrationDeposit.ts#L23)

***

### stakeCredential

> `readonly` **stakeCredential**: [`Credential`](Credential.md)\<[`CredentialType`](../enumerations/CredentialType.md)\>

#### Implementation of

[`ICertRegistrationDeposit`](../interfaces/ICertRegistrationDeposit.md).[`stakeCredential`](../interfaces/ICertRegistrationDeposit.md#stakecredential)

#### Defined in

[src/ledger/certs/CertRegistrationDeposit.ts:22](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/certs/CertRegistrationDeposit.ts#L22)

## Methods

### getRequiredSigners()

> **getRequiredSigners**(): [`Hash28`](Hash28.md)[]

#### Returns

[`Hash28`](Hash28.md)[]

#### Implementation of

[`ICert`](../interfaces/ICert.md).[`getRequiredSigners`](../interfaces/ICert.md#getrequiredsigners)

#### Defined in

[src/ledger/certs/CertRegistrationDeposit.ts:62](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/certs/CertRegistrationDeposit.ts#L62)

***

### toCbor()

> **toCbor**(): `CborString`

#### Returns

`CborString`

#### Defined in

[src/ledger/certs/CertRegistrationDeposit.ts:67](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/certs/CertRegistrationDeposit.ts#L67)

***

### toCborObj()

> **toCborObj**(): `CborArray`

#### Returns

`CborArray`

#### Defined in

[src/ledger/certs/CertRegistrationDeposit.ts:71](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/certs/CertRegistrationDeposit.ts#L71)

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

[src/ledger/certs/CertRegistrationDeposit.ts:36](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/certs/CertRegistrationDeposit.ts#L36)

***

### toJson()

> **toJson**(): `object`

#### Returns

`object`

##### certType

> **certType**: `"RegistrationDeposit"`

##### deposit

> **deposit**: `string`

##### stakeCredential

> **stakeCredential**: `object`

##### stakeCredential.credentialType

> **credentialType**: `string`

##### stakeCredential.hash

> **hash**: `string`

#### Defined in

[src/ledger/certs/CertRegistrationDeposit.ts:98](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/certs/CertRegistrationDeposit.ts#L98)

***

### fromCborObj()

> `static` **fromCborObj**(`cbor`): [`CertRegistrationDeposit`](CertRegistrationDeposit.md)

#### Parameters

• **cbor**: `CborObj`

#### Returns

[`CertRegistrationDeposit`](CertRegistrationDeposit.md)

#### Defined in

[src/ledger/certs/CertRegistrationDeposit.ts:80](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/certs/CertRegistrationDeposit.ts#L80)
