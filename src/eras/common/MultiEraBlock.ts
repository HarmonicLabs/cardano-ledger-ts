import { CborArray, CborBytes, ToCbor, SubCborRef, CborString, Cbor, CborObj, CborMap, CborUInt, CborMapEntry, CanBeCborString, forceCborString, isCborObj} from "@harmoniclabs/cbor";
import { ToJson } from "../../utils/ToJson"
import { canBeUInteger, CanBeUInteger } from "@harmoniclabs/cbor/dist/utils/ints";
import { ConwayBlock } from '../conway/block/ConwayBlock';
import { BabbageBlock } from '../babbage/block/BabbageBlock';
import { AlonzoBlock } from '../alonzo/block/AlonzoBlock';


export interface IMultiEraBlock {
    era: CanBeUInteger;
    block: ConwayBlock | BabbageBlock | AlonzoBlock 
}

export class MultiEraBlock implements 
IMultiEraBlock, ToCbor, ToJson 
{
    readonly era: CanBeUInteger;
    readonly block: ConwayBlock | BabbageBlock | AlonzoBlock 
}