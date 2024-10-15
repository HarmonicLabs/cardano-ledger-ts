[**@harmoniclabs/cardano-ledger-ts**](../README.md) • **Docs**

***

[@harmoniclabs/cardano-ledger-ts](../globals.md) / IAuxiliaryData

# Interface: IAuxiliaryData

## Properties

### metadata?

> `optional` **metadata**: [`TxMetadata`](../classes/TxMetadata.md)

#### Defined in

[src/tx/AuxiliaryData/AuxiliaryData.ts:13](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/tx/AuxiliaryData/AuxiliaryData.ts#L13)

***

### nativeScripts?

> `optional` **nativeScripts**: ([`NativeScript`](../type-aliases/NativeScript.md) \| [`Script`](../classes/Script.md)\<[`NativeScript`](../enumerations/ScriptType.md#nativescript)\>)[]

#### Defined in

[src/tx/AuxiliaryData/AuxiliaryData.ts:14](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/tx/AuxiliaryData/AuxiliaryData.ts#L14)

***

### plutusV1Scripts?

> `optional` **plutusV1Scripts**: ([`Script`](../classes/Script.md)\<[`PlutusV1`](../enumerations/ScriptType.md#plutusv1)\> \| [`PlutusScriptJsonFormat`](PlutusScriptJsonFormat.md)\<[`PlutusV1`](../enumerations/ScriptType.md#plutusv1) \| `"PlutusScriptV1"`\>)[]

#### Defined in

[src/tx/AuxiliaryData/AuxiliaryData.ts:15](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/tx/AuxiliaryData/AuxiliaryData.ts#L15)

***

### plutusV2Scripts?

> `optional` **plutusV2Scripts**: ([`Script`](../classes/Script.md)\<[`PlutusV2`](../enumerations/ScriptType.md#plutusv2)\> \| [`PlutusScriptJsonFormat`](PlutusScriptJsonFormat.md)\<[`PlutusV2`](../enumerations/ScriptType.md#plutusv2) \| `"PlutusScriptV2"`\>)[]

#### Defined in

[src/tx/AuxiliaryData/AuxiliaryData.ts:16](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/tx/AuxiliaryData/AuxiliaryData.ts#L16)
