**@harmoniclabs/cardano-ledger-ts** • [Readme](../README.md) \| [API](../globals.md)

***

[@harmoniclabs/cardano-ledger-ts](../README.md) / TxRedeemer

# Class: TxRedeemer

## Implements

- [`ITxRedeemer`](../interfaces/ITxRedeemer.md)
- `ToCbor`
- `Cloneable`\<[`TxRedeemer`](TxRedeemer.md)\>
- `ToJson`

## Constructors

### new TxRedeemer(redeemer)

> **new TxRedeemer**(`redeemer`): [`TxRedeemer`](TxRedeemer.md)

#### Parameters

• **redeemer**: [`ITxRedeemer`](../interfaces/ITxRedeemer.md)

#### Returns

[`TxRedeemer`](TxRedeemer.md)

#### Source

[src/tx/TxWitnessSet/TxRedeemer.ts:87](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/tx/TxWitnessSet/TxRedeemer.ts#L87)

## Properties

### data

> **`readonly`** **data**: `Data`

the actual value of the redeemer

#### Implementation of

[`ITxRedeemer`](../interfaces/ITxRedeemer.md).[`data`](../interfaces/ITxRedeemer.md#data)

#### Source

[src/tx/TxWitnessSet/TxRedeemer.ts:84](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/tx/TxWitnessSet/TxRedeemer.ts#L84)

***

### execUnits

> **execUnits**: `ExBudget`

#### Implementation of

[`ITxRedeemer`](../interfaces/ITxRedeemer.md).[`execUnits`](../interfaces/ITxRedeemer.md#execunits)

#### Source

[src/tx/TxWitnessSet/TxRedeemer.ts:85](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/tx/TxWitnessSet/TxRedeemer.ts#L85)

***

### index

> **`readonly`** **index**: `number`

index of the input the redeemer corresponds to

#### Implementation of

[`ITxRedeemer`](../interfaces/ITxRedeemer.md).[`index`](../interfaces/ITxRedeemer.md#index)

#### Source

[src/tx/TxWitnessSet/TxRedeemer.ts:80](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/tx/TxWitnessSet/TxRedeemer.ts#L80)

***

### tag

> **`readonly`** **tag**: [`TxRedeemerTag`](../enumerations/TxRedeemerTag.md)

#### Implementation of

[`ITxRedeemer`](../interfaces/ITxRedeemer.md).[`tag`](../interfaces/ITxRedeemer.md#tag)

#### Source

[src/tx/TxWitnessSet/TxRedeemer.ts:76](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/tx/TxWitnessSet/TxRedeemer.ts#L76)

## Methods

### clone()

> **clone**(): [`TxRedeemer`](TxRedeemer.md)

#### Returns

[`TxRedeemer`](TxRedeemer.md)

#### Implementation of

`Cloneable.clone`

#### Source

[src/tx/TxWitnessSet/TxRedeemer.ts:160](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/tx/TxWitnessSet/TxRedeemer.ts#L160)

***

### toCbor()

> **toCbor**(): `CborString`

#### Returns

`CborString`

#### Implementation of

`ToCbor.toCbor`

#### Source

[src/tx/TxWitnessSet/TxRedeemer.ts:203](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/tx/TxWitnessSet/TxRedeemer.ts#L203)

***

### toCborMapEntry()

> **toCborMapEntry**(): `CborMapEntry`

#### Returns

`CborMapEntry`

#### Source

[src/tx/TxWitnessSet/TxRedeemer.ts:169](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/tx/TxWitnessSet/TxRedeemer.ts#L169)

***

### toCborObj()

> **toCborObj**(): `CborArray`

#### Returns

`CborArray`

#### Implementation of

`ToCbor.toCborObj`

#### Source

[src/tx/TxWitnessSet/TxRedeemer.ts:207](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/tx/TxWitnessSet/TxRedeemer.ts#L207)

***

### toJson()

> **toJson**(): `Object`

#### Returns

`Object`

##### data

> **data**: `any`

##### execUnits

> **execUnits**: `Object`

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

#### Source

[src/tx/TxWitnessSet/TxRedeemer.ts:239](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/tx/TxWitnessSet/TxRedeemer.ts#L239)

***

### fromCbor()

> **`static`** **fromCbor**(`cStr`): [`TxRedeemer`](TxRedeemer.md)

#### Parameters

• **cStr**: `CanBeCborString`

#### Returns

[`TxRedeemer`](TxRedeemer.md)

#### Source

[src/tx/TxWitnessSet/TxRedeemer.ts:217](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/tx/TxWitnessSet/TxRedeemer.ts#L217)

***

### fromCborMapEntry()

> **`static`** **fromCborMapEntry**(`entry`): [`TxRedeemer`](TxRedeemer.md)

#### Parameters

• **entry**: `CborMapEntry`

#### Returns

[`TxRedeemer`](TxRedeemer.md)

#### Source

[src/tx/TxWitnessSet/TxRedeemer.ts:183](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/tx/TxWitnessSet/TxRedeemer.ts#L183)

***

### fromCborObj()

> **`static`** **fromCborObj**(`cObj`): [`TxRedeemer`](TxRedeemer.md)

#### Parameters

• **cObj**: `CborObj`

#### Returns

[`TxRedeemer`](TxRedeemer.md)

#### Source

[src/tx/TxWitnessSet/TxRedeemer.ts:221](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/tx/TxWitnessSet/TxRedeemer.ts#L221)
