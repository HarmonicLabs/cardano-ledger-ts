[**@harmoniclabs/cardano-ledger-ts**](../README.md) • **Docs**

***

[@harmoniclabs/cardano-ledger-ts](../globals.md) / Constitution

# Class: Constitution

## Implements

- [`IConstitution`](../interfaces/IConstitution.md)
- `ToCbor`

## Constructors

### new Constitution()

> **new Constitution**(`__namedParameters`): [`Constitution`](Constitution.md)

#### Parameters

• **\_\_namedParameters**: [`IConstitution`](../interfaces/IConstitution.md)

#### Returns

[`Constitution`](Constitution.md)

#### Defined in

[src/governance/Constitution.ts:30](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/governance/Constitution.ts#L30)

## Properties

### anchor

> `readonly` **anchor**: [`Anchor`](Anchor.md)

#### Implementation of

[`IConstitution`](../interfaces/IConstitution.md).[`anchor`](../interfaces/IConstitution.md#anchor)

#### Defined in

[src/governance/Constitution.ts:27](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/governance/Constitution.ts#L27)

***

### scriptHash

> `readonly` **scriptHash**: `undefined` \| [`Hash28`](Hash28.md)

#### Implementation of

[`IConstitution`](../interfaces/IConstitution.md).[`scriptHash`](../interfaces/IConstitution.md#scripthash)

#### Defined in

[src/governance/Constitution.ts:28](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/governance/Constitution.ts#L28)

## Methods

### toCbor()

> **toCbor**(): `CborString`

#### Returns

`CborString`

#### Implementation of

`ToCbor.toCbor`

#### Defined in

[src/governance/Constitution.ts:40](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/governance/Constitution.ts#L40)

***

### toCborObj()

> **toCborObj**(): `CborArray`

#### Returns

`CborArray`

#### Implementation of

`ToCbor.toCborObj`

#### Defined in

[src/governance/Constitution.ts:44](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/governance/Constitution.ts#L44)

***

### toData()

> **toData**(`v`?): `DataConstr`

#### Parameters

• **v?**: `ToDataVersion`

#### Returns

`DataConstr`

#### Defined in

[src/governance/Constitution.ts:52](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/governance/Constitution.ts#L52)
