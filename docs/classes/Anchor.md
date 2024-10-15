[**@harmoniclabs/cardano-ledger-ts**](../README.md) • **Docs**

***

[@harmoniclabs/cardano-ledger-ts](../globals.md) / Anchor

# Class: Anchor

## Implements

- [`IAnchor`](../interfaces/IAnchor.md)

## Constructors

### new Anchor()

> **new Anchor**(`__namedParameters`): [`Anchor`](Anchor.md)

#### Parameters

• **\_\_namedParameters**: [`IAnchor`](../interfaces/IAnchor.md)

#### Returns

[`Anchor`](Anchor.md)

#### Defined in

[src/governance/Anchor.ts:26](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/governance/Anchor.ts#L26)

## Properties

### anchorDataHash

> `readonly` **anchorDataHash**: [`Hash32`](Hash32.md)

#### Implementation of

[`IAnchor`](../interfaces/IAnchor.md).[`anchorDataHash`](../interfaces/IAnchor.md#anchordatahash)

#### Defined in

[src/governance/Anchor.ts:24](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/governance/Anchor.ts#L24)

***

### url

> `readonly` **url**: `string`

#### Implementation of

[`IAnchor`](../interfaces/IAnchor.md).[`url`](../interfaces/IAnchor.md#url)

#### Defined in

[src/governance/Anchor.ts:23](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/governance/Anchor.ts#L23)

## Methods

### toCbor()

> **toCbor**(): `CborString`

#### Returns

`CborString`

#### Defined in

[src/governance/Anchor.ts:36](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/governance/Anchor.ts#L36)

***

### toCborObj()

> **toCborObj**(): `CborObj`

#### Returns

`CborObj`

#### Defined in

[src/governance/Anchor.ts:40](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/governance/Anchor.ts#L40)

***

### toJson()

> **toJson**(): `object`

#### Returns

`object`

##### anchorDataHash

> **anchorDataHash**: `string`

##### url

> **url**: `string`

#### Defined in

[src/governance/Anchor.ts:62](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/governance/Anchor.ts#L62)

***

### fromCborObj()

> `static` **fromCborObj**(`cbor`): [`Anchor`](Anchor.md)

#### Parameters

• **cbor**: `CborObj`

#### Returns

[`Anchor`](Anchor.md)

#### Defined in

[src/governance/Anchor.ts:48](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/governance/Anchor.ts#L48)
