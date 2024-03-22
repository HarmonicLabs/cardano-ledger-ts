**@harmoniclabs/cardano-ledger-ts** • [Readme](../README.md) \| [API](../globals.md)

***

[@harmoniclabs/cardano-ledger-ts](../README.md) / CertGenesisKeyDelegation

# Class: ~~CertGenesisKeyDelegation~~

## Deprecated

## Implements

- [`ICert`](../interfaces/ICert.md)
- [`ICertGenesisKeyDelegation`](../interfaces/ICertGenesisKeyDelegation.md)

## Constructors

### new CertGenesisKeyDelegation(__namedParameters)

> **new CertGenesisKeyDelegation**(`__namedParameters`): [`CertGenesisKeyDelegation`](CertGenesisKeyDelegation.md)

#### Parameters

• **\_\_namedParameters**: [`ICertGenesisKeyDelegation`](../interfaces/ICertGenesisKeyDelegation.md)

#### Returns

[`CertGenesisKeyDelegation`](CertGenesisKeyDelegation.md)

#### Source

[src/ledger/certs/CertGenesisKeyDelegation.ts:23](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/ledger/certs/CertGenesisKeyDelegation.ts#L23)

## Properties

### ~~certType~~

> **`readonly`** **certType**: [`GenesisKeyDelegation`](../enumerations/CertificateType.md#genesiskeydelegation)

#### Implementation of

[`ICert`](../interfaces/ICert.md).[`certType`](../interfaces/ICert.md#certtype)

#### Source

[src/ledger/certs/CertGenesisKeyDelegation.ts:18](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/ledger/certs/CertGenesisKeyDelegation.ts#L18)

***

### ~~genesisDelegateHash~~

> **`readonly`** **genesisDelegateHash**: [`Hash28`](Hash28.md)

#### Implementation of

[`ICertGenesisKeyDelegation`](../interfaces/ICertGenesisKeyDelegation.md).[`genesisDelegateHash`](../interfaces/ICertGenesisKeyDelegation.md#genesisdelegatehash)

#### Source

[src/ledger/certs/CertGenesisKeyDelegation.ts:20](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/ledger/certs/CertGenesisKeyDelegation.ts#L20)

***

### ~~genesisHash~~

> **`readonly`** **genesisHash**: [`Hash28`](Hash28.md)

#### Implementation of

[`ICertGenesisKeyDelegation`](../interfaces/ICertGenesisKeyDelegation.md).[`genesisHash`](../interfaces/ICertGenesisKeyDelegation.md#genesishash)

#### Source

[src/ledger/certs/CertGenesisKeyDelegation.ts:19](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/ledger/certs/CertGenesisKeyDelegation.ts#L19)

***

### ~~vrfKeyHash~~

> **`readonly`** **vrfKeyHash**: [`Hash32`](Hash32.md)

#### Implementation of

[`ICertGenesisKeyDelegation`](../interfaces/ICertGenesisKeyDelegation.md).[`vrfKeyHash`](../interfaces/ICertGenesisKeyDelegation.md#vrfkeyhash)

#### Source

[src/ledger/certs/CertGenesisKeyDelegation.ts:21](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/ledger/certs/CertGenesisKeyDelegation.ts#L21)

## Methods

### ~~getRequiredSigners()~~

> **getRequiredSigners**(): [`Hash28`](Hash28.md)[]

#### Returns

[`Hash28`](Hash28.md)[]

#### Implementation of

[`ICert`](../interfaces/ICert.md).[`getRequiredSigners`](../interfaces/ICert.md#getrequiredsigners)

#### Source

[src/ledger/certs/CertGenesisKeyDelegation.ts:35](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/ledger/certs/CertGenesisKeyDelegation.ts#L35)

***

### ~~toCbor()~~

> **toCbor**(): `CborString`

#### Returns

`CborString`

#### Source

[src/ledger/certs/CertGenesisKeyDelegation.ts:40](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/ledger/certs/CertGenesisKeyDelegation.ts#L40)

***

### ~~toCborObj()~~

> **toCborObj**(): `CborArray`

#### Returns

`CborArray`

#### Source

[src/ledger/certs/CertGenesisKeyDelegation.ts:44](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/ledger/certs/CertGenesisKeyDelegation.ts#L44)

***

### ~~toJson()~~

> **toJson**(): `Object`

#### Returns

`Object`

##### ~~certType~~

> **certType**: `"GenesisKeyDelegation"`

##### ~~genesisDelegateHash~~

> **genesisDelegateHash**: `string`

##### ~~genesisHash~~

> **genesisHash**: `string`

##### ~~vrfKeyHash~~

> **vrfKeyHash**: `string`

#### Source

[src/ledger/certs/CertGenesisKeyDelegation.ts:71](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/ledger/certs/CertGenesisKeyDelegation.ts#L71)

***

### ~~fromCborObj()~~

> **`static`** **fromCborObj**(`cbor`): [`CertGenesisKeyDelegation`](CertGenesisKeyDelegation.md)

#### Parameters

• **cbor**: `CborObj`

#### Returns

[`CertGenesisKeyDelegation`](CertGenesisKeyDelegation.md)

#### Source

[src/ledger/certs/CertGenesisKeyDelegation.ts:54](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/d1659b0/src/ledger/certs/CertGenesisKeyDelegation.ts#L54)
