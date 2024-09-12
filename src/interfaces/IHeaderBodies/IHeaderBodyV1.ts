import { IOperationalCert, isIOperationalCert, opCertToCborObj, opCertFromCborObj } from "../../eras/common/operationalCert";
import { VrfCert, isVrfCert, vrfCertToCborObj, vrfCertFromCborObj } from "../../eras/common/vrfCert";
import { IProtocolVersion, protocolVersionFromCborObj } from "../../eras/common/protocolVersion";
import { isBlockNo, isSlotNo, isBlockBodySize } from "../../utils/isThatType";
import { isIProtocolVersion, protocolVersionToCborObj } from "../../ledger";
import { BlockNo, SlotNo, BlockBodySize } from "../../utils/types";
import { CborArray, CborUInt, CborObj } from "@harmoniclabs/cbor";
import { Hash32, VRFKeyHash, canBeHash32 } from "../../hashes";

// header body interface from shelley to alonzo

// protocolVersion maxs e mins:
// shelley -> min: 1, max: 3
// allegra -> min: 1, max: 5
// mary -> min: 1, max: 5
// alonzo -> min: 1, max: 7

export interface IHeaderBodyV1 {
    readonly blockNo: BlockNo;
    readonly slotNo: SlotNo;
    readonly prevBlock: Hash32;
    readonly issuerVkey: Hash32;
    readonly vrfVkey: VRFKeyHash;
    readonly nonceVrf: VrfCert;
    readonly leaderVrf: VrfCert;
    readonly blockBodySize: BlockBodySize;
    readonly blockBodyHash: Hash32;
    readonly operationalCert: IOperationalCert;
    readonly protocolVersion: IProtocolVersion;
}

export function isIHeaderBodyV1( stuff: any ): stuff is IHeaderBodyV1 
{
    return (
        isBlockNo( stuff.blockNo ) &&
        isSlotNo( stuff.slotNo ) &&
        canBeHash32( stuff.prevBlock ) &&
        canBeHash32( stuff.issuerVkey ) &&
        canBeHash32( stuff.vrfVkey ) &&
        isVrfCert( stuff.nonceVrf ) &&
        isVrfCert( stuff.leaderVrf ) &&
        isBlockBodySize( stuff.blockBodySize ) &&
        canBeHash32( stuff.blockBodyHash ) &&
        isIOperationalCert( stuff.operationalCert ) &&
        isIProtocolVersion( stuff.protocolVersion )
    );
}

export function headerBodyToCborObj( headerBody: IHeaderBodyV1 ): CborArray
{
    return new CborArray([
        new CborUInt( headerBody.blockNo ),
        new CborUInt( headerBody.slotNo ),
        headerBody.prevBlock.toCborObj(),
        headerBody.issuerVkey.toCborObj(),
        headerBody.vrfVkey.toCborObj(),
        vrfCertToCborObj( headerBody.nonceVrf ),
        vrfCertToCborObj( headerBody.leaderVrf ),
        new CborUInt( headerBody.blockBodySize ),
        headerBody.blockBodyHash.toCborObj(),
        opCertToCborObj( headerBody.operationalCert ),
        protocolVersionToCborObj( headerBody.protocolVersion )
    ]);
}

export function headerBodyFromCborObj( cbor: CborObj ): IHeaderBodyV1
{
    if(!( 
        cbor instanceof CborArray &&
        cbor.array.length >= 11 
    )) throw new Error( "invalid cbor format for `IIHeaderBodyV1`" );

    const [ 
        cborBlockNo,
        cborSlotNo,
        cborPrevBlock,
        cborIssuerVkey,
        cborVrfVkey,
        cborNonceVrf,
        cborLeaderVrf,
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
        cborNonceVrf instanceof CborArray &&
        cborLeaderVrf instanceof CborArray &&
        cborBlockBodySize instanceof CborUInt &&
        cborBlockBodyHash instanceof CborArray &&
        cborOperationalCert instanceof CborArray &&
        cborProtocolVersion instanceof CborArray
    )) throw new Error( "invalid cbor format for `IIHeaderBodyV1`" );

    return {
        blockNo: cborBlockNo.num as BlockNo,
        slotNo: cborSlotNo.num as SlotNo,
        prevBlock: Hash32.fromCborObj( cborPrevBlock ) as Hash32,
        issuerVkey: Hash32.fromCborObj( cborIssuerVkey ) as Hash32,
        vrfVkey: VRFKeyHash.fromCborObj( cborVrfVkey ) as VRFKeyHash,
        nonceVrf: vrfCertFromCborObj( cborNonceVrf ) as VrfCert,
        leaderVrf: vrfCertFromCborObj( cborLeaderVrf ) as VrfCert,
        blockBodySize: cborBlockBodySize.num as BlockBodySize,
        blockBodyHash: Hash32.fromCborObj( cborBlockBodyHash ) as Hash32,
        operationalCert: opCertFromCborObj( cborOperationalCert ) as IOperationalCert,
        protocolVersion: protocolVersionFromCborObj( cborProtocolVersion ) as IProtocolVersion
    };
}
