import { ToCbor, Cbor, CborArray, CborBytes, CborObj, CborString, CanBeCborString, forceCborString, SubCborRef } from "@harmoniclabs/cbor";
import { CanBeUInteger } from "@harmoniclabs/cbor/dist/utils/ints";
import { forceBigUInt } from "../../../utils/ints";
import { getSubCborRef } from "../../../utils/getSubCborRef";
import { InvalidCborFormatError } from "../../../utils/InvalidCborFormatError";
import { parseCborFull } from "../../../utils/strictCbor";
import { ToJson } from "../../../utils/ToJson";

/**
 * cardano-ledger Dijkstra CDDL:
 *   leios_certificate = [ signers : bytes .size (0 .. 8192), signature : bytes .size 48 ]
 *
 * `signers` is a committee bitfield, ordered by voter index. The first voter
 * is the most-significant bit of byte 0, exactly like `IsSignerBitfield...`
 * in gouroboros and `Cardano.Ledger.Binary.Bytepslicer` in cardano-ledger.
 */
export const LEIOS_CERTIFICATE_BITFIELD_MAX_BYTES = 8192;
export const LEIOS_CERTIFICATE_SIGNATURE_SIZE = 48;
/** gouroboros `ledger/common/leios.go`: maxcommittee size checked before voting */
export const LEIOS_COMMITTEE_MAX_SIZE = 65536;

export interface ILeiosCertificate
{
    /** committee bitfield (up to 8192 bytes) */
    signers: Uint8Array;
    /** BLS aggregate signature, 48 bytes */
    signature: Uint8Array;
}

export function isLeiosSignerBitfield( signers: unknown ): signers is Uint8Array
{
    return signers instanceof Uint8Array && signers.length <= LEIOS_CERTIFICATE_BITFIELD_MAX_BYTES;
}

/** the exact bitfield byte length gouroboros expects for a committee of `committeeSize` members */
export function leiosSignerBitfieldSize( committeeSize: CanBeUInteger ): number
{
    const n = forceBigUInt( committeeSize );
    if( n > BigInt( LEIOS_COMMITTEE_MAX_SIZE ) )
        throw new Error("Leios committee size exceeds " + LEIOS_COMMITTEE_MAX_SIZE);
    return Math.ceil( Number( n ) / 8 );
}

/**
 * Validates `signers` against a committee size.
 *
 * - the byte length must be exactly ceil(committeeSize / 8);
 * - unused trailing bits (committeeSize % 8) must be zero, as in
 *   gouroboros `IsSignerBitfieldValidForSize`.
 */
export function validateLeiosSignerBitfield( signers: Uint8Array, committeeSize: CanBeUInteger ): void
{
    if( !( signers instanceof Uint8Array ) ) throw new Error("Leios signers must be bytes");
    const expected = leiosSignerBitfieldSize( committeeSize );
    if( signers.length !== expected )
        throw new Error(
            "invalid Leios signer bitfield: committee of " + forceBigUInt( committeeSize ).toString() +
            " members needs " + expected + " bytes, got " + signers.length
        );
    const committee = Number( forceBigUInt( committeeSize ) );
    const unused = ( 8 - ( committee % 8 ) ) % 8;
    if( unused > 0 )
    {
        const mask = ( 1 << unused ) - 1;
        if( ( signers[ signers.length - 1 ] & ( mask << ( 8 - unused ) ) ) !== 0 )
            throw new Error("invalid Leios signer bitfield: unused high bits must be zero");
    }
}

/** true if voter `voterId` (bit 7 of each byte is its first voter) signed */
export function isLeiosSigner( signers: Uint8Array, voterId: CanBeUInteger ): boolean
{
    const id = Number( forceBigUInt( voterId ) );
    const byteIndex = Math.floor( id / 8 );
    if( byteIndex >= signers.length ) return false;
    const bit = 7 - ( id % 8 );
    return ( ( signers[ byteIndex ] >> bit ) & 1 ) === 1;
}

export function areLeiosSignersSignatureValid( signers: Uint8Array, signature: Uint8Array ): boolean
{
    return isLeiosSignerBitfield( signers ) && signature.length === LEIOS_CERTIFICATE_SIGNATURE_SIZE;
}

export class DijkstraLeiosCertificate implements ToCbor, ToJson
{
    readonly signers: Uint8Array;
    readonly signature: Uint8Array;
    readonly cborRef: SubCborRef | undefined;

    constructor( cert: ILeiosCertificate, readonly _cborRef: SubCborRef | undefined = undefined )
    {
        if( !( cert.signers instanceof Uint8Array ) ) throw new Error("invalid leios_certificate.signers");
        if( cert.signers.length > LEIOS_CERTIFICATE_BITFIELD_MAX_BYTES )
            throw new Error("leios_certificate.signers exceeds 8192 bytes");
        if( !( cert.signature instanceof Uint8Array ) || cert.signature.length !== LEIOS_CERTIFICATE_SIGNATURE_SIZE )
            throw new Error("leios_certificate.signature must be 48 bytes");
        this.signers = cert.signers;
        this.signature = cert.signature;
        this.cborRef = _cborRef;
    }

    /** validates the committee bitfield width and its unused bits */
    validateSignerBitfield( committeeSize: CanBeUInteger ): void
    {
        validateLeiosSignerBitfield( this.signers, committeeSize );
    }

    isSigner( voterId: CanBeUInteger ): boolean
    {
        return isLeiosSigner( this.signers, voterId );
    }

    /** `[signers, signature]` with the canonical byte-string widths */
    toCborObj(): CborArray
    {
        return new CborArray([
            new CborBytes( this.signers ),
            new CborBytes( this.signature )
        ]);
    }

    toCborBytes(): Uint8Array
    {
        if( this.cborRef instanceof SubCborRef ) return this.cborRef.toBuffer();
        return this.toCbor();
    }

    toCbor(): CborString
    {
        if( this.cborRef instanceof SubCborRef ) return this.cborRef.toBuffer();
        return Cbor.encode( this.toCborObj() );
    }

    static fromCborObj( cObj: CborObj, _originalBytes?: Uint8Array ): DijkstraLeiosCertificate
    {
        if( !( cObj instanceof CborArray ) || cObj.array.length !== 2 )
            throw new InvalidCborFormatError("Dijkstra leios_certificate must be [bytes, bytes]");
        const signers = cObj.array[0];
        const signature = cObj.array[1];
        if( !( signers instanceof CborBytes ) || signers.bytes.length > LEIOS_CERTIFICATE_BITFIELD_MAX_BYTES )
            throw new InvalidCborFormatError("leios_certificate.signers must be bytes .size (0..8192)");
        if( !( signature instanceof CborBytes ) || signature.bytes.length !== LEIOS_CERTIFICATE_SIGNATURE_SIZE )
            throw new InvalidCborFormatError("leios_certificate.signature must be bytes .size 48");
        return new DijkstraLeiosCertificate(
            { signers: signers.bytes, signature: signature.bytes },
            getSubCborRef( cObj, _originalBytes )
        );
    }

    static fromCbor( cStr: CanBeCborString ): DijkstraLeiosCertificate
    {
        const bytes = cStr instanceof Uint8Array ? cStr : forceCborString( cStr );
        return DijkstraLeiosCertificate.fromCborObj(
            parseCborFull( bytes, "DijkstraLeiosCertificate" ),
            bytes
        );
    }

    toJson()
    {
        return {
            signers: Buffer.from( this.signers ).toString("hex"),
            signature: Buffer.from( this.signature ).toString("hex")
        };
    }

    toJSON() { return this.toJson(); }
}
