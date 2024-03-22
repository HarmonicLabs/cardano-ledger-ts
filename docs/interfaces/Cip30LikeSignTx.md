**@harmoniclabs/cardano-ledger-ts** • [Readme](../README.md) \| [API](../globals.md)

***

[@harmoniclabs/cardano-ledger-ts](../README.md) / Cip30LikeSignTx

# Interface: Cip30LikeSignTx

## Properties

### signTx

> **signTx**: (`txCbor`, `partial`?) => `string` \| `Promise`\<`string`\>

#### Parameters

• **txCbor**: `string`

receives the current transaction (`this`) cbor

• **partial?**: `boolean`

(standard parameter) wheather to throw or not if the wallet can not sign the entire transaction (`true` always passed)

#### Returns

`string` \| `Promise`\<`string`\>

the cbor of the `TxWitnessSet` (!!! NOT the cbor of the signe transaction !!!)

#### Source

[src/tx/Tx.ts:28](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/tx/Tx.ts#L28)
