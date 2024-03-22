**@harmoniclabs/cardano-ledger-ts** • [Readme](../README.md) \| [API](../globals.md)

***

[@harmoniclabs/cardano-ledger-ts](../README.md) / CertPoolRetirement

# Class: CertPoolRetirement

## Implements

- [`ICert`](../interfaces/ICert.md)
- [`ICertPoolRetirement`](../interfaces/ICertPoolRetirement.md)

## Constructors

### new CertPoolRetirement(__namedParameters)

> **new CertPoolRetirement**(`__namedParameters`): [`CertPoolRetirement`](CertPoolRetirement.md)

#### Parameters

• **\_\_namedParameters**: [`ICertPoolRetirement`](../interfaces/ICertPoolRetirement.md)

#### Returns

[`CertPoolRetirement`](CertPoolRetirement.md)

#### Source

[src/ledger/certs/CertPoolRetirement.ts:22](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/ledger/certs/CertPoolRetirement.ts#L22)

## Properties

### certType

> **`readonly`** **certType**: [`PoolRetirement`](../enumerations/CertificateType.md#poolretirement)

#### Implementation of

[`ICert`](../interfaces/ICert.md).[`certType`](../interfaces/ICert.md#certtype)

#### Source

[src/ledger/certs/CertPoolRetirement.ts:18](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/ledger/certs/CertPoolRetirement.ts#L18)

***

### epoch

> **`readonly`** **epoch**: `CanBeUInteger`

#### Implementation of

[`ICertPoolRetirement`](../interfaces/ICertPoolRetirement.md).[`epoch`](../interfaces/ICertPoolRetirement.md#epoch)

#### Source

[src/ledger/certs/CertPoolRetirement.ts:20](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/ledger/certs/CertPoolRetirement.ts#L20)

***

### poolHash

> **`readonly`** **poolHash**: [`Hash28`](Hash28.md)

#### Implementation of

[`ICertPoolRetirement`](../interfaces/ICertPoolRetirement.md).[`poolHash`](../interfaces/ICertPoolRetirement.md#poolhash)

#### Source

[src/ledger/certs/CertPoolRetirement.ts:19](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/ledger/certs/CertPoolRetirement.ts#L19)

## Methods

### getRequiredSigners()

> **getRequiredSigners**(): [`Hash28`](Hash28.md)[]

#### Returns

[`Hash28`](Hash28.md)[]

#### Implementation of

[`ICert`](../interfaces/ICert.md).[`getRequiredSigners`](../interfaces/ICert.md#getrequiredsigners)

#### Source

[src/ledger/certs/CertPoolRetirement.ts:33](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/ledger/certs/CertPoolRetirement.ts#L33)

***

### toCbor()

> **toCbor**(): `CborString`

#### Returns

`CborString`

#### Source

[src/ledger/certs/CertPoolRetirement.ts:38](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/ledger/certs/CertPoolRetirement.ts#L38)

***

### toCborObj()

> **toCborObj**(): `CborArray`

#### Returns

`CborArray`

#### Source

[src/ledger/certs/CertPoolRetirement.ts:42](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/ledger/certs/CertPoolRetirement.ts#L42)

***

### toJson()

> **toJson**(): `Object`

#### Returns

`Object`

##### certType

> **certType**: `"PoolRetirement"`

##### epoch

> **epoch**: `string`

##### poolHash

> **poolHash**: `string`

#### Source

[src/ledger/certs/CertPoolRetirement.ts:69](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/ledger/certs/CertPoolRetirement.ts#L69)

***

### fromCborObj()

> **`static`** **fromCborObj**(`cbor`): [`CertPoolRetirement`](CertPoolRetirement.md)

#### Parameters

• **cbor**: `CborObj`

#### Returns

[`CertPoolRetirement`](CertPoolRetirement.md)

#### Source

[src/ledger/certs/CertPoolRetirement.ts:51](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/ledger/certs/CertPoolRetirement.ts#L51)
