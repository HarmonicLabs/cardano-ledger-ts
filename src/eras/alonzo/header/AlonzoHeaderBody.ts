import { canBeUInteger, CanBeUInteger } from "@harmoniclabs/cbor/dist/utils/ints";
import { CanBeCborString, Cbor, CborArray, CborBytes, CborObj, CborSimple, CborString, CborUInt, forceCborString, SubCborRef, ToCbor } from "@harmoniclabs/cbor";
import { blake2b_256, sha2_256_sync } from "@harmoniclabs/crypto";
import { isObject } from "@harmoniclabs/obj-utils";
import { canBeHash32, CanBeHash32, hash32bytes } from "../../../hashes";
import { isIVrfCert, IVrfCert, VrfCert } from "../../common/Vrf";
import { IProtocolVersion, isIProtocolVersion, ProtocolVersion } from "../../common/protocolVersion";
import { IPoolOperationalCert, isIPoolOperationalCert, PoolOperationalCert } from "../../common/certs/PoolOperationalCert";
import { U8Arr, U8Arr32 } from "../../../utils/U8Arr";
import { forceBigUInt, u32 } from "../../../utils/ints";
import { getSubCborRef, subCborRefOrUndef } from "../../../utils/getSubCborRef";
import { IPraosHeaderBody } from "../../common/interfaces//IPraosHeader";
import { InvalidCborFormatError } from "../../../utils/InvalidCborFormatError";

    /*
    CDDL:
        header_body = [
            block_number : uint,
            slot : uint,
            prev_hash : $hash32 / nil,
            issuer_vkey : $vkey,
            vrf_vkey : $vrf_vkey,
            nonce_vrf : $vrf_cert,
            leader_vrf : $vrf_cert,
            block_body_size : uint,
            block_body_hash : $hash32,
            operational_cert : [kes_vkey : $kes_vkey, sequence_number : uint, kes_period : uint, sigma : $signature],
            protocol_version : [major : uint, minor : uint]
        ]
    */
export interface IAlonzoHeaderBody
{
    blockNumber: CanBeUInteger;
    slot: CanBeUInteger;
    prevHash: CanBeHash32 | undefined;
    issuerPubKey: CanBeHash32;
    vrfPubKey: CanBeHash32;
    nonceVrfResult: IVrfCert;
    leaderVrfResult: IVrfCert;
    /** u32 **/
    blockBodySize: CanBeUInteger;
    blockBodyHash: CanBeHash32;
    opCert: IPoolOperationalCert;
    protocolVersion: IProtocolVersion;
}

export function isIAlonzoHeaderBody( thing: any ): thing is IAlonzoHeaderBody
{
    return isObject( thing ) && (
        thing instanceof AlonzoHeaderBody ||
        (
            canBeUInteger( thing.blockNumber ) &&
            canBeUInteger( thing.slot ) &&
            (thing.prevHash === undefined || canBeHash32( thing.prevHash )) &&
            canBeHash32( thing.issuerPubKey ) &&
            canBeHash32( thing.vrfPubKey ) &&
            isIVrfCert( thing.nonceVrfResult ) &&
            isIVrfCert( thing.leaderVrfResult ) &&
            canBeUInteger( thing.blockBodySize ) &&
            canBeHash32( thing.blockBodyHash ) &&
            isIPoolOperationalCert( thing.opCert ) &&
            isIProtocolVersion( thing.protocolVersion )
        )
    );
}

export class AlonzoHeaderBody
    implements IAlonzoHeaderBody, ToCbor, IPraosHeaderBody
{
    readonly blockNumber: bigint;
    readonly slot: bigint;
    readonly prevHash: U8Arr<32> | undefined;
    readonly issuerPubKey: U8Arr<32>;
    readonly vrfPubKey: U8Arr<32>;
    readonly nonceVrfResult: VrfCert;
    readonly leaderVrfResult: VrfCert;
    readonly blockBodySize: number;
    readonly blockBodyHash: U8Arr<32>;
    readonly opCert: PoolOperationalCert;
    readonly protocolVersion: ProtocolVersion;

    constructor(
        hdrBody: IAlonzoHeaderBody,
        readonly cborRef: SubCborRef | undefined = undefined
    )
    {
        if(!isIAlonzoHeaderBody(hdrBody)) throw new Error("Invalid AlonzoHeaderBody");
        this.blockNumber = forceBigUInt( hdrBody.blockNumber );
        this.slot = forceBigUInt( hdrBody.slot );
        this.prevHash = typeof hdrBody.prevHash !== "undefined" ? hash32bytes( hdrBody.prevHash ) : undefined;
        this.issuerPubKey = hash32bytes( hdrBody.issuerPubKey );
        this.vrfPubKey = hash32bytes( hdrBody.vrfPubKey );
        this.nonceVrfResult = new VrfCert( hdrBody.nonceVrfResult );
        this.leaderVrfResult = new VrfCert( hdrBody.leaderVrfResult );
        this.blockBodySize = u32( hdrBody.blockBodySize );
        this.blockBodyHash = hash32bytes( hdrBody.blockBodyHash );
        this.opCert = new PoolOperationalCert( hdrBody.opCert );
        this.protocolVersion = new ProtocolVersion( hdrBody.protocolVersion );
    }

    getLeaderVrfCert(): VrfCert {
        return this.leaderVrfResult;
    }

    getNonceVrfCert(): VrfCert {
        return this.nonceVrfResult;
    }

    leaderVrfOutput(): U8Arr<32>
    {
        return sha2_256_sync(
            this.leaderVrfResult.proofHash
        ) as U8Arr<32>;
    }

    nonceVrfOutput(): U8Arr<32>
    {
        return sha2_256_sync(
            this.nonceVrfResult.proofHash
        ) as U8Arr<32>;
    }

    clone(): AlonzoHeaderBody
    {
        return new AlonzoHeaderBody({
            blockNumber: this.blockNumber,
            slot: this.slot,
            prevHash: this.prevHash?.slice(),
            issuerPubKey: this.issuerPubKey.slice(),
            vrfPubKey: this.vrfPubKey.slice(),
            nonceVrfResult: this.nonceVrfResult.clone(),
            leaderVrfResult: this.leaderVrfResult.clone(),
            blockBodySize: this.blockBodySize,
            blockBodyHash: this.blockBodyHash.slice(),
            opCert: this.opCert.clone(),
            protocolVersion: this.protocolVersion.clone()
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
        return new CborArray([
            new CborUInt( this.blockNumber ),
            new CborUInt( this.slot ),
            this.prevHash ? new CborBytes( this.prevHash ) : new CborSimple( null ),
            new CborBytes( this.issuerPubKey ),
            new CborBytes( this.vrfPubKey ),
            this.nonceVrfResult.toCborObj(),
            this.leaderVrfResult.toCborObj(),
            new CborUInt( this.blockBodySize ),
            new CborBytes( this.blockBodyHash ),
            new CborBytes( this.opCert.kesPubKey ),
            new CborUInt( this.opCert.sequenceNumber ),
            new CborUInt( this.opCert.kesPeriod ),
            new CborBytes( this.opCert.signature ),
            new CborUInt( this.protocolVersion.major ),
            new CborUInt( this.protocolVersion.minor )
        ]);
    }

    static fromCbor( cbor: CanBeCborString ): AlonzoHeaderBody
    {
        const bytes = cbor instanceof Uint8Array ? cbor : forceCborString( cbor ).toBuffer();
        return AlonzoHeaderBody.fromCborObj(
            Cbor.parse( bytes, { keepRef: true } ),
            bytes
        );
    }

    static fromCborObj( cHdrBody: CborObj, _originalBytes?: Uint8Array ): AlonzoHeaderBody
    {
        // console.log("cHdrBody Alonzo", cHdrBody);
        if (!(
            cHdrBody instanceof CborArray 
            // && cHdrBody.array.length === 15
        ))throw new InvalidCborFormatError("AlonzoHeaderBody");
    
        const [
            _cBlockNo,
            _cSlotNo,
            _cPrevHash,
            _cIssuerVkey,
            _cVrfVkey,
            _cNonceVrfCert,
            _cLeaderVrfCert,
            _cBlockBodySize,
            _cBlockBodyHash,
            _cOpCertHotVkey,
            _cOpCertSeqNum,
            _cOpCertKesPeriod,
            _cOpCertSigma,
            _cProtMajor,
            _cProtMinor
        ] = cHdrBody instanceof CborArray && cHdrBody.array.length === 15 
            ? cHdrBody.array 
            : cHdrBody instanceof CborArray && cHdrBody.array[0] instanceof CborArray 
                ? cHdrBody.array[0].array 
                : (() => { throw new InvalidCborFormatError("AlonzoHeaderBody"); })();

        if (!(
            _cBlockNo instanceof CborUInt &&
            _cSlotNo instanceof CborUInt &&
            (_cPrevHash instanceof CborBytes || _cPrevHash instanceof CborSimple) &&
            _cIssuerVkey instanceof CborBytes && _cIssuerVkey.bytes.length === 32 &&
            _cVrfVkey instanceof CborBytes && _cVrfVkey.bytes.length === 32 &&
            _cNonceVrfCert instanceof CborArray &&
            _cLeaderVrfCert instanceof CborArray &&
            _cBlockBodySize instanceof CborUInt &&
            _cBlockBodyHash instanceof CborBytes && _cBlockBodyHash.bytes.length === 32 &&
            _cOpCertHotVkey instanceof CborBytes && _cOpCertHotVkey.bytes.length === 32 &&
            _cOpCertSeqNum instanceof CborUInt &&
            _cOpCertKesPeriod instanceof CborUInt &&
            _cOpCertSigma instanceof CborBytes && _cOpCertSigma.bytes.length === 64 &&
            _cProtMajor instanceof CborUInt &&
            _cProtMinor instanceof CborUInt
        )) {
            throw new Error("invalid types in AlonzoHeaderBody");
        }

        const prevHash = _cPrevHash instanceof CborBytes ? hash32bytes(_cPrevHash.bytes) : undefined;

        const opCert = new PoolOperationalCert({
            kesPubKey: hash32bytes(_cOpCertHotVkey.bytes),
            sequenceNumber: forceBigUInt(_cOpCertSeqNum.num),
            kesPeriod: forceBigUInt(_cOpCertKesPeriod.num),
            signature: _cOpCertSigma.bytes as U8Arr<64>
        });

        const protocolVersion = new ProtocolVersion({
            major: u32(_cProtMajor.num),
            minor: u32(_cProtMinor.num)
        });

        return new AlonzoHeaderBody({
            blockNumber: forceBigUInt(_cBlockNo.num),
            slot: forceBigUInt(_cSlotNo.num),
            prevHash,
            issuerPubKey: hash32bytes(_cIssuerVkey.bytes),
            vrfPubKey: hash32bytes(_cVrfVkey.bytes),
            nonceVrfResult: VrfCert.fromCborObj(_cNonceVrfCert),
            leaderVrfResult: VrfCert.fromCborObj(_cLeaderVrfCert),
            blockBodySize: u32(_cBlockBodySize.num),
            blockBodyHash: hash32bytes(_cBlockBodyHash.bytes),
            opCert,
            protocolVersion
        }, getSubCborRef(cHdrBody, _originalBytes));
    }
}