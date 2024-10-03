[**@harmoniclabs/cardano-ledger-ts**](../README.md) • **Docs**

***

[@harmoniclabs/cardano-ledger-ts](../globals.md) / GovActionInitHardFork

# Class: GovActionInitHardFork

## Implements

- [`IGovAction`](../interfaces/IGovAction.md)
- [`IGovActionInitHardFork`](../interfaces/IGovActionInitHardFork.md)
- `ToCbor`
- `ToData`

## Constructors

### new GovActionInitHardFork()

> **new GovActionInitHardFork**(`__namedParameters`): [`GovActionInitHardFork`](GovActionInitHardFork.md)

#### Parameters

• **\_\_namedParameters**: [`IGovActionInitHardFork`](../interfaces/IGovActionInitHardFork.md)

#### Returns

[`GovActionInitHardFork`](GovActionInitHardFork.md)

#### Defined in

[src/governance/GovAction/GovActionInitHardFork.ts:34](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/governance/GovAction/GovActionInitHardFork.ts#L34)

## Properties

### govActionId

> `readonly` **govActionId**: `undefined` \| [`TxOutRef`](TxOutRef.md)

#### Implementation of

[`IGovActionInitHardFork`](../interfaces/IGovActionInitHardFork.md).[`govActionId`](../interfaces/IGovActionInitHardFork.md#govactionid)

#### Defined in

[src/governance/GovAction/GovActionInitHardFork.ts:31](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/governance/GovAction/GovActionInitHardFork.ts#L31)

***

### govActionType

> `readonly` **govActionType**: [`InitHardFork`](../enumerations/GovActionType.md#inithardfork)

#### Implementation of

[`IGovAction`](../interfaces/IGovAction.md).[`govActionType`](../interfaces/IGovAction.md#govactiontype)

#### Defined in

[src/governance/GovAction/GovActionInitHardFork.ts:30](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/governance/GovAction/GovActionInitHardFork.ts#L30)

***

### protocolVersion

> `readonly` **protocolVersion**: [`IProtocolVerisionObj`](../interfaces/IProtocolVerisionObj.md)

#### Implementation of

[`IGovActionInitHardFork`](../interfaces/IGovActionInitHardFork.md).[`protocolVersion`](../interfaces/IGovActionInitHardFork.md#protocolversion)

#### Defined in

[src/governance/GovAction/GovActionInitHardFork.ts:32](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/governance/GovAction/GovActionInitHardFork.ts#L32)

## Methods

### toCbor()

> **toCbor**(): `CborString`

#### Returns

`CborString`

#### Implementation of

`ToCbor.toCbor`

#### Defined in

[src/governance/GovAction/GovActionInitHardFork.ts:45](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/governance/GovAction/GovActionInitHardFork.ts#L45)

***

### toCborObj()

> **toCborObj**(): `CborArray`

#### Returns

`CborArray`

#### Implementation of

`ToCbor.toCborObj`

#### Defined in

[src/governance/GovAction/GovActionInitHardFork.ts:49](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/governance/GovAction/GovActionInitHardFork.ts#L49)

***

### toData()

> **toData**(`v`?): `DataConstr`

#### Parameters

• **v?**: `ToDataVersion`

#### Returns

`DataConstr`

#### Implementation of

`ToData.toData`

#### Defined in

[src/governance/GovAction/GovActionInitHardFork.ts:58](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/governance/GovAction/GovActionInitHardFork.ts#L58)
