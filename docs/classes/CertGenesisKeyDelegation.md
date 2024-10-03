[**@harmoniclabs/cardano-ledger-ts**](../README.md) • **Docs**

***

[@harmoniclabs/cardano-ledger-ts](../globals.md) / CertGenesisKeyDelegation

# Class: ~~CertGenesisKeyDelegation~~

## Deprecated

## Implements

- [`ICert`](../interfaces/ICert.md)
- [`ICertGenesisKeyDelegation`](../interfaces/ICertGenesisKeyDelegation.md)

## Constructors

### new CertGenesisKeyDelegation()

> **new CertGenesisKeyDelegation**(`__namedParameters`): [`CertGenesisKeyDelegation`](CertGenesisKeyDelegation.md)

#### Parameters

• **\_\_namedParameters**: [`ICertGenesisKeyDelegation`](../interfaces/ICertGenesisKeyDelegation.md)

#### Returns

[`CertGenesisKeyDelegation`](CertGenesisKeyDelegation.md)

#### Defined in

[src/ledger/certs/CertGenesisKeyDelegation.ts:25](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/certs/CertGenesisKeyDelegation.ts#L25)

## Properties

### ~~certType~~

> `readonly` **certType**: [`GenesisKeyDelegation`](../enumerations/CertificateType.md#genesiskeydelegation)

#### Implementation of

[`ICert`](../interfaces/ICert.md).[`certType`](../interfaces/ICert.md#certtype)

#### Defined in

[src/ledger/certs/CertGenesisKeyDelegation.ts:20](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/certs/CertGenesisKeyDelegation.ts#L20)

***

### ~~genesisDelegateHash~~

> `readonly` **genesisDelegateHash**: [`Hash28`](Hash28.md)

#### Implementation of

[`ICertGenesisKeyDelegation`](../interfaces/ICertGenesisKeyDelegation.md).[`genesisDelegateHash`](../interfaces/ICertGenesisKeyDelegation.md#genesisdelegatehash)

#### Defined in

[src/ledger/certs/CertGenesisKeyDelegation.ts:22](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/certs/CertGenesisKeyDelegation.ts#L22)

***

### ~~genesisHash~~

> `readonly` **genesisHash**: [`Hash28`](Hash28.md)

#### Implementation of

[`ICertGenesisKeyDelegation`](../interfaces/ICertGenesisKeyDelegation.md).[`genesisHash`](../interfaces/ICertGenesisKeyDelegation.md#genesishash)

#### Defined in

[src/ledger/certs/CertGenesisKeyDelegation.ts:21](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/certs/CertGenesisKeyDelegation.ts#L21)

***

### ~~vrfKeyHash~~

> `readonly` **vrfKeyHash**: [`Hash32`](Hash32.md)

#### Implementation of

[`ICertGenesisKeyDelegation`](../interfaces/ICertGenesisKeyDelegation.md).[`vrfKeyHash`](../interfaces/ICertGenesisKeyDelegation.md#vrfkeyhash)

#### Defined in

[src/ledger/certs/CertGenesisKeyDelegation.ts:23](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/certs/CertGenesisKeyDelegation.ts#L23)

## Methods

### ~~getRequiredSigners()~~

> **getRequiredSigners**(): [`Hash28`](Hash28.md)[]

#### Returns

[`Hash28`](Hash28.md)[]

#### Implementation of

[`ICert`](../interfaces/ICert.md).[`getRequiredSigners`](../interfaces/ICert.md#getrequiredsigners)

#### Defined in

[src/ledger/certs/CertGenesisKeyDelegation.ts:50](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/certs/CertGenesisKeyDelegation.ts#L50)

***

### ~~toCbor()~~

> **toCbor**(): `CborString`

#### Returns

`CborString`

#### Defined in

[src/ledger/certs/CertGenesisKeyDelegation.ts:55](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/certs/CertGenesisKeyDelegation.ts#L55)

***

### ~~toCborObj()~~

> **toCborObj**(): `CborArray`

#### Returns

`CborArray`

#### Defined in

[src/ledger/certs/CertGenesisKeyDelegation.ts:59](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/certs/CertGenesisKeyDelegation.ts#L59)

***

### ~~toData()~~

> **toData**(`version`?): `DataConstr`

#### Parameters

• **version?**: `ToDataVersion`

#### Returns

`DataConstr`

#### Implementation of

[`ICert`](../interfaces/ICert.md).[`toData`](../interfaces/ICert.md#todata)

#### Defined in

[src/ledger/certs/CertGenesisKeyDelegation.ts:38](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/certs/CertGenesisKeyDelegation.ts#L38)

***

### ~~toJson()~~

> **toJson**(): `object`

#### Returns

`object`

##### ~~certType~~

> **certType**: `"GenesisKeyDelegation"`

##### ~~genesisDelegateHash~~

> **genesisDelegateHash**: `string`

##### ~~genesisHash~~

> **genesisHash**: `string`

##### ~~vrfKeyHash~~

> **vrfKeyHash**: `string`

#### Defined in

[src/ledger/certs/CertGenesisKeyDelegation.ts:86](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/certs/CertGenesisKeyDelegation.ts#L86)

***

### ~~fromCborObj()~~

> `static` **fromCborObj**(`cbor`): [`CertGenesisKeyDelegation`](CertGenesisKeyDelegation.md)

#### Parameters

• **cbor**: `CborObj`

#### Returns

[`CertGenesisKeyDelegation`](CertGenesisKeyDelegation.md)

#### Defined in

[src/ledger/certs/CertGenesisKeyDelegation.ts:69](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/certs/CertGenesisKeyDelegation.ts#L69)
