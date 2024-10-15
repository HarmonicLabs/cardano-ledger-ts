[**@harmoniclabs/cardano-ledger-ts**](../README.md) • **Docs**

***

[@harmoniclabs/cardano-ledger-ts](../globals.md) / RewardSourceToStr

# Type Alias: RewardSourceToStr\<S\>

> **RewardSourceToStr**\<`S`\>: `S` *extends* [`Reserves`](../enumerations/InstantRewardsSource.md#reserves) ? `"Reserves"` : `S` *extends* [`Treasurery`](../enumerations/InstantRewardsSource.md#treasurery) ? `"Treasurery"` : `never`

## Type Parameters

• **S** *extends* [`InstantRewardsSource`](../enumerations/InstantRewardsSource.md)

## Defined in

[src/ledger/certs/MoveInstantRewardsCert.ts:21](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/certs/MoveInstantRewardsCert.ts#L21)
