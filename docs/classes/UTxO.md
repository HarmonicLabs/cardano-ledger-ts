**@harmoniclabs/cardano-ledger-ts** • [Readme](../README.md) \| [API](../globals.md)

***

[@harmoniclabs/cardano-ledger-ts](../README.md) / UTxO

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

### new UTxO(utxo)

> **new UTxO**(`utxo`): [`UTxO`](UTxO.md)

#### Parameters

• **utxo**: [`IUTxO`](../interfaces/IUTxO.md)

#### Returns

[`UTxO`](UTxO.md)

#### Source

[src/tx/body/output/UTxO.ts:30](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/tx/body/output/UTxO.ts#L30)

## Properties

### resolved

> **`readonly`** **resolved**: [`TxOut`](TxOut.md)

#### Implementation of

[`IUTxO`](../interfaces/IUTxO.md).[`resolved`](../interfaces/IUTxO.md#resolved)

#### Source

[src/tx/body/output/UTxO.ts:28](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/tx/body/output/UTxO.ts#L28)

***

### utxoRef

> **`readonly`** **utxoRef**: [`TxOutRef`](TxOutRef.md)

#### Implementation of

[`IUTxO`](../interfaces/IUTxO.md).[`utxoRef`](../interfaces/IUTxO.md#utxoref)

#### Source

[src/tx/body/output/UTxO.ts:27](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/tx/body/output/UTxO.ts#L27)

## Methods

### clone()

> **clone**(): [`UTxO`](UTxO.md)

#### Returns

[`UTxO`](UTxO.md)

#### Implementation of

`Cloneable.clone`

#### Source

[src/tx/body/output/UTxO.ts:45](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/tx/body/output/UTxO.ts#L45)

***

### toCbor()

> **toCbor**(): `CborString`

#### Returns

`CborString`

#### Implementation of

`ToCbor.toCbor`

#### Source

[src/tx/body/output/UTxO.ts:61](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/tx/body/output/UTxO.ts#L61)

***

### toCborObj()

> **toCborObj**(): `CborArray`

#### Returns

`CborArray`

#### Implementation of

`ToCbor.toCborObj`

#### Source

[src/tx/body/output/UTxO.ts:65](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/tx/body/output/UTxO.ts#L65)

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

#### Implementation of

`ToJson.toJson`

#### Source

[src/tx/body/output/UTxO.ts:105](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/tx/body/output/UTxO.ts#L105)

***

### fromCbor()

> **`static`** **fromCbor**(`cStr`): [`UTxO`](UTxO.md)

#### Parameters

• **cStr**: `CanBeCborString`

#### Returns

[`UTxO`](UTxO.md)

#### Source

[src/tx/body/output/UTxO.ts:73](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/tx/body/output/UTxO.ts#L73)

***

### fromCborObj()

> **`static`** **fromCborObj**(`cObj`): [`UTxO`](UTxO.md)

#### Parameters

• **cObj**: `CborObj`

#### Returns

[`UTxO`](UTxO.md)

#### Source

[src/tx/body/output/UTxO.ts:77](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/tx/body/output/UTxO.ts#L77)
