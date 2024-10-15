[**@harmoniclabs/cardano-ledger-ts**](../README.md) • **Docs**

***

[@harmoniclabs/cardano-ledger-ts](../globals.md) / Script

# Class: Script\<T\>

## Type Parameters

• **T** *extends* [`LitteralScriptType`](../type-aliases/LitteralScriptType.md) = [`LitteralScriptType`](../type-aliases/LitteralScriptType.md)

## Implements

- `ToCbor`

## Constructors

### new Script()

> **new Script**\<`T`\>(`scriptType`, `bytes`): [`Script`](Script.md)\<`T`\>

#### Parameters

• **scriptType**: `T`

• **bytes**: `Uint8Array` \| `T` *extends* [`NativeScript`](../enumerations/ScriptType.md#nativescript) ? [`NativeScript`](../type-aliases/NativeScript.md) : [`PlutusScriptJsonFormat`](../interfaces/PlutusScriptJsonFormat.md)\<[`PlutusScriptType`](../type-aliases/PlutusScriptType.md)\>

#### Returns

[`Script`](Script.md)\<`T`\>

#### Defined in

[src/script/Script.ts:41](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/script/Script.ts#L41)

## Properties

### bytes

> `readonly` **bytes**: `Uint8Array`

#### Defined in

[src/script/Script.ts:32](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/script/Script.ts#L32)

***

### cbor

> `readonly` **cbor**: `T` *extends* [`NativeScript`](../enumerations/ScriptType.md#nativescript) ? `never` : `CborString`

format expected by `cardano-cli`

for standard ledger format (as defined in CDDL) use `toCbor` method

#### Defined in

[src/script/Script.ts:38](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/script/Script.ts#L38)

***

### hash

> `readonly` **hash**: [`Hash28`](Hash28.md)

#### Defined in

[src/script/Script.ts:39](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/script/Script.ts#L39)

***

### type

> `readonly` **type**: `T`

#### Defined in

[src/script/Script.ts:31](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/script/Script.ts#L31)

## Methods

### clone()

> **clone**(): [`Script`](Script.md)\<`T`\>

#### Returns

[`Script`](Script.md)\<`T`\>

#### Defined in

[src/script/Script.ts:163](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/script/Script.ts#L163)

***

### toCbor()

> **toCbor**(): `CborString`

format specified in the ledger CDDL

#### Returns

`CborString`

#### Implementation of

`ToCbor.toCbor`

#### Defined in

[src/script/Script.ts:213](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/script/Script.ts#L213)

***

### toCborObj()

> **toCborObj**(): `CborObj`

format specified in the ledger CDDL

#### Returns

`CborObj`

#### Implementation of

`ToCbor.toCborObj`

#### Defined in

[src/script/Script.ts:220](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/script/Script.ts#L220)

***

### toJson()

> **toJson**(): [`ScriptSignature`](../interfaces/ScriptSignature.md) \| [`ScriptAll`](../interfaces/ScriptAll.md) \| [`ScriptAny`](../interfaces/ScriptAny.md) \| [`ScriptAtLeast`](../interfaces/ScriptAtLeast.md) \| [`ScriptAfter`](../interfaces/ScriptAfter.md) \| [`ScriptBefore`](../interfaces/ScriptBefore.md) \| `object`

#### Returns

[`ScriptSignature`](../interfaces/ScriptSignature.md) \| [`ScriptAll`](../interfaces/ScriptAll.md) \| [`ScriptAny`](../interfaces/ScriptAny.md) \| [`ScriptAtLeast`](../interfaces/ScriptAtLeast.md) \| [`ScriptAfter`](../interfaces/ScriptAfter.md) \| [`ScriptBefore`](../interfaces/ScriptBefore.md) \| `object`

#### Defined in

[src/script/Script.ts:171](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/script/Script.ts#L171)

***

### fromCbor()

> `static` **fromCbor**(`cbor`, `defType`): [`Script`](Script.md)\<[`LitteralScriptType`](../type-aliases/LitteralScriptType.md)\>

#### Parameters

• **cbor**: `CanBeCborString`

• **defType**: [`ScriptType`](../enumerations/ScriptType.md) = `ScriptType.PlutusV2`

#### Returns

[`Script`](Script.md)\<[`LitteralScriptType`](../type-aliases/LitteralScriptType.md)\>

#### Defined in

[src/script/Script.ts:240](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/script/Script.ts#L240)

***

### fromCborObj()

> `static` **fromCborObj**(`cObj`, `defType`): [`Script`](Script.md)\<[`LitteralScriptType`](../type-aliases/LitteralScriptType.md)\>

#### Parameters

• **cObj**: `CborObj`

• **defType**: [`ScriptType`](../enumerations/ScriptType.md) = `ScriptType.PlutusV2`

#### Returns

[`Script`](Script.md)\<[`LitteralScriptType`](../type-aliases/LitteralScriptType.md)\>

#### Defined in

[src/script/Script.ts:245](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/script/Script.ts#L245)

***

### fromJson()

> `static` **fromJson**(`json`): [`Script`](Script.md)\<[`LitteralScriptType`](../type-aliases/LitteralScriptType.md)\>

#### Parameters

• **json**: `any`

#### Returns

[`Script`](Script.md)\<[`LitteralScriptType`](../type-aliases/LitteralScriptType.md)\>

#### Defined in

[src/script/Script.ts:195](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/script/Script.ts#L195)
