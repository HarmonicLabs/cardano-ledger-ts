**@harmoniclabs/cardano-ledger-ts** • [Readme](../README.md) \| [API](../globals.md)

***

[@harmoniclabs/cardano-ledger-ts](../README.md) / CertPoolRegistration

# Class: CertPoolRegistration

## Implements

- [`ICert`](../interfaces/ICert.md)
- [`ICertPoolRegistration`](../interfaces/ICertPoolRegistration.md)

## Constructors

### new CertPoolRegistration(__namedParameters)

> **new CertPoolRegistration**(`__namedParameters`): [`CertPoolRegistration`](CertPoolRegistration.md)

#### Parameters

• **\_\_namedParameters**: [`ICertPoolRegistration`](../interfaces/ICertPoolRegistration.md)

#### Returns

[`CertPoolRegistration`](CertPoolRegistration.md)

#### Source

[src/ledger/certs/CertPoolRegistration.ts:19](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/ledger/certs/CertPoolRegistration.ts#L19)

## Properties

### certType

> **`readonly`** **certType**: [`PoolRegistration`](../enumerations/CertificateType.md#poolregistration)

#### Implementation of

[`ICert`](../interfaces/ICert.md).[`certType`](../interfaces/ICert.md#certtype)

#### Source

[src/ledger/certs/CertPoolRegistration.ts:16](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/ledger/certs/CertPoolRegistration.ts#L16)

***

### poolParams

> **`readonly`** **poolParams**: [`PoolParams`](PoolParams.md)

#### Implementation of

[`ICertPoolRegistration`](../interfaces/ICertPoolRegistration.md).[`poolParams`](../interfaces/ICertPoolRegistration.md#poolparams)

#### Source

[src/ledger/certs/CertPoolRegistration.ts:17](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/ledger/certs/CertPoolRegistration.ts#L17)

## Methods

### getRequiredSigners()

> **getRequiredSigners**(): [`Hash28`](Hash28.md)[]

#### Returns

[`Hash28`](Hash28.md)[]

#### Implementation of

[`ICert`](../interfaces/ICert.md).[`getRequiredSigners`](../interfaces/ICert.md#getrequiredsigners)

#### Source

[src/ledger/certs/CertPoolRegistration.ts:29](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/ledger/certs/CertPoolRegistration.ts#L29)

***

### toCbor()

> **toCbor**(): `CborString`

#### Returns

`CborString`

#### Source

[src/ledger/certs/CertPoolRegistration.ts:37](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/ledger/certs/CertPoolRegistration.ts#L37)

***

### toCborObj()

> **toCborObj**(): `CborArray`

#### Returns

`CborArray`

#### Source

[src/ledger/certs/CertPoolRegistration.ts:41](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/ledger/certs/CertPoolRegistration.ts#L41)

***

### toJson()

> **toJson**(): `Object`

#### Returns

`Object`

##### certType

> **certType**: `"PoolRegistration"`

##### poolParams

> **poolParams**: `Object`

##### poolParams.cost

> **cost**: `string`

##### poolParams.margin

> **margin**: `number`

##### poolParams.metadata

> **metadata**: `undefined` \| `Object`

##### poolParams.operator

> **operator**: `string`

##### poolParams.owners

> **owners**: `string`[]

##### poolParams.pledge

> **pledge**: `string`

##### poolParams.relays

> **relays**: (`Object` \| `Object` \| `Object`)[]

##### poolParams.rewardAccount

> **rewardAccount**: `string`

##### poolParams.vrfKeyHash

> **vrfKeyHash**: `string`

#### Source

[src/ledger/certs/CertPoolRegistration.ts:64](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/ledger/certs/CertPoolRegistration.ts#L64)

***

### fromCborObj()

> **`static`** **fromCborObj**(`cbor`): [`CertPoolRegistration`](CertPoolRegistration.md)

#### Parameters

• **cbor**: `CborObj`

#### Returns

[`CertPoolRegistration`](CertPoolRegistration.md)

#### Source

[src/ledger/certs/CertPoolRegistration.ts:49](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/ledger/certs/CertPoolRegistration.ts#L49)
