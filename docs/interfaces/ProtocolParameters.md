[**@harmoniclabs/cardano-ledger-ts**](../README.md) • **Docs**

***

[@harmoniclabs/cardano-ledger-ts](../globals.md) / ProtocolParameters

# Interface: ProtocolParameters

## Properties

### collateralPercentage

> **collateralPercentage**: `CanBeUInteger`

#### Defined in

[src/ledger/protocol/ProtocolParameters.ts:43](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/protocol/ProtocolParameters.ts#L43)

***

### committeeTermLimit

> **committeeTermLimit**: `CanBeUInteger`

#### Defined in

[src/ledger/protocol/ProtocolParameters.ts:49](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/protocol/ProtocolParameters.ts#L49)

***

### costModels

> **costModels**: `CostModels`

#### Defined in

[src/ledger/protocol/ProtocolParameters.ts:32](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/protocol/ProtocolParameters.ts#L32)

***

### drepActivityPeriod

> **drepActivityPeriod**: `CanBeUInteger`

#### Defined in

[src/ledger/protocol/ProtocolParameters.ts:53](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/protocol/ProtocolParameters.ts#L53)

***

### drepDeposit

> **drepDeposit**: `CanBeUInteger`

#### Defined in

[src/ledger/protocol/ProtocolParameters.ts:52](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/protocol/ProtocolParameters.ts#L52)

***

### drepVotingThresholds

> **drepVotingThresholds**: [`PParamsDrepVotingThresholds`](PParamsDrepVotingThresholds.md)

#### Defined in

[src/ledger/protocol/ProtocolParameters.ts:47](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/protocol/ProtocolParameters.ts#L47)

***

### executionUnitPrices

> **executionUnitPrices**: [`CborPositiveRational`, `CborPositiveRational`] \| `object`

#### Defined in

[src/ledger/protocol/ProtocolParameters.ts:33](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/protocol/ProtocolParameters.ts#L33)

***

### governanceActionDeposit

> **governanceActionDeposit**: `CanBeUInteger`

#### Defined in

[src/ledger/protocol/ProtocolParameters.ts:51](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/protocol/ProtocolParameters.ts#L51)

***

### governanceActionValidityPeriod

> **governanceActionValidityPeriod**: `CanBeUInteger`

#### Defined in

[src/ledger/protocol/ProtocolParameters.ts:50](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/protocol/ProtocolParameters.ts#L50)

***

### maxBlockBodySize

> **maxBlockBodySize**: `CanBeUInteger`

#### Defined in

[src/ledger/protocol/ProtocolParameters.ts:18](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/protocol/ProtocolParameters.ts#L18)

***

### maxBlockExecutionUnits

> **maxBlockExecutionUnits**: `ExBudget` \| `ExBudgetJson`

#### Defined in

[src/ledger/protocol/ProtocolParameters.ts:41](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/protocol/ProtocolParameters.ts#L41)

***

### maxBlockHeaderSize

> **maxBlockHeaderSize**: `CanBeUInteger`

#### Defined in

[src/ledger/protocol/ProtocolParameters.ts:20](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/protocol/ProtocolParameters.ts#L20)

***

### maxCollateralInputs

> **maxCollateralInputs**: `CanBeUInteger`

#### Defined in

[src/ledger/protocol/ProtocolParameters.ts:44](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/protocol/ProtocolParameters.ts#L44)

***

### maxTxExecutionUnits

> **maxTxExecutionUnits**: `ExBudget` \| `ExBudgetJson`

#### Defined in

[src/ledger/protocol/ProtocolParameters.ts:40](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/protocol/ProtocolParameters.ts#L40)

***

### maxTxSize

> **maxTxSize**: `CanBeUInteger`

#### Defined in

[src/ledger/protocol/ProtocolParameters.ts:19](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/protocol/ProtocolParameters.ts#L19)

***

### maxValueSize

> **maxValueSize**: `CanBeUInteger`

#### Defined in

[src/ledger/protocol/ProtocolParameters.ts:42](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/protocol/ProtocolParameters.ts#L42)

***

### minCommitteSize

> **minCommitteSize**: `CanBeUInteger`

#### Defined in

[src/ledger/protocol/ProtocolParameters.ts:48](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/protocol/ProtocolParameters.ts#L48)

***

### minPoolCost

> **minPoolCost**: `CanBeUInteger`

#### Defined in

[src/ledger/protocol/ProtocolParameters.ts:30](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/protocol/ProtocolParameters.ts#L30)

***

### minfeeRefScriptCostPerByte

> **minfeeRefScriptCostPerByte**: [`Rational`](../type-aliases/Rational.md)

#### Defined in

[src/ledger/protocol/ProtocolParameters.ts:54](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/protocol/ProtocolParameters.ts#L54)

***

### monetaryExpansion

> **monetaryExpansion**: [`Rational`](../type-aliases/Rational.md)

#### Defined in

[src/ledger/protocol/ProtocolParameters.ts:26](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/protocol/ProtocolParameters.ts#L26)

***

### poolPledgeInfluence

> **poolPledgeInfluence**: [`Rational`](../type-aliases/Rational.md)

#### Defined in

[src/ledger/protocol/ProtocolParameters.ts:25](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/protocol/ProtocolParameters.ts#L25)

***

### poolRetireMaxEpoch

> **poolRetireMaxEpoch**: `CanBeUInteger`

#### Defined in

[src/ledger/protocol/ProtocolParameters.ts:23](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/protocol/ProtocolParameters.ts#L23)

***

### poolVotingThresholds

> **poolVotingThresholds**: [`PParamsPoolVotingThresholds`](PParamsPoolVotingThresholds.md)

#### Defined in

[src/ledger/protocol/ProtocolParameters.ts:46](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/protocol/ProtocolParameters.ts#L46)

***

### ~~protocolVersion?~~

> `optional` **protocolVersion**: [`IProtocolVerision`](../type-aliases/IProtocolVerision.md)

#### Deprecated

protocolVersion removed in conway

#### Defined in

[src/ledger/protocol/ProtocolParameters.ts:29](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/protocol/ProtocolParameters.ts#L29)

***

### stakeAddressDeposit

> **stakeAddressDeposit**: `CanBeUInteger`

#### Defined in

[src/ledger/protocol/ProtocolParameters.ts:21](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/protocol/ProtocolParameters.ts#L21)

***

### stakePoolDeposit

> **stakePoolDeposit**: `CanBeUInteger`

#### Defined in

[src/ledger/protocol/ProtocolParameters.ts:22](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/protocol/ProtocolParameters.ts#L22)

***

### stakePoolTargetNum

> **stakePoolTargetNum**: `CanBeUInteger`

#### Defined in

[src/ledger/protocol/ProtocolParameters.ts:24](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/protocol/ProtocolParameters.ts#L24)

***

### treasuryCut

> **treasuryCut**: [`Rational`](../type-aliases/Rational.md)

#### Defined in

[src/ledger/protocol/ProtocolParameters.ts:27](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/protocol/ProtocolParameters.ts#L27)

***

### txFeeFixed

> **txFeeFixed**: `CanBeUInteger`

#### Defined in

[src/ledger/protocol/ProtocolParameters.ts:17](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/protocol/ProtocolParameters.ts#L17)

***

### txFeePerByte

> **txFeePerByte**: `CanBeUInteger`

#### Defined in

[src/ledger/protocol/ProtocolParameters.ts:16](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/protocol/ProtocolParameters.ts#L16)

***

### utxoCostPerByte

> **utxoCostPerByte**: `CanBeUInteger`

#### Defined in

[src/ledger/protocol/ProtocolParameters.ts:31](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/protocol/ProtocolParameters.ts#L31)
