[**@harmoniclabs/cardano-ledger-ts**](../README.md) • **Docs**

***

[@harmoniclabs/cardano-ledger-ts](../globals.md) / CertResignCommitteeCold

# Class: CertResignCommitteeCold

## Implements

- [`ICert`](../interfaces/ICert.md)
- [`ICertResignCommitteeCold`](../interfaces/ICertResignCommitteeCold.md)

## Constructors

### new CertResignCommitteeCold()

> **new CertResignCommitteeCold**(`__namedParameters`): [`CertResignCommitteeCold`](CertResignCommitteeCold.md)

#### Parameters

• **\_\_namedParameters**: [`ICertResignCommitteeCold`](../interfaces/ICertResignCommitteeCold.md)

#### Returns

[`CertResignCommitteeCold`](CertResignCommitteeCold.md)

#### Defined in

[src/ledger/certs/CertResignCommitteeCold.ts:23](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/certs/CertResignCommitteeCold.ts#L23)

## Properties

### anchor

> `readonly` **anchor**: `undefined` \| [`Anchor`](Anchor.md)

#### Implementation of

[`ICertResignCommitteeCold`](../interfaces/ICertResignCommitteeCold.md).[`anchor`](../interfaces/ICertResignCommitteeCold.md#anchor)

#### Defined in

[src/ledger/certs/CertResignCommitteeCold.ts:21](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/certs/CertResignCommitteeCold.ts#L21)

***

### certType

> `readonly` **certType**: [`ResignCommitteeCold`](../enumerations/CertificateType.md#resigncommitteecold)

#### Implementation of

[`ICert`](../interfaces/ICert.md).[`certType`](../interfaces/ICert.md#certtype)

#### Defined in

[src/ledger/certs/CertResignCommitteeCold.ts:19](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/certs/CertResignCommitteeCold.ts#L19)

***

### coldCredential

> `readonly` **coldCredential**: [`Credential`](Credential.md)\<[`CredentialType`](../enumerations/CredentialType.md)\>

#### Implementation of

[`ICertResignCommitteeCold`](../interfaces/ICertResignCommitteeCold.md).[`coldCredential`](../interfaces/ICertResignCommitteeCold.md#coldcredential)

#### Defined in

[src/ledger/certs/CertResignCommitteeCold.ts:20](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/certs/CertResignCommitteeCold.ts#L20)

## Methods

### getRequiredSigners()

> **getRequiredSigners**(): [`Hash28`](Hash28.md)[]

#### Returns

[`Hash28`](Hash28.md)[]

#### Implementation of

[`ICert`](../interfaces/ICert.md).[`getRequiredSigners`](../interfaces/ICert.md#getrequiredsigners)

#### Defined in

[src/ledger/certs/CertResignCommitteeCold.ts:50](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/certs/CertResignCommitteeCold.ts#L50)

***

### toCbor()

> **toCbor**(): `CborString`

#### Returns

`CborString`

#### Defined in

[src/ledger/certs/CertResignCommitteeCold.ts:55](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/certs/CertResignCommitteeCold.ts#L55)

***

### toCborObj()

> **toCborObj**(): `CborArray`

#### Returns

`CborArray`

#### Defined in

[src/ledger/certs/CertResignCommitteeCold.ts:59](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/certs/CertResignCommitteeCold.ts#L59)

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

[src/ledger/certs/CertResignCommitteeCold.ts:34](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/certs/CertResignCommitteeCold.ts#L34)

***

### toJson()

> **toJson**(): `object`

#### Returns

`object`

##### anchor

> **anchor**: `null` \| `object`

##### certType

> **certType**: `"ResignCommitteeCold"`

##### coldCredential

> **coldCredential**: `object`

##### coldCredential.credentialType

> **credentialType**: `string`

##### coldCredential.hash

> **hash**: `string`

#### Defined in

[src/ledger/certs/CertResignCommitteeCold.ts:84](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/certs/CertResignCommitteeCold.ts#L84)

***

### fromCborObj()

> `static` **fromCborObj**(`cbor`): [`CertResignCommitteeCold`](CertResignCommitteeCold.md)

#### Parameters

• **cbor**: `CborObj`

#### Returns

[`CertResignCommitteeCold`](CertResignCommitteeCold.md)

#### Defined in

[src/ledger/certs/CertResignCommitteeCold.ts:68](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/certs/CertResignCommitteeCold.ts#L68)
