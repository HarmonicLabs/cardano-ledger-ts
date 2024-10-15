[**@harmoniclabs/cardano-ledger-ts**](../README.md) • **Docs**

***

[@harmoniclabs/cardano-ledger-ts](../globals.md) / GovActionUpdateCommittee

# Class: GovActionUpdateCommittee

## Implements

- [`IGovAction`](../interfaces/IGovAction.md)
- [`IGovActionUpdateCommittee`](../interfaces/IGovActionUpdateCommittee.md)
- `ToCbor`
- `ToData`

## Constructors

### new GovActionUpdateCommittee()

> **new GovActionUpdateCommittee**(`__namedParameters`): [`GovActionUpdateCommittee`](GovActionUpdateCommittee.md)

#### Parameters

• **\_\_namedParameters**: [`IGovActionUpdateCommittee`](../interfaces/IGovActionUpdateCommittee.md)

#### Returns

[`GovActionUpdateCommittee`](GovActionUpdateCommittee.md)

#### Defined in

[src/governance/GovAction/GovAcitonUpdateCommittee.ts:64](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/governance/GovAction/GovAcitonUpdateCommittee.ts#L64)

## Properties

### govActionId

> `readonly` **govActionId**: `undefined` \| [`TxOutRef`](TxOutRef.md)

#### Implementation of

[`IGovActionUpdateCommittee`](../interfaces/IGovActionUpdateCommittee.md).[`govActionId`](../interfaces/IGovActionUpdateCommittee.md#govactionid)

#### Defined in

[src/governance/GovAction/GovAcitonUpdateCommittee.ts:59](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/governance/GovAction/GovAcitonUpdateCommittee.ts#L59)

***

### govActionType

> `readonly` **govActionType**: [`UpdateCommittee`](../enumerations/GovActionType.md#updatecommittee)

#### Implementation of

[`IGovAction`](../interfaces/IGovAction.md).[`govActionType`](../interfaces/IGovAction.md#govactiontype)

#### Defined in

[src/governance/GovAction/GovAcitonUpdateCommittee.ts:58](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/governance/GovAction/GovAcitonUpdateCommittee.ts#L58)

***

### threshold

> `readonly` **threshold**: `CborPositiveRational`

#### Implementation of

[`IGovActionUpdateCommittee`](../interfaces/IGovActionUpdateCommittee.md).[`threshold`](../interfaces/IGovActionUpdateCommittee.md#threshold)

#### Defined in

[src/governance/GovAction/GovAcitonUpdateCommittee.ts:62](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/governance/GovAction/GovAcitonUpdateCommittee.ts#L62)

***

### toAdd

> `readonly` **toAdd**: [`INewCommitteeEntryBI`](../interfaces/INewCommitteeEntryBI.md)[]

#### Implementation of

[`IGovActionUpdateCommittee`](../interfaces/IGovActionUpdateCommittee.md).[`toAdd`](../interfaces/IGovActionUpdateCommittee.md#toadd)

#### Defined in

[src/governance/GovAction/GovAcitonUpdateCommittee.ts:61](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/governance/GovAction/GovAcitonUpdateCommittee.ts#L61)

***

### toRemove

> `readonly` **toRemove**: [`Credential`](Credential.md)\<[`CredentialType`](../enumerations/CredentialType.md)\>[]

#### Implementation of

[`IGovActionUpdateCommittee`](../interfaces/IGovActionUpdateCommittee.md).[`toRemove`](../interfaces/IGovActionUpdateCommittee.md#toremove)

#### Defined in

[src/governance/GovAction/GovAcitonUpdateCommittee.ts:60](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/governance/GovAction/GovAcitonUpdateCommittee.ts#L60)

## Methods

### toCbor()

> **toCbor**(): `CborString`

#### Returns

`CborString`

#### Implementation of

`ToCbor.toCbor`

#### Defined in

[src/governance/GovAction/GovAcitonUpdateCommittee.ts:80](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/governance/GovAction/GovAcitonUpdateCommittee.ts#L80)

***

### toCborObj()

> **toCborObj**(): `CborArray`

#### Returns

`CborArray`

#### Implementation of

`ToCbor.toCborObj`

#### Defined in

[src/governance/GovAction/GovAcitonUpdateCommittee.ts:84](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/governance/GovAction/GovAcitonUpdateCommittee.ts#L84)

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

[src/governance/GovAction/GovAcitonUpdateCommittee.ts:103](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/governance/GovAction/GovAcitonUpdateCommittee.ts#L103)
