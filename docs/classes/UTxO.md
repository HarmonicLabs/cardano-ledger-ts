[**@harmoniclabs/cardano-ledger-ts**](../README.md) • **Docs**

***

[@harmoniclabs/cardano-ledger-ts](../globals.md) / UTxO

# Class: UTxO

## Extended by

- [`TxIn`](TxIn.md)

## Implements

- [`IUTxO`](../interfaces/IUTxO.md)
- `ToData`
- `ToJson`
- `ToCbor`
- `Cloneable`\<[`UTxO`](UTxO.md)\>

## Constructors

### new UTxO()

> **new UTxO**(`utxo`): [`UTxO`](UTxO.md)

#### Parameters

• **utxo**: [`IUTxO`](../interfaces/IUTxO.md)

#### Returns

[`UTxO`](UTxO.md)

#### Defined in

[src/tx/body/output/UTxO.ts:32](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/tx/body/output/UTxO.ts#L32)

## Properties

### resolved

> `readonly` **resolved**: [`TxOut`](TxOut.md)

#### Implementation of

[`IUTxO`](../interfaces/IUTxO.md).[`resolved`](../interfaces/IUTxO.md#resolved)

#### Defined in

[src/tx/body/output/UTxO.ts:30](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/tx/body/output/UTxO.ts#L30)

***

### utxoRef

> `readonly` **utxoRef**: [`TxOutRef`](TxOutRef.md)

#### Implementation of

[`IUTxO`](../interfaces/IUTxO.md).[`utxoRef`](../interfaces/IUTxO.md#utxoref)

#### Defined in

[src/tx/body/output/UTxO.ts:29](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/tx/body/output/UTxO.ts#L29)

## Methods

### clone()

> **clone**(): [`UTxO`](UTxO.md)

#### Returns

[`UTxO`](UTxO.md)

#### Implementation of

`Cloneable.clone`

#### Defined in

[src/tx/body/output/UTxO.ts:47](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/tx/body/output/UTxO.ts#L47)

***

### toCbor()

> **toCbor**(): `CborString`

#### Returns

`CborString`

#### Implementation of

`ToCbor.toCbor`

#### Defined in

[src/tx/body/output/UTxO.ts:63](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/tx/body/output/UTxO.ts#L63)

***

### toCborObj()

> **toCborObj**(): `CborArray`

#### Returns

`CborArray`

#### Implementation of

`ToCbor.toCborObj`

#### Defined in

[src/tx/body/output/UTxO.ts:67](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/tx/body/output/UTxO.ts#L67)

***

### toData()

> **toData**(`version`?): `Data`

#### Parameters

• **version?**: `ToDataVersion`

#### Returns

`Data`

#### Implementation of

`ToData.toData`

#### Defined in

[src/tx/body/output/UTxO.ts:52](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/tx/body/output/UTxO.ts#L52)

***

### toJson()

> **toJson**(): `object`

#### Returns

`object`

##### resolved

> **resolved**: `object`

##### resolved.address

> **address**: \`addr1$\{string\}\` \| \`addr\_test1$\{string\}\`

##### resolved.datum

> **datum**: `any`

##### resolved.refScript

> **refScript**: `undefined` \| [`ScriptSignature`](../interfaces/ScriptSignature.md) \| [`ScriptAll`](../interfaces/ScriptAll.md) \| [`ScriptAny`](../interfaces/ScriptAny.md) \| [`ScriptAtLeast`](../interfaces/ScriptAtLeast.md) \| [`ScriptAfter`](../interfaces/ScriptAfter.md) \| [`ScriptBefore`](../interfaces/ScriptBefore.md) \| `object`

##### resolved.value

> **value**: [`ValueJson`](../type-aliases/ValueJson.md)

##### utxoRef

> **utxoRef**: [`UTxORefJson`](../type-aliases/UTxORefJson.md)

#### Implementation of

`ToJson.toJson`

#### Defined in

[src/tx/body/output/UTxO.ts:107](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/tx/body/output/UTxO.ts#L107)

***

### fromCbor()

> `static` **fromCbor**(`cStr`): [`UTxO`](UTxO.md)

#### Parameters

• **cStr**: `CanBeCborString`

#### Returns

[`UTxO`](UTxO.md)

#### Defined in

[src/tx/body/output/UTxO.ts:75](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/tx/body/output/UTxO.ts#L75)

***

### fromCborObj()

> `static` **fromCborObj**(`cObj`): [`UTxO`](UTxO.md)

#### Parameters

• **cObj**: `CborObj`

#### Returns

[`UTxO`](UTxO.md)

#### Defined in

[src/tx/body/output/UTxO.ts:79](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/tx/body/output/UTxO.ts#L79)

***

### sort()

> `static` **sort**(`a`, `b`): `number`

#### Parameters

• **a**: [`IUTxO`](../interfaces/IUTxO.md)

• **b**: [`IUTxO`](../interfaces/IUTxO.md)

#### Returns

`number`

#### Defined in

[src/tx/body/output/UTxO.ts:115](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/tx/body/output/UTxO.ts#L115)
