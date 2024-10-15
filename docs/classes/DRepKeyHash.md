[**@harmoniclabs/cardano-ledger-ts**](../README.md) • **Docs**

***

[@harmoniclabs/cardano-ledger-ts](../globals.md) / DRepKeyHash

# Class: DRepKeyHash

## Implements

- [`IDRep`](../interfaces/IDRep.md)
- [`IDRepKeyHash`](../interfaces/IDRepKeyHash.md)

## Constructors

### new DRepKeyHash()

> **new DRepKeyHash**(`__namedParameters`): [`DRepKeyHash`](DRepKeyHash.md)

#### Parameters

• **\_\_namedParameters**: [`IDRepKeyHash`](../interfaces/IDRepKeyHash.md)

#### Returns

[`DRepKeyHash`](DRepKeyHash.md)

#### Defined in

[src/governance/DRep/DRepKeyHash.ts:26](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/governance/DRep/DRepKeyHash.ts#L26)

## Properties

### drepType

> `readonly` **drepType**: [`KeyHash`](../enumerations/DRepType.md#keyhash)

#### Implementation of

[`IDRep`](../interfaces/IDRep.md).[`drepType`](../interfaces/IDRep.md#dreptype)

#### Defined in

[src/governance/DRep/DRepKeyHash.ts:23](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/governance/DRep/DRepKeyHash.ts#L23)

***

### hash

> `readonly` **hash**: [`PubKeyHash`](PubKeyHash.md)

#### Implementation of

[`IDRepKeyHash`](../interfaces/IDRepKeyHash.md).[`hash`](../interfaces/IDRepKeyHash.md#hash)

#### Defined in

[src/governance/DRep/DRepKeyHash.ts:24](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/governance/DRep/DRepKeyHash.ts#L24)

## Methods

### toCbor()

> **toCbor**(): `CborString`

#### Returns

`CborString`

#### Defined in

[src/governance/DRep/DRepKeyHash.ts:49](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/governance/DRep/DRepKeyHash.ts#L49)

***

### toCborObj()

> **toCborObj**(): `CborArray`

#### Returns

`CborArray`

#### Defined in

[src/governance/DRep/DRepKeyHash.ts:53](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/governance/DRep/DRepKeyHash.ts#L53)

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

[src/governance/DRep/DRepKeyHash.ts:36](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/governance/DRep/DRepKeyHash.ts#L36)

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

[src/governance/DRep/DRepKeyHash.ts:76](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/governance/DRep/DRepKeyHash.ts#L76)

***

### fromCborObj()

> `static` **fromCborObj**(`cbor`): [`DRepKeyHash`](DRepKeyHash.md)

#### Parameters

• **cbor**: `CborObj`

#### Returns

[`DRepKeyHash`](DRepKeyHash.md)

#### Defined in

[src/governance/DRep/DRepKeyHash.ts:61](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/governance/DRep/DRepKeyHash.ts#L61)
