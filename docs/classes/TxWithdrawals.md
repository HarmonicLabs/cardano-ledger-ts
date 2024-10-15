[**@harmoniclabs/cardano-ledger-ts**](../README.md) • **Docs**

***

[@harmoniclabs/cardano-ledger-ts](../globals.md) / TxWithdrawals

# Class: TxWithdrawals

## Implements

- `ToCbor`
- `ToData`

## Constructors

### new TxWithdrawals()

> **new TxWithdrawals**(`map`, `network`): [`TxWithdrawals`](TxWithdrawals.md)

#### Parameters

• **map**: [`ITxWithdrawals`](../type-aliases/ITxWithdrawals.md)

• **network**: [`NetworkT`](../type-aliases/NetworkT.md) = `"mainnet"`

#### Returns

[`TxWithdrawals`](TxWithdrawals.md)

#### Defined in

[src/ledger/TxWithdrawals.ts:70](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/TxWithdrawals.ts#L70)

## Properties

### map

> `readonly` **map**: [`TxWithdrawalsMapBigInt`](../type-aliases/TxWithdrawalsMapBigInt.md)

#### Defined in

[src/ledger/TxWithdrawals.ts:68](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/TxWithdrawals.ts#L68)

## Methods

### toCbor()

> **toCbor**(): `CborString`

#### Returns

`CborString`

#### Implementation of

`ToCbor.toCbor`

#### Defined in

[src/ledger/TxWithdrawals.ts:138](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/TxWithdrawals.ts#L138)

***

### toCborObj()

> **toCborObj**(): `CborObj`

#### Returns

`CborObj`

#### Implementation of

`ToCbor.toCborObj`

#### Defined in

[src/ledger/TxWithdrawals.ts:142](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/TxWithdrawals.ts#L142)

***

### toData()

> **toData**(`version`?): `DataMap`\<`DataConstr`, `DataI`\>

#### Parameters

• **version?**: `ToDataVersion`

#### Returns

`DataMap`\<`DataConstr`, `DataI`\>

#### Implementation of

`ToData.toData`

#### Defined in

[src/ledger/TxWithdrawals.ts:125](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/TxWithdrawals.ts#L125)

***

### toJson()

> **toJson**(): `object`

#### Returns

`object`

#### Defined in

[src/ledger/TxWithdrawals.ts:177](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/TxWithdrawals.ts#L177)

***

### toTotalWitdrawn()

> **toTotalWitdrawn**(): [`Value`](Value.md)

#### Returns

[`Value`](Value.md)

#### Defined in

[src/ledger/TxWithdrawals.ts:117](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/TxWithdrawals.ts#L117)

***

### fromCbor()

> `static` **fromCbor**(`cStr`): [`TxWithdrawals`](TxWithdrawals.md)

#### Parameters

• **cStr**: `CanBeCborString`

#### Returns

[`TxWithdrawals`](TxWithdrawals.md)

#### Defined in

[src/ledger/TxWithdrawals.ts:154](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/TxWithdrawals.ts#L154)

***

### fromCborObj()

> `static` **fromCborObj**(`cObj`): [`TxWithdrawals`](TxWithdrawals.md)

#### Parameters

• **cObj**: `CborObj`

#### Returns

[`TxWithdrawals`](TxWithdrawals.md)

#### Defined in

[src/ledger/TxWithdrawals.ts:158](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/TxWithdrawals.ts#L158)

***

### fromJson()

> `static` **fromJson**(`json`): [`TxWithdrawals`](TxWithdrawals.md)

#### Parameters

• **json**: `any`

#### Returns

[`TxWithdrawals`](TxWithdrawals.md)

#### Defined in

[src/ledger/TxWithdrawals.ts:191](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/TxWithdrawals.ts#L191)
