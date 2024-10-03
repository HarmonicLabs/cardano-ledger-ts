[**@harmoniclabs/cardano-ledger-ts**](../README.md) • **Docs**

***

[@harmoniclabs/cardano-ledger-ts](../globals.md) / TxRedeemer

# Class: TxRedeemer

## Implements

- [`ITxRedeemer`](../interfaces/ITxRedeemer.md)
- `ToCbor`
- `Cloneable`\<[`TxRedeemer`](TxRedeemer.md)\>
- `ToJson`

## Constructors

### new TxRedeemer()

> **new TxRedeemer**(`redeemer`): [`TxRedeemer`](TxRedeemer.md)

#### Parameters

• **redeemer**: [`ITxRedeemer`](../interfaces/ITxRedeemer.md)

#### Returns

[`TxRedeemer`](TxRedeemer.md)

#### Defined in

[src/tx/TxWitnessSet/TxRedeemer.ts:84](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/tx/TxWitnessSet/TxRedeemer.ts#L84)

## Properties

### data

> `readonly` **data**: `Data`

the actual value of the redeemer

#### Implementation of

[`ITxRedeemer`](../interfaces/ITxRedeemer.md).[`data`](../interfaces/ITxRedeemer.md#data)

#### Defined in

[src/tx/TxWitnessSet/TxRedeemer.ts:81](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/tx/TxWitnessSet/TxRedeemer.ts#L81)

***

### execUnits

> **execUnits**: `ExBudget`

#### Implementation of

[`ITxRedeemer`](../interfaces/ITxRedeemer.md).[`execUnits`](../interfaces/ITxRedeemer.md#execunits)

#### Defined in

[src/tx/TxWitnessSet/TxRedeemer.ts:82](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/tx/TxWitnessSet/TxRedeemer.ts#L82)

***

### index

> `readonly` **index**: `number`

index of the input the redeemer corresponds to

#### Implementation of

[`ITxRedeemer`](../interfaces/ITxRedeemer.md).[`index`](../interfaces/ITxRedeemer.md#index)

#### Defined in

[src/tx/TxWitnessSet/TxRedeemer.ts:77](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/tx/TxWitnessSet/TxRedeemer.ts#L77)

***

### tag

> `readonly` **tag**: [`TxRedeemerTag`](../enumerations/TxRedeemerTag.md)

#### Implementation of

[`ITxRedeemer`](../interfaces/ITxRedeemer.md).[`tag`](../interfaces/ITxRedeemer.md#tag)

#### Defined in

[src/tx/TxWitnessSet/TxRedeemer.ts:73](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/tx/TxWitnessSet/TxRedeemer.ts#L73)

## Methods

### clone()

> **clone**(): [`TxRedeemer`](TxRedeemer.md)

#### Returns

[`TxRedeemer`](TxRedeemer.md)

#### Implementation of

`Cloneable.clone`

#### Defined in

[src/tx/TxWitnessSet/TxRedeemer.ts:157](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/tx/TxWitnessSet/TxRedeemer.ts#L157)

***

### toCbor()

> **toCbor**(): `CborString`

#### Returns

`CborString`

#### Implementation of

`ToCbor.toCbor`

#### Defined in

[src/tx/TxWitnessSet/TxRedeemer.ts:200](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/tx/TxWitnessSet/TxRedeemer.ts#L200)

***

### toCborMapEntry()

> **toCborMapEntry**(): `CborMapEntry`

#### Returns

`CborMapEntry`

#### Defined in

[src/tx/TxWitnessSet/TxRedeemer.ts:166](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/tx/TxWitnessSet/TxRedeemer.ts#L166)

***

### toCborObj()

> **toCborObj**(): `CborArray`

#### Returns

`CborArray`

#### Implementation of

`ToCbor.toCborObj`

#### Defined in

[src/tx/TxWitnessSet/TxRedeemer.ts:204](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/tx/TxWitnessSet/TxRedeemer.ts#L204)

***

### toJson()

> **toJson**(): `object`

#### Returns

`object`

##### data

> **data**: `any`

##### execUnits

> **execUnits**: `object`

##### execUnits.memory

> **memory**: `string`

##### execUnits.steps

> **steps**: `string`

##### index

> **index**: `number`

##### tag

> **tag**: `"Spend"` \| `"Mint"` \| `"Cert"` \| `"Withdraw"` \| `"Voting"` \| `"Proposing"`

#### Implementation of

`ToJson.toJson`

#### Defined in

[src/tx/TxWitnessSet/TxRedeemer.ts:236](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/tx/TxWitnessSet/TxRedeemer.ts#L236)

***

### fromCbor()

> `static` **fromCbor**(`cStr`): [`TxRedeemer`](TxRedeemer.md)

#### Parameters

• **cStr**: `CanBeCborString`

#### Returns

[`TxRedeemer`](TxRedeemer.md)

#### Defined in

[src/tx/TxWitnessSet/TxRedeemer.ts:214](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/tx/TxWitnessSet/TxRedeemer.ts#L214)

***

### fromCborMapEntry()

> `static` **fromCborMapEntry**(`entry`): [`TxRedeemer`](TxRedeemer.md)

#### Parameters

• **entry**: `CborMapEntry`

#### Returns

[`TxRedeemer`](TxRedeemer.md)

#### Defined in

[src/tx/TxWitnessSet/TxRedeemer.ts:180](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/tx/TxWitnessSet/TxRedeemer.ts#L180)

***

### fromCborObj()

> `static` **fromCborObj**(`cObj`): [`TxRedeemer`](TxRedeemer.md)

#### Parameters

• **cObj**: `CborObj`

#### Returns

[`TxRedeemer`](TxRedeemer.md)

#### Defined in

[src/tx/TxWitnessSet/TxRedeemer.ts:218](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/tx/TxWitnessSet/TxRedeemer.ts#L218)
