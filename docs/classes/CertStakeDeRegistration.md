**@harmoniclabs/cardano-ledger-ts** • [Readme](../README.md) \| [API](../globals.md)

***

[@harmoniclabs/cardano-ledger-ts](../README.md) / CertStakeDeRegistration

# Class: CertStakeDeRegistration

## Implements

- [`ICert`](../interfaces/ICert.md)
- [`ICertStakeDeRegistration`](../interfaces/ICertStakeDeRegistration.md)

## Constructors

### new CertStakeDeRegistration(__namedParameters)

> **new CertStakeDeRegistration**(`__namedParameters`): [`CertStakeDeRegistration`](CertStakeDeRegistration.md)

#### Parameters

• **\_\_namedParameters**: [`ICertStakeDeRegistration`](../interfaces/ICertStakeDeRegistration.md)

#### Returns

[`CertStakeDeRegistration`](CertStakeDeRegistration.md)

#### Source

[src/ledger/certs/CertStakeDeRegistration.ts:18](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/ledger/certs/CertStakeDeRegistration.ts#L18)

## Properties

### certType

> **`readonly`** **certType**: [`StakeDeRegistration`](../enumerations/CertificateType.md#stakederegistration)

#### Implementation of

[`ICert`](../interfaces/ICert.md).[`certType`](../interfaces/ICert.md#certtype)

#### Source

[src/ledger/certs/CertStakeDeRegistration.ts:15](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/ledger/certs/CertStakeDeRegistration.ts#L15)

***

### stakeCredential

> **`readonly`** **stakeCredential**: [`Credential`](Credential.md)\<[`CredentialType`](../enumerations/CredentialType.md)\>

#### Implementation of

[`ICertStakeDeRegistration`](../interfaces/ICertStakeDeRegistration.md).[`stakeCredential`](../interfaces/ICertStakeDeRegistration.md#stakecredential)

#### Source

[src/ledger/certs/CertStakeDeRegistration.ts:16](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/ledger/certs/CertStakeDeRegistration.ts#L16)

## Methods

### getRequiredSigners()

> **getRequiredSigners**(): [`Hash28`](Hash28.md)[]

#### Returns

[`Hash28`](Hash28.md)[]

#### Implementation of

[`ICert`](../interfaces/ICert.md).[`getRequiredSigners`](../interfaces/ICert.md#getrequiredsigners)

#### Source

[src/ledger/certs/CertStakeDeRegistration.ts:28](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/ledger/certs/CertStakeDeRegistration.ts#L28)

***

### toCbor()

> **toCbor**(): `CborString`

#### Returns

`CborString`

#### Source

[src/ledger/certs/CertStakeDeRegistration.ts:33](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/ledger/certs/CertStakeDeRegistration.ts#L33)

***

### toCborObj()

> **toCborObj**(): `CborArray`

#### Returns

`CborArray`

#### Source

[src/ledger/certs/CertStakeDeRegistration.ts:37](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/ledger/certs/CertStakeDeRegistration.ts#L37)

***

### toJson()

> **toJson**(): `Object`

#### Returns

`Object`

##### certType

> **certType**: `"StakeDeRegistration"`

##### stakeCredential

> **stakeCredential**: `Object`

##### stakeCredential.credentialType

> **credentialType**: `string`

##### stakeCredential.hash

> **hash**: `string`

#### Source

[src/ledger/certs/CertStakeDeRegistration.ts:60](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/ledger/certs/CertStakeDeRegistration.ts#L60)

***

### fromCborObj()

> **`static`** **fromCborObj**(`cbor`): [`CertStakeDeRegistration`](CertStakeDeRegistration.md)

#### Parameters

• **cbor**: `CborObj`

#### Returns

[`CertStakeDeRegistration`](CertStakeDeRegistration.md)

#### Source

[src/ledger/certs/CertStakeDeRegistration.ts:45](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/ledger/certs/CertStakeDeRegistration.ts#L45)
