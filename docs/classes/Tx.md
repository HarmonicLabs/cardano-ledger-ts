**@harmoniclabs/cardano-ledger-ts** • [Readme](../README.md) \| [API](../globals.md)

***

[@harmoniclabs/cardano-ledger-ts](../README.md) / Tx

# Class: Tx

## Implements

- [`ITx`](../interfaces/ITx.md)
- `ToCbor`
- `ToJson`

## Constructors

### new Tx(tx)

> **new Tx**(`tx`): [`Tx`](Tx.md)

#### Parameters

• **tx**: [`ITx`](../interfaces/ITx.md)

#### Returns

[`Tx`](Tx.md)

#### Source

[src/tx/Tx.ts:79](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/tx/Tx.ts#L79)

## Properties

### addVKeyWitness

> **`readonly`** **addVKeyWitness**: (`vkeyWit`) => `void`

checks that the signer is needed
if true adds the witness
otherwise nothing happens (the signature is not added)

one might prefer to use this method instead of `signWith`
when signature is provided by a third party (example CIP30 wallet)

#### Parameters

• **vkeyWit**: [`VKeyWitness`](VKeyWitness.md)

#### Returns

`void`

#### Source

[src/tx/Tx.ts:47](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/tx/Tx.ts#L47)

***

### auxiliaryData?

> **`optional`** **`readonly`** **auxiliaryData**: `null` \| [`AuxiliaryData`](AuxiliaryData.md)

#### Implementation of

[`ITx`](../interfaces/ITx.md).[`auxiliaryData`](../interfaces/ITx.md#auxiliarydata)

#### Source

[src/tx/Tx.ts:37](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/tx/Tx.ts#L37)

***

### body

> **`readonly`** **body**: [`TxBody`](TxBody.md)

#### Implementation of

[`ITx`](../interfaces/ITx.md).[`body`](../interfaces/ITx.md#body)

#### Source

[src/tx/Tx.ts:34](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/tx/Tx.ts#L34)

***

### hash

> **`readonly`** **hash**: [`Hash32`](Hash32.md)

getter

#### Source

[src/tx/Tx.ts:77](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/tx/Tx.ts#L77)

***

### isComplete

> **`readonly`** **isComplete**: `boolean`

#### Source

[src/tx/Tx.ts:73](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/tx/Tx.ts#L73)

***

### isScriptValid

> **`readonly`** **isScriptValid**: `boolean`

#### Implementation of

[`ITx`](../interfaces/ITx.md).[`isScriptValid`](../interfaces/ITx.md#isscriptvalid)

#### Source

[src/tx/Tx.ts:36](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/tx/Tx.ts#L36)

***

### signWith

> **`readonly`** **signWith**: (`signer`) => `void`

checks that the signer is needed
if true signs the transaction with the specified key
otherwise nothing happens (the signature is not added)

#### Parameters

• **signer**: [`PrivateKey`](PrivateKey.md)

#### Returns

`void`

#### Source

[src/tx/Tx.ts:53](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/tx/Tx.ts#L53)

***

### signWithCip30Wallet

> **`readonly`** **signWithCip30Wallet**: (`cip30wallet`) => `Promise`\<`void`\>

signs the transaction using any browser wallet 
that follows the [CIP-0030 standard]
(https://github.com/cardano-foundation/CIPs/tree/master/CIP-0030#apisigntxtx-cbortransaction-partialsign-bool--false-promisecbortransaction_witness_set)

#### Parameters

• **cip30wallet**: [`Cip30LikeSignTx`](../interfaces/Cip30LikeSignTx.md)

#### Returns

`Promise`\<`void`\>

#### Source

[src/tx/Tx.ts:60](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/tx/Tx.ts#L60)

***

### witnesses

> **`readonly`** **witnesses**: [`TxWitnessSet`](TxWitnessSet.md)

#### Implementation of

[`ITx`](../interfaces/ITx.md).[`witnesses`](../interfaces/ITx.md#witnesses)

#### Source

[src/tx/Tx.ts:35](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/tx/Tx.ts#L35)

## Methods

### toCbor()

> **toCbor**(): `CborString`

#### Returns

`CborString`

#### Implementation of

`ToCbor.toCbor`

#### Source

[src/tx/Tx.ts:191](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/tx/Tx.ts#L191)

***

### toCborObj()

> **toCborObj**(): `CborObj`

#### Returns

`CborObj`

#### Implementation of

`ToCbor.toCborObj`

#### Source

[src/tx/Tx.ts:195](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/tx/Tx.ts#L195)

***

### toJson()

> **toJson**(): `Object`

#### Returns

`Object`

##### auxiliaryData

> **auxiliaryData**: `undefined` \| `Object`

##### body

> **body**: `Object`

##### body.auxDataHash

> **auxDataHash**: `undefined` \| `string`

##### body.certs

> **certs**: `undefined` \| (`Object` \| `Object` \| `Object` \| `Object` \| `Object` \| `Object` \| `Object` \| `Object` \| `Object` \| `Object` \| `Object` \| `Object` \| `Object` \| `Object` \| `Object` \| `Object` \| `Object` \| `Object`)[]

##### body.collateralInputs

> **collateralInputs**: `undefined` \| `Object`[]

##### body.collateralReturn

> **collateralReturn**: `undefined` \| `Object`

##### body.fee

> **fee**: `string`

##### body.inputs

> **inputs**: `Object`[]

##### body.mint

> **mint**: `undefined` \| [`ValueJson`](../type-aliases/ValueJson.md)

##### body.network

> **network**: `undefined` \| [`NetworkT`](../type-aliases/NetworkT.md)

##### body.outputs

> **outputs**: `Object`[]

##### body.protocolUpdate

> **protocolUpdate**: `undefined` \| `object`

##### body.refInputs

> **refInputs**: `undefined` \| `Object`[]

##### body.requiredSigners

> **requiredSigners**: `undefined` \| `string`[]

##### body.scriptDataHash

> **scriptDataHash**: `undefined` \| `string`

##### body.totCollateral

> **totCollateral**: `undefined` \| `string`

##### body.ttl

> **ttl**: `undefined` \| `string`

##### body.validityIntervalStart

> **validityIntervalStart**: `undefined` \| `string`

##### body.withdrawals

> **withdrawals**: `undefined` \| `Object`

##### isScriptValid

> **isScriptValid**: `boolean`

##### witnesses

> **witnesses**: `Object`

##### witnesses.bootstrapWitnesses

> **bootstrapWitnesses**: `undefined` \| `Object`[]

##### witnesses.datums

> **datums**: `undefined` \| `any`[]

##### witnesses.nativeScripts

> **nativeScripts**: `undefined` \| ([`ScriptSignature`](../interfaces/ScriptSignature.md) \| [`ScriptAll`](../interfaces/ScriptAll.md) \| [`ScriptAny`](../interfaces/ScriptAny.md) \| [`ScriptAtLeast`](../interfaces/ScriptAtLeast.md) \| [`ScriptAfter`](../interfaces/ScriptAfter.md) \| [`ScriptBefore`](../interfaces/ScriptBefore.md) \| `Object`)[]

##### witnesses.plutusV1Scripts

> **plutusV1Scripts**: `undefined` \| ([`ScriptSignature`](../interfaces/ScriptSignature.md) \| [`ScriptAll`](../interfaces/ScriptAll.md) \| [`ScriptAny`](../interfaces/ScriptAny.md) \| [`ScriptAtLeast`](../interfaces/ScriptAtLeast.md) \| [`ScriptAfter`](../interfaces/ScriptAfter.md) \| [`ScriptBefore`](../interfaces/ScriptBefore.md) \| `Object`)[]

##### witnesses.plutusV2Scripts

> **plutusV2Scripts**: `undefined` \| ([`ScriptSignature`](../interfaces/ScriptSignature.md) \| [`ScriptAll`](../interfaces/ScriptAll.md) \| [`ScriptAny`](../interfaces/ScriptAny.md) \| [`ScriptAtLeast`](../interfaces/ScriptAtLeast.md) \| [`ScriptAfter`](../interfaces/ScriptAfter.md) \| [`ScriptBefore`](../interfaces/ScriptBefore.md) \| `Object`)[]

##### witnesses.plutusV3Scripts

> **plutusV3Scripts**: `undefined` \| ([`ScriptSignature`](../interfaces/ScriptSignature.md) \| [`ScriptAll`](../interfaces/ScriptAll.md) \| [`ScriptAny`](../interfaces/ScriptAny.md) \| [`ScriptAtLeast`](../interfaces/ScriptAtLeast.md) \| [`ScriptAfter`](../interfaces/ScriptAfter.md) \| [`ScriptBefore`](../interfaces/ScriptBefore.md) \| `Object`)[]

##### witnesses.redeemers

> **redeemers**: `undefined` \| `Object`[]

##### witnesses.vkeyWitnesses

> **vkeyWitnesses**: `undefined` \| `Object`[]

#### Implementation of

`ToJson.toJson`

#### Source

[src/tx/Tx.ts:234](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/tx/Tx.ts#L234)

***

### fromCbor()

> **`static`** **fromCbor**(`cStr`): [`Tx`](Tx.md)

#### Parameters

• **cStr**: `CanBeCborString`

#### Returns

[`Tx`](Tx.md)

#### Source

[src/tx/Tx.ts:207](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/tx/Tx.ts#L207)

***

### fromCborObj()

> **`static`** **fromCborObj**(`cObj`): [`Tx`](Tx.md)

#### Parameters

• **cObj**: `CborObj`

#### Returns

[`Tx`](Tx.md)

#### Source

[src/tx/Tx.ts:211](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/tx/Tx.ts#L211)
