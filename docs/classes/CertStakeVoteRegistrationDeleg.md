[**@harmoniclabs/cardano-ledger-ts**](../README.md) • **Docs**

***

[@harmoniclabs/cardano-ledger-ts](../globals.md) / CertStakeVoteRegistrationDeleg

# Class: CertStakeVoteRegistrationDeleg

## Implements

- [`ICert`](../interfaces/ICert.md)
- [`ICertStakeVoteRegistrationDeleg`](../interfaces/ICertStakeVoteRegistrationDeleg.md)

## Constructors

### new CertStakeVoteRegistrationDeleg()

> **new CertStakeVoteRegistrationDeleg**(`__namedParameters`): [`CertStakeVoteRegistrationDeleg`](CertStakeVoteRegistrationDeleg.md)

#### Parameters

• **\_\_namedParameters**: [`ICertStakeVoteRegistrationDeleg`](../interfaces/ICertStakeVoteRegistrationDeleg.md)

#### Returns

[`CertStakeVoteRegistrationDeleg`](CertStakeVoteRegistrationDeleg.md)

#### Defined in

[src/ledger/certs/CertStakeVoteRegistrationDeleg.ts:31](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/certs/CertStakeVoteRegistrationDeleg.ts#L31)

## Properties

### certType

> `readonly` **certType**: [`StakeVoteRegistrationDeleg`](../enumerations/CertificateType.md#stakevoteregistrationdeleg)

#### Implementation of

[`ICert`](../interfaces/ICert.md).[`certType`](../interfaces/ICert.md#certtype)

#### Defined in

[src/ledger/certs/CertStakeVoteRegistrationDeleg.ts:25](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/certs/CertStakeVoteRegistrationDeleg.ts#L25)

***

### coin

> `readonly` **coin**: `bigint`

#### Implementation of

[`ICertStakeVoteRegistrationDeleg`](../interfaces/ICertStakeVoteRegistrationDeleg.md).[`coin`](../interfaces/ICertStakeVoteRegistrationDeleg.md#coin)

#### Defined in

[src/ledger/certs/CertStakeVoteRegistrationDeleg.ts:29](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/certs/CertStakeVoteRegistrationDeleg.ts#L29)

***

### drep

> `readonly` **drep**: [`DRep`](../type-aliases/DRep.md)

#### Implementation of

[`ICertStakeVoteRegistrationDeleg`](../interfaces/ICertStakeVoteRegistrationDeleg.md).[`drep`](../interfaces/ICertStakeVoteRegistrationDeleg.md#drep)

#### Defined in

[src/ledger/certs/CertStakeVoteRegistrationDeleg.ts:28](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/certs/CertStakeVoteRegistrationDeleg.ts#L28)

***

### poolKeyHash

> `readonly` **poolKeyHash**: [`Hash28`](Hash28.md)

#### Implementation of

[`ICertStakeVoteRegistrationDeleg`](../interfaces/ICertStakeVoteRegistrationDeleg.md).[`poolKeyHash`](../interfaces/ICertStakeVoteRegistrationDeleg.md#poolkeyhash)

#### Defined in

[src/ledger/certs/CertStakeVoteRegistrationDeleg.ts:27](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/certs/CertStakeVoteRegistrationDeleg.ts#L27)

***

### stakeCredential

> `readonly` **stakeCredential**: [`Credential`](Credential.md)\<[`CredentialType`](../enumerations/CredentialType.md)\>

#### Implementation of

[`ICertStakeVoteRegistrationDeleg`](../interfaces/ICertStakeVoteRegistrationDeleg.md).[`stakeCredential`](../interfaces/ICertStakeVoteRegistrationDeleg.md#stakecredential)

#### Defined in

[src/ledger/certs/CertStakeVoteRegistrationDeleg.ts:26](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/certs/CertStakeVoteRegistrationDeleg.ts#L26)

## Methods

### getRequiredSigners()

> **getRequiredSigners**(): [`Hash28`](Hash28.md)[]

#### Returns

[`Hash28`](Hash28.md)[]

#### Implementation of

[`ICert`](../interfaces/ICert.md).[`getRequiredSigners`](../interfaces/ICert.md#getrequiredsigners)

#### Defined in

[src/ledger/certs/CertStakeVoteRegistrationDeleg.ts:86](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/certs/CertStakeVoteRegistrationDeleg.ts#L86)

***

### toCbor()

> **toCbor**(): `CborString`

#### Returns

`CborString`

#### Defined in

[src/ledger/certs/CertStakeVoteRegistrationDeleg.ts:91](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/certs/CertStakeVoteRegistrationDeleg.ts#L91)

***

### toCborObj()

> **toCborObj**(): `CborArray`

#### Returns

`CborArray`

#### Defined in

[src/ledger/certs/CertStakeVoteRegistrationDeleg.ts:95](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/certs/CertStakeVoteRegistrationDeleg.ts#L95)

***

### toData()

> **toData**(`version`?): `DataList`

#### Parameters

• **version?**: `ToDataVersion`

#### Returns

`DataList`

#### Implementation of

[`ICert`](../interfaces/ICert.md).[`toData`](../interfaces/ICert.md#todata)

#### Defined in

[src/ledger/certs/CertStakeVoteRegistrationDeleg.ts:44](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/certs/CertStakeVoteRegistrationDeleg.ts#L44)

***

### toJson()

> **toJson**(): `object`

#### Returns

`object`

##### certType

> **certType**: `"StakeVoteRegistrationDeleg"`

##### coin

> **coin**: `string`

##### drep

> **drep**: `object`

##### drep.drepType

> **drepType**: `string`

##### poolKeyHash

> **poolKeyHash**: `string`

##### stakeCredential

> **stakeCredential**: `object`

##### stakeCredential.credentialType

> **credentialType**: `string`

##### stakeCredential.hash

> **hash**: `string`

#### Defined in

[src/ledger/certs/CertStakeVoteRegistrationDeleg.ts:126](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/certs/CertStakeVoteRegistrationDeleg.ts#L126)

***

### fromCborObj()

> `static` **fromCborObj**(`cbor`): [`CertStakeVoteRegistrationDeleg`](CertStakeVoteRegistrationDeleg.md)

#### Parameters

• **cbor**: `CborObj`

#### Returns

[`CertStakeVoteRegistrationDeleg`](CertStakeVoteRegistrationDeleg.md)

#### Defined in

[src/ledger/certs/CertStakeVoteRegistrationDeleg.ts:106](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/certs/CertStakeVoteRegistrationDeleg.ts#L106)
