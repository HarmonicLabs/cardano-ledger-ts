**@harmoniclabs/cardano-ledger-ts** • [Readme](../README.md) \| [API](../globals.md)

***

[@harmoniclabs/cardano-ledger-ts](../README.md) / CertStakeDelegation

# Class: CertStakeDelegation

## Implements

- [`ICert`](../interfaces/ICert.md)
- [`ICertStakeDelegation`](../interfaces/ICertStakeDelegation.md)

## Constructors

### new CertStakeDelegation(__namedParameters)

> **new CertStakeDelegation**(`__namedParameters`): [`CertStakeDelegation`](CertStakeDelegation.md)

#### Parameters

• **\_\_namedParameters**: [`ICertStakeDelegation`](../interfaces/ICertStakeDelegation.md)

#### Returns

[`CertStakeDelegation`](CertStakeDelegation.md)

#### Source

[src/ledger/certs/CertStakeDelegation.ts:20](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/ledger/certs/CertStakeDelegation.ts#L20)

## Properties

### certType

> **`readonly`** **certType**: [`StakeDelegation`](../enumerations/CertificateType.md#stakedelegation)

#### Implementation of

[`ICert`](../interfaces/ICert.md).[`certType`](../interfaces/ICert.md#certtype)

#### Source

[src/ledger/certs/CertStakeDelegation.ts:16](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/ledger/certs/CertStakeDelegation.ts#L16)

***

### poolKeyHash

> **`readonly`** **poolKeyHash**: [`Hash28`](Hash28.md)

#### Implementation of

[`ICertStakeDelegation`](../interfaces/ICertStakeDelegation.md).[`poolKeyHash`](../interfaces/ICertStakeDelegation.md#poolkeyhash)

#### Source

[src/ledger/certs/CertStakeDelegation.ts:18](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/ledger/certs/CertStakeDelegation.ts#L18)

***

### stakeCredential

> **`readonly`** **stakeCredential**: [`Credential`](Credential.md)\<[`CredentialType`](../enumerations/CredentialType.md)\>

#### Implementation of

[`ICertStakeDelegation`](../interfaces/ICertStakeDelegation.md).[`stakeCredential`](../interfaces/ICertStakeDelegation.md#stakecredential)

#### Source

[src/ledger/certs/CertStakeDelegation.ts:17](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/ledger/certs/CertStakeDelegation.ts#L17)

## Methods

### getRequiredSigners()

> **getRequiredSigners**(): [`Hash28`](Hash28.md)[]

#### Returns

[`Hash28`](Hash28.md)[]

#### Implementation of

[`ICert`](../interfaces/ICert.md).[`getRequiredSigners`](../interfaces/ICert.md#getrequiredsigners)

#### Source

[src/ledger/certs/CertStakeDelegation.ts:31](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/ledger/certs/CertStakeDelegation.ts#L31)

***

### toCbor()

> **toCbor**(): `CborString`

#### Returns

`CborString`

#### Source

[src/ledger/certs/CertStakeDelegation.ts:36](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/ledger/certs/CertStakeDelegation.ts#L36)

***

### toCborObj()

> **toCborObj**(): `CborArray`

#### Returns

`CborArray`

#### Source

[src/ledger/certs/CertStakeDelegation.ts:40](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/ledger/certs/CertStakeDelegation.ts#L40)

***

### toJson()

> **toJson**(): `Object`

#### Returns

`Object`

##### certType

> **certType**: `"StakeDelegation"`

##### poolKeyHash

> **poolKeyHash**: `string`

##### stakeCredential

> **stakeCredential**: `Object`

##### stakeCredential.credentialType

> **credentialType**: `string`

##### stakeCredential.hash

> **hash**: `string`

#### Source

[src/ledger/certs/CertStakeDelegation.ts:65](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/ledger/certs/CertStakeDelegation.ts#L65)

***

### fromCborObj()

> **`static`** **fromCborObj**(`cbor`): [`CertStakeDelegation`](CertStakeDelegation.md)

#### Parameters

• **cbor**: `CborObj`

#### Returns

[`CertStakeDelegation`](CertStakeDelegation.md)

#### Source

[src/ledger/certs/CertStakeDelegation.ts:49](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/ledger/certs/CertStakeDelegation.ts#L49)
