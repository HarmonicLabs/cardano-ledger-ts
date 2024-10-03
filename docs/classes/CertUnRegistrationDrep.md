[**@harmoniclabs/cardano-ledger-ts**](../README.md) • **Docs**

***

[@harmoniclabs/cardano-ledger-ts](../globals.md) / CertUnRegistrationDrep

# Class: CertUnRegistrationDrep

## Implements

- [`ICert`](../interfaces/ICert.md)
- [`ICertUnRegistrationDrep`](../interfaces/ICertUnRegistrationDrep.md)

## Constructors

### new CertUnRegistrationDrep()

> **new CertUnRegistrationDrep**(`__namedParameters`): [`CertUnRegistrationDrep`](CertUnRegistrationDrep.md)

#### Parameters

• **\_\_namedParameters**: [`ICertUnRegistrationDrep`](../interfaces/ICertUnRegistrationDrep.md)

#### Returns

[`CertUnRegistrationDrep`](CertUnRegistrationDrep.md)

#### Defined in

[src/ledger/certs/CertUnRegistrationDrep.ts:26](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/certs/CertUnRegistrationDrep.ts#L26)

## Properties

### certType

> `readonly` **certType**: [`UnRegistrationDrep`](../enumerations/CertificateType.md#unregistrationdrep)

#### Implementation of

[`ICert`](../interfaces/ICert.md).[`certType`](../interfaces/ICert.md#certtype)

#### Defined in

[src/ledger/certs/CertUnRegistrationDrep.ts:21](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/certs/CertUnRegistrationDrep.ts#L21)

***

### coin

> `readonly` **coin**: `bigint`

refound

#### Implementation of

[`ICertUnRegistrationDrep`](../interfaces/ICertUnRegistrationDrep.md).[`coin`](../interfaces/ICertUnRegistrationDrep.md#coin)

#### Defined in

[src/ledger/certs/CertUnRegistrationDrep.ts:24](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/certs/CertUnRegistrationDrep.ts#L24)

***

### drepCredential

> `readonly` **drepCredential**: [`Credential`](Credential.md)\<[`CredentialType`](../enumerations/CredentialType.md)\>

#### Implementation of

[`ICertUnRegistrationDrep`](../interfaces/ICertUnRegistrationDrep.md).[`drepCredential`](../interfaces/ICertUnRegistrationDrep.md#drepcredential)

#### Defined in

[src/ledger/certs/CertUnRegistrationDrep.ts:22](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/certs/CertUnRegistrationDrep.ts#L22)

## Methods

### getRequiredSigners()

> **getRequiredSigners**(): [`Hash28`](Hash28.md)[]

#### Returns

[`Hash28`](Hash28.md)[]

#### Implementation of

[`ICert`](../interfaces/ICert.md).[`getRequiredSigners`](../interfaces/ICert.md#getrequiredsigners)

#### Defined in

[src/ledger/certs/CertUnRegistrationDrep.ts:54](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/certs/CertUnRegistrationDrep.ts#L54)

***

### toCbor()

> **toCbor**(): `CborString`

#### Returns

`CborString`

#### Defined in

[src/ledger/certs/CertUnRegistrationDrep.ts:59](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/certs/CertUnRegistrationDrep.ts#L59)

***

### toCborObj()

> **toCborObj**(): `CborArray`

#### Returns

`CborArray`

#### Defined in

[src/ledger/certs/CertUnRegistrationDrep.ts:63](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/certs/CertUnRegistrationDrep.ts#L63)

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

[src/ledger/certs/CertUnRegistrationDrep.ts:37](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/certs/CertUnRegistrationDrep.ts#L37)

***

### toJson()

> **toJson**(): `object`

#### Returns

`object`

##### certType

> **certType**: `"UnRegistrationDrep"`

##### coin

> **coin**: `string`

##### drepCredential

> **drepCredential**: `object`

##### drepCredential.credentialType

> **credentialType**: `string`

##### drepCredential.hash

> **hash**: `string`

#### Defined in

[src/ledger/certs/CertUnRegistrationDrep.ts:90](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/certs/CertUnRegistrationDrep.ts#L90)

***

### fromCborObj()

> `static` **fromCborObj**(`cbor`): [`CertUnRegistrationDrep`](CertUnRegistrationDrep.md)

#### Parameters

• **cbor**: `CborObj`

#### Returns

[`CertUnRegistrationDrep`](CertUnRegistrationDrep.md)

#### Defined in

[src/ledger/certs/CertUnRegistrationDrep.ts:72](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/certs/CertUnRegistrationDrep.ts#L72)
