**@harmoniclabs/cardano-ledger-ts** • [Readme](../README.md) \| [API](../globals.md)

***

[@harmoniclabs/cardano-ledger-ts](../README.md) / TxBody

# Class: TxBody

## Implements

- [`ITxBody`](../interfaces/ITxBody.md)
- `ToCbor`
- `ToJson`

## Constructors

### new TxBody(body)

> **new TxBody**(`body`): [`TxBody`](TxBody.md)

#### Parameters

• **body**: [`ITxBody`](../interfaces/ITxBody.md)

object describing the transaction

#### Returns

[`TxBody`](TxBody.md)

#### Throws

only if the the `body` parameter does not respect the `ITxBody` interface
     **DOES NOT THROW** if the transaction is unbalanced; that needs to be checked using `TxBody.isValueConserved` static method

#### Source

[src/tx/body/TxBody.ts:142](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/tx/body/TxBody.ts#L142)

## Properties

### auxDataHash?

> **`optional`** **`readonly`** **auxDataHash**: [`AuxiliaryDataHash`](AuxiliaryDataHash.md)

#### Implementation of

[`ITxBody`](../interfaces/ITxBody.md).[`auxDataHash`](../interfaces/ITxBody.md#auxdatahash)

#### Source

[src/tx/body/TxBody.ts:115](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/tx/body/TxBody.ts#L115)

***

### certs?

> **`optional`** **`readonly`** **certs**: [`Certificate`](../type-aliases/Certificate.md)[]

#### Implementation of

[`ITxBody`](../interfaces/ITxBody.md).[`certs`](../interfaces/ITxBody.md#certs)

#### Source

[src/tx/body/TxBody.ts:112](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/tx/body/TxBody.ts#L112)

***

### collateralInputs?

> **`optional`** **`readonly`** **collateralInputs**: [`UTxO`](UTxO.md)[]

#### Implementation of

[`ITxBody`](../interfaces/ITxBody.md).[`collateralInputs`](../interfaces/ITxBody.md#collateralinputs)

#### Source

[src/tx/body/TxBody.ts:119](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/tx/body/TxBody.ts#L119)

***

### collateralReturn?

> **`optional`** **`readonly`** **collateralReturn**: [`TxOut`](TxOut.md)

#### Implementation of

[`ITxBody`](../interfaces/ITxBody.md).[`collateralReturn`](../interfaces/ITxBody.md#collateralreturn)

#### Source

[src/tx/body/TxBody.ts:122](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/tx/body/TxBody.ts#L122)

***

### currentTreasuryValue?

> **`optional`** **`readonly`** **currentTreasuryValue**: `bigint`

#### Implementation of

[`ITxBody`](../interfaces/ITxBody.md).[`currentTreasuryValue`](../interfaces/ITxBody.md#currenttreasuryvalue)

#### Source

[src/tx/body/TxBody.ts:128](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/tx/body/TxBody.ts#L128)

***

### donation?

> **`optional`** **`readonly`** **donation**: `bigint`

#### Implementation of

[`ITxBody`](../interfaces/ITxBody.md).[`donation`](../interfaces/ITxBody.md#donation)

#### Source

[src/tx/body/TxBody.ts:129](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/tx/body/TxBody.ts#L129)

***

### fee

> **`readonly`** **fee**: `bigint`

#### Implementation of

[`ITxBody`](../interfaces/ITxBody.md).[`fee`](../interfaces/ITxBody.md#fee)

#### Source

[src/tx/body/TxBody.ts:110](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/tx/body/TxBody.ts#L110)

***

### hash

> **`readonly`** **hash**: [`Hash32`](Hash32.md)

getter

#### Source

[src/tx/body/TxBody.ts:134](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/tx/body/TxBody.ts#L134)

***

### inputs

> **`readonly`** **inputs**: [[`UTxO`](UTxO.md), `...UTxO[]`]

#### Implementation of

[`ITxBody`](../interfaces/ITxBody.md).[`inputs`](../interfaces/ITxBody.md#inputs)

#### Source

[src/tx/body/TxBody.ts:108](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/tx/body/TxBody.ts#L108)

***

### mint?

> **`optional`** **`readonly`** **mint**: [`Value`](Value.md)

#### Implementation of

[`ITxBody`](../interfaces/ITxBody.md).[`mint`](../interfaces/ITxBody.md#mint)

#### Source

[src/tx/body/TxBody.ts:117](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/tx/body/TxBody.ts#L117)

***

### network?

> **`optional`** **`readonly`** **network**: [`NetworkT`](../type-aliases/NetworkT.md)

#### Implementation of

[`ITxBody`](../interfaces/ITxBody.md).[`network`](../interfaces/ITxBody.md#network)

#### Source

[src/tx/body/TxBody.ts:121](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/tx/body/TxBody.ts#L121)

***

### outputs

> **`readonly`** **outputs**: [`TxOut`](TxOut.md)[]

#### Implementation of

[`ITxBody`](../interfaces/ITxBody.md).[`outputs`](../interfaces/ITxBody.md#outputs)

#### Source

[src/tx/body/TxBody.ts:109](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/tx/body/TxBody.ts#L109)

***

### proposalProcedures?

> **`optional`** **`readonly`** **proposalProcedures**: `ProposalProcedure`[]

#### Implementation of

[`ITxBody`](../interfaces/ITxBody.md).[`proposalProcedures`](../interfaces/ITxBody.md#proposalprocedures)

#### Source

[src/tx/body/TxBody.ts:127](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/tx/body/TxBody.ts#L127)

***

### protocolUpdate?

> **`optional`** **`readonly`** **protocolUpdate**: [`LegacyPPUpdateProposal`](../type-aliases/LegacyPPUpdateProposal.md)

#### Implementation of

[`ITxBody`](../interfaces/ITxBody.md).[`protocolUpdate`](../interfaces/ITxBody.md#protocolupdate)

#### Source

[src/tx/body/TxBody.ts:114](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/tx/body/TxBody.ts#L114)

***

### refInputs?

> **`optional`** **`readonly`** **refInputs**: [`UTxO`](UTxO.md)[]

#### Implementation of

[`ITxBody`](../interfaces/ITxBody.md).[`refInputs`](../interfaces/ITxBody.md#refinputs)

#### Source

[src/tx/body/TxBody.ts:124](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/tx/body/TxBody.ts#L124)

***

### requiredSigners?

> **`optional`** **`readonly`** **requiredSigners**: [`PubKeyHash`](PubKeyHash.md)[]

#### Implementation of

[`ITxBody`](../interfaces/ITxBody.md).[`requiredSigners`](../interfaces/ITxBody.md#requiredsigners)

#### Source

[src/tx/body/TxBody.ts:120](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/tx/body/TxBody.ts#L120)

***

### scriptDataHash?

> **`optional`** **`readonly`** **scriptDataHash**: [`ScriptDataHash`](ScriptDataHash.md)

#### Implementation of

[`ITxBody`](../interfaces/ITxBody.md).[`scriptDataHash`](../interfaces/ITxBody.md#scriptdatahash)

#### Source

[src/tx/body/TxBody.ts:118](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/tx/body/TxBody.ts#L118)

***

### totCollateral?

> **`optional`** **`readonly`** **totCollateral**: `bigint`

#### Implementation of

[`ITxBody`](../interfaces/ITxBody.md).[`totCollateral`](../interfaces/ITxBody.md#totcollateral)

#### Source

[src/tx/body/TxBody.ts:123](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/tx/body/TxBody.ts#L123)

***

### ttl?

> **`optional`** **`readonly`** **ttl**: `bigint`

#### Implementation of

[`ITxBody`](../interfaces/ITxBody.md).[`ttl`](../interfaces/ITxBody.md#ttl)

#### Source

[src/tx/body/TxBody.ts:111](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/tx/body/TxBody.ts#L111)

***

### validityIntervalStart?

> **`optional`** **`readonly`** **validityIntervalStart**: `bigint`

#### Implementation of

[`ITxBody`](../interfaces/ITxBody.md).[`validityIntervalStart`](../interfaces/ITxBody.md#validityintervalstart)

#### Source

[src/tx/body/TxBody.ts:116](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/tx/body/TxBody.ts#L116)

***

### votingProcedures?

> **`optional`** **`readonly`** **votingProcedures**: `VotingProcedures`

#### Implementation of

[`ITxBody`](../interfaces/ITxBody.md).[`votingProcedures`](../interfaces/ITxBody.md#votingprocedures)

#### Source

[src/tx/body/TxBody.ts:126](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/tx/body/TxBody.ts#L126)

***

### withdrawals?

> **`optional`** **`readonly`** **withdrawals**: [`TxWithdrawals`](TxWithdrawals.md)

#### Implementation of

[`ITxBody`](../interfaces/ITxBody.md).[`withdrawals`](../interfaces/ITxBody.md#withdrawals)

#### Source

[src/tx/body/TxBody.ts:113](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/tx/body/TxBody.ts#L113)

## Methods

### toCbor()

> **toCbor**(): `CborString`

#### Returns

`CborString`

#### Implementation of

`ToCbor.toCbor`

#### Source

[src/tx/body/TxBody.ts:465](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/tx/body/TxBody.ts#L465)

***

### toCborObj()

> **toCborObj**(): `CborObj`

#### Returns

`CborObj`

#### Implementation of

`ToCbor.toCborObj`

#### Source

[src/tx/body/TxBody.ts:469](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/tx/body/TxBody.ts#L469)

***

### toJson()

> **toJson**(): `Object`

#### Returns

`Object`

##### auxDataHash

> **auxDataHash**: `undefined` \| `string`

##### certs

> **certs**: `undefined` \| (`Object` \| `Object` \| `Object` \| `Object` \| `Object` \| `Object` \| `Object` \| `Object` \| `Object` \| `Object` \| `Object` \| `Object` \| `Object` \| `Object` \| `Object` \| `Object` \| `Object` \| `Object`)[]

##### collateralInputs

> **collateralInputs**: `undefined` \| `Object`[]

##### collateralReturn

> **collateralReturn**: `undefined` \| `Object`

##### fee

> **fee**: `string`

##### inputs

> **inputs**: `Object`[]

##### mint

> **mint**: `undefined` \| [`ValueJson`](../type-aliases/ValueJson.md)

##### network

> **network**: `undefined` \| [`NetworkT`](../type-aliases/NetworkT.md)

##### outputs

> **outputs**: `Object`[]

##### protocolUpdate

> **protocolUpdate**: `undefined` \| `object`

##### refInputs

> **refInputs**: `undefined` \| `Object`[]

##### requiredSigners

> **requiredSigners**: `undefined` \| `string`[]

##### scriptDataHash

> **scriptDataHash**: `undefined` \| `string`

##### totCollateral

> **totCollateral**: `undefined` \| `string`

##### ttl

> **ttl**: `undefined` \| `string`

##### validityIntervalStart

> **validityIntervalStart**: `undefined` \| `string`

##### withdrawals

> **withdrawals**: `undefined` \| `Object`

#### Implementation of

`ToJson.toJson`

#### Source

[src/tx/body/TxBody.ts:641](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/tx/body/TxBody.ts#L641)

***

### fromCbor()

> **`static`** **fromCbor**(`cStr`): [`TxBody`](TxBody.md)

#### Parameters

• **cStr**: `CanBeCborString`

#### Returns

[`TxBody`](TxBody.md)

#### Source

[src/tx/body/TxBody.ts:557](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/tx/body/TxBody.ts#L557)

***

### fromCborObj()

> **`static`** **fromCborObj**(`cObj`): [`TxBody`](TxBody.md)

#### Parameters

• **cObj**: `CborObj`

#### Returns

[`TxBody`](TxBody.md)

#### Source

[src/tx/body/TxBody.ts:561](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/tx/body/TxBody.ts#L561)

***

### ~~isValueConserved()~~

> **`static`** **isValueConserved**(`tx`): `boolean`

tests that
inputs + withdrawals + refund + mints === outputs + burns + deposit + fee

#### Parameters

• **tx**: [`TxBody`](TxBody.md)

#### Returns

`boolean`

#### Todo

add mints and burns

#### Deprecated

until mints and burns are added

#### Source

[src/tx/body/TxBody.ts:673](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/tx/body/TxBody.ts#L673)
