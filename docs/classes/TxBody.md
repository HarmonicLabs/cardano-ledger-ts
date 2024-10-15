[**@harmoniclabs/cardano-ledger-ts**](../README.md) • **Docs**

***

[@harmoniclabs/cardano-ledger-ts](../globals.md) / TxBody

# Class: TxBody

## Implements

- [`ITxBody`](../interfaces/ITxBody.md)
- `ToCbor`
- `ToJson`

## Constructors

### new TxBody()

> **new TxBody**(`body`): [`TxBody`](TxBody.md)

#### Parameters

• **body**: [`ITxBody`](../interfaces/ITxBody.md)

object describing the transaction

#### Returns

[`TxBody`](TxBody.md)

#### Throws

only if the the `body` parameter does not respect the `ITxBody` interface
     **DOES NOT THROW** if the transaction is unbalanced; that needs to be checked using `TxBody.isValueConserved` static method

#### Defined in

[src/tx/body/TxBody.ts:142](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/tx/body/TxBody.ts#L142)

## Properties

### auxDataHash?

> `readonly` `optional` **auxDataHash**: [`AuxiliaryDataHash`](AuxiliaryDataHash.md)

#### Implementation of

[`ITxBody`](../interfaces/ITxBody.md).[`auxDataHash`](../interfaces/ITxBody.md#auxdatahash)

#### Defined in

[src/tx/body/TxBody.ts:115](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/tx/body/TxBody.ts#L115)

***

### certs?

> `readonly` `optional` **certs**: [`Certificate`](../type-aliases/Certificate.md)[]

#### Implementation of

[`ITxBody`](../interfaces/ITxBody.md).[`certs`](../interfaces/ITxBody.md#certs)

#### Defined in

[src/tx/body/TxBody.ts:112](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/tx/body/TxBody.ts#L112)

***

### collateralInputs?

> `readonly` `optional` **collateralInputs**: [`UTxO`](UTxO.md)[]

#### Implementation of

[`ITxBody`](../interfaces/ITxBody.md).[`collateralInputs`](../interfaces/ITxBody.md#collateralinputs)

#### Defined in

[src/tx/body/TxBody.ts:119](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/tx/body/TxBody.ts#L119)

***

### collateralReturn?

> `readonly` `optional` **collateralReturn**: [`TxOut`](TxOut.md)

#### Implementation of

[`ITxBody`](../interfaces/ITxBody.md).[`collateralReturn`](../interfaces/ITxBody.md#collateralreturn)

#### Defined in

[src/tx/body/TxBody.ts:122](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/tx/body/TxBody.ts#L122)

***

### currentTreasuryValue?

> `readonly` `optional` **currentTreasuryValue**: `bigint`

#### Implementation of

[`ITxBody`](../interfaces/ITxBody.md).[`currentTreasuryValue`](../interfaces/ITxBody.md#currenttreasuryvalue)

#### Defined in

[src/tx/body/TxBody.ts:128](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/tx/body/TxBody.ts#L128)

***

### donation?

> `readonly` `optional` **donation**: `bigint`

#### Implementation of

[`ITxBody`](../interfaces/ITxBody.md).[`donation`](../interfaces/ITxBody.md#donation)

#### Defined in

[src/tx/body/TxBody.ts:129](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/tx/body/TxBody.ts#L129)

***

### fee

> `readonly` **fee**: `bigint`

#### Implementation of

[`ITxBody`](../interfaces/ITxBody.md).[`fee`](../interfaces/ITxBody.md#fee)

#### Defined in

[src/tx/body/TxBody.ts:110](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/tx/body/TxBody.ts#L110)

***

### hash

> `readonly` **hash**: [`Hash32`](Hash32.md)

getter

#### Defined in

[src/tx/body/TxBody.ts:134](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/tx/body/TxBody.ts#L134)

***

### inputs

> `readonly` **inputs**: [[`UTxO`](UTxO.md), `...UTxO[]`]

#### Implementation of

[`ITxBody`](../interfaces/ITxBody.md).[`inputs`](../interfaces/ITxBody.md#inputs)

#### Defined in

[src/tx/body/TxBody.ts:108](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/tx/body/TxBody.ts#L108)

***

### mint?

> `readonly` `optional` **mint**: [`Value`](Value.md)

#### Implementation of

[`ITxBody`](../interfaces/ITxBody.md).[`mint`](../interfaces/ITxBody.md#mint)

#### Defined in

[src/tx/body/TxBody.ts:117](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/tx/body/TxBody.ts#L117)

***

### network?

> `readonly` `optional` **network**: [`NetworkT`](../type-aliases/NetworkT.md)

#### Implementation of

[`ITxBody`](../interfaces/ITxBody.md).[`network`](../interfaces/ITxBody.md#network)

#### Defined in

[src/tx/body/TxBody.ts:121](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/tx/body/TxBody.ts#L121)

***

### outputs

> `readonly` **outputs**: [`TxOut`](TxOut.md)[]

#### Implementation of

[`ITxBody`](../interfaces/ITxBody.md).[`outputs`](../interfaces/ITxBody.md#outputs)

#### Defined in

[src/tx/body/TxBody.ts:109](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/tx/body/TxBody.ts#L109)

***

### proposalProcedures?

> `readonly` `optional` **proposalProcedures**: [`ProposalProcedure`](ProposalProcedure.md)[]

#### Implementation of

[`ITxBody`](../interfaces/ITxBody.md).[`proposalProcedures`](../interfaces/ITxBody.md#proposalprocedures)

#### Defined in

[src/tx/body/TxBody.ts:127](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/tx/body/TxBody.ts#L127)

***

### protocolUpdate?

> `readonly` `optional` **protocolUpdate**: [`LegacyPPUpdateProposal`](../type-aliases/LegacyPPUpdateProposal.md)

#### Implementation of

[`ITxBody`](../interfaces/ITxBody.md).[`protocolUpdate`](../interfaces/ITxBody.md#protocolupdate)

#### Defined in

[src/tx/body/TxBody.ts:114](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/tx/body/TxBody.ts#L114)

***

### refInputs?

> `readonly` `optional` **refInputs**: [`UTxO`](UTxO.md)[]

#### Implementation of

[`ITxBody`](../interfaces/ITxBody.md).[`refInputs`](../interfaces/ITxBody.md#refinputs)

#### Defined in

[src/tx/body/TxBody.ts:124](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/tx/body/TxBody.ts#L124)

***

### requiredSigners?

> `readonly` `optional` **requiredSigners**: [`PubKeyHash`](PubKeyHash.md)[]

#### Implementation of

[`ITxBody`](../interfaces/ITxBody.md).[`requiredSigners`](../interfaces/ITxBody.md#requiredsigners)

#### Defined in

[src/tx/body/TxBody.ts:120](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/tx/body/TxBody.ts#L120)

***

### scriptDataHash?

> `readonly` `optional` **scriptDataHash**: [`ScriptDataHash`](ScriptDataHash.md)

#### Implementation of

[`ITxBody`](../interfaces/ITxBody.md).[`scriptDataHash`](../interfaces/ITxBody.md#scriptdatahash)

#### Defined in

[src/tx/body/TxBody.ts:118](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/tx/body/TxBody.ts#L118)

***

### totCollateral?

> `readonly` `optional` **totCollateral**: `bigint`

#### Implementation of

[`ITxBody`](../interfaces/ITxBody.md).[`totCollateral`](../interfaces/ITxBody.md#totcollateral)

#### Defined in

[src/tx/body/TxBody.ts:123](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/tx/body/TxBody.ts#L123)

***

### ttl?

> `readonly` `optional` **ttl**: `bigint`

#### Implementation of

[`ITxBody`](../interfaces/ITxBody.md).[`ttl`](../interfaces/ITxBody.md#ttl)

#### Defined in

[src/tx/body/TxBody.ts:111](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/tx/body/TxBody.ts#L111)

***

### validityIntervalStart?

> `readonly` `optional` **validityIntervalStart**: `bigint`

#### Implementation of

[`ITxBody`](../interfaces/ITxBody.md).[`validityIntervalStart`](../interfaces/ITxBody.md#validityintervalstart)

#### Defined in

[src/tx/body/TxBody.ts:116](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/tx/body/TxBody.ts#L116)

***

### votingProcedures?

> `readonly` `optional` **votingProcedures**: [`VotingProcedures`](VotingProcedures.md)

#### Implementation of

[`ITxBody`](../interfaces/ITxBody.md).[`votingProcedures`](../interfaces/ITxBody.md#votingprocedures)

#### Defined in

[src/tx/body/TxBody.ts:126](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/tx/body/TxBody.ts#L126)

***

### withdrawals?

> `readonly` `optional` **withdrawals**: [`TxWithdrawals`](TxWithdrawals.md)

#### Implementation of

[`ITxBody`](../interfaces/ITxBody.md).[`withdrawals`](../interfaces/ITxBody.md#withdrawals)

#### Defined in

[src/tx/body/TxBody.ts:113](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/tx/body/TxBody.ts#L113)

## Methods

### toCbor()

> **toCbor**(): `CborString`

#### Returns

`CborString`

#### Implementation of

`ToCbor.toCbor`

#### Defined in

[src/tx/body/TxBody.ts:465](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/tx/body/TxBody.ts#L465)

***

### toCborObj()

> **toCborObj**(): `CborObj`

#### Returns

`CborObj`

#### Implementation of

`ToCbor.toCborObj`

#### Defined in

[src/tx/body/TxBody.ts:469](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/tx/body/TxBody.ts#L469)

***

### toJson()

> **toJson**(): `object`

#### Returns

`object`

##### auxDataHash

> **auxDataHash**: `undefined` \| `string`

##### certs

> **certs**: `undefined` \| (`object` \| `object` \| `object` \| `object` \| `object` \| `object` \| `object` \| `object` \| `object` \| `object` \| `object` \| `object` \| `object` \| `object` \| `object` \| `object` \| `object` \| `object` \| `object`)[]

##### collateralInputs

> **collateralInputs**: `undefined` \| `object`[]

##### collateralReturn

> **collateralReturn**: `undefined` \| `object`

##### fee

> **fee**: `string`

##### inputs

> **inputs**: `object`[]

##### mint

> **mint**: `undefined` \| [`ValueJson`](../type-aliases/ValueJson.md)

##### network

> **network**: `undefined` \| [`NetworkT`](../type-aliases/NetworkT.md)

##### outputs

> **outputs**: `object`[]

##### protocolUpdate

> **protocolUpdate**: `undefined` \| `object`

##### refInputs

> **refInputs**: `undefined` \| `object`[]

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

> **withdrawals**: `undefined` \| `object`

#### Implementation of

`ToJson.toJson`

#### Defined in

[src/tx/body/TxBody.ts:641](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/tx/body/TxBody.ts#L641)

***

### fromCbor()

> `static` **fromCbor**(`cStr`): [`TxBody`](TxBody.md)

#### Parameters

• **cStr**: `CanBeCborString`

#### Returns

[`TxBody`](TxBody.md)

#### Defined in

[src/tx/body/TxBody.ts:557](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/tx/body/TxBody.ts#L557)

***

### fromCborObj()

> `static` **fromCborObj**(`cObj`): [`TxBody`](TxBody.md)

#### Parameters

• **cObj**: `CborObj`

#### Returns

[`TxBody`](TxBody.md)

#### Defined in

[src/tx/body/TxBody.ts:561](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/tx/body/TxBody.ts#L561)

***

### ~~isValueConserved()~~

> `static` **isValueConserved**(`tx`): `boolean`

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

#### Defined in

[src/tx/body/TxBody.ts:673](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/tx/body/TxBody.ts#L673)
