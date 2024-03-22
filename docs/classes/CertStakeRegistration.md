**@harmoniclabs/cardano-ledger-ts** • [Readme](../README.md) \| [API](../globals.md)

***

[@harmoniclabs/cardano-ledger-ts](../README.md) / CertStakeRegistration

# Class: CertStakeRegistration

## Implements

- [`ICert`](../interfaces/ICert.md)
- [`ICertStakeRegistration`](../interfaces/ICertStakeRegistration.md)

## Constructors

### new CertStakeRegistration(__namedParameters)

> **new CertStakeRegistration**(`__namedParameters`): [`CertStakeRegistration`](CertStakeRegistration.md)

#### Parameters

• **\_\_namedParameters**: [`ICertStakeRegistration`](../interfaces/ICertStakeRegistration.md)

#### Returns

[`CertStakeRegistration`](CertStakeRegistration.md)

#### Source

[src/ledger/certs/CertStakeRegistration.ts:18](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/ledger/certs/CertStakeRegistration.ts#L18)

## Properties

### certType

> **`readonly`** **certType**: [`StakeRegistration`](../enumerations/CertificateType.md#stakeregistration)

#### Implementation of

[`ICert`](../interfaces/ICert.md).[`certType`](../interfaces/ICert.md#certtype)

#### Source

[src/ledger/certs/CertStakeRegistration.ts:15](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/ledger/certs/CertStakeRegistration.ts#L15)

***

### stakeCredential

> **`readonly`** **stakeCredential**: [`Credential`](Credential.md)\<[`CredentialType`](../enumerations/CredentialType.md)\>

#### Implementation of

[`ICertStakeRegistration`](../interfaces/ICertStakeRegistration.md).[`stakeCredential`](../interfaces/ICertStakeRegistration.md#stakecredential)

#### Source

[src/ledger/certs/CertStakeRegistration.ts:16](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/ledger/certs/CertStakeRegistration.ts#L16)

## Methods

### getRequiredSigners()

> **getRequiredSigners**(): [`Hash28`](Hash28.md)[]

#### Returns

[`Hash28`](Hash28.md)[]

#### Implementation of

[`ICert`](../interfaces/ICert.md).[`getRequiredSigners`](../interfaces/ICert.md#getrequiredsigners)

#### Source

[src/ledger/certs/CertStakeRegistration.ts:28](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/ledger/certs/CertStakeRegistration.ts#L28)

***

### toCbor()

> **toCbor**(): `CborString`

#### Returns

`CborString`

#### Source

[src/ledger/certs/CertStakeRegistration.ts:33](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/ledger/certs/CertStakeRegistration.ts#L33)

***

### toCborObj()

> **toCborObj**(): `CborArray`

#### Returns

`CborArray`

#### Source

[src/ledger/certs/CertStakeRegistration.ts:37](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/ledger/certs/CertStakeRegistration.ts#L37)

***

### toJson()

> **toJson**(): `Object`

#### Returns

`Object`

##### certType

> **certType**: `"StakeRegistration"`

##### stakeCredential

> **stakeCredential**: `Object`

##### stakeCredential.credentialType

> **credentialType**: `string`

##### stakeCredential.hash

> **hash**: `string`

#### Source

[src/ledger/certs/CertStakeRegistration.ts:60](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/ledger/certs/CertStakeRegistration.ts#L60)

***

### fromCborObj()

> **`static`** **fromCborObj**(`cbor`): [`CertStakeRegistration`](CertStakeRegistration.md)

#### Parameters

• **cbor**: `CborObj`

#### Returns

[`CertStakeRegistration`](CertStakeRegistration.md)

#### Source

[src/ledger/certs/CertStakeRegistration.ts:45](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/ledger/certs/CertStakeRegistration.ts#L45)
