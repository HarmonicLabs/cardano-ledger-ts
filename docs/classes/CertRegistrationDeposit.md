**@harmoniclabs/cardano-ledger-ts** • [Readme](../README.md) \| [API](../globals.md)

***

[@harmoniclabs/cardano-ledger-ts](../README.md) / CertRegistrationDeposit

# Class: CertRegistrationDeposit

## Implements

- [`ICert`](../interfaces/ICert.md)
- [`ICertRegistrationDeposit`](../interfaces/ICertRegistrationDeposit.md)

## Constructors

### new CertRegistrationDeposit(__namedParameters)

> **new CertRegistrationDeposit**(`__namedParameters`): [`CertRegistrationDeposit`](CertRegistrationDeposit.md)

#### Parameters

• **\_\_namedParameters**: [`ICertRegistrationDeposit`](../interfaces/ICertRegistrationDeposit.md)

#### Returns

[`CertRegistrationDeposit`](CertRegistrationDeposit.md)

#### Source

[src/ledger/certs/CertRegistrationDeposit.ts:22](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/ledger/certs/CertRegistrationDeposit.ts#L22)

## Properties

### certType

> **`readonly`** **certType**: [`RegistrationDeposit`](../enumerations/CertificateType.md#registrationdeposit)

#### Implementation of

[`ICert`](../interfaces/ICert.md).[`certType`](../interfaces/ICert.md#certtype)

#### Source

[src/ledger/certs/CertRegistrationDeposit.ts:18](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/ledger/certs/CertRegistrationDeposit.ts#L18)

***

### deposit

> **`readonly`** **deposit**: `bigint`

#### Implementation of

[`ICertRegistrationDeposit`](../interfaces/ICertRegistrationDeposit.md).[`deposit`](../interfaces/ICertRegistrationDeposit.md#deposit)

#### Source

[src/ledger/certs/CertRegistrationDeposit.ts:20](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/ledger/certs/CertRegistrationDeposit.ts#L20)

***

### stakeCredential

> **`readonly`** **stakeCredential**: [`Credential`](Credential.md)\<[`CredentialType`](../enumerations/CredentialType.md)\>

#### Implementation of

[`ICertRegistrationDeposit`](../interfaces/ICertRegistrationDeposit.md).[`stakeCredential`](../interfaces/ICertRegistrationDeposit.md#stakecredential)

#### Source

[src/ledger/certs/CertRegistrationDeposit.ts:19](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/ledger/certs/CertRegistrationDeposit.ts#L19)

## Methods

### getRequiredSigners()

> **getRequiredSigners**(): [`Hash28`](Hash28.md)[]

#### Returns

[`Hash28`](Hash28.md)[]

#### Implementation of

[`ICert`](../interfaces/ICert.md).[`getRequiredSigners`](../interfaces/ICert.md#getrequiredsigners)

#### Source

[src/ledger/certs/CertRegistrationDeposit.ts:33](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/ledger/certs/CertRegistrationDeposit.ts#L33)

***

### toCbor()

> **toCbor**(): `CborString`

#### Returns

`CborString`

#### Source

[src/ledger/certs/CertRegistrationDeposit.ts:38](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/ledger/certs/CertRegistrationDeposit.ts#L38)

***

### toCborObj()

> **toCborObj**(): `CborArray`

#### Returns

`CborArray`

#### Source

[src/ledger/certs/CertRegistrationDeposit.ts:42](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/ledger/certs/CertRegistrationDeposit.ts#L42)

***

### toJson()

> **toJson**(): `Object`

#### Returns

`Object`

##### certType

> **certType**: `"RegistrationDeposit"`

##### deposit

> **deposit**: `string`

##### stakeCredential

> **stakeCredential**: `Object`

##### stakeCredential.credentialType

> **credentialType**: `string`

##### stakeCredential.hash

> **hash**: `string`

#### Source

[src/ledger/certs/CertRegistrationDeposit.ts:69](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/ledger/certs/CertRegistrationDeposit.ts#L69)

***

### fromCborObj()

> **`static`** **fromCborObj**(`cbor`): [`CertRegistrationDeposit`](CertRegistrationDeposit.md)

#### Parameters

• **cbor**: `CborObj`

#### Returns

[`CertRegistrationDeposit`](CertRegistrationDeposit.md)

#### Source

[src/ledger/certs/CertRegistrationDeposit.ts:51](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/ledger/certs/CertRegistrationDeposit.ts#L51)
