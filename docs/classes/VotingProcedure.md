[**@harmoniclabs/cardano-ledger-ts**](../README.md) • **Docs**

***

[@harmoniclabs/cardano-ledger-ts](../globals.md) / VotingProcedure

# Class: VotingProcedure

## Implements

- [`IVotingProcedure`](../interfaces/IVotingProcedure.md)

## Constructors

### new VotingProcedure()

> **new VotingProcedure**(`__namedParameters`): [`VotingProcedure`](VotingProcedure.md)

#### Parameters

• **\_\_namedParameters**: [`IVotingProcedure`](../interfaces/IVotingProcedure.md)

#### Returns

[`VotingProcedure`](VotingProcedure.md)

#### Defined in

[src/governance/VotingProcedure.ts:28](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/governance/VotingProcedure.ts#L28)

## Properties

### anchor

> `readonly` **anchor**: `undefined` \| [`Anchor`](Anchor.md)

#### Implementation of

[`IVotingProcedure`](../interfaces/IVotingProcedure.md).[`anchor`](../interfaces/IVotingProcedure.md#anchor)

#### Defined in

[src/governance/VotingProcedure.ts:26](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/governance/VotingProcedure.ts#L26)

***

### vote

> `readonly` **vote**: [`Vote`](../enumerations/Vote.md)

#### Implementation of

[`IVotingProcedure`](../interfaces/IVotingProcedure.md).[`vote`](../interfaces/IVotingProcedure.md#vote)

#### Defined in

[src/governance/VotingProcedure.ts:25](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/governance/VotingProcedure.ts#L25)

## Methods

### toCbor()

> **toCbor**(): `CborString`

#### Returns

`CborString`

#### Defined in

[src/governance/VotingProcedure.ts:38](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/governance/VotingProcedure.ts#L38)

***

### toCborObj()

> **toCborObj**(): `CborObj`

#### Returns

`CborObj`

#### Defined in

[src/governance/VotingProcedure.ts:42](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/governance/VotingProcedure.ts#L42)
