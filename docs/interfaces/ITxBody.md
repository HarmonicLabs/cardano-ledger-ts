[**@harmoniclabs/cardano-ledger-ts**](../README.md) • **Docs**

***

[@harmoniclabs/cardano-ledger-ts](../globals.md) / ITxBody

# Interface: ITxBody

## Properties

### auxDataHash?

> `optional` **auxDataHash**: [`AuxiliaryDataHash`](../classes/AuxiliaryDataHash.md)

#### Defined in

[src/tx/body/TxBody.ts:23](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/tx/body/TxBody.ts#L23)

***

### certs?

> `optional` **certs**: [`Certificate`](../type-aliases/Certificate.md)[]

#### Defined in

[src/tx/body/TxBody.ts:20](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/tx/body/TxBody.ts#L20)

***

### collateralInputs?

> `optional` **collateralInputs**: [`UTxO`](../classes/UTxO.md)[]

#### Defined in

[src/tx/body/TxBody.ts:27](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/tx/body/TxBody.ts#L27)

***

### collateralReturn?

> `optional` **collateralReturn**: [`TxOut`](../classes/TxOut.md)

#### Defined in

[src/tx/body/TxBody.ts:30](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/tx/body/TxBody.ts#L30)

***

### currentTreasuryValue?

> `optional` **currentTreasuryValue**: `CanBeUInteger`

#### Defined in

[src/tx/body/TxBody.ts:36](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/tx/body/TxBody.ts#L36)

***

### donation?

> `optional` **donation**: `CanBeUInteger`

#### Defined in

[src/tx/body/TxBody.ts:37](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/tx/body/TxBody.ts#L37)

***

### fee

> **fee**: `CanBeUInteger`

#### Defined in

[src/tx/body/TxBody.ts:18](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/tx/body/TxBody.ts#L18)

***

### inputs

> **inputs**: [[`UTxO`](../classes/UTxO.md), `...UTxO[]`]

#### Defined in

[src/tx/body/TxBody.ts:16](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/tx/body/TxBody.ts#L16)

***

### mint?

> `optional` **mint**: [`Value`](../classes/Value.md)

#### Defined in

[src/tx/body/TxBody.ts:25](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/tx/body/TxBody.ts#L25)

***

### network?

> `optional` **network**: [`NetworkT`](../type-aliases/NetworkT.md)

#### Defined in

[src/tx/body/TxBody.ts:29](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/tx/body/TxBody.ts#L29)

***

### outputs

> **outputs**: [`TxOut`](../classes/TxOut.md)[]

#### Defined in

[src/tx/body/TxBody.ts:17](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/tx/body/TxBody.ts#L17)

***

### proposalProcedures?

> `optional` **proposalProcedures**: ([`IProposalProcedure`](IProposalProcedure.md) \| [`ProposalProcedure`](../classes/ProposalProcedure.md))[]

#### Defined in

[src/tx/body/TxBody.ts:35](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/tx/body/TxBody.ts#L35)

***

### protocolUpdate?

> `optional` **protocolUpdate**: [`LegacyPPUpdateProposal`](../type-aliases/LegacyPPUpdateProposal.md)

#### Defined in

[src/tx/body/TxBody.ts:22](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/tx/body/TxBody.ts#L22)

***

### refInputs?

> `optional` **refInputs**: [`UTxO`](../classes/UTxO.md)[]

#### Defined in

[src/tx/body/TxBody.ts:32](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/tx/body/TxBody.ts#L32)

***

### requiredSigners?

> `optional` **requiredSigners**: [`PubKeyHash`](../classes/PubKeyHash.md)[]

#### Defined in

[src/tx/body/TxBody.ts:28](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/tx/body/TxBody.ts#L28)

***

### scriptDataHash?

> `optional` **scriptDataHash**: [`ScriptDataHash`](../classes/ScriptDataHash.md)

#### Defined in

[src/tx/body/TxBody.ts:26](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/tx/body/TxBody.ts#L26)

***

### totCollateral?

> `optional` **totCollateral**: `CanBeUInteger`

#### Defined in

[src/tx/body/TxBody.ts:31](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/tx/body/TxBody.ts#L31)

***

### ttl?

> `optional` **ttl**: `CanBeUInteger`

#### Defined in

[src/tx/body/TxBody.ts:19](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/tx/body/TxBody.ts#L19)

***

### validityIntervalStart?

> `optional` **validityIntervalStart**: `CanBeUInteger`

#### Defined in

[src/tx/body/TxBody.ts:24](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/tx/body/TxBody.ts#L24)

***

### votingProcedures?

> `optional` **votingProcedures**: [`VotingProcedures`](../classes/VotingProcedures.md) \| [`IVotingProcedures`](../type-aliases/IVotingProcedures.md)

#### Defined in

[src/tx/body/TxBody.ts:34](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/tx/body/TxBody.ts#L34)

***

### withdrawals?

> `optional` **withdrawals**: [`ITxWithdrawals`](../type-aliases/ITxWithdrawals.md) \| [`TxWithdrawals`](../classes/TxWithdrawals.md)

#### Defined in

[src/tx/body/TxBody.ts:21](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/tx/body/TxBody.ts#L21)
