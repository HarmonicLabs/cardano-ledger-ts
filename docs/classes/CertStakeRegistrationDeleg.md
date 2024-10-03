[**@harmoniclabs/cardano-ledger-ts**](../README.md) • **Docs**

***

[@harmoniclabs/cardano-ledger-ts](../globals.md) / CertStakeRegistrationDeleg

# Class: CertStakeRegistrationDeleg

## Implements

- [`ICert`](../interfaces/ICert.md)
- [`ICertStakeRegistrationDeleg`](../interfaces/ICertStakeRegistrationDeleg.md)

## Constructors

### new CertStakeRegistrationDeleg()

> **new CertStakeRegistrationDeleg**(`__namedParameters`): [`CertStakeRegistrationDeleg`](CertStakeRegistrationDeleg.md)

#### Parameters

• **\_\_namedParameters**: [`ICertStakeRegistrationDeleg`](../interfaces/ICertStakeRegistrationDeleg.md)

#### Returns

[`CertStakeRegistrationDeleg`](CertStakeRegistrationDeleg.md)

#### Defined in

[src/ledger/certs/CertStakeRegistrationDeleg.ts:28](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/certs/CertStakeRegistrationDeleg.ts#L28)

## Properties

### certType

> `readonly` **certType**: [`StakeRegistrationDeleg`](../enumerations/CertificateType.md#stakeregistrationdeleg)

#### Implementation of

[`ICert`](../interfaces/ICert.md).[`certType`](../interfaces/ICert.md#certtype)

#### Defined in

[src/ledger/certs/CertStakeRegistrationDeleg.ts:23](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/certs/CertStakeRegistrationDeleg.ts#L23)

***

### coin

> `readonly` **coin**: `bigint`

#### Implementation of

[`ICertStakeRegistrationDeleg`](../interfaces/ICertStakeRegistrationDeleg.md).[`coin`](../interfaces/ICertStakeRegistrationDeleg.md#coin)

#### Defined in

[src/ledger/certs/CertStakeRegistrationDeleg.ts:26](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/certs/CertStakeRegistrationDeleg.ts#L26)

***

### poolKeyHash

> `readonly` **poolKeyHash**: [`Hash28`](Hash28.md)

#### Implementation of

[`ICertStakeRegistrationDeleg`](../interfaces/ICertStakeRegistrationDeleg.md).[`poolKeyHash`](../interfaces/ICertStakeRegistrationDeleg.md#poolkeyhash)

#### Defined in

[src/ledger/certs/CertStakeRegistrationDeleg.ts:25](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/certs/CertStakeRegistrationDeleg.ts#L25)

***

### stakeCredential

> `readonly` **stakeCredential**: [`Credential`](Credential.md)\<[`CredentialType`](../enumerations/CredentialType.md)\>

#### Implementation of

[`ICertStakeRegistrationDeleg`](../interfaces/ICertStakeRegistrationDeleg.md).[`stakeCredential`](../interfaces/ICertStakeRegistrationDeleg.md#stakecredential)

#### Defined in

[src/ledger/certs/CertStakeRegistrationDeleg.ts:24](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/certs/CertStakeRegistrationDeleg.ts#L24)

## Methods

### getRequiredSigners()

> **getRequiredSigners**(): [`Hash28`](Hash28.md)[]

#### Returns

[`Hash28`](Hash28.md)[]

#### Implementation of

[`ICert`](../interfaces/ICert.md).[`getRequiredSigners`](../interfaces/ICert.md#getrequiredsigners)

#### Defined in

[src/ledger/certs/CertStakeRegistrationDeleg.ts:58](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/certs/CertStakeRegistrationDeleg.ts#L58)

***

### toCbor()

> **toCbor**(): `CborString`

#### Returns

`CborString`

#### Defined in

[src/ledger/certs/CertStakeRegistrationDeleg.ts:63](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/certs/CertStakeRegistrationDeleg.ts#L63)

***

### toCborObj()

> **toCborObj**(): `CborArray`

#### Returns

`CborArray`

#### Defined in

[src/ledger/certs/CertStakeRegistrationDeleg.ts:67](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/certs/CertStakeRegistrationDeleg.ts#L67)

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

[src/ledger/certs/CertStakeRegistrationDeleg.ts:40](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/certs/CertStakeRegistrationDeleg.ts#L40)

***

### toJson()

> **toJson**(): `object`

#### Returns

`object`

##### certType

> **certType**: `"StakeRegistrationDeleg"`

##### coin

> **coin**: `string`

##### poolKeyHash

> **poolKeyHash**: `string`

##### stakeCredential

> **stakeCredential**: `object`

##### stakeCredential.credentialType

> **credentialType**: `string`

##### stakeCredential.hash

> **hash**: `string`

#### Defined in

[src/ledger/certs/CertStakeRegistrationDeleg.ts:77](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/certs/CertStakeRegistrationDeleg.ts#L77)

***

### fromCbor()

> `static` **fromCbor**(`cbor`): [`CertStakeRegistrationDeleg`](CertStakeRegistrationDeleg.md)

#### Parameters

• **cbor**: `CanBeCborString`

#### Returns

[`CertStakeRegistrationDeleg`](CertStakeRegistrationDeleg.md)

#### Defined in

[src/ledger/certs/CertStakeRegistrationDeleg.ts:87](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/certs/CertStakeRegistrationDeleg.ts#L87)

***

### fromCborObj()

> `static` **fromCborObj**(`cbor`): [`CertStakeRegistrationDeleg`](CertStakeRegistrationDeleg.md)

#### Parameters

• **cbor**: `CborObj`

#### Returns

[`CertStakeRegistrationDeleg`](CertStakeRegistrationDeleg.md)

#### Defined in

[src/ledger/certs/CertStakeRegistrationDeleg.ts:91](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/certs/CertStakeRegistrationDeleg.ts#L91)
