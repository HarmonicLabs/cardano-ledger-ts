[**@harmoniclabs/cardano-ledger-ts**](../README.md) • **Docs**

***

[@harmoniclabs/cardano-ledger-ts](../globals.md) / TxRedeemerTagStr

# Type Alias: TxRedeemerTagStr\<Tag\>

> **TxRedeemerTagStr**\<`Tag`\>: `Tag` *extends* [`Spend`](../enumerations/TxRedeemerTag.md#spend) ? `"Spend"` : `Tag` *extends* [`Mint`](../enumerations/TxRedeemerTag.md#mint) ? `"Mint"` : `Tag` *extends* [`Cert`](../enumerations/TxRedeemerTag.md#cert) ? `"Cert"` : `Tag` *extends* [`Withdraw`](../enumerations/TxRedeemerTag.md#withdraw) ? `"Withdraw"` : `Tag` *extends* [`Voting`](../enumerations/TxRedeemerTag.md#voting) ? `"Voting"` : `Tag` *extends* [`Proposing`](../enumerations/TxRedeemerTag.md#proposing) ? `"Proposing"` : `never`

## Type Parameters

• **Tag** *extends* [`TxRedeemerTag`](../enumerations/TxRedeemerTag.md)

## Defined in

[src/tx/TxWitnessSet/TxRedeemer.ts:38](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/tx/TxWitnessSet/TxRedeemer.ts#L38)
