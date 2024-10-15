[**@harmoniclabs/cardano-ledger-ts**](../README.md) • **Docs**

***

[@harmoniclabs/cardano-ledger-ts](../globals.md) / CertVoteRegistrationDeleg

# Class: CertVoteRegistrationDeleg

## Implements

- [`ICert`](../interfaces/ICert.md)
- [`ICertVoteRegistrationDeleg`](../interfaces/ICertVoteRegistrationDeleg.md)

## Constructors

### new CertVoteRegistrationDeleg()

> **new CertVoteRegistrationDeleg**(`__namedParameters`): [`CertVoteRegistrationDeleg`](CertVoteRegistrationDeleg.md)

#### Parameters

• **\_\_namedParameters**: [`ICertVoteRegistrationDeleg`](../interfaces/ICertVoteRegistrationDeleg.md)

#### Returns

[`CertVoteRegistrationDeleg`](CertVoteRegistrationDeleg.md)

#### Defined in

[src/ledger/certs/CertVoteRegistrationDeleg.ts:28](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/certs/CertVoteRegistrationDeleg.ts#L28)

## Properties

### certType

> `readonly` **certType**: [`VoteRegistrationDeleg`](../enumerations/CertificateType.md#voteregistrationdeleg)

#### Implementation of

[`ICert`](../interfaces/ICert.md).[`certType`](../interfaces/ICert.md#certtype)

#### Defined in

[src/ledger/certs/CertVoteRegistrationDeleg.ts:23](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/certs/CertVoteRegistrationDeleg.ts#L23)

***

### coin

> `readonly` **coin**: `bigint`

#### Implementation of

[`ICertVoteRegistrationDeleg`](../interfaces/ICertVoteRegistrationDeleg.md).[`coin`](../interfaces/ICertVoteRegistrationDeleg.md#coin)

#### Defined in

[src/ledger/certs/CertVoteRegistrationDeleg.ts:26](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/certs/CertVoteRegistrationDeleg.ts#L26)

***

### drep

> `readonly` **drep**: [`DRep`](../type-aliases/DRep.md)

#### Implementation of

[`ICertVoteRegistrationDeleg`](../interfaces/ICertVoteRegistrationDeleg.md).[`drep`](../interfaces/ICertVoteRegistrationDeleg.md#drep)

#### Defined in

[src/ledger/certs/CertVoteRegistrationDeleg.ts:25](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/certs/CertVoteRegistrationDeleg.ts#L25)

***

### stakeCredential

> `readonly` **stakeCredential**: [`Credential`](Credential.md)\<[`CredentialType`](../enumerations/CredentialType.md)\>

#### Implementation of

[`ICertVoteRegistrationDeleg`](../interfaces/ICertVoteRegistrationDeleg.md).[`stakeCredential`](../interfaces/ICertVoteRegistrationDeleg.md#stakecredential)

#### Defined in

[src/ledger/certs/CertVoteRegistrationDeleg.ts:24](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/certs/CertVoteRegistrationDeleg.ts#L24)

## Methods

### getRequiredSigners()

> **getRequiredSigners**(): [`Hash28`](Hash28.md)[]

#### Returns

[`Hash28`](Hash28.md)[]

#### Implementation of

[`ICert`](../interfaces/ICert.md).[`getRequiredSigners`](../interfaces/ICert.md#getrequiredsigners)

#### Defined in

[src/ledger/certs/CertVoteRegistrationDeleg.ts:58](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/certs/CertVoteRegistrationDeleg.ts#L58)

***

### toCbor()

> **toCbor**(): `CborString`

#### Returns

`CborString`

#### Defined in

[src/ledger/certs/CertVoteRegistrationDeleg.ts:63](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/certs/CertVoteRegistrationDeleg.ts#L63)

***

### toCborObj()

> **toCborObj**(): `CborArray`

#### Returns

`CborArray`

#### Defined in

[src/ledger/certs/CertVoteRegistrationDeleg.ts:67](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/certs/CertVoteRegistrationDeleg.ts#L67)

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

[src/ledger/certs/CertVoteRegistrationDeleg.ts:40](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/certs/CertVoteRegistrationDeleg.ts#L40)

***

### toJson()

> **toJson**(): `object`

#### Returns

`object`

##### certType

> **certType**: `"VoteRegistrationDeleg"`

##### coin

> **coin**: `string`

##### drep

> **drep**: `object`

##### drep.drepType

> **drepType**: `string`

##### stakeCredential

> **stakeCredential**: `object`

##### stakeCredential.credentialType

> **credentialType**: `string`

##### stakeCredential.hash

> **hash**: `string`

#### Defined in

[src/ledger/certs/CertVoteRegistrationDeleg.ts:96](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/certs/CertVoteRegistrationDeleg.ts#L96)

***

### fromCborObj()

> `static` **fromCborObj**(`cbor`): [`CertVoteRegistrationDeleg`](CertVoteRegistrationDeleg.md)

#### Parameters

• **cbor**: `CborObj`

#### Returns

[`CertVoteRegistrationDeleg`](CertVoteRegistrationDeleg.md)

#### Defined in

[src/ledger/certs/CertVoteRegistrationDeleg.ts:77](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/certs/CertVoteRegistrationDeleg.ts#L77)
