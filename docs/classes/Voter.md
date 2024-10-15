[**@harmoniclabs/cardano-ledger-ts**](../README.md) • **Docs**

***

[@harmoniclabs/cardano-ledger-ts](../globals.md) / Voter

# Class: Voter

## Implements

- [`IVoter`](../interfaces/IVoter.md)
- `ToData`

## Constructors

### new Voter()

> **new Voter**(`__namedParameters`): [`Voter`](Voter.md)

#### Parameters

• **\_\_namedParameters**: [`IVoter`](../interfaces/IVoter.md)

#### Returns

[`Voter`](Voter.md)

#### Defined in

[src/governance/Voter.ts:70](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/governance/Voter.ts#L70)

## Properties

### hash

> `readonly` **hash**: [`Hash28`](Hash28.md)

#### Implementation of

[`IVoter`](../interfaces/IVoter.md).[`hash`](../interfaces/IVoter.md#hash)

#### Defined in

[src/governance/Voter.ts:68](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/governance/Voter.ts#L68)

***

### kind

> `readonly` **kind**: [`VoterKind`](../enumerations/VoterKind.md)

#### Implementation of

[`IVoter`](../interfaces/IVoter.md).[`kind`](../interfaces/IVoter.md#kind)

#### Defined in

[src/governance/Voter.ts:67](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/governance/Voter.ts#L67)

## Methods

### toCborObj()

> **toCborObj**(): `CborArray`

#### Returns

`CborArray`

#### Defined in

[src/governance/Voter.ts:101](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/governance/Voter.ts#L101)

***

### toData()

> **toData**(`version`?): `DataConstr`

#### Parameters

• **version?**: `ToDataVersion`

#### Returns

`DataConstr`

#### Implementation of

`ToData.toData`

#### Defined in

[src/governance/Voter.ts:109](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/governance/Voter.ts#L109)

***

### ConstitutionalCommitteKeyHash()

> `static` **ConstitutionalCommitteKeyHash**(`hash`): [`Voter`](Voter.md)

#### Parameters

• **hash**: [`CanBeHash28`](../type-aliases/CanBeHash28.md)

#### Returns

[`Voter`](Voter.md)

#### Defined in

[src/governance/Voter.ts:80](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/governance/Voter.ts#L80)

***

### ConstitutionalCommitteScript()

> `static` **ConstitutionalCommitteScript**(`hash`): [`Voter`](Voter.md)

#### Parameters

• **hash**: [`CanBeHash28`](../type-aliases/CanBeHash28.md)

#### Returns

[`Voter`](Voter.md)

#### Defined in

[src/governance/Voter.ts:84](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/governance/Voter.ts#L84)

***

### DRepKeyHash()

> `static` **DRepKeyHash**(`hash`): [`Voter`](Voter.md)

#### Parameters

• **hash**: [`CanBeHash28`](../type-aliases/CanBeHash28.md)

#### Returns

[`Voter`](Voter.md)

#### Defined in

[src/governance/Voter.ts:88](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/governance/Voter.ts#L88)

***

### DRepScript()

> `static` **DRepScript**(`hash`): [`Voter`](Voter.md)

#### Parameters

• **hash**: [`CanBeHash28`](../type-aliases/CanBeHash28.md)

#### Returns

[`Voter`](Voter.md)

#### Defined in

[src/governance/Voter.ts:92](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/governance/Voter.ts#L92)

***

### StakingPoolKeyHash()

> `static` **StakingPoolKeyHash**(`hash`): [`Voter`](Voter.md)

#### Parameters

• **hash**: [`CanBeHash28`](../type-aliases/CanBeHash28.md)

#### Returns

[`Voter`](Voter.md)

#### Defined in

[src/governance/Voter.ts:96](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/governance/Voter.ts#L96)
