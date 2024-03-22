**@harmoniclabs/cardano-ledger-ts** • [Readme](../README.md) \| [API](../globals.md)

***

[@harmoniclabs/cardano-ledger-ts](../README.md) / CertResignCommitteeCold

# Class: CertResignCommitteeCold

## Implements

- [`ICert`](../interfaces/ICert.md)
- [`ICertResignCommitteeCold`](../interfaces/ICertResignCommitteeCold.md)

## Constructors

### new CertResignCommitteeCold(__namedParameters)

> **new CertResignCommitteeCold**(`__namedParameters`): [`CertResignCommitteeCold`](CertResignCommitteeCold.md)

#### Parameters

• **\_\_namedParameters**: [`ICertResignCommitteeCold`](../interfaces/ICertResignCommitteeCold.md)

#### Returns

[`CertResignCommitteeCold`](CertResignCommitteeCold.md)

#### Source

[src/ledger/certs/CertResignCommitteeCold.ts:21](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/ledger/certs/CertResignCommitteeCold.ts#L21)

## Properties

### anchor

> **`readonly`** **anchor**: `undefined` \| `Anchor`

#### Implementation of

[`ICertResignCommitteeCold`](../interfaces/ICertResignCommitteeCold.md).[`anchor`](../interfaces/ICertResignCommitteeCold.md#anchor)

#### Source

[src/ledger/certs/CertResignCommitteeCold.ts:19](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/ledger/certs/CertResignCommitteeCold.ts#L19)

***

### certType

> **`readonly`** **certType**: [`ResignCommitteeCold`](../enumerations/CertificateType.md#resigncommitteecold)

#### Implementation of

[`ICert`](../interfaces/ICert.md).[`certType`](../interfaces/ICert.md#certtype)

#### Source

[src/ledger/certs/CertResignCommitteeCold.ts:17](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/ledger/certs/CertResignCommitteeCold.ts#L17)

***

### coldCredential

> **`readonly`** **coldCredential**: [`Credential`](Credential.md)\<[`CredentialType`](../enumerations/CredentialType.md)\>

#### Implementation of

[`ICertResignCommitteeCold`](../interfaces/ICertResignCommitteeCold.md).[`coldCredential`](../interfaces/ICertResignCommitteeCold.md#coldcredential)

#### Source

[src/ledger/certs/CertResignCommitteeCold.ts:18](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/ledger/certs/CertResignCommitteeCold.ts#L18)

## Methods

### getRequiredSigners()

> **getRequiredSigners**(): [`Hash28`](Hash28.md)[]

#### Returns

[`Hash28`](Hash28.md)[]

#### Implementation of

[`ICert`](../interfaces/ICert.md).[`getRequiredSigners`](../interfaces/ICert.md#getrequiredsigners)

#### Source

[src/ledger/certs/CertResignCommitteeCold.ts:32](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/ledger/certs/CertResignCommitteeCold.ts#L32)

***

### toCbor()

> **toCbor**(): `CborString`

#### Returns

`CborString`

#### Source

[src/ledger/certs/CertResignCommitteeCold.ts:37](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/ledger/certs/CertResignCommitteeCold.ts#L37)

***

### toCborObj()

> **toCborObj**(): `CborArray`

#### Returns

`CborArray`

#### Source

[src/ledger/certs/CertResignCommitteeCold.ts:41](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/ledger/certs/CertResignCommitteeCold.ts#L41)

***

### toJson()

> **toJson**(): `Object`

#### Returns

`Object`

##### anchor

> **anchor**: `null` \| `Object`

##### certType

> **certType**: `"ResignCommitteeCold"`

##### coldCredential

> **coldCredential**: `Object`

##### coldCredential.credentialType

> **credentialType**: `string`

##### coldCredential.hash

> **hash**: `string`

#### Source

[src/ledger/certs/CertResignCommitteeCold.ts:66](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/ledger/certs/CertResignCommitteeCold.ts#L66)

***

### fromCborObj()

> **`static`** **fromCborObj**(`cbor`): [`CertResignCommitteeCold`](CertResignCommitteeCold.md)

#### Parameters

• **cbor**: `CborObj`

#### Returns

[`CertResignCommitteeCold`](CertResignCommitteeCold.md)

#### Source

[src/ledger/certs/CertResignCommitteeCold.ts:50](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/ledger/certs/CertResignCommitteeCold.ts#L50)
