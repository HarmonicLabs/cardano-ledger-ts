**@harmoniclabs/cardano-ledger-ts** • [Readme](../README.md) \| [API](../globals.md)

***

[@harmoniclabs/cardano-ledger-ts](../README.md) / AuxiliaryData

# Class: AuxiliaryData

## Implements

- [`IAuxiliaryData`](../interfaces/IAuxiliaryData.md)
- `ToCbor`
- `ToJson`

## Constructors

### new AuxiliaryData(auxData)

> **new AuxiliaryData**(`auxData`): [`AuxiliaryData`](AuxiliaryData.md)

#### Parameters

• **auxData**: [`IAuxiliaryData`](../interfaces/IAuxiliaryData.md)

#### Returns

[`AuxiliaryData`](AuxiliaryData.md)

#### Source

[src/tx/AuxiliaryData/AuxiliaryData.ts:36](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/tx/AuxiliaryData/AuxiliaryData.ts#L36)

## Properties

### hash

> **`readonly`** **hash**: [`AuxiliaryDataHash`](AuxiliaryDataHash.md)

#### Source

[src/tx/AuxiliaryData/AuxiliaryData.ts:34](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/tx/AuxiliaryData/AuxiliaryData.ts#L34)

***

### metadata?

> **`optional`** **`readonly`** **metadata**: [`TxMetadata`](TxMetadata.md)

#### Implementation of

[`IAuxiliaryData`](../interfaces/IAuxiliaryData.md).[`metadata`](../interfaces/IAuxiliaryData.md#metadata)

#### Source

[src/tx/AuxiliaryData/AuxiliaryData.ts:29](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/tx/AuxiliaryData/AuxiliaryData.ts#L29)

***

### nativeScripts?

> **`optional`** **`readonly`** **nativeScripts**: [`Script`](Script.md)\<[`NativeScript`](../enumerations/ScriptType.md#nativescript)\>[]

#### Implementation of

[`IAuxiliaryData`](../interfaces/IAuxiliaryData.md).[`nativeScripts`](../interfaces/IAuxiliaryData.md#nativescripts)

#### Source

[src/tx/AuxiliaryData/AuxiliaryData.ts:30](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/tx/AuxiliaryData/AuxiliaryData.ts#L30)

***

### plutusV1Scripts?

> **`optional`** **`readonly`** **plutusV1Scripts**: [`Script`](Script.md)\<[`PlutusV1`](../enumerations/ScriptType.md#plutusv1)\>[]

#### Implementation of

[`IAuxiliaryData`](../interfaces/IAuxiliaryData.md).[`plutusV1Scripts`](../interfaces/IAuxiliaryData.md#plutusv1scripts)

#### Source

[src/tx/AuxiliaryData/AuxiliaryData.ts:31](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/tx/AuxiliaryData/AuxiliaryData.ts#L31)

***

### plutusV2Scripts?

> **`optional`** **`readonly`** **plutusV2Scripts**: [`Script`](Script.md)\<[`PlutusV2`](../enumerations/ScriptType.md#plutusv2)\>[]

#### Implementation of

[`IAuxiliaryData`](../interfaces/IAuxiliaryData.md).[`plutusV2Scripts`](../interfaces/IAuxiliaryData.md#plutusv2scripts)

#### Source

[src/tx/AuxiliaryData/AuxiliaryData.ts:32](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/tx/AuxiliaryData/AuxiliaryData.ts#L32)

## Methods

### toCbor()

> **toCbor**(): `CborString`

#### Returns

`CborString`

#### Implementation of

`ToCbor.toCbor`

#### Source

[src/tx/AuxiliaryData/AuxiliaryData.ts:167](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/tx/AuxiliaryData/AuxiliaryData.ts#L167)

***

### toCborObj()

> **toCborObj**(): `CborTag`

#### Returns

`CborTag`

#### Implementation of

`ToCbor.toCborObj`

#### Source

[src/tx/AuxiliaryData/AuxiliaryData.ts:171](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/tx/AuxiliaryData/AuxiliaryData.ts#L171)

***

### toJson()

> **toJson**(): `Object`

#### Returns

`Object`

##### metadata

> **metadata**: `any`

##### nativeScripts

> **nativeScripts**: `undefined` \| ([`ScriptSignature`](../interfaces/ScriptSignature.md) \| [`ScriptAll`](../interfaces/ScriptAll.md) \| [`ScriptAny`](../interfaces/ScriptAny.md) \| [`ScriptAtLeast`](../interfaces/ScriptAtLeast.md) \| [`ScriptAfter`](../interfaces/ScriptAfter.md) \| [`ScriptBefore`](../interfaces/ScriptBefore.md) \| `Object`)[]

##### plutusV1Scripts

> **plutusV1Scripts**: `undefined` \| ([`ScriptSignature`](../interfaces/ScriptSignature.md) \| [`ScriptAll`](../interfaces/ScriptAll.md) \| [`ScriptAny`](../interfaces/ScriptAny.md) \| [`ScriptAtLeast`](../interfaces/ScriptAtLeast.md) \| [`ScriptAfter`](../interfaces/ScriptAfter.md) \| [`ScriptBefore`](../interfaces/ScriptBefore.md) \| `Object`)[]

##### plutusV2Scripts

> **plutusV2Scripts**: `undefined` \| ([`ScriptSignature`](../interfaces/ScriptSignature.md) \| [`ScriptAll`](../interfaces/ScriptAll.md) \| [`ScriptAny`](../interfaces/ScriptAny.md) \| [`ScriptAtLeast`](../interfaces/ScriptAtLeast.md) \| [`ScriptAfter`](../interfaces/ScriptAfter.md) \| [`ScriptBefore`](../interfaces/ScriptBefore.md) \| `Object`)[]

#### Implementation of

`ToJson.toJson`

#### Source

[src/tx/AuxiliaryData/AuxiliaryData.ts:287](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/tx/AuxiliaryData/AuxiliaryData.ts#L287)

***

### fromCbor()

> **`static`** **fromCbor**(`cStr`): [`AuxiliaryData`](AuxiliaryData.md)

#### Parameters

• **cStr**: `CanBeCborString`

#### Returns

[`AuxiliaryData`](AuxiliaryData.md)

#### Source

[src/tx/AuxiliaryData/AuxiliaryData.ts:200](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/tx/AuxiliaryData/AuxiliaryData.ts#L200)

***

### fromCborObj()

> **`static`** **fromCborObj**(`cObj`): [`AuxiliaryData`](AuxiliaryData.md)

#### Parameters

• **cObj**: `CborObj`

#### Returns

[`AuxiliaryData`](AuxiliaryData.md)

#### Source

[src/tx/AuxiliaryData/AuxiliaryData.ts:204](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/tx/AuxiliaryData/AuxiliaryData.ts#L204)
