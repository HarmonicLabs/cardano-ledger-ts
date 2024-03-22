**@harmoniclabs/cardano-ledger-ts** • [Readme](../README.md) \| [API](../globals.md)

***

[@harmoniclabs/cardano-ledger-ts](../README.md) / Value

# Class: Value

## Implements

- `ToCbor`
- `ToData`

## Constructors

### new Value(map)

> **new Value**(`map`): [`Value`](Value.md)

#### Parameters

• **map**: [`IValue`](../type-aliases/IValue.md)

#### Returns

[`Value`](Value.md)

#### Source

[src/ledger/Value/Value.ts:45](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/ledger/Value/Value.ts#L45)

## Properties

### lovelaces

> **`readonly`** **lovelaces**: `bigint`

#### Source

[src/ledger/Value/Value.ts:110](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/ledger/Value/Value.ts#L110)

***

### map

> **`readonly`** **map**: [`IValue`](../type-aliases/IValue.md)

#### Source

[src/ledger/Value/Value.ts:34](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/ledger/Value/Value.ts#L34)

## Accessors

### zero

> **`get`** **`static`** **zero**(): [`Value`](Value.md)

#### Returns

[`Value`](Value.md)

#### Source

[src/ledger/Value/Value.ts:174](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/ledger/Value/Value.ts#L174)

## Methods

### `[iterator]`()

> **[iterator]**(): `Generator`\<`Object`, `void`, `unknown`\>

#### Returns

`Generator`\<`Object`, `void`, `unknown`\>

> ##### assets
>
> > **assets**: [`IValueAssets`](../type-aliases/IValueAssets.md)
>
> ##### policy
>
> > **policy**: `string`
>

#### Source

[src/ledger/Value/Value.ts:36](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/ledger/Value/Value.ts#L36)

***

### clone()

> **clone**(): [`Value`](Value.md)

#### Returns

[`Value`](Value.md)

#### Source

[src/ledger/Value/Value.ts:283](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/ledger/Value/Value.ts#L283)

***

### get()

> **get**(`policy`, `assetName`): `bigint`

#### Parameters

• **policy**: `string` \| `Uint8Array` \| [`Hash28`](Hash28.md)

• **assetName**: `Uint8Array`

#### Returns

`bigint`

#### Source

[src/ledger/Value/Value.ts:112](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/ledger/Value/Value.ts#L112)

***

### toCbor()

> **toCbor**(): `CborString`

#### Returns

`CborString`

#### Implementation of

`ToCbor.toCbor`

#### Source

[src/ledger/Value/Value.ts:309](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/ledger/Value/Value.ts#L309)

***

### toCborObj()

> **toCborObj**(): `CborObj`

#### Returns

`CborObj`

#### Implementation of

`ToCbor.toCborObj`

#### Source

[src/ledger/Value/Value.ts:313](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/ledger/Value/Value.ts#L313)

***

### toData()

> **toData**(): `DataMap`\<`DataB`, `DataMap`\<`DataB`, `DataI`\>\>

#### Returns

`DataMap`\<`DataB`, `DataMap`\<`DataB`, `DataI`\>\>

#### Implementation of

`ToData.toData`

#### Source

[src/ledger/Value/Value.ts:288](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/ledger/Value/Value.ts#L288)

***

### toJson()

> **toJson**(): [`ValueJson`](../type-aliases/ValueJson.md)

#### Returns

[`ValueJson`](../type-aliases/ValueJson.md)

#### Source

[src/ledger/Value/Value.ts:445](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/ledger/Value/Value.ts#L445)

***

### toString()

> **toString**(`includeLovelaces`): `string`

cardano-cli format

#### Parameters

• **includeLovelaces**: `boolean`= `true`

#### Returns

`string`

#### Source

[src/ledger/Value/Value.ts:453](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/ledger/Value/Value.ts#L453)

***

### toUnits()

> **toUnits**(): [`ValueUnitsBI`](../type-aliases/ValueUnitsBI.md)

#### Returns

[`ValueUnitsBI`](../type-aliases/ValueUnitsBI.md)

#### Source

[src/ledger/Value/Value.ts:131](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/ledger/Value/Value.ts#L131)

***

### add()

> **`static`** **add**(`a`, `b`): [`Value`](Value.md)

#### Parameters

• **a**: [`Value`](Value.md)

• **b**: [`Value`](Value.md)

#### Returns

[`Value`](Value.md)

#### Source

[src/ledger/Value/Value.ts:273](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/ledger/Value/Value.ts#L273)

***

### assetEntry()

> **`static`** **assetEntry**(`name`, `qty`): [`IValueAsset`](../type-aliases/IValueAsset.md)

#### Parameters

• **name**: `Uint8Array`

• **qty**: `number` \| `bigint`

#### Returns

[`IValueAsset`](../type-aliases/IValueAsset.md)

#### Source

[src/ledger/Value/Value.ts:223](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/ledger/Value/Value.ts#L223)

***

### entry()

> **`static`** **entry**(`policy`, `assets`): [`IValuePolicyEntry`](../type-aliases/IValuePolicyEntry.md)

#### Parameters

• **policy**: [`Hash28`](Hash28.md)

• **assets**: [`IValueAssets`](../type-aliases/IValueAssets.md)

#### Returns

[`IValuePolicyEntry`](../type-aliases/IValuePolicyEntry.md)

#### Source

[src/ledger/Value/Value.ts:265](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/ledger/Value/Value.ts#L265)

***

### fromCbor()

> **`static`** **fromCbor**(`cStr`): [`Value`](Value.md)

#### Parameters

• **cStr**: `CanBeCborString`

#### Returns

[`Value`](Value.md)

#### Source

[src/ledger/Value/Value.ts:346](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/ledger/Value/Value.ts#L346)

***

### fromCborObj()

> **`static`** **fromCborObj**(`cObj`): [`Value`](Value.md)

#### Parameters

• **cObj**: `CborObj`

#### Returns

[`Value`](Value.md)

#### Source

[src/ledger/Value/Value.ts:350](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/ledger/Value/Value.ts#L350)

***

### fromUnits()

> **`static`** **fromUnits**(`units`): [`Value`](Value.md)

#### Parameters

• **units**: [`ValueUnits`](../type-aliases/ValueUnits.md)

#### Returns

[`Value`](Value.md)

#### Source

[src/ledger/Value/Value.ts:146](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/ledger/Value/Value.ts#L146)

***

### isAdaOnly()

> **`static`** **isAdaOnly**(`v`): `boolean`

#### Parameters

• **v**: [`Value`](Value.md)

#### Returns

`boolean`

#### Source

[src/ledger/Value/Value.ts:200](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/ledger/Value/Value.ts#L200)

***

### isPositive()

> **`static`** **isPositive**(`v`): `boolean`

#### Parameters

• **v**: [`Value`](Value.md)

#### Returns

`boolean`

#### Source

[src/ledger/Value/Value.ts:191](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/ledger/Value/Value.ts#L191)

***

### isZero()

> **`static`** **isZero**(`v`): `boolean`

#### Parameters

• **v**: [`Value`](Value.md)

#### Returns

`boolean`

#### Source

[src/ledger/Value/Value.ts:179](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/ledger/Value/Value.ts#L179)

***

### lovelaceEntry()

> **`static`** **lovelaceEntry**(`n`): [`IValueAdaEntry`](../type-aliases/IValueAdaEntry.md)

#### Parameters

• **n**: `CanBeUInteger`

#### Returns

[`IValueAdaEntry`](../type-aliases/IValueAdaEntry.md)

#### Source

[src/ledger/Value/Value.ts:205](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/ledger/Value/Value.ts#L205)

***

### lovelaces()

> **`static`** **lovelaces**(`n`): [`Value`](Value.md)

#### Parameters

• **n**: `number` \| `bigint`

#### Returns

[`Value`](Value.md)

#### Source

[src/ledger/Value/Value.ts:218](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/ledger/Value/Value.ts#L218)

***

### singleAsset()

> **`static`** **singleAsset**(`policy`, `name`, `qty`): [`Value`](Value.md)

#### Parameters

• **policy**: [`Hash28`](Hash28.md)

• **name**: `Uint8Array`

• **qty**: `number` \| `bigint`

#### Returns

[`Value`](Value.md)

#### Source

[src/ledger/Value/Value.ts:250](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/ledger/Value/Value.ts#L250)

***

### singleAssetEntry()

> **`static`** **singleAssetEntry**(`policy`, `name`, `qty`): [`IValuePolicyEntry`](../type-aliases/IValuePolicyEntry.md)

#### Parameters

• **policy**: [`Hash28`](Hash28.md)

• **name**: `Uint8Array`

• **qty**: `number` \| `bigint`

#### Returns

[`IValuePolicyEntry`](../type-aliases/IValuePolicyEntry.md)

#### Source

[src/ledger/Value/Value.ts:238](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/ledger/Value/Value.ts#L238)

***

### sub()

> **`static`** **sub**(`a`, `b`): [`Value`](Value.md)

#### Parameters

• **a**: [`Value`](Value.md)

• **b**: [`Value`](Value.md)

#### Returns

[`Value`](Value.md)

#### Source

[src/ledger/Value/Value.ts:278](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/ledger/Value/Value.ts#L278)
