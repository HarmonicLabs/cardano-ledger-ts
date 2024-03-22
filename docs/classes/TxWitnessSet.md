**@harmoniclabs/cardano-ledger-ts** • [Readme](../README.md) \| [API](../globals.md)

***

[@harmoniclabs/cardano-ledger-ts](../README.md) / TxWitnessSet

# Class: TxWitnessSet

## Implements

- [`ITxWitnessSet`](../interfaces/ITxWitnessSet.md)
- `ToCbor`
- `ToJson`

## Constructors

### new TxWitnessSet(witnesses, allRequiredSigners)

> **new TxWitnessSet**(`witnesses`, `allRequiredSigners`): [`TxWitnessSet`](TxWitnessSet.md)

#### Parameters

• **witnesses**: [`ITxWitnessSet`](../interfaces/ITxWitnessSet.md)

• **allRequiredSigners**: `undefined` \| [`Hash28`](Hash28.md)[]= `undefined`

#### Returns

[`TxWitnessSet`](TxWitnessSet.md)

#### Source

[src/tx/TxWitnessSet/TxWitnessSet.ts:115](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/tx/TxWitnessSet/TxWitnessSet.ts#L115)

## Properties

### addVKeyWitness

> **`readonly`** **addVKeyWitness**: (`vkeyWit`) => `void`

#### Parameters

• **vkeyWit**: [`VKeyWitness`](VKeyWitness.md)

#### Returns

`void`

#### Source

[src/tx/TxWitnessSet/TxWitnessSet.ts:101](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/tx/TxWitnessSet/TxWitnessSet.ts#L101)

***

### bootstrapWitnesses?

> **`optional`** **`readonly`** **bootstrapWitnesses**: [`BootstrapWitness`](BootstrapWitness.md)[]

#### Implementation of

[`ITxWitnessSet`](../interfaces/ITxWitnessSet.md).[`bootstrapWitnesses`](../interfaces/ITxWitnessSet.md#bootstrapwitnesses)

#### Source

[src/tx/TxWitnessSet/TxWitnessSet.ts:89](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/tx/TxWitnessSet/TxWitnessSet.ts#L89)

***

### datums?

> **`optional`** **`readonly`** **datums**: `Data`[]

#### Implementation of

[`ITxWitnessSet`](../interfaces/ITxWitnessSet.md).[`datums`](../interfaces/ITxWitnessSet.md#datums)

#### Source

[src/tx/TxWitnessSet/TxWitnessSet.ts:91](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/tx/TxWitnessSet/TxWitnessSet.ts#L91)

***

### isComplete

> **`readonly`** **isComplete**: `boolean`

#### Source

[src/tx/TxWitnessSet/TxWitnessSet.ts:113](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/tx/TxWitnessSet/TxWitnessSet.ts#L113)

***

### nativeScripts?

> **`optional`** **`readonly`** **nativeScripts**: [`Script`](Script.md)\<[`NativeScript`](../enumerations/ScriptType.md#nativescript)\>[]

#### Implementation of

[`ITxWitnessSet`](../interfaces/ITxWitnessSet.md).[`nativeScripts`](../interfaces/ITxWitnessSet.md#nativescripts)

#### Source

[src/tx/TxWitnessSet/TxWitnessSet.ts:88](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/tx/TxWitnessSet/TxWitnessSet.ts#L88)

***

### plutusV1Scripts?

> **`optional`** **`readonly`** **plutusV1Scripts**: [`Script`](Script.md)\<[`PlutusV1`](../enumerations/ScriptType.md#plutusv1)\>[]

#### Implementation of

[`ITxWitnessSet`](../interfaces/ITxWitnessSet.md).[`plutusV1Scripts`](../interfaces/ITxWitnessSet.md#plutusv1scripts)

#### Source

[src/tx/TxWitnessSet/TxWitnessSet.ts:90](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/tx/TxWitnessSet/TxWitnessSet.ts#L90)

***

### plutusV2Scripts?

> **`optional`** **`readonly`** **plutusV2Scripts**: [`Script`](Script.md)\<[`PlutusV2`](../enumerations/ScriptType.md#plutusv2)\>[]

#### Implementation of

[`ITxWitnessSet`](../interfaces/ITxWitnessSet.md).[`plutusV2Scripts`](../interfaces/ITxWitnessSet.md#plutusv2scripts)

#### Source

[src/tx/TxWitnessSet/TxWitnessSet.ts:93](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/tx/TxWitnessSet/TxWitnessSet.ts#L93)

***

### plutusV3Scripts?

> **`optional`** **`readonly`** **plutusV3Scripts**: [`Script`](Script.md)\<[`PlutusV3`](../enumerations/ScriptType.md#plutusv3)\>[]

#### Implementation of

[`ITxWitnessSet`](../interfaces/ITxWitnessSet.md).[`plutusV3Scripts`](../interfaces/ITxWitnessSet.md#plutusv3scripts)

#### Source

[src/tx/TxWitnessSet/TxWitnessSet.ts:94](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/tx/TxWitnessSet/TxWitnessSet.ts#L94)

***

### redeemers?

> **`optional`** **`readonly`** **redeemers**: [`TxRedeemer`](TxRedeemer.md)[]

#### Implementation of

[`ITxWitnessSet`](../interfaces/ITxWitnessSet.md).[`redeemers`](../interfaces/ITxWitnessSet.md#redeemers)

#### Source

[src/tx/TxWitnessSet/TxWitnessSet.ts:92](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/tx/TxWitnessSet/TxWitnessSet.ts#L92)

***

### vkeyWitnesses?

> **`optional`** **`readonly`** **vkeyWitnesses**: [`VKeyWitness`](VKeyWitness.md)[]

#### Implementation of

[`ITxWitnessSet`](../interfaces/ITxWitnessSet.md).[`vkeyWitnesses`](../interfaces/ITxWitnessSet.md#vkeywitnesses)

#### Source

[src/tx/TxWitnessSet/TxWitnessSet.ts:87](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/tx/TxWitnessSet/TxWitnessSet.ts#L87)

## Methods

### toCbor()

> **toCbor**(): `CborString`

#### Returns

`CborString`

#### Implementation of

`ToCbor.toCbor`

#### Source

[src/tx/TxWitnessSet/TxWitnessSet.ts:223](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/tx/TxWitnessSet/TxWitnessSet.ts#L223)

***

### toCborObj()

> **toCborObj**(): `CborObj`

#### Returns

`CborObj`

#### Implementation of

`ToCbor.toCborObj`

#### Source

[src/tx/TxWitnessSet/TxWitnessSet.ts:227](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/tx/TxWitnessSet/TxWitnessSet.ts#L227)

***

### toJson()

> **toJson**(): `Object`

#### Returns

`Object`

##### bootstrapWitnesses

> **bootstrapWitnesses**: `undefined` \| `Object`[]

##### datums

> **datums**: `undefined` \| `any`[]

##### nativeScripts

> **nativeScripts**: `undefined` \| ([`ScriptSignature`](../interfaces/ScriptSignature.md) \| [`ScriptAll`](../interfaces/ScriptAll.md) \| [`ScriptAny`](../interfaces/ScriptAny.md) \| [`ScriptAtLeast`](../interfaces/ScriptAtLeast.md) \| [`ScriptAfter`](../interfaces/ScriptAfter.md) \| [`ScriptBefore`](../interfaces/ScriptBefore.md) \| `Object`)[]

##### plutusV1Scripts

> **plutusV1Scripts**: `undefined` \| ([`ScriptSignature`](../interfaces/ScriptSignature.md) \| [`ScriptAll`](../interfaces/ScriptAll.md) \| [`ScriptAny`](../interfaces/ScriptAny.md) \| [`ScriptAtLeast`](../interfaces/ScriptAtLeast.md) \| [`ScriptAfter`](../interfaces/ScriptAfter.md) \| [`ScriptBefore`](../interfaces/ScriptBefore.md) \| `Object`)[]

##### plutusV2Scripts

> **plutusV2Scripts**: `undefined` \| ([`ScriptSignature`](../interfaces/ScriptSignature.md) \| [`ScriptAll`](../interfaces/ScriptAll.md) \| [`ScriptAny`](../interfaces/ScriptAny.md) \| [`ScriptAtLeast`](../interfaces/ScriptAtLeast.md) \| [`ScriptAfter`](../interfaces/ScriptAfter.md) \| [`ScriptBefore`](../interfaces/ScriptBefore.md) \| `Object`)[]

##### plutusV3Scripts

> **plutusV3Scripts**: `undefined` \| ([`ScriptSignature`](../interfaces/ScriptSignature.md) \| [`ScriptAll`](../interfaces/ScriptAll.md) \| [`ScriptAny`](../interfaces/ScriptAny.md) \| [`ScriptAtLeast`](../interfaces/ScriptAtLeast.md) \| [`ScriptAfter`](../interfaces/ScriptAfter.md) \| [`ScriptBefore`](../interfaces/ScriptBefore.md) \| `Object`)[]

##### redeemers

> **redeemers**: `undefined` \| `Object`[]

##### vkeyWitnesses

> **vkeyWitnesses**: `undefined` \| `Object`[]

#### Implementation of

`ToJson.toJson`

#### Source

[src/tx/TxWitnessSet/TxWitnessSet.ts:209](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/tx/TxWitnessSet/TxWitnessSet.ts#L209)

***

### fromCbor()

> **`static`** **fromCbor**(`cStr`): [`TxWitnessSet`](TxWitnessSet.md)

#### Parameters

• **cStr**: `CanBeCborString`

#### Returns

[`TxWitnessSet`](TxWitnessSet.md)

#### Source

[src/tx/TxWitnessSet/TxWitnessSet.ts:305](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/tx/TxWitnessSet/TxWitnessSet.ts#L305)

***

### fromCborObj()

> **`static`** **fromCborObj**(`cObj`): [`TxWitnessSet`](TxWitnessSet.md)

#### Parameters

• **cObj**: `CborObj`

#### Returns

[`TxWitnessSet`](TxWitnessSet.md)

#### Source

[src/tx/TxWitnessSet/TxWitnessSet.ts:309](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/tx/TxWitnessSet/TxWitnessSet.ts#L309)
