[**@harmoniclabs/cardano-ledger-ts**](../README.md) • **Docs**

***

[@harmoniclabs/cardano-ledger-ts](../globals.md) / CertPoolRegistration

# Class: CertPoolRegistration

## Implements

- [`ICert`](../interfaces/ICert.md)
- [`ICertPoolRegistration`](../interfaces/ICertPoolRegistration.md)

## Constructors

### new CertPoolRegistration()

> **new CertPoolRegistration**(`__namedParameters`): [`CertPoolRegistration`](CertPoolRegistration.md)

#### Parameters

• **\_\_namedParameters**: [`ICertPoolRegistration`](../interfaces/ICertPoolRegistration.md)

#### Returns

[`CertPoolRegistration`](CertPoolRegistration.md)

#### Defined in

[src/ledger/certs/CertPoolRegistration.ts:21](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/certs/CertPoolRegistration.ts#L21)

## Properties

### certType

> `readonly` **certType**: [`PoolRegistration`](../enumerations/CertificateType.md#poolregistration)

#### Implementation of

[`ICert`](../interfaces/ICert.md).[`certType`](../interfaces/ICert.md#certtype)

#### Defined in

[src/ledger/certs/CertPoolRegistration.ts:18](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/certs/CertPoolRegistration.ts#L18)

***

### poolParams

> `readonly` **poolParams**: [`PoolParams`](PoolParams.md)

#### Implementation of

[`ICertPoolRegistration`](../interfaces/ICertPoolRegistration.md).[`poolParams`](../interfaces/ICertPoolRegistration.md#poolparams)

#### Defined in

[src/ledger/certs/CertPoolRegistration.ts:19](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/certs/CertPoolRegistration.ts#L19)

## Methods

### getRequiredSigners()

> **getRequiredSigners**(): [`Hash28`](Hash28.md)[]

#### Returns

[`Hash28`](Hash28.md)[]

#### Implementation of

[`ICert`](../interfaces/ICert.md).[`getRequiredSigners`](../interfaces/ICert.md#getrequiredsigners)

#### Defined in

[src/ledger/certs/CertPoolRegistration.ts:55](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/certs/CertPoolRegistration.ts#L55)

***

### toCbor()

> **toCbor**(): `CborString`

#### Returns

`CborString`

#### Defined in

[src/ledger/certs/CertPoolRegistration.ts:63](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/certs/CertPoolRegistration.ts#L63)

***

### toCborObj()

> **toCborObj**(): `CborArray`

#### Returns

`CborArray`

#### Defined in

[src/ledger/certs/CertPoolRegistration.ts:67](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/certs/CertPoolRegistration.ts#L67)

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

[src/ledger/certs/CertPoolRegistration.ts:31](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/certs/CertPoolRegistration.ts#L31)

***

### toJson()

> **toJson**(): `object`

#### Returns

`object`

##### certType

> **certType**: `"PoolRegistration"`

##### poolParams

> **poolParams**: `object`

##### poolParams.cost

> **cost**: `string`

##### poolParams.margin

> **margin**: `number`

##### poolParams.metadata

> **metadata**: `undefined` \| `object`

##### poolParams.operator

> **operator**: `string`

##### poolParams.owners

> **owners**: `string`[]

##### poolParams.pledge

> **pledge**: `string`

##### poolParams.relays

> **relays**: (`object` \| `object` \| `object`)[]

##### poolParams.rewardAccount

> **rewardAccount**: [`StakeAddress`](StakeAddress.md)\<[`StakeAddressType`](../type-aliases/StakeAddressType.md)\>

##### poolParams.vrfKeyHash

> **vrfKeyHash**: `string`

#### Defined in

[src/ledger/certs/CertPoolRegistration.ts:90](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/certs/CertPoolRegistration.ts#L90)

***

### fromCborObj()

> `static` **fromCborObj**(`cbor`): [`CertPoolRegistration`](CertPoolRegistration.md)

#### Parameters

• **cbor**: `CborObj`

#### Returns

[`CertPoolRegistration`](CertPoolRegistration.md)

#### Defined in

[src/ledger/certs/CertPoolRegistration.ts:75](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/certs/CertPoolRegistration.ts#L75)
