**@harmoniclabs/cardano-ledger-ts** • [Readme](../README.md) \| [API](../globals.md)

***

[@harmoniclabs/cardano-ledger-ts](../README.md) / CertVoteDeleg

# Class: CertVoteDeleg

## Implements

- [`ICert`](../interfaces/ICert.md)
- [`ICertVoteDeleg`](../interfaces/ICertVoteDeleg.md)

## Constructors

### new CertVoteDeleg(__namedParameters)

> **new CertVoteDeleg**(`__namedParameters`): [`CertVoteDeleg`](CertVoteDeleg.md)

#### Parameters

• **\_\_namedParameters**: [`ICertVoteDeleg`](../interfaces/ICertVoteDeleg.md)

#### Returns

[`CertVoteDeleg`](CertVoteDeleg.md)

#### Source

[src/ledger/certs/CertVoteDeleg.ts:22](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/ledger/certs/CertVoteDeleg.ts#L22)

## Properties

### certType

> **`readonly`** **certType**: [`VoteDeleg`](../enumerations/CertificateType.md#votedeleg)

#### Implementation of

[`ICert`](../interfaces/ICert.md).[`certType`](../interfaces/ICert.md#certtype)

#### Source

[src/ledger/certs/CertVoteDeleg.ts:18](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/ledger/certs/CertVoteDeleg.ts#L18)

***

### drep

> **`readonly`** **drep**: `DRep`

#### Implementation of

[`ICertVoteDeleg`](../interfaces/ICertVoteDeleg.md).[`drep`](../interfaces/ICertVoteDeleg.md#drep)

#### Source

[src/ledger/certs/CertVoteDeleg.ts:20](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/ledger/certs/CertVoteDeleg.ts#L20)

***

### stakeCredential

> **`readonly`** **stakeCredential**: [`Credential`](Credential.md)\<[`CredentialType`](../enumerations/CredentialType.md)\>

#### Implementation of

[`ICertVoteDeleg`](../interfaces/ICertVoteDeleg.md).[`stakeCredential`](../interfaces/ICertVoteDeleg.md#stakecredential)

#### Source

[src/ledger/certs/CertVoteDeleg.ts:19](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/ledger/certs/CertVoteDeleg.ts#L19)

## Methods

### getRequiredSigners()

> **getRequiredSigners**(): [`Hash28`](Hash28.md)[]

#### Returns

[`Hash28`](Hash28.md)[]

#### Implementation of

[`ICert`](../interfaces/ICert.md).[`getRequiredSigners`](../interfaces/ICert.md#getrequiredsigners)

#### Source

[src/ledger/certs/CertVoteDeleg.ts:33](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/ledger/certs/CertVoteDeleg.ts#L33)

***

### toCbor()

> **toCbor**(): `CborString`

#### Returns

`CborString`

#### Source

[src/ledger/certs/CertVoteDeleg.ts:38](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/ledger/certs/CertVoteDeleg.ts#L38)

***

### toCborObj()

> **toCborObj**(): `CborArray`

#### Returns

`CborArray`

#### Source

[src/ledger/certs/CertVoteDeleg.ts:42](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/ledger/certs/CertVoteDeleg.ts#L42)

***

### toJson()

> **toJson**(): `Object`

#### Returns

`Object`

##### certType

> **certType**: `"VoteDeleg"`

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

[src/ledger/certs/CertVoteDeleg.ts:67](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/ledger/certs/CertVoteDeleg.ts#L67)

***

### fromCborObj()

> **`static`** **fromCborObj**(`cbor`): [`CertVoteDeleg`](CertVoteDeleg.md)

#### Parameters

• **cbor**: `CborObj`

#### Returns

[`CertVoteDeleg`](CertVoteDeleg.md)

#### Source

[src/ledger/certs/CertVoteDeleg.ts:51](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/ledger/certs/CertVoteDeleg.ts#L51)
