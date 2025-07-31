import { canBeUInteger, CanBeUInteger } from "@harmoniclabs/cbor/dist/utils/ints";
import { CanBeCborString, Cbor, CborArray, CborBytes, CborObj, CborSimple, CborString, CborUInt, forceCborString, SubCborRef, ToCbor } from "@harmoniclabs/cbor";
import { blake2b_256, sha2_256_sync } from "@harmoniclabs/crypto";
import { isObject } from "@harmoniclabs/obj-utils";
import { canBeHash32, CanBeHash32, hash32bytes } from "../../../hashes";
import { isIVrfCert, IVrfCert, VrfCert } from "../../common/ledger/Vrf";
import { IProtocolVersion, isIProtocolVersion, ProtocolVersion } from "../../common/ledger/protocol";
import { IPoolOperationalCert, isIPoolOperationalCert, PoolOperationalCert } from "../../common/ledger/certs/PoolOperationalCert";
import { U8Arr, U8Arr32 } from "../../../utils/U8Arr";
import { forceBigUInt, u32 } from "../../../utils/ints";
import { getSubCborRef } from "../../../utils/getSubCborRef";
import { IPraosHeaderBody } from "../../common/interfaces//IPraosHeader";
import { InvalidCborFormatError } from "../../../utils/InvalidCborFormatError";
export interface IBabbageHeaderBody
{
    blockNumber: CanBeUInteger;
    slot: CanBeUInteger;
    prevHash: CanBeHash32 | undefined;
    issuerPubKey: CanBeHash32;
    vrfPubKey: CanBeHash32;
    vrfResult: IVrfCert
    /** u32 **/
    blockBodySize: CanBeUInteger;
    blockBodyHash: CanBeHash32;
    opCert: IPoolOperationalCert;
    protocolVersion: IProtocolVersion;
}

export function isIBabbageHeaderBody( thing: any ): thing is IBabbageHeaderBody
{
    return isObject( thing ) && (
        thing instanceof BabbageHeaderBody // already validated at construction, shortcut
        || (
            canBeUInteger( thing.blockNumber )
            && canBeUInteger( thing.slot )
            && (thing.prevHash === undefined || canBeHash32( thing.prevHash ))
            && canBeHash32( thing.issuerPubKey )
            && canBeHash32( thing.vrfPubKey )
            && isIVrfCert( thing.vrfResult )
            && canBeUInteger( thing.blockBodySize )
            && canBeHash32( thing.blockBodyHash )
            && isIPoolOperationalCert( thing.opCert )
            && isIProtocolVersion( thing.protocolVersion )
        )
    );
}

export class BabbageHeaderBody
    implements IBabbageHeaderBody, ToCbor, IPraosHeaderBody
{
    readonly blockNumber: bigint;
    readonly slot: bigint;
    readonly prevHash: U8Arr<32> | undefined;
    readonly issuerPubKey: U8Arr<32>;
    readonly vrfPubKey: U8Arr<32>;
    readonly vrfResult: VrfCert;
    readonly blockBodySize: number;
    readonly blockBodyHash: U8Arr<32>;
    readonly opCert: PoolOperationalCert;
    readonly protocolVersion: ProtocolVersion;
   
    constructor(
        hdrBody: IBabbageHeaderBody,
        readonly cborRef: SubCborRef | undefined = undefined
    )
    {
        if(!isIBabbageHeaderBody(hdrBody)) throw new Error("Invalid BabbageHeaderBody");
        this.blockNumber = forceBigUInt( hdrBody.blockNumber );
        this.slot = forceBigUInt( hdrBody.slot );
        this.prevHash = typeof hdrBody.prevHash !== "undefined" ? hash32bytes( hdrBody.prevHash ) : undefined;
        this.issuerPubKey = hash32bytes( hdrBody.issuerPubKey );
        this.vrfPubKey = hash32bytes( hdrBody.vrfPubKey );
        this.vrfResult = new VrfCert( hdrBody.vrfResult );
        this.blockBodySize = u32( hdrBody.blockBodySize );
        this.blockBodyHash = hash32bytes( hdrBody.blockBodyHash );
        this.opCert = new PoolOperationalCert( hdrBody.opCert );
        this.protocolVersion = new ProtocolVersion( hdrBody.protocolVersion );
    }

    // just keep the leaderVrfOutput and nonceVrfOutput ones
    leaderVrfOutput(): U8Arr<32>
    {
        return sha2_256_sync(
            this.vrfResult.proofHash
        ) as U8Arr<32>;
    }
    nonceVrfOutput: () => U8Arr32;   

    clone(): BabbageHeaderBody
    {
        return new BabbageHeaderBody({
            blockNumber: this.blockNumber,
            slot: this.slot,
            prevHash: this.prevHash?.slice(),
            issuerPubKey: this.issuerPubKey.slice(),
            vrfPubKey: this.vrfPubKey.slice(),
            vrfResult: this.vrfResult.clone(),
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
        if( this.cborRef instanceof SubCborRef ) return Cbor.parse( this.cborRef.toBuffer() ) as CborArray;

        return new CborArray([
            new CborUInt( this.blockNumber ),
            new CborUInt( this.slot ),
            this.prevHash ? new CborBytes( this.prevHash ) : new CborSimple( null ),
            new CborBytes( this.issuerPubKey ),
            new CborBytes( this.vrfPubKey ),
            this.vrfResult.toCborObj(),
            new CborUInt( this.blockBodySize ),
            new CborBytes( this.blockBodyHash ),
            this.opCert.toCborObj(),
            this.protocolVersion.toCborObj()
        ]);
    }
    /*
    CDDL:
        header_body = [block_number : uint
              , slot : uint
              , prev_hash : $hash32 / nil
              , issuer_vkey : $vkey
              , vrf_vkey : $vrf_vkey
              , vrf_result : $vrf_cert
              , block_body_size : uint
              , block_body_hash : $hash32
              , operational_cert
              , protocol_version]
    */

    static fromCbor( cbor: CanBeCborString ): BabbageHeaderBody
    {
        const bytes = cbor instanceof Uint8Array ? cbor : forceCborString( cbor ).toBuffer();
        return BabbageHeaderBody.fromCborObj(
            Cbor.parse( bytes, { keepRef: true } ),
            bytes
        );
    }
    static fromCborObj(cHdrBody: CborObj, _originalBytes?: Uint8Array): BabbageHeaderBody 
    {
        // console.log("cHdrBody Babbage", cHdrBody);
        if(!(
            cHdrBody instanceof CborArray
        ))throw new InvalidCborFormatError("BabbageHeaderBody");
        // console.log("cobj:", cHdrBody);

        const [
            _cBlockNo,          // block_number
            _cSlotNo,           // slot
            _cPrevHash,         // prev_hash
            _cIssuerVkey,       // issuer_vkey
            _cVrfVkey,          // vrf_vkey
            _cVrfCert,          // vrf_result
            _cBlockBodySize,    // block_body_size
            _cBlockBodyHash,    // block_body_hash
            _cOpCert,           // operational_cert
            _cProtVer           // protocol_version
        ] = cHdrBody instanceof CborArray && cHdrBody.array.length === 10 
            ? cHdrBody.array 
            : cHdrBody instanceof CborArray && cHdrBody.array[0] instanceof CborArray 
                ? cHdrBody.array[0].array 
                : (() => { throw new InvalidCborFormatError("BabbageHeaderBody"); })();
    
        if (!(
            _cBlockNo instanceof CborUInt &&
            _cSlotNo instanceof CborUInt &&
            (_cPrevHash instanceof CborBytes || _cPrevHash === undefined) && // Allow nil per CDDL
            _cIssuerVkey instanceof CborBytes &&
            _cVrfVkey instanceof CborBytes &&
            _cBlockBodySize instanceof CborUInt &&
            _cBlockBodyHash instanceof CborBytes
        )) {
            throw new Error("invalid cbor for BabbageHeaderBody");
        }
        
        const babbageHeaderBody = new BabbageHeaderBody({
            blockNumber: Number(_cBlockNo.num),
            slot: _cSlotNo.num,
            prevHash: _cPrevHash?.bytes as U8Arr32 | undefined, // Handle nil case
            issuerPubKey: _cIssuerVkey.bytes as U8Arr32,
            vrfPubKey: _cVrfVkey.bytes as U8Arr32,
            vrfResult: VrfCert.fromCborObj(_cVrfCert),
            blockBodySize: _cBlockBodySize.num,
            blockBodyHash: _cBlockBodyHash.bytes as U8Arr32,
            opCert: PoolOperationalCert.fromCborObj(_cOpCert),
            protocolVersion: ProtocolVersion.fromCborObj(_cProtVer)
        }, getSubCborRef( cHdrBody, _originalBytes ))

        return babbageHeaderBody;
    }
}