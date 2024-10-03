[**@harmoniclabs/cardano-ledger-ts**](../README.md) • **Docs**

***

[@harmoniclabs/cardano-ledger-ts](../globals.md) / GovActionInfo

# Class: GovActionInfo

## Implements

- [`IGovAction`](../interfaces/IGovAction.md)
- [`IGovActionInfo`](../interfaces/IGovActionInfo.md)
- `ToCbor`

## Constructors

### new GovActionInfo()

> **new GovActionInfo**(`_info`?): [`GovActionInfo`](GovActionInfo.md)

#### Parameters

• **\_info?**: [`IGovActionInfo`](../interfaces/IGovActionInfo.md)

#### Returns

[`GovActionInfo`](GovActionInfo.md)

#### Defined in

[src/governance/GovAction/GovActionInfo.ts:20](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/governance/GovAction/GovActionInfo.ts#L20)

## Properties

### govActionType

> `readonly` **govActionType**: [`Info`](../enumerations/GovActionType.md#info)

#### Implementation of

[`IGovAction`](../interfaces/IGovAction.md).[`govActionType`](../interfaces/IGovAction.md#govactiontype)

#### Defined in

[src/governance/GovAction/GovActionInfo.ts:18](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/governance/GovAction/GovActionInfo.ts#L18)

## Methods

### toCbor()

> **toCbor**(): `CborString`

#### Returns

`CborString`

#### Implementation of

`ToCbor.toCbor`

#### Defined in

[src/governance/GovAction/GovActionInfo.ts:29](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/governance/GovAction/GovActionInfo.ts#L29)

***

### toCborObj()

> **toCborObj**(): `CborArray`

#### Returns

`CborArray`

#### Implementation of

`ToCbor.toCborObj`

#### Defined in

[src/governance/GovAction/GovActionInfo.ts:33](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/governance/GovAction/GovActionInfo.ts#L33)

***

### toData()

> **toData**(`v`?): `DataConstr`

#### Parameters

• **v?**: `ToDataVersion`

#### Returns

`DataConstr`

#### Defined in

[src/governance/GovAction/GovActionInfo.ts:40](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/governance/GovAction/GovActionInfo.ts#L40)
