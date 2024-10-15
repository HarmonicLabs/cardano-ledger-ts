[**@harmoniclabs/cardano-ledger-ts**](../README.md) • **Docs**

***

[@harmoniclabs/cardano-ledger-ts](../globals.md) / DRepAlwaysNoConfidence

# Class: DRepAlwaysNoConfidence

## Implements

- [`IDRep`](../interfaces/IDRep.md)
- [`IDRepAlwaysNoConfidence`](../interfaces/IDRepAlwaysNoConfidence.md)

## Constructors

### new DRepAlwaysNoConfidence()

> **new DRepAlwaysNoConfidence**(`_info`?): [`DRepAlwaysNoConfidence`](DRepAlwaysNoConfidence.md)

#### Parameters

• **\_info?**: [`IDRepAlwaysNoConfidence`](../interfaces/IDRepAlwaysNoConfidence.md)

#### Returns

[`DRepAlwaysNoConfidence`](DRepAlwaysNoConfidence.md)

#### Defined in

[src/governance/DRep/DRepAlwaysNoConfidence.ts:18](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/governance/DRep/DRepAlwaysNoConfidence.ts#L18)

## Properties

### drepType

> `readonly` **drepType**: [`AlwaysNoConfidence`](../enumerations/DRepType.md#alwaysnoconfidence)

#### Implementation of

[`IDRep`](../interfaces/IDRep.md).[`drepType`](../interfaces/IDRep.md#dreptype)

#### Defined in

[src/governance/DRep/DRepAlwaysNoConfidence.ts:15](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/governance/DRep/DRepAlwaysNoConfidence.ts#L15)

***

### hash?

> `readonly` `optional` **hash**: `undefined`

#### Implementation of

[`IDRepAlwaysNoConfidence`](../interfaces/IDRepAlwaysNoConfidence.md).[`hash`](../interfaces/IDRepAlwaysNoConfidence.md#hash)

#### Defined in

[src/governance/DRep/DRepAlwaysNoConfidence.ts:16](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/governance/DRep/DRepAlwaysNoConfidence.ts#L16)

## Methods

### toCbor()

> **toCbor**(): `CborString`

#### Returns

`CborString`

#### Defined in

[src/governance/DRep/DRepAlwaysNoConfidence.ts:41](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/governance/DRep/DRepAlwaysNoConfidence.ts#L41)

***

### toCborObj()

> **toCborObj**(): `CborArray`

#### Returns

`CborArray`

#### Defined in

[src/governance/DRep/DRepAlwaysNoConfidence.ts:45](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/governance/DRep/DRepAlwaysNoConfidence.ts#L45)

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

[src/governance/DRep/DRepAlwaysNoConfidence.ts:28](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/governance/DRep/DRepAlwaysNoConfidence.ts#L28)

***

### toJson()

> **toJson**(): `object`

#### Returns

`object`

##### drepType

> **drepType**: `string`

#### Defined in

[src/governance/DRep/DRepAlwaysNoConfidence.ts:52](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/governance/DRep/DRepAlwaysNoConfidence.ts#L52)
