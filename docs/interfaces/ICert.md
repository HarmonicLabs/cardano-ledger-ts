[**@harmoniclabs/cardano-ledger-ts**](../README.md) • **Docs**

***

[@harmoniclabs/cardano-ledger-ts](../globals.md) / ICert

# Interface: ICert

## Extends

- `ToData`

## Properties

### certType

> **certType**: [`CertificateType`](../enumerations/CertificateType.md)

#### Defined in

[src/ledger/certs/ICert.ts:6](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/certs/ICert.ts#L6)

***

### getRequiredSigners()

> **getRequiredSigners**: () => [`Hash28`](../classes/Hash28.md)[]

#### Returns

[`Hash28`](../classes/Hash28.md)[]

#### Defined in

[src/ledger/certs/ICert.ts:7](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/certs/ICert.ts#L7)

***

### toData()

> **toData**: (`version`?) => `Data`

#### Parameters

• **version?**: `"v1"` \| `"v2"` \| `"v3"`

#### Returns

`Data`

#### Inherited from

`ToData.toData`

#### Defined in

node\_modules/@harmoniclabs/plutus-data/dist/toData/interface.d.ts:3
