[**@harmoniclabs/cardano-ledger-ts**](../README.md) • **Docs**

***

[@harmoniclabs/cardano-ledger-ts](../globals.md) / GovActionNewConstitution

# Class: GovActionNewConstitution

## Implements

- [`IGovAction`](../interfaces/IGovAction.md)
- [`IGovActionNewConstitution`](../interfaces/IGovActionNewConstitution.md)
- `ToCbor`
- `ToData`

## Constructors

### new GovActionNewConstitution()

> **new GovActionNewConstitution**(`__namedParameters`): [`GovActionNewConstitution`](GovActionNewConstitution.md)

#### Parameters

• **\_\_namedParameters**: [`IGovActionNewConstitution`](../interfaces/IGovActionNewConstitution.md)

#### Returns

[`GovActionNewConstitution`](GovActionNewConstitution.md)

#### Defined in

[src/governance/GovAction/GovActionNewConstitution.ts:32](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/governance/GovAction/GovActionNewConstitution.ts#L32)

## Properties

### constitution

> `readonly` **constitution**: [`Constitution`](Constitution.md)

#### Implementation of

[`IGovActionNewConstitution`](../interfaces/IGovActionNewConstitution.md).[`constitution`](../interfaces/IGovActionNewConstitution.md#constitution)

#### Defined in

[src/governance/GovAction/GovActionNewConstitution.ts:30](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/governance/GovAction/GovActionNewConstitution.ts#L30)

***

### govActionId

> `readonly` **govActionId**: `undefined` \| [`TxOutRef`](TxOutRef.md)

#### Implementation of

[`IGovActionNewConstitution`](../interfaces/IGovActionNewConstitution.md).[`govActionId`](../interfaces/IGovActionNewConstitution.md#govactionid)

#### Defined in

[src/governance/GovAction/GovActionNewConstitution.ts:29](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/governance/GovAction/GovActionNewConstitution.ts#L29)

***

### govActionType

> `readonly` **govActionType**: [`NewConstitution`](../enumerations/GovActionType.md#newconstitution)

#### Implementation of

[`IGovAction`](../interfaces/IGovAction.md).[`govActionType`](../interfaces/IGovAction.md#govactiontype)

#### Defined in

[src/governance/GovAction/GovActionNewConstitution.ts:28](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/governance/GovAction/GovActionNewConstitution.ts#L28)

## Methods

### toCbor()

> **toCbor**(): `CborString`

#### Returns

`CborString`

#### Implementation of

`ToCbor.toCbor`

#### Defined in

[src/governance/GovAction/GovActionNewConstitution.ts:43](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/governance/GovAction/GovActionNewConstitution.ts#L43)

***

### toCborObj()

> **toCborObj**(): `CborArray`

#### Returns

`CborArray`

#### Implementation of

`ToCbor.toCborObj`

#### Defined in

[src/governance/GovAction/GovActionNewConstitution.ts:47](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/governance/GovAction/GovActionNewConstitution.ts#L47)

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

[src/governance/GovAction/GovActionNewConstitution.ts:56](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/governance/GovAction/GovActionNewConstitution.ts#L56)
