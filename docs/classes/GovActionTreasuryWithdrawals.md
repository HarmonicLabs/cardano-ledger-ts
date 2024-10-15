[**@harmoniclabs/cardano-ledger-ts**](../README.md) • **Docs**

***

[@harmoniclabs/cardano-ledger-ts](../globals.md) / GovActionTreasuryWithdrawals

# Class: GovActionTreasuryWithdrawals

## Implements

- [`IGovAction`](../interfaces/IGovAction.md)
- [`IGovActionTreasuryWithdrawals`](../interfaces/IGovActionTreasuryWithdrawals.md)
- `ToCbor`
- `ToData`

## Constructors

### new GovActionTreasuryWithdrawals()

> **new GovActionTreasuryWithdrawals**(`__namedParameters`): [`GovActionTreasuryWithdrawals`](GovActionTreasuryWithdrawals.md)

#### Parameters

• **\_\_namedParameters**: [`IGovActionTreasuryWithdrawals`](../interfaces/IGovActionTreasuryWithdrawals.md)

#### Returns

[`GovActionTreasuryWithdrawals`](GovActionTreasuryWithdrawals.md)

#### Defined in

[src/governance/GovAction/GovActionTreasuryWithdrawals.ts:32](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/governance/GovAction/GovActionTreasuryWithdrawals.ts#L32)

## Properties

### govActionType

> `readonly` **govActionType**: [`TreasuryWithdrawals`](../enumerations/GovActionType.md#treasurywithdrawals)

#### Implementation of

[`IGovAction`](../interfaces/IGovAction.md).[`govActionType`](../interfaces/IGovAction.md#govactiontype)

#### Defined in

[src/governance/GovAction/GovActionTreasuryWithdrawals.ts:28](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/governance/GovAction/GovActionTreasuryWithdrawals.ts#L28)

***

### policyHash

> `readonly` **policyHash**: `undefined` \| [`Hash28`](Hash28.md)

#### Implementation of

[`IGovActionTreasuryWithdrawals`](../interfaces/IGovActionTreasuryWithdrawals.md).[`policyHash`](../interfaces/IGovActionTreasuryWithdrawals.md#policyhash)

#### Defined in

[src/governance/GovAction/GovActionTreasuryWithdrawals.ts:30](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/governance/GovAction/GovActionTreasuryWithdrawals.ts#L30)

***

### withdrawals

> `readonly` **withdrawals**: [`TxWithdrawals`](TxWithdrawals.md)

#### Implementation of

[`IGovActionTreasuryWithdrawals`](../interfaces/IGovActionTreasuryWithdrawals.md).[`withdrawals`](../interfaces/IGovActionTreasuryWithdrawals.md#withdrawals)

#### Defined in

[src/governance/GovAction/GovActionTreasuryWithdrawals.ts:29](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/governance/GovAction/GovActionTreasuryWithdrawals.ts#L29)

## Methods

### toCbor()

> **toCbor**(): `CborString`

#### Returns

`CborString`

#### Implementation of

`ToCbor.toCbor`

#### Defined in

[src/governance/GovAction/GovActionTreasuryWithdrawals.ts:49](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/governance/GovAction/GovActionTreasuryWithdrawals.ts#L49)

***

### toCborObj()

> **toCborObj**(): `CborArray`

#### Returns

`CborArray`

#### Implementation of

`ToCbor.toCborObj`

#### Defined in

[src/governance/GovAction/GovActionTreasuryWithdrawals.ts:53](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/governance/GovAction/GovActionTreasuryWithdrawals.ts#L53)

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

[src/governance/GovAction/GovActionTreasuryWithdrawals.ts:62](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/governance/GovAction/GovActionTreasuryWithdrawals.ts#L62)
