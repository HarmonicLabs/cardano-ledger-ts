[**@harmoniclabs/cardano-ledger-ts**](../README.md) • **Docs**

***

[@harmoniclabs/cardano-ledger-ts](../globals.md) / StakeHash

# Type Alias: StakeHash\<T\>

> **StakeHash**\<`T`\>: `T` *extends* `"stakeKey"` ? [`StakeKeyHash`](../classes/StakeKeyHash.md) : `T` *extends* `"script"` ? [`StakeValidatorHash`](../classes/StakeValidatorHash.md) : `T` *extends* `"pointer"` ? [`CanBeUInteger`, `CanBeUInteger`, `CanBeUInteger`] : `never`

## Type Parameters

• **T** *extends* [`StakeCredentialsType`](StakeCredentialsType.md)

## Defined in

[src/credentials/StakeCredentials.ts:15](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/credentials/StakeCredentials.ts#L15)
