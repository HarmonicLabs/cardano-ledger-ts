[**@harmoniclabs/cardano-ledger-ts**](../README.md) • **Docs**

***

[@harmoniclabs/cardano-ledger-ts](../globals.md) / TxOut

# Class: TxOut

## Implements

- [`ITxOut`](../interfaces/ITxOut.md)
- `ToCbor`
- `Cloneable`\<[`TxOut`](TxOut.md)\>
- `ToData`
- `ToJson`

## Constructors

### new TxOut()

> **new TxOut**(`txOutput`): [`TxOut`](TxOut.md)

#### Parameters

• **txOutput**: [`ITxOut`](../interfaces/ITxOut.md)

#### Returns

[`TxOut`](TxOut.md)

#### Defined in

[src/tx/body/output/TxOut.ts:46](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/tx/body/output/TxOut.ts#L46)

## Properties

### address

> `readonly` **address**: [`Address`](Address.md)

#### Implementation of

[`ITxOut`](../interfaces/ITxOut.md).[`address`](../interfaces/ITxOut.md#address)

#### Defined in

[src/tx/body/output/TxOut.ts:41](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/tx/body/output/TxOut.ts#L41)

***

### datum?

> `readonly` `optional` **datum**: `Data` \| [`Hash32`](Hash32.md)

#### Implementation of

[`ITxOut`](../interfaces/ITxOut.md).[`datum`](../interfaces/ITxOut.md#datum)

#### Defined in

[src/tx/body/output/TxOut.ts:43](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/tx/body/output/TxOut.ts#L43)

***

### refScript?

> `readonly` `optional` **refScript**: [`Script`](Script.md)\<[`LitteralScriptType`](../type-aliases/LitteralScriptType.md)\>

#### Implementation of

[`ITxOut`](../interfaces/ITxOut.md).[`refScript`](../interfaces/ITxOut.md#refscript)

#### Defined in

[src/tx/body/output/TxOut.ts:44](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/tx/body/output/TxOut.ts#L44)

***

### value

> `readonly` **value**: [`Value`](Value.md)

#### Implementation of

[`ITxOut`](../interfaces/ITxOut.md).[`value`](../interfaces/ITxOut.md#value)

#### Defined in

[src/tx/body/output/TxOut.ts:42](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/tx/body/output/TxOut.ts#L42)

## Accessors

### fake

> `get` `static` **fake**(): [`TxOut`](TxOut.md)

#### Returns

[`TxOut`](TxOut.md)

#### Defined in

[src/tx/body/output/TxOut.ts:119](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/tx/body/output/TxOut.ts#L119)

## Methods

### clone()

> **clone**(): [`TxOut`](TxOut.md)

#### Returns

[`TxOut`](TxOut.md)

#### Implementation of

`Cloneable.clone`

#### Defined in

[src/tx/body/output/TxOut.ts:109](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/tx/body/output/TxOut.ts#L109)

***

### toCbor()

> **toCbor**(): `CborString`

#### Returns

`CborString`

#### Implementation of

`ToCbor.toCbor`

#### Defined in

[src/tx/body/output/TxOut.ts:168](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/tx/body/output/TxOut.ts#L168)

***

### toCborObj()

> **toCborObj**(): `CborMap`

#### Returns

`CborMap`

#### Implementation of

`ToCbor.toCborObj`

#### Defined in

[src/tx/body/output/TxOut.ts:172](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/tx/body/output/TxOut.ts#L172)

***

### toData()

> **toData**(`version`): `Data`

#### Parameters

• **version**: `ToDataVersion` = `"v2"`

#### Returns

`Data`

#### Implementation of

`ToData.toData`

#### Defined in

[src/tx/body/output/TxOut.ts:129](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/tx/body/output/TxOut.ts#L129)

***

### toJson()

> **toJson**(): `object`

#### Returns

`object`

##### address

> **address**: \`addr1$\{string\}\` \| \`addr\_test1$\{string\}\`

##### datum

> **datum**: `any`

##### refScript

> **refScript**: `undefined` \| [`ScriptSignature`](../interfaces/ScriptSignature.md) \| [`ScriptAll`](../interfaces/ScriptAll.md) \| [`ScriptAny`](../interfaces/ScriptAny.md) \| [`ScriptAtLeast`](../interfaces/ScriptAtLeast.md) \| [`ScriptAfter`](../interfaces/ScriptAfter.md) \| [`ScriptBefore`](../interfaces/ScriptBefore.md) \| `object`

##### value

> **value**: [`ValueJson`](../type-aliases/ValueJson.md)

#### Implementation of

`ToJson.toJson`

#### Defined in

[src/tx/body/output/TxOut.ts:333](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/tx/body/output/TxOut.ts#L333)

***

### fromCbor()

> `static` **fromCbor**(`cStr`): [`TxOut`](TxOut.md)

#### Parameters

• **cStr**: `CanBeCborString`

#### Returns

[`TxOut`](TxOut.md)

#### Defined in

[src/tx/body/output/TxOut.ts:223](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/tx/body/output/TxOut.ts#L223)

***

### fromCborObj()

> `static` **fromCborObj**(`cObj`): [`TxOut`](TxOut.md)

#### Parameters

• **cObj**: `CborObj`

#### Returns

[`TxOut`](TxOut.md)

#### Defined in

[src/tx/body/output/TxOut.ts:227](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/tx/body/output/TxOut.ts#L227)
