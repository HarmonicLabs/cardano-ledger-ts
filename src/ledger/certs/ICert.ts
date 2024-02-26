import { Hash28 } from "../../hashes";
import { CertificateType } from "./CertificateType";

export interface ICert {
    certType: CertificateType,
    getRequiredSigners: () => Hash28[]
}

const ada = BigInt( 1_000_000 );

export function certToDepositLovelaces( cert: ICert ): bigint
{
    const t = cert.certType;

    if( t === CertificateType.StakeRegistration )       return BigInt(  2 ) * ada;
    if( t === CertificateType.StakeDeRegistration )     return BigInt( -2 ) * ada;

    if( t === CertificateType.PoolRegistration )        return BigInt(  500 ) * ada;
    if( t === CertificateType.PoolRetirement   )        return BigInt( -500 ) * ada;

    return BigInt(0);
}

export function certificatesToDepositLovelaces( certs: ICert[] ): bigint
{
    return certs.reduce( (a,b) => a + certToDepositLovelaces( b ), BigInt(0) );
}