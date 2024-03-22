**@harmoniclabs/cardano-ledger-ts** • [Readme](../README.md) \| [API](../globals.md)

***

[@harmoniclabs/cardano-ledger-ts](../README.md) / CertAuthCommitteeHot

# Class: CertAuthCommitteeHot

## Implements

- [`ICert`](../interfaces/ICert.md)
- [`ICertAuthCommitteeHot`](../interfaces/ICertAuthCommitteeHot.md)
- `ToCbor`
- `ToJson`

## Constructors

### new CertAuthCommitteeHot(__namedParameters)

> **new CertAuthCommitteeHot**(`__namedParameters`): [`CertAuthCommitteeHot`](CertAuthCommitteeHot.md)

#### Parameters

• **\_\_namedParameters**: [`ICertAuthCommitteeHot`](../interfaces/ICertAuthCommitteeHot.md)

#### Returns

[`CertAuthCommitteeHot`](CertAuthCommitteeHot.md)

#### Source

[src/ledger/certs/CertAuthCommitteeHot.ts:21](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/ledger/certs/CertAuthCommitteeHot.ts#L21)

## Properties

### certType

> **`readonly`** **certType**: [`AuthCommitteeHot`](../enumerations/CertificateType.md#authcommitteehot)

#### Implementation of

[`ICert`](../interfaces/ICert.md).[`certType`](../interfaces/ICert.md#certtype)

#### Source

[src/ledger/certs/CertAuthCommitteeHot.ts:17](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/ledger/certs/CertAuthCommitteeHot.ts#L17)

***

### coldCredential

> **`readonly`** **coldCredential**: [`Credential`](Credential.md)\<[`CredentialType`](../enumerations/CredentialType.md)\>

#### Implementation of

[`ICertAuthCommitteeHot`](../interfaces/ICertAuthCommitteeHot.md).[`coldCredential`](../interfaces/ICertAuthCommitteeHot.md#coldcredential)

#### Source

[src/ledger/certs/CertAuthCommitteeHot.ts:18](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/ledger/certs/CertAuthCommitteeHot.ts#L18)

***

### hotCredential

> **`readonly`** **hotCredential**: [`Credential`](Credential.md)\<[`CredentialType`](../enumerations/CredentialType.md)\>

#### Implementation of

[`ICertAuthCommitteeHot`](../interfaces/ICertAuthCommitteeHot.md).[`hotCredential`](../interfaces/ICertAuthCommitteeHot.md#hotcredential)

#### Source

[src/ledger/certs/CertAuthCommitteeHot.ts:19](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/ledger/certs/CertAuthCommitteeHot.ts#L19)

## Methods

### getRequiredSigners()

> **getRequiredSigners**(): [`Hash28`](Hash28.md)[]

#### Returns

[`Hash28`](Hash28.md)[]

#### Implementation of

[`ICert`](../interfaces/ICert.md).[`getRequiredSigners`](../interfaces/ICert.md#getrequiredsigners)

#### Source

[src/ledger/certs/CertAuthCommitteeHot.ts:32](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/ledger/certs/CertAuthCommitteeHot.ts#L32)

***

### toCbor()

> **toCbor**(): `CborString`

#### Returns

`CborString`

#### Implementation of

`ToCbor.toCbor`

#### Source

[src/ledger/certs/CertAuthCommitteeHot.ts:37](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/ledger/certs/CertAuthCommitteeHot.ts#L37)

***

### toCborObj()

> **toCborObj**(): `CborArray`

#### Returns

`CborArray`

#### Implementation of

`ToCbor.toCborObj`

#### Source

[src/ledger/certs/CertAuthCommitteeHot.ts:41](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/ledger/certs/CertAuthCommitteeHot.ts#L41)

***

### toJson()

> **toJson**(): `Object`

#### Returns

`Object`

##### certType

> **certType**: `"AuthCommitteeHot"`

##### coldCredential

> **coldCredential**: `Object`

##### coldCredential.credentialType

> **credentialType**: `string`

##### coldCredential.hash

> **hash**: `string`

##### hotCredential

> **hotCredential**: `Object`

##### hotCredential.credentialType

> **credentialType**: `string`

##### hotCredential.hash

> **hash**: `string`

#### Implementation of

`ToJson.toJson`

#### Source

[src/ledger/certs/CertAuthCommitteeHot.ts:66](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/ledger/certs/CertAuthCommitteeHot.ts#L66)

***

### fromCborObj()

> **`static`** **fromCborObj**(`cbor`): [`CertAuthCommitteeHot`](CertAuthCommitteeHot.md)

#### Parameters

• **cbor**: `CborObj`

#### Returns

[`CertAuthCommitteeHot`](CertAuthCommitteeHot.md)

#### Source

[src/ledger/certs/CertAuthCommitteeHot.ts:50](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/ledger/certs/CertAuthCommitteeHot.ts#L50)
