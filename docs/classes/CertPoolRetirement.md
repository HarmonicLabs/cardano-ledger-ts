[**@harmoniclabs/cardano-ledger-ts**](../README.md) • **Docs**

***

[@harmoniclabs/cardano-ledger-ts](../globals.md) / CertPoolRetirement

# Class: CertPoolRetirement

## Implements

- [`ICert`](../interfaces/ICert.md)
- [`ICertPoolRetirement`](../interfaces/ICertPoolRetirement.md)

## Constructors

### new CertPoolRetirement()

> **new CertPoolRetirement**(`__namedParameters`): [`CertPoolRetirement`](CertPoolRetirement.md)

#### Parameters

• **\_\_namedParameters**: [`ICertPoolRetirement`](../interfaces/ICertPoolRetirement.md)

#### Returns

[`CertPoolRetirement`](CertPoolRetirement.md)

#### Defined in

[src/ledger/certs/CertPoolRetirement.ts:24](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/certs/CertPoolRetirement.ts#L24)

## Properties

### certType

> `readonly` **certType**: [`PoolRetirement`](../enumerations/CertificateType.md#poolretirement)

#### Implementation of

[`ICert`](../interfaces/ICert.md).[`certType`](../interfaces/ICert.md#certtype)

#### Defined in

[src/ledger/certs/CertPoolRetirement.ts:20](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/certs/CertPoolRetirement.ts#L20)

***

### epoch

> `readonly` **epoch**: `CanBeUInteger`

#### Implementation of

[`ICertPoolRetirement`](../interfaces/ICertPoolRetirement.md).[`epoch`](../interfaces/ICertPoolRetirement.md#epoch)

#### Defined in

[src/ledger/certs/CertPoolRetirement.ts:22](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/certs/CertPoolRetirement.ts#L22)

***

### poolHash

> `readonly` **poolHash**: [`Hash28`](Hash28.md)

#### Implementation of

[`ICertPoolRetirement`](../interfaces/ICertPoolRetirement.md).[`poolHash`](../interfaces/ICertPoolRetirement.md#poolhash)

#### Defined in

[src/ledger/certs/CertPoolRetirement.ts:21](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/certs/CertPoolRetirement.ts#L21)

## Methods

### getRequiredSigners()

> **getRequiredSigners**(): [`Hash28`](Hash28.md)[]

#### Returns

[`Hash28`](Hash28.md)[]

#### Implementation of

[`ICert`](../interfaces/ICert.md).[`getRequiredSigners`](../interfaces/ICert.md#getrequiredsigners)

#### Defined in

[src/ledger/certs/CertPoolRetirement.ts:56](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/certs/CertPoolRetirement.ts#L56)

***

### toCbor()

> **toCbor**(): `CborString`

#### Returns

`CborString`

#### Defined in

[src/ledger/certs/CertPoolRetirement.ts:61](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/certs/CertPoolRetirement.ts#L61)

***

### toCborObj()

> **toCborObj**(): `CborArray`

#### Returns

`CborArray`

#### Defined in

[src/ledger/certs/CertPoolRetirement.ts:65](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/certs/CertPoolRetirement.ts#L65)

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

[src/ledger/certs/CertPoolRetirement.ts:35](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/certs/CertPoolRetirement.ts#L35)

***

### toJson()

> **toJson**(): `object`

#### Returns

`object`

##### certType

> **certType**: `"PoolRetirement"`

##### epoch

> **epoch**: `string`

##### poolHash

> **poolHash**: `string`

#### Defined in

[src/ledger/certs/CertPoolRetirement.ts:92](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/certs/CertPoolRetirement.ts#L92)

***

### fromCborObj()

> `static` **fromCborObj**(`cbor`): [`CertPoolRetirement`](CertPoolRetirement.md)

#### Parameters

• **cbor**: `CborObj`

#### Returns

[`CertPoolRetirement`](CertPoolRetirement.md)

#### Defined in

[src/ledger/certs/CertPoolRetirement.ts:74](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/certs/CertPoolRetirement.ts#L74)
