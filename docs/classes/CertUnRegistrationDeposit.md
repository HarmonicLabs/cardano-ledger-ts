**@harmoniclabs/cardano-ledger-ts** • [Readme](../README.md) \| [API](../globals.md)

***

[@harmoniclabs/cardano-ledger-ts](../README.md) / CertUnRegistrationDeposit

# Class: CertUnRegistrationDeposit

## Implements

- [`ICert`](../interfaces/ICert.md)
- [`ICertUnRegistrationDeposit`](../interfaces/ICertUnRegistrationDeposit.md)

## Constructors

### new CertUnRegistrationDeposit(__namedParameters)

> **new CertUnRegistrationDeposit**(`__namedParameters`): [`CertUnRegistrationDeposit`](CertUnRegistrationDeposit.md)

#### Parameters

• **\_\_namedParameters**: [`ICertUnRegistrationDeposit`](../interfaces/ICertUnRegistrationDeposit.md)

#### Returns

[`CertUnRegistrationDeposit`](CertUnRegistrationDeposit.md)

#### Source

[src/ledger/certs/CertUnRegistrationDeposit.ts:22](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/ledger/certs/CertUnRegistrationDeposit.ts#L22)

## Properties

### certType

> **`readonly`** **certType**: [`UnRegistrationDeposit`](../enumerations/CertificateType.md#unregistrationdeposit)

#### Implementation of

[`ICert`](../interfaces/ICert.md).[`certType`](../interfaces/ICert.md#certtype)

#### Source

[src/ledger/certs/CertUnRegistrationDeposit.ts:18](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/ledger/certs/CertUnRegistrationDeposit.ts#L18)

***

### deposit

> **`readonly`** **deposit**: `bigint`

#### Implementation of

[`ICertUnRegistrationDeposit`](../interfaces/ICertUnRegistrationDeposit.md).[`deposit`](../interfaces/ICertUnRegistrationDeposit.md#deposit)

#### Source

[src/ledger/certs/CertUnRegistrationDeposit.ts:20](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/ledger/certs/CertUnRegistrationDeposit.ts#L20)

***

### stakeCredential

> **`readonly`** **stakeCredential**: [`Credential`](Credential.md)\<[`CredentialType`](../enumerations/CredentialType.md)\>

#### Implementation of

[`ICertUnRegistrationDeposit`](../interfaces/ICertUnRegistrationDeposit.md).[`stakeCredential`](../interfaces/ICertUnRegistrationDeposit.md#stakecredential)

#### Source

[src/ledger/certs/CertUnRegistrationDeposit.ts:19](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/ledger/certs/CertUnRegistrationDeposit.ts#L19)

## Methods

### getRequiredSigners()

> **getRequiredSigners**(): [`Hash28`](Hash28.md)[]

#### Returns

[`Hash28`](Hash28.md)[]

#### Implementation of

[`ICert`](../interfaces/ICert.md).[`getRequiredSigners`](../interfaces/ICert.md#getrequiredsigners)

#### Source

[src/ledger/certs/CertUnRegistrationDeposit.ts:33](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/ledger/certs/CertUnRegistrationDeposit.ts#L33)

***

### toCbor()

> **toCbor**(): `CborString`

#### Returns

`CborString`

#### Source

[src/ledger/certs/CertUnRegistrationDeposit.ts:38](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/ledger/certs/CertUnRegistrationDeposit.ts#L38)

***

### toCborObj()

> **toCborObj**(): `CborArray`

#### Returns

`CborArray`

#### Source

[src/ledger/certs/CertUnRegistrationDeposit.ts:42](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/ledger/certs/CertUnRegistrationDeposit.ts#L42)

***

### toJson()

> **toJson**(): `Object`

#### Returns

`Object`

##### certType

> **certType**: `"UnRegistrationDeposit"`

##### deposit

> **deposit**: `string`

##### stakeCredential

> **stakeCredential**: `Object`

##### stakeCredential.credentialType

> **credentialType**: `string`

##### stakeCredential.hash

> **hash**: `string`

#### Source

[src/ledger/certs/CertUnRegistrationDeposit.ts:69](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/ledger/certs/CertUnRegistrationDeposit.ts#L69)

***

### fromCborObj()

> **`static`** **fromCborObj**(`cbor`): [`CertUnRegistrationDeposit`](CertUnRegistrationDeposit.md)

#### Parameters

• **cbor**: `CborObj`

#### Returns

[`CertUnRegistrationDeposit`](CertUnRegistrationDeposit.md)

#### Source

[src/ledger/certs/CertUnRegistrationDeposit.ts:51](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/ledger/certs/CertUnRegistrationDeposit.ts#L51)
