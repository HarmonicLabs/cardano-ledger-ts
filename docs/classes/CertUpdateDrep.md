[**@harmoniclabs/cardano-ledger-ts**](../README.md) • **Docs**

***

[@harmoniclabs/cardano-ledger-ts](../globals.md) / CertUpdateDrep

# Class: CertUpdateDrep

## Implements

- [`ICert`](../interfaces/ICert.md)
- [`ICertUpdateDrep`](../interfaces/ICertUpdateDrep.md)

## Constructors

### new CertUpdateDrep()

> **new CertUpdateDrep**(`__namedParameters`): [`CertUpdateDrep`](CertUpdateDrep.md)

#### Parameters

• **\_\_namedParameters**: [`ICertUpdateDrep`](../interfaces/ICertUpdateDrep.md)

#### Returns

[`CertUpdateDrep`](CertUpdateDrep.md)

#### Defined in

[src/ledger/certs/CertUpdateDrep.ts:23](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/certs/CertUpdateDrep.ts#L23)

## Properties

### anchor

> `readonly` **anchor**: `undefined` \| [`Anchor`](Anchor.md)

#### Implementation of

[`ICertUpdateDrep`](../interfaces/ICertUpdateDrep.md).[`anchor`](../interfaces/ICertUpdateDrep.md#anchor)

#### Defined in

[src/ledger/certs/CertUpdateDrep.ts:21](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/certs/CertUpdateDrep.ts#L21)

***

### certType

> `readonly` **certType**: [`UpdateDrep`](../enumerations/CertificateType.md#updatedrep)

#### Implementation of

[`ICert`](../interfaces/ICert.md).[`certType`](../interfaces/ICert.md#certtype)

#### Defined in

[src/ledger/certs/CertUpdateDrep.ts:19](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/certs/CertUpdateDrep.ts#L19)

***

### drepCredential

> `readonly` **drepCredential**: [`Credential`](Credential.md)\<[`CredentialType`](../enumerations/CredentialType.md)\>

#### Implementation of

[`ICertUpdateDrep`](../interfaces/ICertUpdateDrep.md).[`drepCredential`](../interfaces/ICertUpdateDrep.md#drepcredential)

#### Defined in

[src/ledger/certs/CertUpdateDrep.ts:20](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/certs/CertUpdateDrep.ts#L20)

## Methods

### getRequiredSigners()

> **getRequiredSigners**(): [`Hash28`](Hash28.md)[]

#### Returns

[`Hash28`](Hash28.md)[]

#### Implementation of

[`ICert`](../interfaces/ICert.md).[`getRequiredSigners`](../interfaces/ICert.md#getrequiredsigners)

#### Defined in

[src/ledger/certs/CertUpdateDrep.ts:50](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/certs/CertUpdateDrep.ts#L50)

***

### toCbor()

> **toCbor**(): `CborString`

#### Returns

`CborString`

#### Defined in

[src/ledger/certs/CertUpdateDrep.ts:55](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/certs/CertUpdateDrep.ts#L55)

***

### toCborObj()

> **toCborObj**(): `CborArray`

#### Returns

`CborArray`

#### Defined in

[src/ledger/certs/CertUpdateDrep.ts:59](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/certs/CertUpdateDrep.ts#L59)

***

### toData()

> **toData**(`version`?): `DataConstr`

#### Parameters

• **version?**: `ToDataVersion`

#### Returns

`DataConstr`

#### Implementation of

[`ICert`](../interfaces/ICert.md).[`toData`](../interfaces/ICert.md#todata)

#### Defined in

[src/ledger/certs/CertUpdateDrep.ts:34](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/certs/CertUpdateDrep.ts#L34)

***

### toJson()

> **toJson**(): `object`

#### Returns

`object`

##### anchor

> **anchor**: `null` \| `object`

##### certType

> **certType**: `"UpdateDrep"`

##### drepCredential

> **drepCredential**: `object`

##### drepCredential.credentialType

> **credentialType**: `string`

##### drepCredential.hash

> **hash**: `string`

#### Defined in

[src/ledger/certs/CertUpdateDrep.ts:84](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/certs/CertUpdateDrep.ts#L84)

***

### fromCborObj()

> `static` **fromCborObj**(`cbor`): [`CertUpdateDrep`](CertUpdateDrep.md)

#### Parameters

• **cbor**: `CborObj`

#### Returns

[`CertUpdateDrep`](CertUpdateDrep.md)

#### Defined in

[src/ledger/certs/CertUpdateDrep.ts:68](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/certs/CertUpdateDrep.ts#L68)
