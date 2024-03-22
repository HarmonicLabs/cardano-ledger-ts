**@harmoniclabs/cardano-ledger-ts** • [Readme](../README.md) \| [API](../globals.md)

***

[@harmoniclabs/cardano-ledger-ts](../README.md) / TxOut

# Class: TxOut

## Implements

- [`ITxOut`](../interfaces/ITxOut.md)
- `ToCbor`
- `Cloneable`\<[`TxOut`](TxOut.md)\>
- `ToData`
- `ToJson`

## Constructors

### new TxOut(txOutput)

> **new TxOut**(`txOutput`): [`TxOut`](TxOut.md)

#### Parameters

• **txOutput**: [`ITxOut`](../interfaces/ITxOut.md)

#### Returns

[`TxOut`](TxOut.md)

#### Source

[src/tx/body/output/TxOut.ts:45](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/tx/body/output/TxOut.ts#L45)

## Properties

### address

> **`readonly`** **address**: [`Address`](Address.md)

#### Implementation of

[`ITxOut`](../interfaces/ITxOut.md).[`address`](../interfaces/ITxOut.md#address)

#### Source

[src/tx/body/output/TxOut.ts:40](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/tx/body/output/TxOut.ts#L40)

***

### datum?

> **`optional`** **`readonly`** **datum**: `Data` \| [`Hash32`](Hash32.md)

#### Implementation of

[`ITxOut`](../interfaces/ITxOut.md).[`datum`](../interfaces/ITxOut.md#datum)

#### Source

[src/tx/body/output/TxOut.ts:42](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/tx/body/output/TxOut.ts#L42)

***

### refScript?

> **`optional`** **`readonly`** **refScript**: [`Script`](Script.md)\<[`LitteralScriptType`](../type-aliases/LitteralScriptType.md)\>

#### Implementation of

[`ITxOut`](../interfaces/ITxOut.md).[`refScript`](../interfaces/ITxOut.md#refscript)

#### Source

[src/tx/body/output/TxOut.ts:43](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/tx/body/output/TxOut.ts#L43)

***

### value

> **`readonly`** **value**: [`Value`](Value.md)

#### Implementation of

[`ITxOut`](../interfaces/ITxOut.md).[`value`](../interfaces/ITxOut.md#value)

#### Source

[src/tx/body/output/TxOut.ts:41](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/tx/body/output/TxOut.ts#L41)

## Accessors

### fake

> **`get`** **`static`** **fake**(): [`TxOut`](TxOut.md)

#### Returns

[`TxOut`](TxOut.md)

#### Source

[src/tx/body/output/TxOut.ts:118](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/tx/body/output/TxOut.ts#L118)

## Methods

### clone()

> **clone**(): [`TxOut`](TxOut.md)

#### Returns

[`TxOut`](TxOut.md)

#### Implementation of

`Cloneable.clone`

#### Source

[src/tx/body/output/TxOut.ts:108](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/tx/body/output/TxOut.ts#L108)

***

### toCbor()

> **toCbor**(): `CborString`

#### Returns

`CborString`

#### Implementation of

`ToCbor.toCbor`

#### Source

[src/tx/body/output/TxOut.ts:167](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/tx/body/output/TxOut.ts#L167)

***

### toCborObj()

> **toCborObj**(): `CborMap`

#### Returns

`CborMap`

#### Implementation of

`ToCbor.toCborObj`

#### Source

[src/tx/body/output/TxOut.ts:171](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/tx/body/output/TxOut.ts#L171)

***

### toData()

> **toData**(`version`): `Data`

#### Parameters

• **version**: `"v1"` \| `"v2"`= `"v2"`

#### Returns

`Data`

#### Implementation of

`ToData.toData`

#### Source

[src/tx/body/output/TxOut.ts:128](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/tx/body/output/TxOut.ts#L128)

***

### toJson()

> **toJson**(): `Object`

#### Returns

`Object`

##### address

> **address**: \`addr1${string}\` \| \`addr_test1${string}\`

##### datum

> **datum**: `any`

##### refScript

> **refScript**: `undefined` \| [`ScriptSignature`](../interfaces/ScriptSignature.md) \| [`ScriptAll`](../interfaces/ScriptAll.md) \| [`ScriptAny`](../interfaces/ScriptAny.md) \| [`ScriptAtLeast`](../interfaces/ScriptAtLeast.md) \| [`ScriptAfter`](../interfaces/ScriptAfter.md) \| [`ScriptBefore`](../interfaces/ScriptBefore.md) \| `Object`

##### value

> **value**: [`ValueJson`](../type-aliases/ValueJson.md)

#### Implementation of

`ToJson.toJson`

#### Source

[src/tx/body/output/TxOut.ts:332](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/tx/body/output/TxOut.ts#L332)

***

### fromCbor()

> **`static`** **fromCbor**(`cStr`): [`TxOut`](TxOut.md)

#### Parameters

• **cStr**: `CanBeCborString`

#### Returns

[`TxOut`](TxOut.md)

#### Source

[src/tx/body/output/TxOut.ts:222](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/tx/body/output/TxOut.ts#L222)

***

### fromCborObj()

> **`static`** **fromCborObj**(`cObj`): [`TxOut`](TxOut.md)

#### Parameters

• **cObj**: `CborObj`

#### Returns

[`TxOut`](TxOut.md)

#### Source

[src/tx/body/output/TxOut.ts:226](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/tx/body/output/TxOut.ts#L226)
