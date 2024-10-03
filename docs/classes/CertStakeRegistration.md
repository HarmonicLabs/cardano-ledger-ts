[**@harmoniclabs/cardano-ledger-ts**](../README.md) • **Docs**

***

[@harmoniclabs/cardano-ledger-ts](../globals.md) / CertStakeRegistration

# Class: CertStakeRegistration

## Implements

- [`ICert`](../interfaces/ICert.md)
- [`ICertStakeRegistration`](../interfaces/ICertStakeRegistration.md)

## Constructors

### new CertStakeRegistration()

> **new CertStakeRegistration**(`__namedParameters`): [`CertStakeRegistration`](CertStakeRegistration.md)

#### Parameters

• **\_\_namedParameters**: [`ICertStakeRegistration`](../interfaces/ICertStakeRegistration.md)

#### Returns

[`CertStakeRegistration`](CertStakeRegistration.md)

#### Defined in

[src/ledger/certs/CertStakeRegistration.ts:21](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/certs/CertStakeRegistration.ts#L21)

## Properties

### certType

> `readonly` **certType**: [`StakeRegistration`](../enumerations/CertificateType.md#stakeregistration)

#### Implementation of

[`ICert`](../interfaces/ICert.md).[`certType`](../interfaces/ICert.md#certtype)

#### Defined in

[src/ledger/certs/CertStakeRegistration.ts:18](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/certs/CertStakeRegistration.ts#L18)

***

### stakeCredential

> `readonly` **stakeCredential**: [`Credential`](Credential.md)\<[`CredentialType`](../enumerations/CredentialType.md)\>

#### Implementation of

[`ICertStakeRegistration`](../interfaces/ICertStakeRegistration.md).[`stakeCredential`](../interfaces/ICertStakeRegistration.md#stakecredential)

#### Defined in

[src/ledger/certs/CertStakeRegistration.ts:19](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/certs/CertStakeRegistration.ts#L19)

## Methods

### getRequiredSigners()

> **getRequiredSigners**(): [`Hash28`](Hash28.md)[]

#### Returns

[`Hash28`](Hash28.md)[]

#### Implementation of

[`ICert`](../interfaces/ICert.md).[`getRequiredSigners`](../interfaces/ICert.md#getrequiredsigners)

#### Defined in

[src/ledger/certs/CertStakeRegistration.ts:55](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/certs/CertStakeRegistration.ts#L55)

***

### toCbor()

> **toCbor**(): `CborString`

#### Returns

`CborString`

#### Defined in

[src/ledger/certs/CertStakeRegistration.ts:60](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/certs/CertStakeRegistration.ts#L60)

***

### toCborObj()

> **toCborObj**(): `CborArray`

#### Returns

`CborArray`

#### Defined in

[src/ledger/certs/CertStakeRegistration.ts:64](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/certs/CertStakeRegistration.ts#L64)

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

[src/ledger/certs/CertStakeRegistration.ts:31](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/certs/CertStakeRegistration.ts#L31)

***

### toJson()

> **toJson**(): `object`

#### Returns

`object`

##### certType

> **certType**: `"StakeRegistration"`

##### stakeCredential

> **stakeCredential**: `object`

##### stakeCredential.credentialType

> **credentialType**: `string`

##### stakeCredential.hash

> **hash**: `string`

#### Defined in

[src/ledger/certs/CertStakeRegistration.ts:87](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/certs/CertStakeRegistration.ts#L87)

***

### fromCborObj()

> `static` **fromCborObj**(`cbor`): [`CertStakeRegistration`](CertStakeRegistration.md)

#### Parameters

• **cbor**: `CborObj`

#### Returns

[`CertStakeRegistration`](CertStakeRegistration.md)

#### Defined in

[src/ledger/certs/CertStakeRegistration.ts:72](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/certs/CertStakeRegistration.ts#L72)
