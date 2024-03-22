**@harmoniclabs/cardano-ledger-ts** • [Readme](../README.md) \| [API](../globals.md)

***

[@harmoniclabs/cardano-ledger-ts](../README.md) / TxIn

# Class: TxIn

## Extends

- [`UTxO`](UTxO.md)

## Constructors

### new TxIn(utxo)

> **new TxIn**(`utxo`): [`TxIn`](TxIn.md)

#### Parameters

• **utxo**: [`IUTxO`](../interfaces/IUTxO.md)

#### Returns

[`TxIn`](TxIn.md)

#### Inherited from

[`UTxO`](UTxO.md).[`constructor`](UTxO.md#constructors)

#### Source

[src/tx/body/output/UTxO.ts:30](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/tx/body/output/UTxO.ts#L30)

## Properties

### resolved

> **`readonly`** **resolved**: [`TxOut`](TxOut.md)

#### Inherited from

[`UTxO`](UTxO.md).[`resolved`](UTxO.md#resolved)

#### Source

[src/tx/body/output/UTxO.ts:28](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/tx/body/output/UTxO.ts#L28)

***

### utxoRef

> **`readonly`** **utxoRef**: [`TxOutRef`](TxOutRef.md)

#### Inherited from

[`UTxO`](UTxO.md).[`utxoRef`](UTxO.md#utxoref)

#### Source

[src/tx/body/output/UTxO.ts:27](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/tx/body/output/UTxO.ts#L27)

## Methods

### clone()

> **clone**(): [`UTxO`](UTxO.md)

#### Returns

[`UTxO`](UTxO.md)

#### Inherited from

[`UTxO`](UTxO.md).[`clone`](UTxO.md#clone)

#### Source

[src/tx/body/output/UTxO.ts:45](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/tx/body/output/UTxO.ts#L45)

***

### toCbor()

> **toCbor**(): `CborString`

#### Returns

`CborString`

#### Inherited from

[`UTxO`](UTxO.md).[`toCbor`](UTxO.md#tocbor)

#### Source

[src/tx/body/output/UTxO.ts:61](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/tx/body/output/UTxO.ts#L61)

***

### toCborObj()

> **toCborObj**(): `CborArray`

#### Returns

`CborArray`

#### Inherited from

[`UTxO`](UTxO.md).[`toCborObj`](UTxO.md#tocborobj)

#### Source

[src/tx/body/output/UTxO.ts:65](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/tx/body/output/UTxO.ts#L65)

***

### toData()

> **toData**(`version`): `Data`

#### Parameters

• **version**: `"v1"` \| `"v2"`= `"v2"`

#### Returns

`Data`

#### Inherited from

[`UTxO`](UTxO.md).[`toData`](UTxO.md#todata)

#### Source

[src/tx/body/output/UTxO.ts:50](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/tx/body/output/UTxO.ts#L50)

***

### toJson()

> **toJson**(): `Object`

#### Returns

`Object`

##### resolved

> **resolved**: `Object`

##### resolved.address

> **address**: \`addr1${string}\` \| \`addr_test1${string}\`

##### resolved.datum

> **datum**: `any`

##### resolved.refScript

> **refScript**: `undefined` \| [`ScriptSignature`](../interfaces/ScriptSignature.md) \| [`ScriptAll`](../interfaces/ScriptAll.md) \| [`ScriptAny`](../interfaces/ScriptAny.md) \| [`ScriptAtLeast`](../interfaces/ScriptAtLeast.md) \| [`ScriptAfter`](../interfaces/ScriptAfter.md) \| [`ScriptBefore`](../interfaces/ScriptBefore.md) \| `Object`

##### resolved.value

> **value**: [`ValueJson`](../type-aliases/ValueJson.md)

##### utxoRef

> **utxoRef**: [`UTxORefJson`](../type-aliases/UTxORefJson.md)

#### Inherited from

[`UTxO`](UTxO.md).[`toJson`](UTxO.md#tojson)

#### Source

[src/tx/body/output/UTxO.ts:105](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/tx/body/output/UTxO.ts#L105)

***

### fromCbor()

> **`static`** **fromCbor**(`cStr`): [`UTxO`](UTxO.md)

#### Parameters

• **cStr**: `CanBeCborString`

#### Returns

[`UTxO`](UTxO.md)

#### Inherited from

[`UTxO`](UTxO.md).[`fromCbor`](UTxO.md#fromcbor)

#### Source

[src/tx/body/output/UTxO.ts:73](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/tx/body/output/UTxO.ts#L73)

***

### fromCborObj()

> **`static`** **fromCborObj**(`cObj`): [`UTxO`](UTxO.md)

#### Parameters

• **cObj**: `CborObj`

#### Returns

[`UTxO`](UTxO.md)

#### Inherited from

[`UTxO`](UTxO.md).[`fromCborObj`](UTxO.md#fromcborobj)

#### Source

[src/tx/body/output/UTxO.ts:77](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/tx/body/output/UTxO.ts#L77)
