[**@harmoniclabs/cardano-ledger-ts**](../README.md) • **Docs**

***

[@harmoniclabs/cardano-ledger-ts](../globals.md) / GovActionParameterChange

# Class: GovActionParameterChange

## Implements

- [`IGovAction`](../interfaces/IGovAction.md)
- [`IGovActionParameterChange`](../interfaces/IGovActionParameterChange.md)
- `ToCbor`
- `ToData`

## Constructors

### new GovActionParameterChange()

> **new GovActionParameterChange**(`__namedParameters`): [`GovActionParameterChange`](GovActionParameterChange.md)

#### Parameters

• **\_\_namedParameters**: [`IGovActionParameterChange`](../interfaces/IGovActionParameterChange.md)

#### Returns

[`GovActionParameterChange`](GovActionParameterChange.md)

#### Defined in

[src/governance/GovAction/GovActionParameterChange.ts:36](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/governance/GovAction/GovActionParameterChange.ts#L36)

## Properties

### govActionId

> `readonly` **govActionId**: `undefined` \| [`TxOutRef`](TxOutRef.md)

#### Implementation of

[`IGovActionParameterChange`](../interfaces/IGovActionParameterChange.md).[`govActionId`](../interfaces/IGovActionParameterChange.md#govactionid)

#### Defined in

[src/governance/GovAction/GovActionParameterChange.ts:32](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/governance/GovAction/GovActionParameterChange.ts#L32)

***

### govActionType

> `readonly` **govActionType**: [`ParameterChange`](../enumerations/GovActionType.md#parameterchange)

#### Implementation of

[`IGovAction`](../interfaces/IGovAction.md).[`govActionType`](../interfaces/IGovAction.md#govactiontype)

#### Defined in

[src/governance/GovAction/GovActionParameterChange.ts:31](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/governance/GovAction/GovActionParameterChange.ts#L31)

***

### policyHash

> `readonly` **policyHash**: `undefined` \| [`Hash28`](Hash28.md)

#### Implementation of

[`IGovActionParameterChange`](../interfaces/IGovActionParameterChange.md).[`policyHash`](../interfaces/IGovActionParameterChange.md#policyhash)

#### Defined in

[src/governance/GovAction/GovActionParameterChange.ts:34](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/governance/GovAction/GovActionParameterChange.ts#L34)

***

### protocolParamsUpdate

> `readonly` **protocolParamsUpdate**: `Partial`\<[`ProtocolParameters`](../interfaces/ProtocolParameters.md)\>

#### Implementation of

[`IGovActionParameterChange`](../interfaces/IGovActionParameterChange.md).[`protocolParamsUpdate`](../interfaces/IGovActionParameterChange.md#protocolparamsupdate)

#### Defined in

[src/governance/GovAction/GovActionParameterChange.ts:33](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/governance/GovAction/GovActionParameterChange.ts#L33)

## Methods

### toCbor()

> **toCbor**(): `CborString`

#### Returns

`CborString`

#### Implementation of

`ToCbor.toCbor`

#### Defined in

[src/governance/GovAction/GovActionParameterChange.ts:48](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/governance/GovAction/GovActionParameterChange.ts#L48)

***

### toCborObj()

> **toCborObj**(): `CborArray`

#### Returns

`CborArray`

#### Implementation of

`ToCbor.toCborObj`

#### Defined in

[src/governance/GovAction/GovActionParameterChange.ts:52](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/governance/GovAction/GovActionParameterChange.ts#L52)

***

### toData()

> **toData**(`v`?): `DataConstr`

#### Parameters

• **v?**: `ToDataVersion`

#### Returns

`DataConstr`

#### Implementation of

`ToData.toData`

#### Defined in

[src/governance/GovAction/GovActionParameterChange.ts:62](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/governance/GovAction/GovActionParameterChange.ts#L62)
