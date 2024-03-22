**@harmoniclabs/cardano-ledger-ts** • [Readme](../README.md) \| [API](../globals.md)

***

[@harmoniclabs/cardano-ledger-ts](../README.md) / TxRedeemerTagStr

# Type alias: TxRedeemerTagStr\<Tag\>

> **TxRedeemerTagStr**\<`Tag`\>: `Tag` extends [`Spend`](../enumerations/TxRedeemerTag.md#spend) ? `"Spend"` : `Tag` extends [`Mint`](../enumerations/TxRedeemerTag.md#mint) ? `"Mint"` : `Tag` extends [`Cert`](../enumerations/TxRedeemerTag.md#cert) ? `"Cert"` : `Tag` extends [`Withdraw`](../enumerations/TxRedeemerTag.md#withdraw) ? `"Withdraw"` : `Tag` extends [`Voting`](../enumerations/TxRedeemerTag.md#voting) ? `"Voting"` : `Tag` extends [`Proposing`](../enumerations/TxRedeemerTag.md#proposing) ? `"Proposing"` : `never`

## Type parameters

• **Tag** extends [`TxRedeemerTag`](../enumerations/TxRedeemerTag.md)

## Source

[src/tx/TxWitnessSet/TxRedeemer.ts:41](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/tx/TxWitnessSet/TxRedeemer.ts#L41)
