import { IOperationalCert, isIOperationalCert, opCertToCborObj, opCertFromCborObj } from "../../common/operationalCert";
import { VrfCert, isVrfCert, vrfCertToCborObj, vrfCertFromCborObj } from "../../common/vrfCert";
import { IProtocolVersion, protocolVersionFromCborObj } from "../../common/protocolVersion";
import { isBlockNo, isSlotNo, isBlockBodySize } from "../../../utils/isThatType";
import { isIProtocolVersion, protocolVersionToCborObj } from "../../../ledger";
import { BlockNo, SlotNo, BlockBodySize } from "../../../utils/types";
import { CborArray, CborUInt, CborObj } from "@harmoniclabs/cbor";
import { Hash32, VRFKeyHash, canBeHash32 } from "../../../hashes";

export interface IBabbageHeaderBody {
    readonly blockNo: BlockNo;
    readonly slotNo: SlotNo;
    readonly prevBlock: Hash32;
    readonly issuerVkey: Hash32;
    readonly vrfVkey: VRFKeyHash;
    readonly vrfResult: VrfCert;                            // new
    readonly blockBodySize: BlockBodySize;
    readonly blockBodyHash: Hash32;
    readonly operationalCert: IOperationalCert;
    readonly protocolVersion: IProtocolVersion;             // min: 1, max: 9
}

export function isIBabbageHeaderBody( stuff: any ): stuff is IBabbageHeaderBody 
{
    return (
        isBlockNo( stuff.blockNo ) &&
        isSlotNo( stuff.slotNo ) &&
        canBeHash32( stuff.prevBlock ) &&
        canBeHash32( stuff.issuerVkey ) &&
        canBeHash32( stuff.vrfVkey ) &&
        isVrfCert( stuff.vrfResult ) &&
        isBlockBodySize( stuff.blockBodySize ) &&
        canBeHash32( stuff.blockBodyHash ) &&
        isIOperationalCert( stuff.operationalCert ) &&
        isIProtocolVersion( stuff.protocolVersion )
    );
}

export function headerBodyToCborObj( headerBody: IBabbageHeaderBody ): CborArray
{
    return new CborArray([
        new CborUInt( headerBody.blockNo ),
        new CborUInt( headerBody.slotNo ),
        headerBody.prevBlock.toCborObj(),
        headerBody.issuerVkey.toCborObj(),
        headerBody.vrfVkey.toCborObj(),
        vrfCertToCborObj( headerBody.vrfResult ),
        new CborUInt( headerBody.blockBodySize ),
        headerBody.blockBodyHash.toCborObj(),
        opCertToCborObj( headerBody.operationalCert ),
        protocolVersionToCborObj( headerBody.protocolVersion )
    ]);
}

export function headerBodyFromCborObj( cbor: CborObj ): IBabbageHeaderBody
{
    if(!( 
        cbor instanceof CborArray &&
        cbor.array.length >= 11 
    )) throw new Error( "invalid cbor format for `IBabbageHeaderBody`" );

    const [ 
        cborBlockNo,
        cborSlotNo,
        cborPrevBlock,
        cborIssuerVkey,
        cborVrfVkey,
        cborVrfResult,
        cborBlockBodySize,
        cborBlockBodyHash,
        cborOperationalCert,
        cborProtocolVersion
    ] = cbor.array;
    
    if(!( 
        cborBlockNo instanceof CborUInt &&
        cborSlotNo instanceof CborUInt &&
        cborPrevBlock instanceof CborArray &&
        cborIssuerVkey instanceof CborArray &&
        cborVrfVkey instanceof CborArray &&
        cborVrfResult instanceof CborArray &&
        cborBlockBodySize instanceof CborUInt &&
        cborBlockBodyHash instanceof CborArray &&
        cborOperationalCert instanceof CborArray &&
        cborProtocolVersion instanceof CborArray
    )) throw new Error( "invalid cbor format for `IBabbageHeaderBody`" );

    return {
        blockNo: cborBlockNo.num as BlockNo,
        slotNo: cborSlotNo.num as SlotNo,
        prevBlock: Hash32.fromCborObj( cborPrevBlock ) as Hash32,
        issuerVkey: Hash32.fromCborObj( cborIssuerVkey ) as Hash32,
        vrfVkey: VRFKeyHash.fromCborObj( cborVrfVkey ) as VRFKeyHash,
        vrfResult: vrfCertFromCborObj( cborVrfResult ) as VrfCert,
        blockBodySize: cborBlockBodySize.num as BlockBodySize,
        blockBodyHash: Hash32.fromCborObj( cborBlockBodyHash ) as Hash32,
        operationalCert: opCertFromCborObj( cborOperationalCert ) as IOperationalCert,
        protocolVersion: protocolVersionFromCborObj( cborProtocolVersion ) as IProtocolVersion
    };
}
