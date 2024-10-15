[**@harmoniclabs/cardano-ledger-ts**](../README.md) • **Docs**

***

[@harmoniclabs/cardano-ledger-ts](../globals.md) / CertTypeToStr

# Type Alias: CertTypeToStr\<CertT\>

> **CertTypeToStr**\<`CertT`\>: `CertT` *extends* [`StakeRegistration`](../enumerations/CertificateType.md#stakeregistration) ? `"StakeRegistration"` : `CertT` *extends* [`StakeDeRegistration`](../enumerations/CertificateType.md#stakederegistration) ? `"StakeDeRegistration"` : `CertT` *extends* [`StakeDelegation`](../enumerations/CertificateType.md#stakedelegation) ? `"StakeDelegation"` : `CertT` *extends* [`PoolRegistration`](../enumerations/CertificateType.md#poolregistration) ? `"PoolRegistration"` : `CertT` *extends* [`PoolRetirement`](../enumerations/CertificateType.md#poolretirement) ? `"PoolRetirement"` : `CertT` *extends* [`GenesisKeyDelegation`](../enumerations/CertificateType.md#genesiskeydelegation) ? `"GenesisKeyDelegation"` : `CertT` *extends* [`MoveInstantRewards`](../enumerations/CertificateType.md#moveinstantrewards) ? `"MoveInstantRewards"` : `CertT` *extends* [`RegistrationDeposit`](../enumerations/CertificateType.md#registrationdeposit) ? `"RegistrationDeposit"` : `CertT` *extends* [`UnRegistrationDeposit`](../enumerations/CertificateType.md#unregistrationdeposit) ? `"UnRegistrationDeposit"` : `CertT` *extends* [`VoteDeleg`](../enumerations/CertificateType.md#votedeleg) ? `"VoteDeleg"` : ... *extends* ... ? ... : ...

## Type Parameters

• **CertT** *extends* [`CertificateType`](../enumerations/CertificateType.md)

## Defined in

[src/ledger/certs/CertificateType.ts:38](https://github.com/HarmonicLabs/cardano-ledger-ts/blob/94dd590ffe94133126b0d8d49920fc7b002e1975/src/ledger/certs/CertificateType.ts#L38)
