[**@harmoniclabs/cardano-ledger-ts**](../README.md) • **Docs**

***

[@harmoniclabs/cardano-ledger-ts](../globals.md) / TxIn

# Class: TxIn

## Extends

- [`UTxO`](UTxO.md)

## Constructors

### new TxIn()

> **new TxIn**(`utxo`): [`TxIn`](TxIn.md)

#### Parameters

• **utxo**: [`IUTxO`](../interfaces/IUTxO.md)

#### Returns

[`TxIn`](TxIn.md)

#### Inherited from

[`UTxO`](UTxO.md).[`constructor`](UTxO.md#constructors)

#### Defined in

[src/tx/body/output/UTxO.ts:32](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/tx/body/output/UTxO.ts#L32)

## Properties

### resolved

> `readonly` **resolved**: [`TxOut`](TxOut.md)

#### Inherited from

[`UTxO`](UTxO.md).[`resolved`](UTxO.md#resolved)

#### Defined in

[src/tx/body/output/UTxO.ts:30](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/tx/body/output/UTxO.ts#L30)

***

### utxoRef

> `readonly` **utxoRef**: [`TxOutRef`](TxOutRef.md)

#### Inherited from

[`UTxO`](UTxO.md).[`utxoRef`](UTxO.md#utxoref)

#### Defined in

[src/tx/body/output/UTxO.ts:29](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/tx/body/output/UTxO.ts#L29)

## Methods

### clone()

> **clone**(): [`UTxO`](UTxO.md)

#### Returns

[`UTxO`](UTxO.md)

#### Inherited from

[`UTxO`](UTxO.md).[`clone`](UTxO.md#clone)

#### Defined in

[src/tx/body/output/UTxO.ts:47](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/tx/body/output/UTxO.ts#L47)

***

### toCbor()

> **toCbor**(): `CborString`

#### Returns

`CborString`

#### Inherited from

[`UTxO`](UTxO.md).[`toCbor`](UTxO.md#tocbor)

#### Defined in

[src/tx/body/output/UTxO.ts:63](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/tx/body/output/UTxO.ts#L63)

***

### toCborObj()

> **toCborObj**(): `CborArray`

#### Returns

`CborArray`

#### Inherited from

[`UTxO`](UTxO.md).[`toCborObj`](UTxO.md#tocborobj)

#### Defined in

[src/tx/body/output/UTxO.ts:67](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/tx/body/output/UTxO.ts#L67)

***

### toData()

> **toData**(`version`?): `Data`

#### Parameters

• **version?**: `ToDataVersion`

#### Returns

`Data`

#### Inherited from

[`UTxO`](UTxO.md).[`toData`](UTxO.md#todata)

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

#### Inherited from

[`UTxO`](UTxO.md).[`toJson`](UTxO.md#tojson)

#### Defined in

[src/tx/body/output/UTxO.ts:107](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/tx/body/output/UTxO.ts#L107)

***

### fromCbor()

> `static` **fromCbor**(`cStr`): [`UTxO`](UTxO.md)

#### Parameters

• **cStr**: `CanBeCborString`

#### Returns

[`UTxO`](UTxO.md)

#### Inherited from

[`UTxO`](UTxO.md).[`fromCbor`](UTxO.md#fromcbor)

#### Defined in

[src/tx/body/output/UTxO.ts:75](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/tx/body/output/UTxO.ts#L75)

***

### fromCborObj()

> `static` **fromCborObj**(`cObj`): [`UTxO`](UTxO.md)

#### Parameters

• **cObj**: `CborObj`

#### Returns

[`UTxO`](UTxO.md)

#### Inherited from

[`UTxO`](UTxO.md).[`fromCborObj`](UTxO.md#fromcborobj)

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

#### Inherited from

[`UTxO`](UTxO.md).[`sort`](UTxO.md#sort)

#### Defined in

[src/tx/body/output/UTxO.ts:115](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/tx/body/output/UTxO.ts#L115)
