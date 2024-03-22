**@harmoniclabs/cardano-ledger-ts** • [Readme](../README.md) \| [API](../globals.md)

***

[@harmoniclabs/cardano-ledger-ts](../README.md) / RewardSourceToStr

# Type alias: RewardSourceToStr\<S\>

> **RewardSourceToStr**\<`S`\>: `S` extends [`Reserves`](../enumerations/InstantRewardsSource.md#reserves) ? `"Reserves"` : `S` extends [`Treasurery`](../enumerations/InstantRewardsSource.md#treasurery) ? `"Treasurery"` : `never`

## Type parameters

• **S** extends [`InstantRewardsSource`](../enumerations/InstantRewardsSource.md)

## Source

[src/ledger/certs/MoveInstantRewardsCert.ts:19](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/ledger/certs/MoveInstantRewardsCert.ts#L19)
