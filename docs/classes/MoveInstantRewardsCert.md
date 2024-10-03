[**@harmoniclabs/cardano-ledger-ts**](../README.md) • **Docs**

***

[@harmoniclabs/cardano-ledger-ts](../globals.md) / MoveInstantRewardsCert

# Class: ~~MoveInstantRewardsCert~~

## Deprecated

## Implements

- `ToCbor`
- `ToJson`
- [`ICert`](../interfaces/ICert.md)

## Constructors

### new MoveInstantRewardsCert()

> **new MoveInstantRewardsCert**(`__namedParameters`): [`MoveInstantRewardsCert`](MoveInstantRewardsCert.md)

#### Parameters

• **\_\_namedParameters**: [`IMoveInstantRewardsCert`](../interfaces/IMoveInstantRewardsCert.md)

#### Returns

[`MoveInstantRewardsCert`](MoveInstantRewardsCert.md)

#### Defined in

[src/ledger/certs/MoveInstantRewardsCert.ts:102](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/certs/MoveInstantRewardsCert.ts#L102)

## Properties

### ~~certType~~

> `readonly` **certType**: [`MoveInstantRewards`](../enumerations/CertificateType.md#moveinstantrewards)

#### Implementation of

[`ICert`](../interfaces/ICert.md).[`certType`](../interfaces/ICert.md#certtype)

#### Defined in

[src/ledger/certs/MoveInstantRewardsCert.ts:93](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/certs/MoveInstantRewardsCert.ts#L93)

***

### ~~destination~~

> `readonly` **destination**: `CanBeUInteger` \| [`RewardsMap`](../type-aliases/RewardsMap.md)

If the second field is a map, funds are moved to stake credentials,
otherwise the funds are given to the other accounting pot
(eg. source is Reserve, hence founds are going to treasurery)

#### Defined in

[src/ledger/certs/MoveInstantRewardsCert.ts:100](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/certs/MoveInstantRewardsCert.ts#L100)

***

### ~~source~~

> `readonly` **source**: [`InstantRewardsSource`](../enumerations/InstantRewardsSource.md)

#### Defined in

[src/ledger/certs/MoveInstantRewardsCert.ts:94](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/certs/MoveInstantRewardsCert.ts#L94)

## Methods

### ~~getRequiredSigners()~~

> **getRequiredSigners**(): [`Hash28`](Hash28.md)[]

#### Returns

[`Hash28`](Hash28.md)[]

#### Implementation of

[`ICert`](../interfaces/ICert.md).[`getRequiredSigners`](../interfaces/ICert.md#getrequiredsigners)

#### Defined in

[src/ledger/certs/MoveInstantRewardsCert.ts:155](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/certs/MoveInstantRewardsCert.ts#L155)

***

### ~~toCbor()~~

> **toCbor**(): `CborString`

#### Returns

`CborString`

#### Implementation of

`ToCbor.toCbor`

#### Defined in

[src/ledger/certs/MoveInstantRewardsCert.ts:160](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/certs/MoveInstantRewardsCert.ts#L160)

***

### ~~toCborObj()~~

> **toCborObj**(): `CborObj`

#### Returns

`CborObj`

#### Implementation of

`ToCbor.toCborObj`

#### Defined in

[src/ledger/certs/MoveInstantRewardsCert.ts:165](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/certs/MoveInstantRewardsCert.ts#L165)

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

[src/ledger/certs/MoveInstantRewardsCert.ts:143](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/certs/MoveInstantRewardsCert.ts#L143)

***

### ~~toJson()~~

> **toJson**(): `object`

#### Returns

`object`

##### ~~certType~~

> **certType**: `"MoveInstantRewards"`

##### ~~destination~~

> **destination**: `string` \| `object`[]

##### ~~source~~

> **source**: `"Reserves"` \| `"Treasurery"`

#### Implementation of

`ToJson.toJson`

#### Defined in

[src/ledger/certs/MoveInstantRewardsCert.ts:196](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/certs/MoveInstantRewardsCert.ts#L196)

***

### ~~fromCborObj()~~

> `static` **fromCborObj**(`cObj`): [`MoveInstantRewardsCert`](MoveInstantRewardsCert.md)

#### Parameters

• **cObj**: `CborObj`

#### Returns

[`MoveInstantRewardsCert`](MoveInstantRewardsCert.md)

#### Defined in

[src/ledger/certs/MoveInstantRewardsCert.ts:175](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/certs/MoveInstantRewardsCert.ts#L175)
