**@harmoniclabs/cardano-ledger-ts** • [Readme](../README.md) \| [API](../globals.md)

***

[@harmoniclabs/cardano-ledger-ts](../README.md) / CertRegistrationDrep

# Class: CertRegistrationDrep

## Implements

- [`ICert`](../interfaces/ICert.md)
- [`ICertRegistrationDrep`](../interfaces/ICertRegistrationDrep.md)

## Constructors

### new CertRegistrationDrep(__namedParameters)

> **new CertRegistrationDrep**(`__namedParameters`): [`CertRegistrationDrep`](CertRegistrationDrep.md)

#### Parameters

• **\_\_namedParameters**: [`ICertRegistrationDrep`](../interfaces/ICertRegistrationDrep.md)

#### Returns

[`CertRegistrationDrep`](CertRegistrationDrep.md)

#### Source

[src/ledger/certs/CertRegistrationDrep.ts:25](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/ledger/certs/CertRegistrationDrep.ts#L25)

## Properties

### anchor

> **`readonly`** **anchor**: `undefined` \| `Anchor`

#### Implementation of

[`ICertRegistrationDrep`](../interfaces/ICertRegistrationDrep.md).[`anchor`](../interfaces/ICertRegistrationDrep.md#anchor)

#### Source

[src/ledger/certs/CertRegistrationDrep.ts:23](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/ledger/certs/CertRegistrationDrep.ts#L23)

***

### certType

> **`readonly`** **certType**: [`RegistrationDrep`](../enumerations/CertificateType.md#registrationdrep)

#### Implementation of

[`ICert`](../interfaces/ICert.md).[`certType`](../interfaces/ICert.md#certtype)

#### Source

[src/ledger/certs/CertRegistrationDrep.ts:20](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/ledger/certs/CertRegistrationDrep.ts#L20)

***

### coin

> **`readonly`** **coin**: `bigint`

#### Implementation of

[`ICertRegistrationDrep`](../interfaces/ICertRegistrationDrep.md).[`coin`](../interfaces/ICertRegistrationDrep.md#coin)

#### Source

[src/ledger/certs/CertRegistrationDrep.ts:22](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/ledger/certs/CertRegistrationDrep.ts#L22)

***

### drepCredential

> **`readonly`** **drepCredential**: [`Credential`](Credential.md)\<[`CredentialType`](../enumerations/CredentialType.md)\>

#### Implementation of

[`ICertRegistrationDrep`](../interfaces/ICertRegistrationDrep.md).[`drepCredential`](../interfaces/ICertRegistrationDrep.md#drepcredential)

#### Source

[src/ledger/certs/CertRegistrationDrep.ts:21](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/ledger/certs/CertRegistrationDrep.ts#L21)

## Methods

### getRequiredSigners()

> **getRequiredSigners**(): [`Hash28`](Hash28.md)[]

#### Returns

[`Hash28`](Hash28.md)[]

#### Implementation of

[`ICert`](../interfaces/ICert.md).[`getRequiredSigners`](../interfaces/ICert.md#getrequiredsigners)

#### Source

[src/ledger/certs/CertRegistrationDrep.ts:37](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/ledger/certs/CertRegistrationDrep.ts#L37)

***

### toCbor()

> **toCbor**(): `CborString`

#### Returns

`CborString`

#### Source

[src/ledger/certs/CertRegistrationDrep.ts:42](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/ledger/certs/CertRegistrationDrep.ts#L42)

***

### toCborObj()

> **toCborObj**(): `CborArray`

#### Returns

`CborArray`

#### Source

[src/ledger/certs/CertRegistrationDrep.ts:46](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/ledger/certs/CertRegistrationDrep.ts#L46)

***

### toJson()

> **toJson**(): `Object`

#### Returns

`Object`

##### anchor

> **anchor**: `null` \| `Object`

##### certType

> **certType**: `"RegistrationDrep"`

##### coin

> **coin**: `string`

##### stakeCredential

> **stakeCredential**: `Object`

##### stakeCredential.credentialType

> **credentialType**: `string`

##### stakeCredential.hash

> **hash**: `string`

#### Source

[src/ledger/certs/CertRegistrationDrep.ts:75](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/ledger/certs/CertRegistrationDrep.ts#L75)

***

### fromCborObj()

> **`static`** **fromCborObj**(`cbor`): [`CertRegistrationDrep`](CertRegistrationDrep.md)

#### Parameters

• **cbor**: `CborObj`

#### Returns

[`CertRegistrationDrep`](CertRegistrationDrep.md)

#### Source

[src/ledger/certs/CertRegistrationDrep.ts:56](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/ledger/certs/CertRegistrationDrep.ts#L56)
