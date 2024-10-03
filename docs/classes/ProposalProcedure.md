[**@harmoniclabs/cardano-ledger-ts**](../README.md) • **Docs**

***

[@harmoniclabs/cardano-ledger-ts](../globals.md) / ProposalProcedure

# Class: ProposalProcedure

## Implements

- [`IProposalProcedure`](../interfaces/IProposalProcedure.md)
- `ToCbor`
- `ToData`

## Constructors

### new ProposalProcedure()

> **new ProposalProcedure**(`__namedParameters`): [`ProposalProcedure`](ProposalProcedure.md)

#### Parameters

• **\_\_namedParameters**: [`IProposalProcedure`](../interfaces/IProposalProcedure.md)

#### Returns

[`ProposalProcedure`](ProposalProcedure.md)

#### Defined in

[src/governance/ProposalProcedure.ts:38](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/governance/ProposalProcedure.ts#L38)

## Properties

### anchor

> `readonly` **anchor**: [`Anchor`](Anchor.md)

#### Implementation of

[`IProposalProcedure`](../interfaces/IProposalProcedure.md).[`anchor`](../interfaces/IProposalProcedure.md#anchor)

#### Defined in

[src/governance/ProposalProcedure.ts:36](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/governance/ProposalProcedure.ts#L36)

***

### deposit

> `readonly` **deposit**: `bigint`

#### Implementation of

[`IProposalProcedure`](../interfaces/IProposalProcedure.md).[`deposit`](../interfaces/IProposalProcedure.md#deposit)

#### Defined in

[src/governance/ProposalProcedure.ts:33](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/governance/ProposalProcedure.ts#L33)

***

### govAction

> `readonly` **govAction**: [`GovAction`](../type-aliases/GovAction.md)

#### Implementation of

[`IProposalProcedure`](../interfaces/IProposalProcedure.md).[`govAction`](../interfaces/IProposalProcedure.md#govaction)

#### Defined in

[src/governance/ProposalProcedure.ts:35](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/governance/ProposalProcedure.ts#L35)

***

### rewardAccount

> `readonly` **rewardAccount**: [`StakeAddress`](StakeAddress.md)\<[`StakeAddressType`](../type-aliases/StakeAddressType.md)\>

#### Implementation of

[`IProposalProcedure`](../interfaces/IProposalProcedure.md).[`rewardAccount`](../interfaces/IProposalProcedure.md#rewardaccount)

#### Defined in

[src/governance/ProposalProcedure.ts:34](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/governance/ProposalProcedure.ts#L34)

## Methods

### toCbor()

> **toCbor**(): `CborString`

#### Returns

`CborString`

#### Implementation of

`ToCbor.toCbor`

#### Defined in

[src/governance/ProposalProcedure.ts:50](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/governance/ProposalProcedure.ts#L50)

***

### toCborObj()

> **toCborObj**(): `CborArray`

#### Returns

`CborArray`

#### Implementation of

`ToCbor.toCborObj`

#### Defined in

[src/governance/ProposalProcedure.ts:54](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/governance/ProposalProcedure.ts#L54)

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

[src/governance/ProposalProcedure.ts:64](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/governance/ProposalProcedure.ts#L64)
