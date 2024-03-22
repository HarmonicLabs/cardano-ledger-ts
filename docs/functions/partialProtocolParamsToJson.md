**@harmoniclabs/cardano-ledger-ts** • [Readme](../README.md) \| [API](../globals.md)

***

[@harmoniclabs/cardano-ledger-ts](../README.md) / partialProtocolParamsToJson

# Function: partialProtocolParamsToJson()

> **partialProtocolParamsToJson**(`pp`): `Object`

## Parameters

• **pp**: `Partial`\<[`ProtocolParameters`](../interfaces/ProtocolParameters.md)\>

## Returns

`Object`

### collateralPercentage?

> **`optional`** **collateralPercentage**: `CanBeUInteger`

### committeeTermLimit?

> **`optional`** **committeeTermLimit**: `CanBeUInteger`

### costModels

> **costModels**: `undefined` \| `Object`

### drepActivityPeriod?

> **`optional`** **drepActivityPeriod**: `CanBeUInteger`

### drepDeposit?

> **`optional`** **drepDeposit**: `CanBeUInteger`

### drepVotingThresholds?

> **`optional`** **drepVotingThresholds**: `PParamsDrepVotingThresholds`

### executionUnitPrices

> **executionUnitPrices**: `undefined` \| `Object`

### governanceActionDeposit?

> **`optional`** **governanceActionDeposit**: `CanBeUInteger`

### governanceActionValidityPeriod?

> **`optional`** **governanceActionValidityPeriod**: `CanBeUInteger`

### maxBlockBodySize?

> **`optional`** **maxBlockBodySize**: `CanBeUInteger`

### maxBlockExecutionUnits

> **maxBlockExecutionUnits**: `undefined` \| `ExBudgetJson` \| `Object`

### maxBlockHeaderSize?

> **`optional`** **maxBlockHeaderSize**: `CanBeUInteger`

### maxCollateralInputs?

> **`optional`** **maxCollateralInputs**: `CanBeUInteger`

### maxTxExecutionUnits

> **maxTxExecutionUnits**: `undefined` \| `ExBudgetJson` \| `Object`

### maxTxSize?

> **`optional`** **maxTxSize**: `CanBeUInteger`

### maxValueSize?

> **`optional`** **maxValueSize**: `CanBeUInteger`

### minCommitteSize?

> **`optional`** **minCommitteSize**: `CanBeUInteger`

### minPoolCost?

> **`optional`** **minPoolCost**: `CanBeUInteger`

### minfeeRefScriptCostPerByte?

> **`optional`** **minfeeRefScriptCostPerByte**: `Rational`

### monetaryExpansion

> **monetaryExpansion**: `undefined` \| `number`

### poolPledgeInfluence

> **poolPledgeInfluence**: `undefined` \| `number`

### poolRetireMaxEpoch?

> **`optional`** **poolRetireMaxEpoch**: `CanBeUInteger`

### poolVotingThresholds?

> **`optional`** **poolVotingThresholds**: `PParamsPoolVotingThresholds`

### ~~protocolVersion?~~

> **`optional`** **protocolVersion**: `IProtocolVerision`

#### Deprecated

protocolVersion removed in conway

### stakeAddressDeposit?

> **`optional`** **stakeAddressDeposit**: `CanBeUInteger`

### stakePoolDeposit?

> **`optional`** **stakePoolDeposit**: `CanBeUInteger`

### stakePoolTargetNum?

> **`optional`** **stakePoolTargetNum**: `CanBeUInteger`

### treasuryCut

> **treasuryCut**: `undefined` \| `number`

### txFeeFixed?

> **`optional`** **txFeeFixed**: `CanBeUInteger`

### txFeePerByte?

> **`optional`** **txFeePerByte**: `CanBeUInteger`

### utxoCostPerByte?

> **`optional`** **utxoCostPerByte**: `CanBeUInteger`

## Source

[src/ledger/protocol/ProtocolParameters.ts:502](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/ledger/protocol/ProtocolParameters.ts#L502)
