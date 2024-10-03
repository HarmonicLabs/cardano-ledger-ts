[**@harmoniclabs/cardano-ledger-ts**](../README.md) • **Docs**

***

[@harmoniclabs/cardano-ledger-ts](../globals.md) / Value

# Class: Value

## Implements

- `ToCbor`
- `ToData`

## Constructors

### new Value()

> **new Value**(`map`): [`Value`](Value.md)

#### Parameters

• **map**: [`IValue`](../type-aliases/IValue.md)

#### Returns

[`Value`](Value.md)

#### Defined in

[src/ledger/Value/Value.ts:47](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/Value/Value.ts#L47)

## Properties

### lovelaces

> `readonly` **lovelaces**: `bigint`

#### Defined in

[src/ledger/Value/Value.ts:114](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/Value/Value.ts#L114)

***

### map

> `readonly` **map**: [`NormalizedIValue`](../type-aliases/NormalizedIValue.md)

#### Defined in

[src/ledger/Value/Value.ts:36](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/Value/Value.ts#L36)

## Accessors

### zero

> `get` `static` **zero**(): [`Value`](Value.md)

#### Returns

[`Value`](Value.md)

#### Defined in

[src/ledger/Value/Value.ts:178](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/Value/Value.ts#L178)

## Methods

### \[iterator\]()

> **\[iterator\]**(): `Generator`\<`object`, `void`, `unknown`\>

#### Returns

`Generator`\<`object`, `void`, `unknown`\>

##### assets

> **assets**: [`IValueAssetBI`](../type-aliases/IValueAssetBI.md)[]

##### policy

> **policy**: `string`

#### Defined in

[src/ledger/Value/Value.ts:38](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/Value/Value.ts#L38)

***

### clone()

> **clone**(): [`Value`](Value.md)

#### Returns

[`Value`](Value.md)

#### Defined in

[src/ledger/Value/Value.ts:287](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/Value/Value.ts#L287)

***

### get()

> **get**(`policy`, `assetName`): `bigint`

#### Parameters

• **policy**: `string` \| `Uint8Array` \| [`Hash28`](Hash28.md)

• **assetName**: `Uint8Array`

#### Returns

`bigint`

#### Defined in

[src/ledger/Value/Value.ts:116](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/Value/Value.ts#L116)

***

### toCbor()

> **toCbor**(): `CborString`

#### Returns

`CborString`

#### Implementation of

`ToCbor.toCbor`

#### Defined in

[src/ledger/Value/Value.ts:313](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/Value/Value.ts#L313)

***

### toCborObj()

> **toCborObj**(): `CborObj`

#### Returns

`CborObj`

#### Implementation of

`ToCbor.toCborObj`

#### Defined in

[src/ledger/Value/Value.ts:317](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/Value/Value.ts#L317)

***

### toData()

> **toData**(): `DataMap`\<`DataB`, `DataMap`\<`DataB`, `DataI`\>\>

#### Returns

`DataMap`\<`DataB`, `DataMap`\<`DataB`, `DataI`\>\>

#### Implementation of

`ToData.toData`

#### Defined in

[src/ledger/Value/Value.ts:292](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/Value/Value.ts#L292)

***

### toJson()

> **toJson**(): [`ValueJson`](../type-aliases/ValueJson.md)

#### Returns

[`ValueJson`](../type-aliases/ValueJson.md)

#### Defined in

[src/ledger/Value/Value.ts:449](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/Value/Value.ts#L449)

***

### toString()

> **toString**(`includeLovelaces`): `string`

cardano-cli format

#### Parameters

• **includeLovelaces**: `boolean` = `true`

#### Returns

`string`

#### Defined in

[src/ledger/Value/Value.ts:457](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/Value/Value.ts#L457)

***

### toUnits()

> **toUnits**(): [`ValueUnitsBI`](../type-aliases/ValueUnitsBI.md)

#### Returns

[`ValueUnitsBI`](../type-aliases/ValueUnitsBI.md)

#### Defined in

[src/ledger/Value/Value.ts:135](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/Value/Value.ts#L135)

***

### add()

> `static` **add**(`a`, `b`): [`Value`](Value.md)

#### Parameters

• **a**: [`Value`](Value.md)

• **b**: [`Value`](Value.md)

#### Returns

[`Value`](Value.md)

#### Defined in

[src/ledger/Value/Value.ts:277](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/Value/Value.ts#L277)

***

### assetEntry()

> `static` **assetEntry**(`name`, `qty`): [`IValueAssetBI`](../type-aliases/IValueAssetBI.md)

#### Parameters

• **name**: `Uint8Array`

• **qty**: `number` \| `bigint`

#### Returns

[`IValueAssetBI`](../type-aliases/IValueAssetBI.md)

#### Defined in

[src/ledger/Value/Value.ts:227](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/Value/Value.ts#L227)

***

### entry()

> `static` **entry**(`policy`, `assets`): [`NormalizedIValuePolicyEntry`](../interfaces/NormalizedIValuePolicyEntry.md)

#### Parameters

• **policy**: [`Hash28`](Hash28.md)

• **assets**: [`IValueAsset`](../type-aliases/IValueAsset.md)[]

#### Returns

[`NormalizedIValuePolicyEntry`](../interfaces/NormalizedIValuePolicyEntry.md)

#### Defined in

[src/ledger/Value/Value.ts:269](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/Value/Value.ts#L269)

***

### fromCbor()

> `static` **fromCbor**(`cStr`): [`Value`](Value.md)

#### Parameters

• **cStr**: `CanBeCborString`

#### Returns

[`Value`](Value.md)

#### Defined in

[src/ledger/Value/Value.ts:350](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/Value/Value.ts#L350)

***

### fromCborObj()

> `static` **fromCborObj**(`cObj`): [`Value`](Value.md)

#### Parameters

• **cObj**: `CborObj`

#### Returns

[`Value`](Value.md)

#### Defined in

[src/ledger/Value/Value.ts:354](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/Value/Value.ts#L354)

***

### fromUnits()

> `static` **fromUnits**(`units`): [`Value`](Value.md)

#### Parameters

• **units**: [`ValueUnits`](../type-aliases/ValueUnits.md)

#### Returns

[`Value`](Value.md)

#### Defined in

[src/ledger/Value/Value.ts:150](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/Value/Value.ts#L150)

***

### isAdaOnly()

> `static` **isAdaOnly**(`v`): `boolean`

#### Parameters

• **v**: [`Value`](Value.md)

#### Returns

`boolean`

#### Defined in

[src/ledger/Value/Value.ts:204](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/Value/Value.ts#L204)

***

### isPositive()

> `static` **isPositive**(`v`): `boolean`

#### Parameters

• **v**: [`Value`](Value.md)

#### Returns

`boolean`

#### Defined in

[src/ledger/Value/Value.ts:195](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/Value/Value.ts#L195)

***

### isZero()

> `static` **isZero**(`v`): `boolean`

#### Parameters

• **v**: [`Value`](Value.md)

#### Returns

`boolean`

#### Defined in

[src/ledger/Value/Value.ts:183](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/Value/Value.ts#L183)

***

### lovelaceEntry()

> `static` **lovelaceEntry**(`n`): [`NormalizedIValueAdaEntry`](../type-aliases/NormalizedIValueAdaEntry.md)

#### Parameters

• **n**: `CanBeUInteger`

#### Returns

[`NormalizedIValueAdaEntry`](../type-aliases/NormalizedIValueAdaEntry.md)

#### Defined in

[src/ledger/Value/Value.ts:209](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/Value/Value.ts#L209)

***

### lovelaces()

> `static` **lovelaces**(`n`): [`Value`](Value.md)

#### Parameters

• **n**: `number` \| `bigint`

#### Returns

[`Value`](Value.md)

#### Defined in

[src/ledger/Value/Value.ts:222](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/Value/Value.ts#L222)

***

### singleAsset()

> `static` **singleAsset**(`policy`, `name`, `qty`): [`Value`](Value.md)

#### Parameters

• **policy**: [`Hash28`](Hash28.md)

• **name**: `Uint8Array`

• **qty**: `number` \| `bigint`

#### Returns

[`Value`](Value.md)

#### Defined in

[src/ledger/Value/Value.ts:254](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/Value/Value.ts#L254)

***

### singleAssetEntry()

> `static` **singleAssetEntry**(`policy`, `name`, `qty`): [`NormalizedIValuePolicyEntry`](../interfaces/NormalizedIValuePolicyEntry.md)

#### Parameters

• **policy**: [`Hash28`](Hash28.md)

• **name**: `Uint8Array`

• **qty**: `number` \| `bigint`

#### Returns

[`NormalizedIValuePolicyEntry`](../interfaces/NormalizedIValuePolicyEntry.md)

#### Defined in

[src/ledger/Value/Value.ts:242](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/Value/Value.ts#L242)

***

### sub()

> `static` **sub**(`a`, `b`): [`Value`](Value.md)

#### Parameters

• **a**: [`Value`](Value.md)

• **b**: [`Value`](Value.md)

#### Returns

[`Value`](Value.md)

#### Defined in

[src/ledger/Value/Value.ts:282](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/Value/Value.ts#L282)
