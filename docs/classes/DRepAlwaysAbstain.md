[**@harmoniclabs/cardano-ledger-ts**](../README.md) • **Docs**

***

[@harmoniclabs/cardano-ledger-ts](../globals.md) / DRepAlwaysAbstain

# Class: DRepAlwaysAbstain

## Implements

- [`IDRep`](../interfaces/IDRep.md)
- [`IDRepAlwaysAbstain`](../interfaces/IDRepAlwaysAbstain.md)

## Constructors

### new DRepAlwaysAbstain()

> **new DRepAlwaysAbstain**(`_info`?): [`DRepAlwaysAbstain`](DRepAlwaysAbstain.md)

#### Parameters

• **\_info?**: [`IDRepAlwaysAbstain`](../interfaces/IDRepAlwaysAbstain.md)

#### Returns

[`DRepAlwaysAbstain`](DRepAlwaysAbstain.md)

#### Defined in

[src/governance/DRep/DRepAlwaysAbstain.ts:18](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/governance/DRep/DRepAlwaysAbstain.ts#L18)

## Properties

### drepType

> `readonly` **drepType**: [`AlwaysAbstain`](../enumerations/DRepType.md#alwaysabstain)

#### Implementation of

[`IDRep`](../interfaces/IDRep.md).[`drepType`](../interfaces/IDRep.md#dreptype)

#### Defined in

[src/governance/DRep/DRepAlwaysAbstain.ts:15](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/governance/DRep/DRepAlwaysAbstain.ts#L15)

***

### hash?

> `readonly` `optional` **hash**: `undefined`

#### Implementation of

[`IDRepAlwaysAbstain`](../interfaces/IDRepAlwaysAbstain.md).[`hash`](../interfaces/IDRepAlwaysAbstain.md#hash)

#### Defined in

[src/governance/DRep/DRepAlwaysAbstain.ts:16](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/governance/DRep/DRepAlwaysAbstain.ts#L16)

## Methods

### toCbor()

> **toCbor**(): `CborString`

#### Returns

`CborString`

#### Defined in

[src/governance/DRep/DRepAlwaysAbstain.ts:41](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/governance/DRep/DRepAlwaysAbstain.ts#L41)

***

### toCborObj()

> **toCborObj**(): `CborArray`

#### Returns

`CborArray`

#### Defined in

[src/governance/DRep/DRepAlwaysAbstain.ts:45](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/governance/DRep/DRepAlwaysAbstain.ts#L45)

***

### toData()

> **toData**(`version`?): `DataConstr`

#### Parameters

• **version?**: `ToDataVersion`

#### Returns

`DataConstr`

#### Implementation of

[`IDRep`](../interfaces/IDRep.md).[`toData`](../interfaces/IDRep.md#todata)

#### Defined in

[src/governance/DRep/DRepAlwaysAbstain.ts:28](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/governance/DRep/DRepAlwaysAbstain.ts#L28)

***

### toJson()

> **toJson**(): `object`

#### Returns

`object`

##### drepType

> **drepType**: `string`

#### Defined in

[src/governance/DRep/DRepAlwaysAbstain.ts:52](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/governance/DRep/DRepAlwaysAbstain.ts#L52)
