import { isObject } from "@harmoniclabs/obj-utils";
import { isU8Arr, U8Arr } from "../../utils/U8Arr";
import { CanBeCborString, Cbor, CborArray, CborBytes, CborObj, CborString, forceCborString, SubCborRef, ToCbor } from "@harmoniclabs/cbor";
import { getSubCborRef, subCborRefOrUndef } from "../../utils/getSubCborRef";

/** just an alias to accepts all bytes, but still give indications **/
export type VrfProofHashBytes = Uint8Array;
export type VrfProofHash = U8Arr<64>;
export type VrfProofBytes = U8Arr<80>;

export interface IVrfCert {
    proofHash: VrfProofHashBytes;
    proof: VrfProofBytes;
}

export interface IVrfCertChecked extends IVrfCert {
    proofHash: VrfProofHash;
    proof: VrfProofBytes;
}

export function isIVrfCert( stuff: any ): stuff is IVrfCertChecked
{
    return isObject( stuff ) && (
        (stuff instanceof VrfCert) // already validated at construction, shortcut
        || (
            isU8Arr( stuff.proofHash, 64 ) &&
            isU8Arr( stuff.proof, 80 )
        )
    );
}

/** $vrf_cert = [bytes, bytes .size 80] **/
export class VrfCert
    implements IVrfCertChecked, ToCbor
{
    readonly proofHash: VrfProofHash;
    readonly proof: VrfProofBytes;

    constructor(
        cert: IVrfCert,
        readonly cborRef: SubCborRef | undefined = undefined
    )
    {
        if(!isIVrfCert(cert)) throw new Error("Invalid VrfCert");
        this.proofHash = cert.proofHash;
        this.proof  = cert.proof;
        this.cborRef = cborRef ?? subCborRefOrUndef( cert );
    }

    clone(): VrfCert
    {
        return new VrfCert({
            proofHash: this.proofHash,
            proof: this.proof
        }, this.cborRef?.clone());
    }

    toCborBytes(): Uint8Array
    {
        if( this.cborRef instanceof SubCborRef ) return this.cborRef.toBuffer();
        return this.toCbor().toBuffer();
    }
    toCbor(): CborString
    {
        if( this.cborRef instanceof SubCborRef ) return new CborString( this.cborRef.toBuffer() );
        return Cbor.encode( this.toCborObj() );
    }
    toCborObj(): CborArray
    {
        if( this.cborRef instanceof SubCborRef ) return Cbor.parse( this.cborRef.toBuffer() ) as CborArray;

        return new CborArray([
            new CborBytes( this.proofHash ),
            new CborBytes( this.proof )
        ]);
    }

    static fromCbor( cbor: CanBeCborString ): VrfCert
    {
        const bytes = cbor instanceof Uint8Array ? cbor : forceCborString( cbor ).toBuffer();
        return VrfCert.fromCborObj( Cbor.parse( bytes, { keepRef: true } ), bytes );
    }
    static fromCborObj(
        cbor: CborObj,
        _originalBytes: Uint8Array | undefined = undefined
    ): VrfCert
    {
        if(!(
            cbor instanceof CborArray &&
            cbor.array.length >= 2 &&
            cbor.array[0] instanceof CborBytes &&
            cbor.array[1] instanceof CborBytes &&
            cbor.array[1].bytes.length === 80
        )) throw new Error("invalid cbor for 'VrfCert'");
    
        return new VrfCert({
            proofHash: cbor.array[0].bytes,
            proof: cbor.array[1].bytes as VrfProofBytes
        }, getSubCborRef( cbor, _originalBytes ));
    }
}