[**@harmoniclabs/cardano-ledger-ts**](../README.md) • **Docs**

***

[@harmoniclabs/cardano-ledger-ts](../globals.md) / CertStakeDelegation

# Class: CertStakeDelegation

## Implements

- [`ICert`](../interfaces/ICert.md)
- [`ICertStakeDelegation`](../interfaces/ICertStakeDelegation.md)

## Constructors

### new CertStakeDelegation()

> **new CertStakeDelegation**(`__namedParameters`): [`CertStakeDelegation`](CertStakeDelegation.md)

#### Parameters

• **\_\_namedParameters**: [`ICertStakeDelegation`](../interfaces/ICertStakeDelegation.md)

#### Returns

[`CertStakeDelegation`](CertStakeDelegation.md)

#### Defined in

[src/ledger/certs/CertStakeDelegation.ts:23](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/certs/CertStakeDelegation.ts#L23)

## Properties

### certType

> `readonly` **certType**: [`StakeDelegation`](../enumerations/CertificateType.md#stakedelegation)

#### Implementation of

[`ICert`](../interfaces/ICert.md).[`certType`](../interfaces/ICert.md#certtype)

#### Defined in

[src/ledger/certs/CertStakeDelegation.ts:19](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/certs/CertStakeDelegation.ts#L19)

***

### poolKeyHash

> `readonly` **poolKeyHash**: [`Hash28`](Hash28.md)

#### Implementation of

[`ICertStakeDelegation`](../interfaces/ICertStakeDelegation.md).[`poolKeyHash`](../interfaces/ICertStakeDelegation.md#poolkeyhash)

#### Defined in

[src/ledger/certs/CertStakeDelegation.ts:21](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/certs/CertStakeDelegation.ts#L21)

***

### stakeCredential

> `readonly` **stakeCredential**: [`Credential`](Credential.md)\<[`CredentialType`](../enumerations/CredentialType.md)\>

#### Implementation of

[`ICertStakeDelegation`](../interfaces/ICertStakeDelegation.md).[`stakeCredential`](../interfaces/ICertStakeDelegation.md#stakecredential)

#### Defined in

[src/ledger/certs/CertStakeDelegation.ts:20](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/certs/CertStakeDelegation.ts#L20)

## Methods

### getRequiredSigners()

> **getRequiredSigners**(): [`Hash28`](Hash28.md)[]

#### Returns

[`Hash28`](Hash28.md)[]

#### Implementation of

[`ICert`](../interfaces/ICert.md).[`getRequiredSigners`](../interfaces/ICert.md#getrequiredsigners)

#### Defined in

[src/ledger/certs/CertStakeDelegation.ts:65](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/certs/CertStakeDelegation.ts#L65)

***

### toCbor()

> **toCbor**(): `CborString`

#### Returns

`CborString`

#### Defined in

[src/ledger/certs/CertStakeDelegation.ts:70](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/certs/CertStakeDelegation.ts#L70)

***

### toCborObj()

> **toCborObj**(): `CborArray`

#### Returns

`CborArray`

#### Defined in

[src/ledger/certs/CertStakeDelegation.ts:74](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/certs/CertStakeDelegation.ts#L74)

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

[src/ledger/certs/CertStakeDelegation.ts:34](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/certs/CertStakeDelegation.ts#L34)

***

### toJson()

> **toJson**(): `object`

#### Returns

`object`

##### certType

> **certType**: `"StakeDelegation"`

##### poolKeyHash

> **poolKeyHash**: `string`

##### stakeCredential

> **stakeCredential**: `object`

##### stakeCredential.credentialType

> **credentialType**: `string`

##### stakeCredential.hash

> **hash**: `string`

#### Defined in

[src/ledger/certs/CertStakeDelegation.ts:99](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/certs/CertStakeDelegation.ts#L99)

***

### fromCborObj()

> `static` **fromCborObj**(`cbor`): [`CertStakeDelegation`](CertStakeDelegation.md)

#### Parameters

• **cbor**: `CborObj`

#### Returns

[`CertStakeDelegation`](CertStakeDelegation.md)

#### Defined in

[src/ledger/certs/CertStakeDelegation.ts:83](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/certs/CertStakeDelegation.ts#L83)
