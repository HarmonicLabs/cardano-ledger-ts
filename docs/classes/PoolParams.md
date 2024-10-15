[**@harmoniclabs/cardano-ledger-ts**](../README.md) • **Docs**

***

[@harmoniclabs/cardano-ledger-ts](../globals.md) / PoolParams

# Class: PoolParams

## Implements

- [`ITypedPoolParams`](../interfaces/ITypedPoolParams.md)

## Constructors

### new PoolParams()

> **new PoolParams**(`params`): [`PoolParams`](PoolParams.md)

#### Parameters

• **params**: [`IPoolParams`](../interfaces/IPoolParams.md)

#### Returns

[`PoolParams`](PoolParams.md)

#### Defined in

[src/ledger/PoolParams.ts:81](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/PoolParams.ts#L81)

## Properties

### cost

> `readonly` **cost**: `bigint`

#### Implementation of

[`ITypedPoolParams`](../interfaces/ITypedPoolParams.md).[`cost`](../interfaces/ITypedPoolParams.md#cost)

#### Defined in

[src/ledger/PoolParams.ts:74](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/PoolParams.ts#L74)

***

### margin

> `readonly` **margin**: `CborPositiveRational`

#### Implementation of

[`ITypedPoolParams`](../interfaces/ITypedPoolParams.md).[`margin`](../interfaces/ITypedPoolParams.md#margin)

#### Defined in

[src/ledger/PoolParams.ts:75](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/PoolParams.ts#L75)

***

### metadata?

> `readonly` `optional` **metadata**: [`ITypedPoolParamsMetadata`](../interfaces/ITypedPoolParamsMetadata.md)

#### Implementation of

[`ITypedPoolParams`](../interfaces/ITypedPoolParams.md).[`metadata`](../interfaces/ITypedPoolParams.md#metadata)

#### Defined in

[src/ledger/PoolParams.ts:79](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/PoolParams.ts#L79)

***

### operator

> `readonly` **operator**: [`PoolKeyHash`](PoolKeyHash.md)

#### Implementation of

[`ITypedPoolParams`](../interfaces/ITypedPoolParams.md).[`operator`](../interfaces/ITypedPoolParams.md#operator)

#### Defined in

[src/ledger/PoolParams.ts:71](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/PoolParams.ts#L71)

***

### owners

> `readonly` **owners**: [`PubKeyHash`](PubKeyHash.md)[]

#### Implementation of

[`ITypedPoolParams`](../interfaces/ITypedPoolParams.md).[`owners`](../interfaces/ITypedPoolParams.md#owners)

#### Defined in

[src/ledger/PoolParams.ts:77](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/PoolParams.ts#L77)

***

### pledge

> `readonly` **pledge**: `bigint`

#### Implementation of

[`ITypedPoolParams`](../interfaces/ITypedPoolParams.md).[`pledge`](../interfaces/ITypedPoolParams.md#pledge)

#### Defined in

[src/ledger/PoolParams.ts:73](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/PoolParams.ts#L73)

***

### relays

> `readonly` **relays**: [`PoolRelay`](../type-aliases/PoolRelay.md)[]

#### Implementation of

[`ITypedPoolParams`](../interfaces/ITypedPoolParams.md).[`relays`](../interfaces/ITypedPoolParams.md#relays)

#### Defined in

[src/ledger/PoolParams.ts:78](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/PoolParams.ts#L78)

***

### rewardAccount

> `readonly` **rewardAccount**: [`StakeAddress`](StakeAddress.md)\<[`StakeAddressType`](../type-aliases/StakeAddressType.md)\>

#### Implementation of

[`ITypedPoolParams`](../interfaces/ITypedPoolParams.md).[`rewardAccount`](../interfaces/ITypedPoolParams.md#rewardaccount)

#### Defined in

[src/ledger/PoolParams.ts:76](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/PoolParams.ts#L76)

***

### vrfKeyHash

> `readonly` **vrfKeyHash**: [`VRFKeyHash`](VRFKeyHash.md)

#### Implementation of

[`ITypedPoolParams`](../interfaces/ITypedPoolParams.md).[`vrfKeyHash`](../interfaces/ITypedPoolParams.md#vrfkeyhash)

#### Defined in

[src/ledger/PoolParams.ts:72](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/PoolParams.ts#L72)

## Methods

### toCborObjArray()

> **toCborObjArray**(): `CborObj`[]

#### Returns

`CborObj`[]

#### Defined in

[src/ledger/PoolParams.ts:190](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/PoolParams.ts#L190)

***

### toJson()

> **toJson**(): `object`

#### Returns

`object`

##### cost

> **cost**: `string`

##### margin

> **margin**: `number`

##### metadata

> **metadata**: `undefined` \| `object`

##### operator

> **operator**: `string`

##### owners

> **owners**: `string`[]

##### pledge

> **pledge**: `string`

##### relays

> **relays**: (`object` \| `object` \| `object`)[]

##### rewardAccount

> **rewardAccount**: [`StakeAddress`](StakeAddress.md)\<[`StakeAddressType`](../type-aliases/StakeAddressType.md)\>

##### vrfKeyHash

> **vrfKeyHash**: `string`

#### Defined in

[src/ledger/PoolParams.ts:263](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/PoolParams.ts#L263)

***

### fromCborObjArray()

> `static` **fromCborObjArray**(`__namedParameters`): [`PoolParams`](PoolParams.md)

#### Parameters

• **\_\_namedParameters**: `CborObj`[]

#### Returns

[`PoolParams`](PoolParams.md)

#### Defined in

[src/ledger/PoolParams.ts:210](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/PoolParams.ts#L210)
