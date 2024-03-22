**@harmoniclabs/cardano-ledger-ts** • [Readme](../README.md) \| [API](../globals.md)

***

[@harmoniclabs/cardano-ledger-ts](../README.md) / StakeHash

# Type alias: StakeHash\<T\>

> **StakeHash**\<`T`\>: `T` extends `"stakeKey"` ? [`StakeKeyHash`](../classes/StakeKeyHash.md) : `T` extends `"script"` ? [`StakeValidatorHash`](../classes/StakeValidatorHash.md) : `T` extends `"pointer"` ? [`CanBeUInteger`, `CanBeUInteger`, `CanBeUInteger`] : `never`

## Type parameters

• **T** extends [`StakeCredentialsType`](StakeCredentialsType.md)

## Source

[src/credentials/StakeCredentials.ts:14](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/credentials/StakeCredentials.ts#L14)
