[**@harmoniclabs/cardano-ledger-ts**](../README.md) • **Docs**

***

[@harmoniclabs/cardano-ledger-ts](../globals.md) / CertAuthCommitteeHot

# Class: CertAuthCommitteeHot

## Implements

- [`ICert`](../interfaces/ICert.md)
- [`ICertAuthCommitteeHot`](../interfaces/ICertAuthCommitteeHot.md)
- `ToCbor`
- `ToJson`

## Constructors

### new CertAuthCommitteeHot()

> **new CertAuthCommitteeHot**(`__namedParameters`): [`CertAuthCommitteeHot`](CertAuthCommitteeHot.md)

#### Parameters

• **\_\_namedParameters**: [`ICertAuthCommitteeHot`](../interfaces/ICertAuthCommitteeHot.md)

#### Returns

[`CertAuthCommitteeHot`](CertAuthCommitteeHot.md)

#### Defined in

[src/ledger/certs/CertAuthCommitteeHot.ts:23](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/certs/CertAuthCommitteeHot.ts#L23)

## Properties

### certType

> `readonly` **certType**: [`AuthCommitteeHot`](../enumerations/CertificateType.md#authcommitteehot)

#### Implementation of

[`ICert`](../interfaces/ICert.md).[`certType`](../interfaces/ICert.md#certtype)

#### Defined in

[src/ledger/certs/CertAuthCommitteeHot.ts:19](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/certs/CertAuthCommitteeHot.ts#L19)

***

### coldCredential

> `readonly` **coldCredential**: [`Credential`](Credential.md)\<[`CredentialType`](../enumerations/CredentialType.md)\>

#### Implementation of

[`ICertAuthCommitteeHot`](../interfaces/ICertAuthCommitteeHot.md).[`coldCredential`](../interfaces/ICertAuthCommitteeHot.md#coldcredential)

#### Defined in

[src/ledger/certs/CertAuthCommitteeHot.ts:20](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/certs/CertAuthCommitteeHot.ts#L20)

***

### hotCredential

> `readonly` **hotCredential**: [`Credential`](Credential.md)\<[`CredentialType`](../enumerations/CredentialType.md)\>

#### Implementation of

[`ICertAuthCommitteeHot`](../interfaces/ICertAuthCommitteeHot.md).[`hotCredential`](../interfaces/ICertAuthCommitteeHot.md#hotcredential)

#### Defined in

[src/ledger/certs/CertAuthCommitteeHot.ts:21](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/certs/CertAuthCommitteeHot.ts#L21)

## Methods

### getRequiredSigners()

> **getRequiredSigners**(): [`Hash28`](Hash28.md)[]

#### Returns

[`Hash28`](Hash28.md)[]

#### Implementation of

[`ICert`](../interfaces/ICert.md).[`getRequiredSigners`](../interfaces/ICert.md#getrequiredsigners)

#### Defined in

[src/ledger/certs/CertAuthCommitteeHot.ts:52](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/certs/CertAuthCommitteeHot.ts#L52)

***

### toCbor()

> **toCbor**(): `CborString`

#### Returns

`CborString`

#### Implementation of

`ToCbor.toCbor`

#### Defined in

[src/ledger/certs/CertAuthCommitteeHot.ts:57](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/certs/CertAuthCommitteeHot.ts#L57)

***

### toCborObj()

> **toCborObj**(): `CborArray`

#### Returns

`CborArray`

#### Implementation of

`ToCbor.toCborObj`

#### Defined in

[src/ledger/certs/CertAuthCommitteeHot.ts:61](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/certs/CertAuthCommitteeHot.ts#L61)

***

### toData()

> **toData**(`version`?): `DataConstr`

#### Parameters

• **version?**: `ToDataVersion`

#### Returns

`DataConstr`

#### Implementation of

[`ICert`](../interfaces/ICert.md).[`toData`](../interfaces/ICert.md#todata)

#### Defined in

[src/ledger/certs/CertAuthCommitteeHot.ts:34](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/certs/CertAuthCommitteeHot.ts#L34)

***

### toJson()

> **toJson**(): `object`

#### Returns

`object`

##### certType

> **certType**: `"AuthCommitteeHot"`

##### coldCredential

> **coldCredential**: `object`

##### coldCredential.credentialType

> **credentialType**: `string`

##### coldCredential.hash

> **hash**: `string`

##### hotCredential

> **hotCredential**: `object`

##### hotCredential.credentialType

> **credentialType**: `string`

##### hotCredential.hash

> **hash**: `string`

#### Implementation of

`ToJson.toJson`

#### Defined in

[src/ledger/certs/CertAuthCommitteeHot.ts:86](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/certs/CertAuthCommitteeHot.ts#L86)

***

### fromCborObj()

> `static` **fromCborObj**(`cbor`): [`CertAuthCommitteeHot`](CertAuthCommitteeHot.md)

#### Parameters

• **cbor**: `CborObj`

#### Returns

[`CertAuthCommitteeHot`](CertAuthCommitteeHot.md)

#### Defined in

[src/ledger/certs/CertAuthCommitteeHot.ts:70](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/certs/CertAuthCommitteeHot.ts#L70)
