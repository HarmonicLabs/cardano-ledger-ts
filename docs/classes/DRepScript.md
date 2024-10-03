[**@harmoniclabs/cardano-ledger-ts**](../README.md) • **Docs**

***

[@harmoniclabs/cardano-ledger-ts](../globals.md) / DRepScript

# Class: DRepScript

## Implements

- [`IDRep`](../interfaces/IDRep.md)
- [`IDRepScript`](../interfaces/IDRepScript.md)

## Constructors

### new DRepScript()

> **new DRepScript**(`__namedParameters`): [`DRepScript`](DRepScript.md)

#### Parameters

• **\_\_namedParameters**: [`IDRepScript`](../interfaces/IDRepScript.md)

#### Returns

[`DRepScript`](DRepScript.md)

#### Defined in

[src/governance/DRep/DRepScript.ts:26](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/governance/DRep/DRepScript.ts#L26)

## Properties

### drepType

> `readonly` **drepType**: [`Script`](../enumerations/DRepType.md#script)

#### Implementation of

[`IDRep`](../interfaces/IDRep.md).[`drepType`](../interfaces/IDRep.md#dreptype)

#### Defined in

[src/governance/DRep/DRepScript.ts:23](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/governance/DRep/DRepScript.ts#L23)

***

### hash

> `readonly` **hash**: [`ValidatorHash`](ValidatorHash.md)

#### Implementation of

[`IDRepScript`](../interfaces/IDRepScript.md).[`hash`](../interfaces/IDRepScript.md#hash)

#### Defined in

[src/governance/DRep/DRepScript.ts:24](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/governance/DRep/DRepScript.ts#L24)

## Methods

### toCbor()

> **toCbor**(): `CborString`

#### Returns

`CborString`

#### Defined in

[src/governance/DRep/DRepScript.ts:50](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/governance/DRep/DRepScript.ts#L50)

***

### toCborObj()

> **toCborObj**(): `CborArray`

#### Returns

`CborArray`

#### Defined in

[src/governance/DRep/DRepScript.ts:54](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/governance/DRep/DRepScript.ts#L54)

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

[src/governance/DRep/DRepScript.ts:36](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/governance/DRep/DRepScript.ts#L36)

***

### toJson()

> **toJson**(): `object`

#### Returns

`object`

##### drepType

> **drepType**: `string`

##### hash

> **hash**: `string`

#### Defined in

[src/governance/DRep/DRepScript.ts:77](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/governance/DRep/DRepScript.ts#L77)

***

### fromCborObj()

> `static` **fromCborObj**(`cbor`): [`DRepScript`](DRepScript.md)

#### Parameters

• **cbor**: `CborObj`

#### Returns

[`DRepScript`](DRepScript.md)

#### Defined in

[src/governance/DRep/DRepScript.ts:62](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/governance/DRep/DRepScript.ts#L62)
