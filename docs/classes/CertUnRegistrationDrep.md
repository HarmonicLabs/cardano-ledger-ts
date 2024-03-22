**@harmoniclabs/cardano-ledger-ts** • [Readme](../README.md) \| [API](../globals.md)

***

[@harmoniclabs/cardano-ledger-ts](../README.md) / CertUnRegistrationDrep

# Class: CertUnRegistrationDrep

## Implements

- [`ICert`](../interfaces/ICert.md)
- [`ICertUnRegistrationDrep`](../interfaces/ICertUnRegistrationDrep.md)

## Constructors

### new CertUnRegistrationDrep(__namedParameters)

> **new CertUnRegistrationDrep**(`__namedParameters`): [`CertUnRegistrationDrep`](CertUnRegistrationDrep.md)

#### Parameters

• **\_\_namedParameters**: [`ICertUnRegistrationDrep`](../interfaces/ICertUnRegistrationDrep.md)

#### Returns

[`CertUnRegistrationDrep`](CertUnRegistrationDrep.md)

#### Source

[src/ledger/certs/CertUnRegistrationDrep.ts:23](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/ledger/certs/CertUnRegistrationDrep.ts#L23)

## Properties

### certType

> **`readonly`** **certType**: [`UnRegistrationDrep`](../enumerations/CertificateType.md#unregistrationdrep)

#### Implementation of

[`ICert`](../interfaces/ICert.md).[`certType`](../interfaces/ICert.md#certtype)

#### Source

[src/ledger/certs/CertUnRegistrationDrep.ts:19](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/ledger/certs/CertUnRegistrationDrep.ts#L19)

***

### coin

> **`readonly`** **coin**: `bigint`

#### Implementation of

[`ICertUnRegistrationDrep`](../interfaces/ICertUnRegistrationDrep.md).[`coin`](../interfaces/ICertUnRegistrationDrep.md#coin)

#### Source

[src/ledger/certs/CertUnRegistrationDrep.ts:21](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/ledger/certs/CertUnRegistrationDrep.ts#L21)

***

### drepCredential

> **`readonly`** **drepCredential**: [`Credential`](Credential.md)\<[`CredentialType`](../enumerations/CredentialType.md)\>

#### Implementation of

[`ICertUnRegistrationDrep`](../interfaces/ICertUnRegistrationDrep.md).[`drepCredential`](../interfaces/ICertUnRegistrationDrep.md#drepcredential)

#### Source

[src/ledger/certs/CertUnRegistrationDrep.ts:20](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/ledger/certs/CertUnRegistrationDrep.ts#L20)

## Methods

### getRequiredSigners()

> **getRequiredSigners**(): [`Hash28`](Hash28.md)[]

#### Returns

[`Hash28`](Hash28.md)[]

#### Implementation of

[`ICert`](../interfaces/ICert.md).[`getRequiredSigners`](../interfaces/ICert.md#getrequiredsigners)

#### Source

[src/ledger/certs/CertUnRegistrationDrep.ts:34](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/ledger/certs/CertUnRegistrationDrep.ts#L34)

***

### toCbor()

> **toCbor**(): `CborString`

#### Returns

`CborString`

#### Source

[src/ledger/certs/CertUnRegistrationDrep.ts:39](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/ledger/certs/CertUnRegistrationDrep.ts#L39)

***

### toCborObj()

> **toCborObj**(): `CborArray`

#### Returns

`CborArray`

#### Source

[src/ledger/certs/CertUnRegistrationDrep.ts:43](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/ledger/certs/CertUnRegistrationDrep.ts#L43)

***

### toJson()

> **toJson**(): `Object`

#### Returns

`Object`

##### certType

> **certType**: `"UnRegistrationDrep"`

##### coin

> **coin**: `string`

##### drepCredential

> **drepCredential**: `Object`

##### drepCredential.credentialType

> **credentialType**: `string`

##### drepCredential.hash

> **hash**: `string`

#### Source

[src/ledger/certs/CertUnRegistrationDrep.ts:70](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/ledger/certs/CertUnRegistrationDrep.ts#L70)

***

### fromCborObj()

> **`static`** **fromCborObj**(`cbor`): [`CertUnRegistrationDrep`](CertUnRegistrationDrep.md)

#### Parameters

• **cbor**: `CborObj`

#### Returns

[`CertUnRegistrationDrep`](CertUnRegistrationDrep.md)

#### Source

[src/ledger/certs/CertUnRegistrationDrep.ts:52](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/ledger/certs/CertUnRegistrationDrep.ts#L52)
