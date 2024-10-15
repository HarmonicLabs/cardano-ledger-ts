[**@harmoniclabs/cardano-ledger-ts**](../README.md) • **Docs**

***

[@harmoniclabs/cardano-ledger-ts](../globals.md) / partialProtocolParamsToJson

# Function: partialProtocolParamsToJson()

> **partialProtocolParamsToJson**(`pp`): `object`

## Parameters

• **pp**: `Partial`\<[`ProtocolParameters`](../interfaces/ProtocolParameters.md)\>

## Returns

`object`

### collateralPercentage?

> `optional` **collateralPercentage**: `CanBeUInteger`

### committeeTermLimit?

> `optional` **committeeTermLimit**: `CanBeUInteger`

### costModels

> **costModels**: `undefined` \| `object`

### drepActivityPeriod?

> `optional` **drepActivityPeriod**: `CanBeUInteger`

### drepDeposit?

> `optional` **drepDeposit**: `CanBeUInteger`

### drepVotingThresholds?

> `optional` **drepVotingThresholds**: [`PParamsDrepVotingThresholds`](../interfaces/PParamsDrepVotingThresholds.md)

### executionUnitPrices

> **executionUnitPrices**: `undefined` \| `object`

### governanceActionDeposit?

> `optional` **governanceActionDeposit**: `CanBeUInteger`

### governanceActionValidityPeriod?

> `optional` **governanceActionValidityPeriod**: `CanBeUInteger`

### maxBlockBodySize?

> `optional` **maxBlockBodySize**: `CanBeUInteger`

### maxBlockExecutionUnits

> **maxBlockExecutionUnits**: `undefined` \| `ExBudgetJson` \| `object`

### maxBlockHeaderSize?

> `optional` **maxBlockHeaderSize**: `CanBeUInteger`

### maxCollateralInputs?

> `optional` **maxCollateralInputs**: `CanBeUInteger`

### maxTxExecutionUnits

> **maxTxExecutionUnits**: `undefined` \| `ExBudgetJson` \| `object`

### maxTxSize?

> `optional` **maxTxSize**: `CanBeUInteger`

### maxValueSize?

> `optional` **maxValueSize**: `CanBeUInteger`

### minCommitteSize?

> `optional` **minCommitteSize**: `CanBeUInteger`

### minPoolCost?

> `optional` **minPoolCost**: `CanBeUInteger`

### minfeeRefScriptCostPerByte?

> `optional` **minfeeRefScriptCostPerByte**: [`Rational`](../type-aliases/Rational.md)

### monetaryExpansion

> **monetaryExpansion**: `undefined` \| `number`

### poolPledgeInfluence

> **poolPledgeInfluence**: `undefined` \| `number`

### poolRetireMaxEpoch?

> `optional` **poolRetireMaxEpoch**: `CanBeUInteger`

### poolVotingThresholds?

> `optional` **poolVotingThresholds**: [`PParamsPoolVotingThresholds`](../interfaces/PParamsPoolVotingThresholds.md)

### ~~protocolVersion?~~

> `optional` **protocolVersion**: [`IProtocolVerision`](../type-aliases/IProtocolVerision.md)

#### Deprecated

protocolVersion removed in conway

### stakeAddressDeposit?

> `optional` **stakeAddressDeposit**: `CanBeUInteger`

### stakePoolDeposit?

> `optional` **stakePoolDeposit**: `CanBeUInteger`

### stakePoolTargetNum?

> `optional` **stakePoolTargetNum**: `CanBeUInteger`

### treasuryCut

> **treasuryCut**: `undefined` \| `number`

### txFeeFixed?

> `optional` **txFeeFixed**: `CanBeUInteger`

### txFeePerByte?

> `optional` **txFeePerByte**: `CanBeUInteger`

### utxoCostPerByte?

> `optional` **utxoCostPerByte**: `CanBeUInteger`

## Defined in

[src/ledger/protocol/ProtocolParameters.ts:552](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/protocol/ProtocolParameters.ts#L552)
