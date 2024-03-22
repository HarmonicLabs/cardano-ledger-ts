**@harmoniclabs/cardano-ledger-ts** • [Readme](../README.md) \| [API](../globals.md)

***

[@harmoniclabs/cardano-ledger-ts](../README.md) / CertStakeRegistrationDeleg

# Class: CertStakeRegistrationDeleg

## Implements

- [`ICert`](../interfaces/ICert.md)
- [`ICertStakeRegistrationDeleg`](../interfaces/ICertStakeRegistrationDeleg.md)

## Constructors

### new CertStakeRegistrationDeleg(__namedParameters)

> **new CertStakeRegistrationDeleg**(`__namedParameters`): [`CertStakeRegistrationDeleg`](CertStakeRegistrationDeleg.md)

#### Parameters

• **\_\_namedParameters**: [`ICertStakeRegistrationDeleg`](../interfaces/ICertStakeRegistrationDeleg.md)

#### Returns

[`CertStakeRegistrationDeleg`](CertStakeRegistrationDeleg.md)

#### Source

[src/ledger/certs/CertStakeRegistrationDeleg.ts:26](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/ledger/certs/CertStakeRegistrationDeleg.ts#L26)

## Properties

### certType

> **`readonly`** **certType**: [`StakeRegistrationDeleg`](../enumerations/CertificateType.md#stakeregistrationdeleg)

#### Implementation of

[`ICert`](../interfaces/ICert.md).[`certType`](../interfaces/ICert.md#certtype)

#### Source

[src/ledger/certs/CertStakeRegistrationDeleg.ts:21](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/ledger/certs/CertStakeRegistrationDeleg.ts#L21)

***

### coin

> **`readonly`** **coin**: `bigint`

#### Implementation of

[`ICertStakeRegistrationDeleg`](../interfaces/ICertStakeRegistrationDeleg.md).[`coin`](../interfaces/ICertStakeRegistrationDeleg.md#coin)

#### Source

[src/ledger/certs/CertStakeRegistrationDeleg.ts:24](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/ledger/certs/CertStakeRegistrationDeleg.ts#L24)

***

### poolKeyHash

> **`readonly`** **poolKeyHash**: [`Hash28`](Hash28.md)

#### Implementation of

[`ICertStakeRegistrationDeleg`](../interfaces/ICertStakeRegistrationDeleg.md).[`poolKeyHash`](../interfaces/ICertStakeRegistrationDeleg.md#poolkeyhash)

#### Source

[src/ledger/certs/CertStakeRegistrationDeleg.ts:23](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/ledger/certs/CertStakeRegistrationDeleg.ts#L23)

***

### stakeCredential

> **`readonly`** **stakeCredential**: [`Credential`](Credential.md)\<[`CredentialType`](../enumerations/CredentialType.md)\>

#### Implementation of

[`ICertStakeRegistrationDeleg`](../interfaces/ICertStakeRegistrationDeleg.md).[`stakeCredential`](../interfaces/ICertStakeRegistrationDeleg.md#stakecredential)

#### Source

[src/ledger/certs/CertStakeRegistrationDeleg.ts:22](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/ledger/certs/CertStakeRegistrationDeleg.ts#L22)

## Methods

### getRequiredSigners()

> **getRequiredSigners**(): [`Hash28`](Hash28.md)[]

#### Returns

[`Hash28`](Hash28.md)[]

#### Implementation of

[`ICert`](../interfaces/ICert.md).[`getRequiredSigners`](../interfaces/ICert.md#getrequiredsigners)

#### Source

[src/ledger/certs/CertStakeRegistrationDeleg.ts:38](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/ledger/certs/CertStakeRegistrationDeleg.ts#L38)

***

### toCbor()

> **toCbor**(): `CborString`

#### Returns

`CborString`

#### Source

[src/ledger/certs/CertStakeRegistrationDeleg.ts:43](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/ledger/certs/CertStakeRegistrationDeleg.ts#L43)

***

### toCborObj()

> **toCborObj**(): `CborArray`

#### Returns

`CborArray`

#### Source

[src/ledger/certs/CertStakeRegistrationDeleg.ts:47](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/ledger/certs/CertStakeRegistrationDeleg.ts#L47)

***

### toJson()

> **toJson**(): `Object`

#### Returns

`Object`

##### certType

> **certType**: `"StakeRegistrationDeleg"`

##### coin

> **coin**: `string`

##### poolKeyHash

> **poolKeyHash**: `string`

##### stakeCredential

> **stakeCredential**: `Object`

##### stakeCredential.credentialType

> **credentialType**: `string`

##### stakeCredential.hash

> **hash**: `string`

#### Source

[src/ledger/certs/CertStakeRegistrationDeleg.ts:57](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/ledger/certs/CertStakeRegistrationDeleg.ts#L57)
