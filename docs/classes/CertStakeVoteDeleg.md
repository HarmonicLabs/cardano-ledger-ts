[**@harmoniclabs/cardano-ledger-ts**](../README.md) • **Docs**

***

[@harmoniclabs/cardano-ledger-ts](../globals.md) / CertStakeVoteDeleg

# Class: CertStakeVoteDeleg

## Implements

- [`ICert`](../interfaces/ICert.md)
- [`ICertStakeVoteDeleg`](../interfaces/ICertStakeVoteDeleg.md)

## Constructors

### new CertStakeVoteDeleg()

> **new CertStakeVoteDeleg**(`__namedParameters`): [`CertStakeVoteDeleg`](CertStakeVoteDeleg.md)

#### Parameters

• **\_\_namedParameters**: [`ICertStakeVoteDeleg`](../interfaces/ICertStakeVoteDeleg.md)

#### Returns

[`CertStakeVoteDeleg`](CertStakeVoteDeleg.md)

#### Defined in

[src/ledger/certs/CertStakeVoteDeleg.ts:26](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/certs/CertStakeVoteDeleg.ts#L26)

## Properties

### certType

> `readonly` **certType**: [`StakeVoteDeleg`](../enumerations/CertificateType.md#stakevotedeleg)

#### Implementation of

[`ICert`](../interfaces/ICert.md).[`certType`](../interfaces/ICert.md#certtype)

#### Defined in

[src/ledger/certs/CertStakeVoteDeleg.ts:21](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/certs/CertStakeVoteDeleg.ts#L21)

***

### drep

> `readonly` **drep**: [`DRep`](../type-aliases/DRep.md)

#### Implementation of

[`ICertStakeVoteDeleg`](../interfaces/ICertStakeVoteDeleg.md).[`drep`](../interfaces/ICertStakeVoteDeleg.md#drep)

#### Defined in

[src/ledger/certs/CertStakeVoteDeleg.ts:24](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/certs/CertStakeVoteDeleg.ts#L24)

***

### poolKeyHash

> `readonly` **poolKeyHash**: [`Hash28`](Hash28.md)

#### Implementation of

[`ICertStakeVoteDeleg`](../interfaces/ICertStakeVoteDeleg.md).[`poolKeyHash`](../interfaces/ICertStakeVoteDeleg.md#poolkeyhash)

#### Defined in

[src/ledger/certs/CertStakeVoteDeleg.ts:23](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/certs/CertStakeVoteDeleg.ts#L23)

***

### stakeCredential

> `readonly` **stakeCredential**: [`Credential`](Credential.md)\<[`CredentialType`](../enumerations/CredentialType.md)\>

#### Implementation of

[`ICertStakeVoteDeleg`](../interfaces/ICertStakeVoteDeleg.md).[`stakeCredential`](../interfaces/ICertStakeVoteDeleg.md#stakecredential)

#### Defined in

[src/ledger/certs/CertStakeVoteDeleg.ts:22](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/certs/CertStakeVoteDeleg.ts#L22)

## Methods

### getRequiredSigners()

> **getRequiredSigners**(): [`Hash28`](Hash28.md)[]

#### Returns

[`Hash28`](Hash28.md)[]

#### Implementation of

[`ICert`](../interfaces/ICert.md).[`getRequiredSigners`](../interfaces/ICert.md#getrequiredsigners)

#### Defined in

[src/ledger/certs/CertStakeVoteDeleg.ts:69](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/certs/CertStakeVoteDeleg.ts#L69)

***

### toCbor()

> **toCbor**(): `CborString`

#### Returns

`CborString`

#### Defined in

[src/ledger/certs/CertStakeVoteDeleg.ts:74](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/certs/CertStakeVoteDeleg.ts#L74)

***

### toCborObj()

> **toCborObj**(): `CborArray`

#### Returns

`CborArray`

#### Defined in

[src/ledger/certs/CertStakeVoteDeleg.ts:78](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/certs/CertStakeVoteDeleg.ts#L78)

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

[src/ledger/certs/CertStakeVoteDeleg.ts:38](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/certs/CertStakeVoteDeleg.ts#L38)

***

### toJson()

> **toJson**(): `object`

#### Returns

`object`

##### certType

> **certType**: `"StakeVoteDeleg"`

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

[src/ledger/certs/CertStakeVoteDeleg.ts:105](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/certs/CertStakeVoteDeleg.ts#L105)

***

### fromCborObj()

> `static` **fromCborObj**(`cbor`): [`CertStakeVoteDeleg`](CertStakeVoteDeleg.md)

#### Parameters

• **cbor**: `CborObj`

#### Returns

[`CertStakeVoteDeleg`](CertStakeVoteDeleg.md)

#### Defined in

[src/ledger/certs/CertStakeVoteDeleg.ts:88](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/certs/CertStakeVoteDeleg.ts#L88)
