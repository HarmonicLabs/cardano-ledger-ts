[**@harmoniclabs/cardano-ledger-ts**](../README.md) • **Docs**

***

[@harmoniclabs/cardano-ledger-ts](../globals.md) / GovActionNoConfidence

# Class: GovActionNoConfidence

## Implements

- [`IGovAction`](../interfaces/IGovAction.md)
- [`IGovActionNoConfidence`](../interfaces/IGovActionNoConfidence.md)
- `ToCbor`
- `ToData`

## Constructors

### new GovActionNoConfidence()

> **new GovActionNoConfidence**(`__namedParameters`): [`GovActionNoConfidence`](GovActionNoConfidence.md)

#### Parameters

• **\_\_namedParameters**: [`IGovActionNoConfidence`](../interfaces/IGovActionNoConfidence.md)

#### Returns

[`GovActionNoConfidence`](GovActionNoConfidence.md)

#### Defined in

[src/governance/GovAction/GovActionNoConfidence.ts:28](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/governance/GovAction/GovActionNoConfidence.ts#L28)

## Properties

### govActionId

> `readonly` **govActionId**: `undefined` \| [`TxOutRef`](TxOutRef.md)

#### Implementation of

[`IGovActionNoConfidence`](../interfaces/IGovActionNoConfidence.md).[`govActionId`](../interfaces/IGovActionNoConfidence.md#govactionid)

#### Defined in

[src/governance/GovAction/GovActionNoConfidence.ts:26](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/governance/GovAction/GovActionNoConfidence.ts#L26)

***

### govActionType

> `readonly` **govActionType**: [`NoConfidence`](../enumerations/GovActionType.md#noconfidence)

#### Implementation of

[`IGovAction`](../interfaces/IGovAction.md).[`govActionType`](../interfaces/IGovAction.md#govactiontype)

#### Defined in

[src/governance/GovAction/GovActionNoConfidence.ts:25](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/governance/GovAction/GovActionNoConfidence.ts#L25)

## Methods

### toCbor()

> **toCbor**(): `CborString`

#### Returns

`CborString`

#### Implementation of

`ToCbor.toCbor`

#### Defined in

[src/governance/GovAction/GovActionNoConfidence.ts:38](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/governance/GovAction/GovActionNoConfidence.ts#L38)

***

### toCborObj()

> **toCborObj**(): `CborArray`

#### Returns

`CborArray`

#### Implementation of

`ToCbor.toCborObj`

#### Defined in

[src/governance/GovAction/GovActionNoConfidence.ts:42](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/governance/GovAction/GovActionNoConfidence.ts#L42)

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

[src/governance/GovAction/GovActionNoConfidence.ts:50](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/governance/GovAction/GovActionNoConfidence.ts#L50)
