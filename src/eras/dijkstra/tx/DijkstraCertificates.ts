import { Cbor, CborArray, CborBytes, CborObj, CborSimple, CborUInt, SubCborRef } from "@harmoniclabs/cbor";
import { Certificate, certificateFromCborObj } from "../../common/ledger";
import { CertPoolRegistration, ICertPoolRegistration } from "../../common/ledger/certs/CertPoolRegistration";
import { PoolParams } from "../../common/ledger/PoolParams";
import { getSubCborRef } from "../../../utils/getSubCborRef";
import { InvalidCborFormatError } from "../../../utils/InvalidCborFormatError";

/*
    Dijkstra certificates (cardano-ledger eras/dijkstra TxCert.hs):

    - tags 0 and 1 (stake (de)registration without deposit) are rejected:
      "Certificates without deposits are no longer supported";
    - tag 5 (genesis delegation) and tag 6 (MIR) are rejected;
    - pool_registration_cert = (3, operator, vrf_keyhash, ? bls_key/ nil, pledge, ...)
      `bls_key = [bls_pubkey : bytes .size 96, bls_possession_proof : bytes .size 48]`
      Decoding peeks the 4th element: a list is the key, a null is "no key"
      (the null is consumed), anything else means the field is absent
      (StakePool.hs decodeBlsKeyBackwardsCompatible).
    - every other tag decodes exactly as in Conway.
*/

export interface IBlsKey {
    publicKey: Uint8Array; // 96 bytes
    possessionProof: Uint8Array; // 48 bytes
}

export interface IDijkstraCertPoolRegistration extends ICertPoolRegistration {
    blsKey?: IBlsKey | null;
    /** true when the wire form carried an explicit `nil` in the bls_key position */
    blsKeyExplicitNil?: boolean;
}

export class DijkstraCertPoolRegistration extends CertPoolRegistration
{
    readonly blsKey: IBlsKey | null;
    readonly blsKeyExplicitNil: boolean;

    constructor(
        cert: IDijkstraCertPoolRegistration,
        cborRef: SubCborRef | undefined = undefined
    )
    {
        super({ poolParams: cert.poolParams }, cborRef);
        this.blsKey = cert.blsKey ?? null;
        this.blsKeyExplicitNil = this.blsKey === null && cert.blsKeyExplicitNil === true;
        if( this.blsKey !== null && !(
            this.blsKey.publicKey instanceof Uint8Array && this.blsKey.publicKey.length === 96 &&
            this.blsKey.possessionProof instanceof Uint8Array && this.blsKey.possessionProof.length === 48
        )) throw new Error("invalid bls_key: expected [bytes .size 96, bytes .size 48]");
    }

    toCborObj(): CborArray
    {
        if( this.cborRef instanceof SubCborRef ) return Cbor.parse( this.cborRef.toBuffer() ) as CborArray;
        const params = this.poolParams.toCborObjArray();
        const bls: CborObj[] =
            this.blsKey !== null ? [ new CborArray([ new CborBytes( this.blsKey.publicKey ), new CborBytes( this.blsKey.possessionProof ) ]) ] :
            this.blsKeyExplicitNil ? [ new CborSimple( null ) ] : [];
        return new CborArray([
            new CborUInt( this.certType ),
            params[0], params[1],
            ...bls,
            ...params.slice( 2 )
        ]);
    }

    static fromCborObj( cbor: CborObj ): DijkstraCertPoolRegistration
    {
        if(!(
            cbor instanceof CborArray &&
            cbor.array[0] instanceof CborUInt &&
            Number( cbor.array[0].num ) === 3
        )) throw new InvalidCborFormatError("DijkstraCertPoolRegistration");

        const arr = cbor.array.slice( 1 );
        const fourth = arr[2];
        let blsKey: IBlsKey | null = null;
        let explicitNil = false;
        let rest = arr;
        if( fourth instanceof CborArray )
        {
            const [ pk, pop ] = fourth.array;
            if(!(
                fourth.array.length === 2 &&
                pk instanceof CborBytes && pk.bytes.length === 96 &&
                pop instanceof CborBytes && pop.bytes.length === 48
            )) throw new InvalidCborFormatError("DijkstraCertPoolRegistration: invalid bls_key");
            blsKey = { publicKey: pk.bytes, possessionProof: pop.bytes };
            rest = [ arr[0], arr[1], ...arr.slice( 3 ) ];
        }
        else if( fourth instanceof CborSimple && fourth.simple === null )
        {
            explicitNil = true;
            rest = [ arr[0], arr[1], ...arr.slice( 3 ) ];
        }
        if( rest.length !== 9 ) throw new InvalidCborFormatError("DijkstraCertPoolRegistration: pool_params must have 9 fields besides bls_key");

        return new DijkstraCertPoolRegistration({
            poolParams: PoolParams.fromCborObjArray( rest as any ),
            blsKey,
            blsKeyExplicitNil: explicitNil
        }, getSubCborRef( cbor ));
    }

    toJson()
    {
        return {
            ...super.toJson(),
            blsKey: this.blsKey === null ? null : {
                publicKey: Buffer.from( this.blsKey.publicKey ).toString("hex"),
                possessionProof: Buffer.from( this.blsKey.possessionProof ).toString("hex")
            }
        };
    }
}

/** `certificate` for the Dijkstra era (see the header comment for the differences from Conway). */
export function dijkstraCertificateFromCborObj( cbor: CborObj ): Certificate
{
    if(!(
        cbor instanceof CborArray &&
        cbor.array.length > 0 &&
        cbor.array[0] instanceof CborUInt
    )) throw new InvalidCborFormatError("Dijkstra certificate");

    const tag = Number( cbor.array[0].num );
    if( tag === 0 || tag === 1 ) throw new InvalidCborFormatError("Certificates without deposits are no longer supported");
    if( tag === 5 ) throw new InvalidCborFormatError("Genesis delegation certificates are no longer supported");
    if( tag === 6 ) throw new InvalidCborFormatError("MIR certificates are no longer supported");
    if( tag > 18 ) throw new InvalidCborFormatError("unknown Dijkstra certificate tag " + tag);
    if( tag === 3 ) return DijkstraCertPoolRegistration.fromCborObj( cbor ) as Certificate;
    return certificateFromCborObj( cbor );
}
