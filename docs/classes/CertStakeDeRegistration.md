[**@harmoniclabs/cardano-ledger-ts**](../README.md) • **Docs**

***

[@harmoniclabs/cardano-ledger-ts](../globals.md) / CertStakeDeRegistration

# Class: CertStakeDeRegistration

## Implements

- [`ICert`](../interfaces/ICert.md)
- [`ICertStakeDeRegistration`](../interfaces/ICertStakeDeRegistration.md)

## Constructors

### new CertStakeDeRegistration()

> **new CertStakeDeRegistration**(`__namedParameters`): [`CertStakeDeRegistration`](CertStakeDeRegistration.md)

#### Parameters

• **\_\_namedParameters**: [`ICertStakeDeRegistration`](../interfaces/ICertStakeDeRegistration.md)

#### Returns

[`CertStakeDeRegistration`](CertStakeDeRegistration.md)

#### Defined in

[src/ledger/certs/CertStakeDeRegistration.ts:21](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/certs/CertStakeDeRegistration.ts#L21)

## Properties

### certType

> `readonly` **certType**: [`StakeDeRegistration`](../enumerations/CertificateType.md#stakederegistration)

#### Implementation of

[`ICert`](../interfaces/ICert.md).[`certType`](../interfaces/ICert.md#certtype)

#### Defined in

[src/ledger/certs/CertStakeDeRegistration.ts:18](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/certs/CertStakeDeRegistration.ts#L18)

***

### stakeCredential

> `readonly` **stakeCredential**: [`Credential`](Credential.md)\<[`CredentialType`](../enumerations/CredentialType.md)\>

#### Implementation of

[`ICertStakeDeRegistration`](../interfaces/ICertStakeDeRegistration.md).[`stakeCredential`](../interfaces/ICertStakeDeRegistration.md#stakecredential)

#### Defined in

[src/ledger/certs/CertStakeDeRegistration.ts:19](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/certs/CertStakeDeRegistration.ts#L19)

## Methods

### getRequiredSigners()

> **getRequiredSigners**(): [`Hash28`](Hash28.md)[]

#### Returns

[`Hash28`](Hash28.md)[]

#### Implementation of

[`ICert`](../interfaces/ICert.md).[`getRequiredSigners`](../interfaces/ICert.md#getrequiredsigners)

#### Defined in

[src/ledger/certs/CertStakeDeRegistration.ts:55](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/certs/CertStakeDeRegistration.ts#L55)

***

### toCbor()

> **toCbor**(): `CborString`

#### Returns

`CborString`

#### Defined in

[src/ledger/certs/CertStakeDeRegistration.ts:60](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/certs/CertStakeDeRegistration.ts#L60)

***

### toCborObj()

> **toCborObj**(): `CborArray`

#### Returns

`CborArray`

#### Defined in

[src/ledger/certs/CertStakeDeRegistration.ts:64](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/certs/CertStakeDeRegistration.ts#L64)

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

[src/ledger/certs/CertStakeDeRegistration.ts:31](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/certs/CertStakeDeRegistration.ts#L31)

***

### toJson()

> **toJson**(): `object`

#### Returns

`object`

##### certType

> **certType**: `"StakeDeRegistration"`

##### stakeCredential

> **stakeCredential**: `object`

##### stakeCredential.credentialType

> **credentialType**: `string`

##### stakeCredential.hash

> **hash**: `string`

#### Defined in

[src/ledger/certs/CertStakeDeRegistration.ts:87](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/certs/CertStakeDeRegistration.ts#L87)

***

### fromCborObj()

> `static` **fromCborObj**(`cbor`): [`CertStakeDeRegistration`](CertStakeDeRegistration.md)

#### Parameters

• **cbor**: `CborObj`

#### Returns

[`CertStakeDeRegistration`](CertStakeDeRegistration.md)

#### Defined in

[src/ledger/certs/CertStakeDeRegistration.ts:72](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/certs/CertStakeDeRegistration.ts#L72)
