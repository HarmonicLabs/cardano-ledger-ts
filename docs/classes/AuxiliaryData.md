[**@harmoniclabs/cardano-ledger-ts**](../README.md) • **Docs**

***

[@harmoniclabs/cardano-ledger-ts](../globals.md) / AuxiliaryData

# Class: AuxiliaryData

## Implements

- [`IAuxiliaryData`](../interfaces/IAuxiliaryData.md)
- `ToCbor`
- `ToJson`

## Constructors

### new AuxiliaryData()

> **new AuxiliaryData**(`auxData`): [`AuxiliaryData`](AuxiliaryData.md)

#### Parameters

• **auxData**: [`IAuxiliaryData`](../interfaces/IAuxiliaryData.md)

#### Returns

[`AuxiliaryData`](AuxiliaryData.md)

#### Defined in

[src/tx/AuxiliaryData/AuxiliaryData.ts:36](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/tx/AuxiliaryData/AuxiliaryData.ts#L36)

## Properties

### hash

> `readonly` **hash**: [`AuxiliaryDataHash`](AuxiliaryDataHash.md)

#### Defined in

[src/tx/AuxiliaryData/AuxiliaryData.ts:34](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/tx/AuxiliaryData/AuxiliaryData.ts#L34)

***

### metadata?

> `readonly` `optional` **metadata**: [`TxMetadata`](TxMetadata.md)

#### Implementation of

[`IAuxiliaryData`](../interfaces/IAuxiliaryData.md).[`metadata`](../interfaces/IAuxiliaryData.md#metadata)

#### Defined in

[src/tx/AuxiliaryData/AuxiliaryData.ts:29](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/tx/AuxiliaryData/AuxiliaryData.ts#L29)

***

### nativeScripts?

> `readonly` `optional` **nativeScripts**: [`Script`](Script.md)\<[`NativeScript`](../enumerations/ScriptType.md#nativescript)\>[]

#### Implementation of

[`IAuxiliaryData`](../interfaces/IAuxiliaryData.md).[`nativeScripts`](../interfaces/IAuxiliaryData.md#nativescripts)

#### Defined in

[src/tx/AuxiliaryData/AuxiliaryData.ts:30](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/tx/AuxiliaryData/AuxiliaryData.ts#L30)

***

### plutusV1Scripts?

> `readonly` `optional` **plutusV1Scripts**: [`Script`](Script.md)\<[`PlutusV1`](../enumerations/ScriptType.md#plutusv1)\>[]

#### Implementation of

[`IAuxiliaryData`](../interfaces/IAuxiliaryData.md).[`plutusV1Scripts`](../interfaces/IAuxiliaryData.md#plutusv1scripts)

#### Defined in

[src/tx/AuxiliaryData/AuxiliaryData.ts:31](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/tx/AuxiliaryData/AuxiliaryData.ts#L31)

***

### plutusV2Scripts?

> `readonly` `optional` **plutusV2Scripts**: [`Script`](Script.md)\<[`PlutusV2`](../enumerations/ScriptType.md#plutusv2)\>[]

#### Implementation of

[`IAuxiliaryData`](../interfaces/IAuxiliaryData.md).[`plutusV2Scripts`](../interfaces/IAuxiliaryData.md#plutusv2scripts)

#### Defined in

[src/tx/AuxiliaryData/AuxiliaryData.ts:32](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/tx/AuxiliaryData/AuxiliaryData.ts#L32)

## Methods

### toCbor()

> **toCbor**(): `CborString`

#### Returns

`CborString`

#### Implementation of

`ToCbor.toCbor`

#### Defined in

[src/tx/AuxiliaryData/AuxiliaryData.ts:167](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/tx/AuxiliaryData/AuxiliaryData.ts#L167)

***

### toCborObj()

> **toCborObj**(): `CborTag`

#### Returns

`CborTag`

#### Implementation of

`ToCbor.toCborObj`

#### Defined in

[src/tx/AuxiliaryData/AuxiliaryData.ts:171](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/tx/AuxiliaryData/AuxiliaryData.ts#L171)

***

### toJson()

> **toJson**(): `object`

#### Returns

`object`

##### metadata

> **metadata**: `any`

##### nativeScripts

> **nativeScripts**: `undefined` \| ([`ScriptSignature`](../interfaces/ScriptSignature.md) \| [`ScriptAll`](../interfaces/ScriptAll.md) \| [`ScriptAny`](../interfaces/ScriptAny.md) \| [`ScriptAtLeast`](../interfaces/ScriptAtLeast.md) \| [`ScriptAfter`](../interfaces/ScriptAfter.md) \| [`ScriptBefore`](../interfaces/ScriptBefore.md) \| `object`)[]

##### plutusV1Scripts

> **plutusV1Scripts**: `undefined` \| ([`ScriptSignature`](../interfaces/ScriptSignature.md) \| [`ScriptAll`](../interfaces/ScriptAll.md) \| [`ScriptAny`](../interfaces/ScriptAny.md) \| [`ScriptAtLeast`](../interfaces/ScriptAtLeast.md) \| [`ScriptAfter`](../interfaces/ScriptAfter.md) \| [`ScriptBefore`](../interfaces/ScriptBefore.md) \| `object`)[]

##### plutusV2Scripts

> **plutusV2Scripts**: `undefined` \| ([`ScriptSignature`](../interfaces/ScriptSignature.md) \| [`ScriptAll`](../interfaces/ScriptAll.md) \| [`ScriptAny`](../interfaces/ScriptAny.md) \| [`ScriptAtLeast`](../interfaces/ScriptAtLeast.md) \| [`ScriptAfter`](../interfaces/ScriptAfter.md) \| [`ScriptBefore`](../interfaces/ScriptBefore.md) \| `object`)[]

#### Implementation of

`ToJson.toJson`

#### Defined in

[src/tx/AuxiliaryData/AuxiliaryData.ts:287](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/tx/AuxiliaryData/AuxiliaryData.ts#L287)

***

### fromCbor()

> `static` **fromCbor**(`cStr`): [`AuxiliaryData`](AuxiliaryData.md)

#### Parameters

• **cStr**: `CanBeCborString`

#### Returns

[`AuxiliaryData`](AuxiliaryData.md)

#### Defined in

[src/tx/AuxiliaryData/AuxiliaryData.ts:200](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/tx/AuxiliaryData/AuxiliaryData.ts#L200)

***

### fromCborObj()

> `static` **fromCborObj**(`cObj`): [`AuxiliaryData`](AuxiliaryData.md)

#### Parameters

• **cObj**: `CborObj`

#### Returns

[`AuxiliaryData`](AuxiliaryData.md)

#### Defined in

[src/tx/AuxiliaryData/AuxiliaryData.ts:204](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/tx/AuxiliaryData/AuxiliaryData.ts#L204)
