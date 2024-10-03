[**@harmoniclabs/cardano-ledger-ts**](../README.md) • **Docs**

***

[@harmoniclabs/cardano-ledger-ts](../globals.md) / TxOutRef

# Class: TxOutRef

## Implements

- [`ITxOutRef`](../interfaces/ITxOutRef.md)
- `ToData`
- `ToCbor`
- `ToJson`

## Constructors

### new TxOutRef()

> **new TxOutRef**(`__namedParameters`): [`TxOutRef`](TxOutRef.md)

#### Parameters

• **\_\_namedParameters**: [`ITxOutRef`](../interfaces/ITxOutRef.md)

#### Returns

[`TxOutRef`](TxOutRef.md)

#### Defined in

[src/tx/body/output/TxOutRef.ts:73](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/tx/body/output/TxOutRef.ts#L73)

## Properties

### id

> `readonly` **id**: [`Hash32`](Hash32.md)

#### Implementation of

[`ITxOutRef`](../interfaces/ITxOutRef.md).[`id`](../interfaces/ITxOutRef.md#id)

#### Defined in

[src/tx/body/output/TxOutRef.ts:70](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/tx/body/output/TxOutRef.ts#L70)

***

### index

> `readonly` **index**: `number`

#### Implementation of

[`ITxOutRef`](../interfaces/ITxOutRef.md).[`index`](../interfaces/ITxOutRef.md#index)

#### Defined in

[src/tx/body/output/TxOutRef.ts:71](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/tx/body/output/TxOutRef.ts#L71)

## Accessors

### fake

> `get` `static` **fake**(): [`TxOutRef`](TxOutRef.md)

#### Returns

[`TxOutRef`](TxOutRef.md)

#### Defined in

[src/tx/body/output/TxOutRef.ts:166](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/tx/body/output/TxOutRef.ts#L166)

## Methods

### eq()

> **eq**(`other`): `boolean`

#### Parameters

• **other**: [`ITxOutRef`](../interfaces/ITxOutRef.md)

#### Returns

`boolean`

#### Defined in

[src/tx/body/output/TxOutRef.ts:179](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/tx/body/output/TxOutRef.ts#L179)

***

### toCbor()

> **toCbor**(): `CborString`

#### Returns

`CborString`

#### Implementation of

`ToCbor.toCbor`

#### Defined in

[src/tx/body/output/TxOutRef.ts:124](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/tx/body/output/TxOutRef.ts#L124)

***

### toCborObj()

> **toCborObj**(): `CborObj`

#### Returns

`CborObj`

#### Implementation of

`ToCbor.toCborObj`

#### Defined in

[src/tx/body/output/TxOutRef.ts:128](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/tx/body/output/TxOutRef.ts#L128)

***

### toData()

> **toData**(`version`?): `DataConstr`

#### Parameters

• **version?**: `ToDataVersion`

#### Returns

`DataConstr`

#### Implementation of

`ToData.toData`

#### Defined in

[src/tx/body/output/TxOutRef.ts:110](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/tx/body/output/TxOutRef.ts#L110)

***

### toJson()

> **toJson**(): [`UTxORefJson`](../type-aliases/UTxORefJson.md)

#### Returns

[`UTxORefJson`](../type-aliases/UTxORefJson.md)

#### Implementation of

`ToJson.toJson`

#### Defined in

[src/tx/body/output/TxOutRef.ts:158](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/tx/body/output/TxOutRef.ts#L158)

***

### toString()

> **toString**(): \`$\{string\}#$\{number\}\`

Returns a string representation of an object.

#### Returns

\`$\{string\}#$\{number\}\`

#### Defined in

[src/tx/body/output/TxOutRef.ts:93](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/tx/body/output/TxOutRef.ts#L93)

***

### eq()

> `static` **eq**(`a`, `b`): `boolean`

#### Parameters

• **a**: [`ITxOutRef`](../interfaces/ITxOutRef.md)

• **b**: [`ITxOutRef`](../interfaces/ITxOutRef.md)

#### Returns

`boolean`

#### Defined in

[src/tx/body/output/TxOutRef.ts:174](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/tx/body/output/TxOutRef.ts#L174)

***

### fromCbor()

> `static` **fromCbor**(`cStr`): [`TxOutRef`](TxOutRef.md)

#### Parameters

• **cStr**: `CanBeCborString`

#### Returns

[`TxOutRef`](TxOutRef.md)

#### Defined in

[src/tx/body/output/TxOutRef.ts:136](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/tx/body/output/TxOutRef.ts#L136)

***

### fromCborObj()

> `static` **fromCborObj**(`cObj`): [`TxOutRef`](TxOutRef.md)

#### Parameters

• **cObj**: `CborObj`

#### Returns

[`TxOutRef`](TxOutRef.md)

#### Defined in

[src/tx/body/output/TxOutRef.ts:140](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/tx/body/output/TxOutRef.ts#L140)

***

### fromString()

> `static` **fromString**(`str`): [`TxOutRef`](TxOutRef.md)

#### Parameters

• **str**: `string`

#### Returns

[`TxOutRef`](TxOutRef.md)

#### Defined in

[src/tx/body/output/TxOutRef.ts:98](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/tx/body/output/TxOutRef.ts#L98)

***

### sort()

> `static` **sort**(`a`, `b`): `number`

#### Parameters

• **a**: [`ITxOutRef`](../interfaces/ITxOutRef.md)

• **b**: [`ITxOutRef`](../interfaces/ITxOutRef.md)

#### Returns

`number`

#### Defined in

[src/tx/body/output/TxOutRef.ts:184](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/tx/body/output/TxOutRef.ts#L184)
