[**@harmoniclabs/cardano-ledger-ts**](../README.md) • **Docs**

***

[@harmoniclabs/cardano-ledger-ts](../globals.md) / getAllRequiredSigners

# Function: getAllRequiredSigners()

> **getAllRequiredSigners**(`body`): [`Hash28`](../classes/Hash28.md)[]

signers needed are:
 - required to spend an utxo
 - required by certificate
 - required by withdrawals
 - additional specified in the `requiredSigners` field

## Parameters

• **body**: `Readonly`\<[`TxBody`](../classes/TxBody.md)\>

## Returns

[`Hash28`](../classes/Hash28.md)[]

## Defined in

[src/tx/Tx.ts:277](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/tx/Tx.ts#L277)
