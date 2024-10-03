[**@harmoniclabs/cardano-ledger-ts**](../README.md) • **Docs**

***

[@harmoniclabs/cardano-ledger-ts](../globals.md) / CertVoteDeleg

# Class: CertVoteDeleg

## Implements

- [`ICert`](../interfaces/ICert.md)
- [`ICertVoteDeleg`](../interfaces/ICertVoteDeleg.md)

## Constructors

### new CertVoteDeleg()

> **new CertVoteDeleg**(`__namedParameters`): [`CertVoteDeleg`](CertVoteDeleg.md)

#### Parameters

• **\_\_namedParameters**: [`ICertVoteDeleg`](../interfaces/ICertVoteDeleg.md)

#### Returns

[`CertVoteDeleg`](CertVoteDeleg.md)

#### Defined in

[src/ledger/certs/CertVoteDeleg.ts:24](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/certs/CertVoteDeleg.ts#L24)

## Properties

### certType

> `readonly` **certType**: [`VoteDeleg`](../enumerations/CertificateType.md#votedeleg)

#### Implementation of

[`ICert`](../interfaces/ICert.md).[`certType`](../interfaces/ICert.md#certtype)

#### Defined in

[src/ledger/certs/CertVoteDeleg.ts:20](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/certs/CertVoteDeleg.ts#L20)

***

### drep

> `readonly` **drep**: [`DRep`](../type-aliases/DRep.md)

#### Implementation of

[`ICertVoteDeleg`](../interfaces/ICertVoteDeleg.md).[`drep`](../interfaces/ICertVoteDeleg.md#drep)

#### Defined in

[src/ledger/certs/CertVoteDeleg.ts:22](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/certs/CertVoteDeleg.ts#L22)

***

### stakeCredential

> `readonly` **stakeCredential**: [`Credential`](Credential.md)\<[`CredentialType`](../enumerations/CredentialType.md)\>

#### Implementation of

[`ICertVoteDeleg`](../interfaces/ICertVoteDeleg.md).[`stakeCredential`](../interfaces/ICertVoteDeleg.md#stakecredential)

#### Defined in

[src/ledger/certs/CertVoteDeleg.ts:21](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/certs/CertVoteDeleg.ts#L21)

## Methods

### getRequiredSigners()

> **getRequiredSigners**(): [`Hash28`](Hash28.md)[]

#### Returns

[`Hash28`](Hash28.md)[]

#### Implementation of

[`ICert`](../interfaces/ICert.md).[`getRequiredSigners`](../interfaces/ICert.md#getrequiredsigners)

#### Defined in

[src/ledger/certs/CertVoteDeleg.ts:53](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/certs/CertVoteDeleg.ts#L53)

***

### toCbor()

> **toCbor**(): `CborString`

#### Returns

`CborString`

#### Defined in

[src/ledger/certs/CertVoteDeleg.ts:58](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/certs/CertVoteDeleg.ts#L58)

***

### toCborObj()

> **toCborObj**(): `CborArray`

#### Returns

`CborArray`

#### Defined in

[src/ledger/certs/CertVoteDeleg.ts:62](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/certs/CertVoteDeleg.ts#L62)

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

[src/ledger/certs/CertVoteDeleg.ts:35](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/certs/CertVoteDeleg.ts#L35)

***

### toJson()

> **toJson**(): `object`

#### Returns

`object`

##### certType

> **certType**: `"VoteDeleg"`

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

[src/ledger/certs/CertVoteDeleg.ts:87](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/certs/CertVoteDeleg.ts#L87)

***

### fromCborObj()

> `static` **fromCborObj**(`cbor`): [`CertVoteDeleg`](CertVoteDeleg.md)

#### Parameters

• **cbor**: `CborObj`

#### Returns

[`CertVoteDeleg`](CertVoteDeleg.md)

#### Defined in

[src/ledger/certs/CertVoteDeleg.ts:71](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/certs/CertVoteDeleg.ts#L71)
