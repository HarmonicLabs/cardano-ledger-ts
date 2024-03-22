**@harmoniclabs/cardano-ledger-ts** • [Readme](../README.md) \| [API](../globals.md)

***

[@harmoniclabs/cardano-ledger-ts](../README.md) / CertStakeVoteDeleg

# Class: CertStakeVoteDeleg

## Implements

- [`ICert`](../interfaces/ICert.md)
- [`ICertStakeVoteDeleg`](../interfaces/ICertStakeVoteDeleg.md)

## Constructors

### new CertStakeVoteDeleg(__namedParameters)

> **new CertStakeVoteDeleg**(`__namedParameters`): [`CertStakeVoteDeleg`](CertStakeVoteDeleg.md)

#### Parameters

• **\_\_namedParameters**: [`ICertStakeVoteDeleg`](../interfaces/ICertStakeVoteDeleg.md)

#### Returns

[`CertStakeVoteDeleg`](CertStakeVoteDeleg.md)

#### Source

[src/ledger/certs/CertStakeVoteDeleg.ts:24](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/ledger/certs/CertStakeVoteDeleg.ts#L24)

## Properties

### certType

> **`readonly`** **certType**: [`StakeVoteDeleg`](../enumerations/CertificateType.md#stakevotedeleg)

#### Implementation of

[`ICert`](../interfaces/ICert.md).[`certType`](../interfaces/ICert.md#certtype)

#### Source

[src/ledger/certs/CertStakeVoteDeleg.ts:19](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/ledger/certs/CertStakeVoteDeleg.ts#L19)

***

### drep

> **`readonly`** **drep**: `DRep`

#### Implementation of

[`ICertStakeVoteDeleg`](../interfaces/ICertStakeVoteDeleg.md).[`drep`](../interfaces/ICertStakeVoteDeleg.md#drep)

#### Source

[src/ledger/certs/CertStakeVoteDeleg.ts:22](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/ledger/certs/CertStakeVoteDeleg.ts#L22)

***

### poolKeyHash

> **`readonly`** **poolKeyHash**: [`Hash28`](Hash28.md)

#### Implementation of

[`ICertStakeVoteDeleg`](../interfaces/ICertStakeVoteDeleg.md).[`poolKeyHash`](../interfaces/ICertStakeVoteDeleg.md#poolkeyhash)

#### Source

[src/ledger/certs/CertStakeVoteDeleg.ts:21](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/ledger/certs/CertStakeVoteDeleg.ts#L21)

***

### stakeCredential

> **`readonly`** **stakeCredential**: [`Credential`](Credential.md)\<[`CredentialType`](../enumerations/CredentialType.md)\>

#### Implementation of

[`ICertStakeVoteDeleg`](../interfaces/ICertStakeVoteDeleg.md).[`stakeCredential`](../interfaces/ICertStakeVoteDeleg.md#stakecredential)

#### Source

[src/ledger/certs/CertStakeVoteDeleg.ts:20](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/ledger/certs/CertStakeVoteDeleg.ts#L20)

## Methods

### getRequiredSigners()

> **getRequiredSigners**(): [`Hash28`](Hash28.md)[]

#### Returns

[`Hash28`](Hash28.md)[]

#### Implementation of

[`ICert`](../interfaces/ICert.md).[`getRequiredSigners`](../interfaces/ICert.md#getrequiredsigners)

#### Source

[src/ledger/certs/CertStakeVoteDeleg.ts:36](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/ledger/certs/CertStakeVoteDeleg.ts#L36)

***

### toCbor()

> **toCbor**(): `CborString`

#### Returns

`CborString`

#### Source

[src/ledger/certs/CertStakeVoteDeleg.ts:41](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/ledger/certs/CertStakeVoteDeleg.ts#L41)

***

### toCborObj()

> **toCborObj**(): `CborArray`

#### Returns

`CborArray`

#### Source

[src/ledger/certs/CertStakeVoteDeleg.ts:45](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/ledger/certs/CertStakeVoteDeleg.ts#L45)

***

### toJson()

> **toJson**(): `Object`

#### Returns

`Object`

##### certType

> **certType**: `"StakeVoteDeleg"`

##### drep

> **drep**: `Object`

##### drep.drepType

> **drepType**: `string`

##### poolKeyHash

> **poolKeyHash**: `string`

##### stakeCredential

> **stakeCredential**: `Object`

##### stakeCredential.credentialType

> **credentialType**: `string`

##### stakeCredential.hash

> **hash**: `string`

#### Source

[src/ledger/certs/CertStakeVoteDeleg.ts:72](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/ledger/certs/CertStakeVoteDeleg.ts#L72)

***

### fromCborObj()

> **`static`** **fromCborObj**(`cbor`): [`CertStakeVoteDeleg`](CertStakeVoteDeleg.md)

#### Parameters

• **cbor**: `CborObj`

#### Returns

[`CertStakeVoteDeleg`](CertStakeVoteDeleg.md)

#### Source

[src/ledger/certs/CertStakeVoteDeleg.ts:55](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/ledger/certs/CertStakeVoteDeleg.ts#L55)
