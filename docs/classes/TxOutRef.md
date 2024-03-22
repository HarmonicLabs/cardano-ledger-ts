**@harmoniclabs/cardano-ledger-ts** • [Readme](../README.md) \| [API](../globals.md)

***

[@harmoniclabs/cardano-ledger-ts](../README.md) / TxOutRef

# Class: TxOutRef

## Implements

- [`ITxOutRef`](../interfaces/ITxOutRef.md)
- `ToData`
- `ToCbor`
- `ToJson`

## Constructors

### new TxOutRef(__namedParameters)

> **new TxOutRef**(`__namedParameters`): [`TxOutRef`](TxOutRef.md)

#### Parameters

• **\_\_namedParameters**: [`ITxOutRef`](../interfaces/ITxOutRef.md)

#### Returns

[`TxOutRef`](TxOutRef.md)

#### Source

[src/tx/body/output/TxOutRef.ts:55](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/tx/body/output/TxOutRef.ts#L55)

## Properties

### id

> **`readonly`** **id**: [`Hash32`](Hash32.md)

#### Implementation of

[`ITxOutRef`](../interfaces/ITxOutRef.md).[`id`](../interfaces/ITxOutRef.md#id)

#### Source

[src/tx/body/output/TxOutRef.ts:52](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/tx/body/output/TxOutRef.ts#L52)

***

### index

> **`readonly`** **index**: `number`

#### Implementation of

[`ITxOutRef`](../interfaces/ITxOutRef.md).[`index`](../interfaces/ITxOutRef.md#index)

#### Source

[src/tx/body/output/TxOutRef.ts:53](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/tx/body/output/TxOutRef.ts#L53)

## Accessors

### fake

> **`get`** **`static`** **fake**(): [`TxOutRef`](TxOutRef.md)

#### Returns

[`TxOutRef`](TxOutRef.md)

#### Source

[src/tx/body/output/TxOutRef.ts:136](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/tx/body/output/TxOutRef.ts#L136)

## Methods

### toCbor()

> **toCbor**(): `CborString`

#### Returns

`CborString`

#### Implementation of

`ToCbor.toCbor`

#### Source

[src/tx/body/output/TxOutRef.ts:94](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/tx/body/output/TxOutRef.ts#L94)

***

### toCborObj()

> **toCborObj**(): `CborObj`

#### Returns

`CborObj`

#### Implementation of

`ToCbor.toCborObj`

#### Source

[src/tx/body/output/TxOutRef.ts:98](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/tx/body/output/TxOutRef.ts#L98)

***

### toData()

> **toData**(): `DataConstr`

#### Returns

`DataConstr`

#### Implementation of

`ToData.toData`

#### Source

[src/tx/body/output/TxOutRef.ts:80](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/tx/body/output/TxOutRef.ts#L80)

***

### toJson()

> **toJson**(): [`UTxORefJson`](../type-aliases/UTxORefJson.md)

#### Returns

[`UTxORefJson`](../type-aliases/UTxORefJson.md)

#### Implementation of

`ToJson.toJson`

#### Source

[src/tx/body/output/TxOutRef.ts:128](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/tx/body/output/TxOutRef.ts#L128)

***

### toString()

> **toString**(): \`${string}#${number}\`

#### Returns

\`${string}#${number}\`

#### Source

[src/tx/body/output/TxOutRef.ts:75](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/tx/body/output/TxOutRef.ts#L75)

***

### fromCbor()

> **`static`** **fromCbor**(`cStr`): [`TxOutRef`](TxOutRef.md)

#### Parameters

• **cStr**: `CanBeCborString`

#### Returns

[`TxOutRef`](TxOutRef.md)

#### Source

[src/tx/body/output/TxOutRef.ts:106](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/tx/body/output/TxOutRef.ts#L106)

***

### fromCborObj()

> **`static`** **fromCborObj**(`cObj`): [`TxOutRef`](TxOutRef.md)

#### Parameters

• **cObj**: `CborObj`

#### Returns

[`TxOutRef`](TxOutRef.md)

#### Source

[src/tx/body/output/TxOutRef.ts:110](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/tx/body/output/TxOutRef.ts#L110)
