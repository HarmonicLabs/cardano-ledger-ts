**@harmoniclabs/cardano-ledger-ts** • [Readme](../README.md) \| [API](../globals.md)

***

[@harmoniclabs/cardano-ledger-ts](../README.md) / CertVoteRegistrationDeleg

# Class: CertVoteRegistrationDeleg

## Implements

- [`ICert`](../interfaces/ICert.md)
- [`ICertVoteRegistrationDeleg`](../interfaces/ICertVoteRegistrationDeleg.md)

## Constructors

### new CertVoteRegistrationDeleg(__namedParameters)

> **new CertVoteRegistrationDeleg**(`__namedParameters`): [`CertVoteRegistrationDeleg`](CertVoteRegistrationDeleg.md)

#### Parameters

• **\_\_namedParameters**: [`ICertVoteRegistrationDeleg`](../interfaces/ICertVoteRegistrationDeleg.md)

#### Returns

[`CertVoteRegistrationDeleg`](CertVoteRegistrationDeleg.md)

#### Source

[src/ledger/certs/CertVoteRegistrationDeleg.ts:26](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/ledger/certs/CertVoteRegistrationDeleg.ts#L26)

## Properties

### certType

> **`readonly`** **certType**: [`VoteRegistrationDeleg`](../enumerations/CertificateType.md#voteregistrationdeleg)

#### Implementation of

[`ICert`](../interfaces/ICert.md).[`certType`](../interfaces/ICert.md#certtype)

#### Source

[src/ledger/certs/CertVoteRegistrationDeleg.ts:21](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/ledger/certs/CertVoteRegistrationDeleg.ts#L21)

***

### coin

> **`readonly`** **coin**: `bigint`

#### Implementation of

[`ICertVoteRegistrationDeleg`](../interfaces/ICertVoteRegistrationDeleg.md).[`coin`](../interfaces/ICertVoteRegistrationDeleg.md#coin)

#### Source

[src/ledger/certs/CertVoteRegistrationDeleg.ts:24](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/ledger/certs/CertVoteRegistrationDeleg.ts#L24)

***

### drep

> **`readonly`** **drep**: `DRep`

#### Implementation of

[`ICertVoteRegistrationDeleg`](../interfaces/ICertVoteRegistrationDeleg.md).[`drep`](../interfaces/ICertVoteRegistrationDeleg.md#drep)

#### Source

[src/ledger/certs/CertVoteRegistrationDeleg.ts:23](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/ledger/certs/CertVoteRegistrationDeleg.ts#L23)

***

### stakeCredential

> **`readonly`** **stakeCredential**: [`Credential`](Credential.md)\<[`CredentialType`](../enumerations/CredentialType.md)\>

#### Implementation of

[`ICertVoteRegistrationDeleg`](../interfaces/ICertVoteRegistrationDeleg.md).[`stakeCredential`](../interfaces/ICertVoteRegistrationDeleg.md#stakecredential)

#### Source

[src/ledger/certs/CertVoteRegistrationDeleg.ts:22](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/ledger/certs/CertVoteRegistrationDeleg.ts#L22)

## Methods

### getRequiredSigners()

> **getRequiredSigners**(): [`Hash28`](Hash28.md)[]

#### Returns

[`Hash28`](Hash28.md)[]

#### Implementation of

[`ICert`](../interfaces/ICert.md).[`getRequiredSigners`](../interfaces/ICert.md#getrequiredsigners)

#### Source

[src/ledger/certs/CertVoteRegistrationDeleg.ts:38](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/ledger/certs/CertVoteRegistrationDeleg.ts#L38)

***

### toCbor()

> **toCbor**(): `CborString`

#### Returns

`CborString`

#### Source

[src/ledger/certs/CertVoteRegistrationDeleg.ts:43](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/ledger/certs/CertVoteRegistrationDeleg.ts#L43)

***

### toCborObj()

> **toCborObj**(): `CborArray`

#### Returns

`CborArray`

#### Source

[src/ledger/certs/CertVoteRegistrationDeleg.ts:47](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/ledger/certs/CertVoteRegistrationDeleg.ts#L47)

***

### toJson()

> **toJson**(): `Object`

#### Returns

`Object`

##### certType

> **certType**: `"VoteRegistrationDeleg"`

##### coin

> **coin**: `string`

##### drep

> **drep**: `Object`

##### drep.drepType

> **drepType**: `string`

##### stakeCredential

> **stakeCredential**: `Object`

##### stakeCredential.credentialType

> **credentialType**: `string`

##### stakeCredential.hash

> **hash**: `string`

#### Source

[src/ledger/certs/CertVoteRegistrationDeleg.ts:76](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/ledger/certs/CertVoteRegistrationDeleg.ts#L76)

***

### fromCborObj()

> **`static`** **fromCborObj**(`cbor`): [`CertVoteRegistrationDeleg`](CertVoteRegistrationDeleg.md)

#### Parameters

• **cbor**: `CborObj`

#### Returns

[`CertVoteRegistrationDeleg`](CertVoteRegistrationDeleg.md)

#### Source

[src/ledger/certs/CertVoteRegistrationDeleg.ts:57](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/ledger/certs/CertVoteRegistrationDeleg.ts#L57)
