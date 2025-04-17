import { CanBeCborString, Cbor, CborArray, CborBytes, CborObj, CborString, CborUInt, forceCborString, SubCborRef, ToCbor } from "@harmoniclabs/cbor";
import { isObject } from "@harmoniclabs/obj-utils";
import { isU8Arr, U8Arr } from "../../../utils/U8Arr";
import { isKesPubKey, KesPubKey } from "../Kes";
import { CanBeUInteger, canBeUInteger, forceBigUInt } from "../../../utils/ints";
import { getSubCborRef, subCborRefOrUndef } from "../../../utils/getSubCborRef";

/*
$signature = bytes .size 64

operational_cert = [hot_vkey : $kes_vkey
                   , sequence_number : uint .size 8
                   , kes_period : uint
                   , signature : $signature]
*/

export interface IPoolOperationalCert {
    kesPubKey: Uint8Array;
    sequenceNumber: CanBeUInteger;
    kesPeriod: CanBeUInteger;
    /* bytes .size 64 */
    signature: Uint8Array;
}

export interface IPoolOperationalCertChecked extends IPoolOperationalCert {
    kesPubKey: KesPubKey;
    sequenceNumber: CanBeUInteger;
    kesPeriod: CanBeUInteger;
    signature: U8Arr<64>;
}

export function isIPoolOperationalCert( thing: any ): thing is IPoolOperationalCertChecked
{
    return isObject( thing ) && (
        isKesPubKey( thing.kesPubKey ) &&
        canBeUInteger( thing.sequenceNumber ) &&
        canBeUInteger( thing.kesPeriod ) &&
        isU8Arr( thing.signature, 64 )
    );
}

export class PoolOperationalCert
    implements IPoolOperationalCert, ToCbor
{
    readonly kesPubKey: KesPubKey;
    readonly sequenceNumber: bigint;
    readonly kesPeriod: bigint;
    readonly signature: U8Arr<64>;

    constructor(
        cert: IPoolOperationalCert,
        readonly cborRef: SubCborRef | undefined = undefined
    )
    {
        if(!isIPoolOperationalCert(cert)) throw new Error("Invalid PoolOperationalCert");
        this.kesPubKey = cert.kesPubKey;
        this.sequenceNumber = forceBigUInt( cert.sequenceNumber );
        this.kesPeriod      = forceBigUInt( cert.kesPeriod );
        this.signature = cert.signature;
        
        this.cborRef = cborRef ?? subCborRefOrUndef( cert );
    }

    clone(): PoolOperationalCert
    {
        return new PoolOperationalCert({
            kesPubKey: Uint8Array.prototype.slice.call( this.kesPubKey, 0, 32 ),
            sequenceNumber: this.sequenceNumber,
            kesPeriod: this.kesPeriod,
            signature: Uint8Array.prototype.slice.call( this.signature, 0, 64 )
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
            new CborBytes( this.kesPubKey ),
            new CborUInt( this.sequenceNumber ),
            new CborUInt( this.kesPeriod ),
            new CborBytes( this.signature )
        ]);
    }

    static fromCbor( cbor: CanBeCborString ): PoolOperationalCert
    {
        const bytes = cbor instanceof Uint8Array ? cbor : forceCborString( cbor ).toBuffer();
        return PoolOperationalCert.fromCborObj(
            Cbor.parse( bytes, { keepRef: true } ),
            bytes
        );
    }
    static fromCborObj( cbor: CborObj, _originalBytes?: Uint8Array ): PoolOperationalCert
    {
        if(!(
            cbor instanceof CborArray
            && cbor.array.length >= 4
        )) throw new Error("invalid cbor for PoolOperationalCert");

        const [
            cKes,
            cSeq,
            cPeriod,
            cSig
        ] = cbor.array;

        if(!(
            cKes instanceof CborBytes
            && cKes.bytes.length === 32
            && cSeq instanceof CborUInt
            && cPeriod instanceof CborUInt
            && cSig instanceof CborBytes
            && cSig.bytes.length === 64
        )) throw new Error("invalid cbor for PoolOperationalCert");

        return new PoolOperationalCert({
            kesPubKey: cKes.bytes,
            sequenceNumber: cSeq.num,
            kesPeriod: cPeriod.num,
            signature: cSig.bytes
        }, getSubCborRef( cbor, _originalBytes ));
    }
}