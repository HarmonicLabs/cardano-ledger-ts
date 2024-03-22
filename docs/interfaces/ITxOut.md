**@harmoniclabs/cardano-ledger-ts** • [Readme](../README.md) \| [API](../globals.md)

***

[@harmoniclabs/cardano-ledger-ts](../README.md) / ITxOut

# Interface: ITxOut

## Properties

### address

> **address**: \`addr1${string}\` \| \`addr_test1${string}\` \| [`Address`](../classes/Address.md)

#### Source

[src/tx/body/output/TxOut.ts:16](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/tx/body/output/TxOut.ts#L16)

***

### datum?

> **`optional`** **datum**: `Data` \| [`Hash32`](../classes/Hash32.md)

#### Source

[src/tx/body/output/TxOut.ts:18](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/tx/body/output/TxOut.ts#L18)

***

### refScript?

> **`optional`** **refScript**: [`Script`](../classes/Script.md)\<[`LitteralScriptType`](../type-aliases/LitteralScriptType.md)\>

#### Source

[src/tx/body/output/TxOut.ts:19](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/tx/body/output/TxOut.ts#L19)

***

### value

> **value**: [`IValue`](../type-aliases/IValue.md) \| [`Value`](../classes/Value.md)

#### Source

[src/tx/body/output/TxOut.ts:17](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/tx/body/output/TxOut.ts#L17)
