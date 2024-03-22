**@harmoniclabs/cardano-ledger-ts** • [Readme](../README.md) \| [API](../globals.md)

***

[@harmoniclabs/cardano-ledger-ts](../README.md) / PoolParams

# Class: PoolParams

## Implements

- [`ITypedPoolParams`](../interfaces/ITypedPoolParams.md)

## Constructors

### new PoolParams(params)

> **new PoolParams**(`params`): [`PoolParams`](PoolParams.md)

#### Parameters

• **params**: [`IPoolParams`](../interfaces/IPoolParams.md)

#### Returns

[`PoolParams`](PoolParams.md)

#### Source

[src/ledger/PoolParams.ts:79](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/ledger/PoolParams.ts#L79)

## Properties

### cost

> **`readonly`** **cost**: `bigint`

#### Implementation of

[`ITypedPoolParams`](../interfaces/ITypedPoolParams.md).[`cost`](../interfaces/ITypedPoolParams.md#cost)

#### Source

[src/ledger/PoolParams.ts:72](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/ledger/PoolParams.ts#L72)

***

### margin

> **`readonly`** **margin**: `CborPositiveRational`

#### Implementation of

[`ITypedPoolParams`](../interfaces/ITypedPoolParams.md).[`margin`](../interfaces/ITypedPoolParams.md#margin)

#### Source

[src/ledger/PoolParams.ts:73](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/ledger/PoolParams.ts#L73)

***

### metadata?

> **`optional`** **`readonly`** **metadata**: [`ITypedPoolParamsMetadata`](../interfaces/ITypedPoolParamsMetadata.md)

#### Implementation of

[`ITypedPoolParams`](../interfaces/ITypedPoolParams.md).[`metadata`](../interfaces/ITypedPoolParams.md#metadata)

#### Source

[src/ledger/PoolParams.ts:77](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/ledger/PoolParams.ts#L77)

***

### operator

> **`readonly`** **operator**: [`PoolKeyHash`](PoolKeyHash.md)

#### Implementation of

[`ITypedPoolParams`](../interfaces/ITypedPoolParams.md).[`operator`](../interfaces/ITypedPoolParams.md#operator)

#### Source

[src/ledger/PoolParams.ts:69](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/ledger/PoolParams.ts#L69)

***

### owners

> **`readonly`** **owners**: [`PubKeyHash`](PubKeyHash.md)[]

#### Implementation of

[`ITypedPoolParams`](../interfaces/ITypedPoolParams.md).[`owners`](../interfaces/ITypedPoolParams.md#owners)

#### Source

[src/ledger/PoolParams.ts:75](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/ledger/PoolParams.ts#L75)

***

### pledge

> **`readonly`** **pledge**: `bigint`

#### Implementation of

[`ITypedPoolParams`](../interfaces/ITypedPoolParams.md).[`pledge`](../interfaces/ITypedPoolParams.md#pledge)

#### Source

[src/ledger/PoolParams.ts:71](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/ledger/PoolParams.ts#L71)

***

### relays

> **`readonly`** **relays**: [`PoolRelay`](../type-aliases/PoolRelay.md)[]

#### Implementation of

[`ITypedPoolParams`](../interfaces/ITypedPoolParams.md).[`relays`](../interfaces/ITypedPoolParams.md#relays)

#### Source

[src/ledger/PoolParams.ts:76](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/ledger/PoolParams.ts#L76)

***

### rewardAccount

> **`readonly`** **rewardAccount**: [`Hash28`](Hash28.md)

#### Implementation of

[`ITypedPoolParams`](../interfaces/ITypedPoolParams.md).[`rewardAccount`](../interfaces/ITypedPoolParams.md#rewardaccount)

#### Source

[src/ledger/PoolParams.ts:74](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/ledger/PoolParams.ts#L74)

***

### vrfKeyHash

> **`readonly`** **vrfKeyHash**: [`VRFKeyHash`](VRFKeyHash.md)

#### Implementation of

[`ITypedPoolParams`](../interfaces/ITypedPoolParams.md).[`vrfKeyHash`](../interfaces/ITypedPoolParams.md#vrfkeyhash)

#### Source

[src/ledger/PoolParams.ts:70](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/ledger/PoolParams.ts#L70)

## Methods

### toCborObjArray()

> **toCborObjArray**(): `CborObj`[]

#### Returns

`CborObj`[]

#### Source

[src/ledger/PoolParams.ts:170](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/ledger/PoolParams.ts#L170)

***

### toJson()

> **toJson**(): `Object`

#### Returns

`Object`

##### cost

> **cost**: `string`

##### margin

> **margin**: `number`

##### metadata

> **metadata**: `undefined` \| `Object`

##### operator

> **operator**: `string`

##### owners

> **owners**: `string`[]

##### pledge

> **pledge**: `string`

##### relays

> **relays**: (`Object` \| `Object` \| `Object`)[]

##### rewardAccount

> **rewardAccount**: `string`

##### vrfKeyHash

> **vrfKeyHash**: `string`

#### Source

[src/ledger/PoolParams.ts:236](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/ledger/PoolParams.ts#L236)

***

### fromCborObjArray()

> **`static`** **fromCborObjArray**(`__namedParameters`): [`PoolParams`](PoolParams.md)

#### Parameters

• **\_\_namedParameters**: `CborObj`[]

#### Returns

[`PoolParams`](PoolParams.md)

#### Source

[src/ledger/PoolParams.ts:190](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/ledger/PoolParams.ts#L190)
