import { CborArray, CborBytes, ToCbor, SubCborRef, CborString, Cbor, CborObj, CborMap, CborUInt, CborMapEntry, CanBeCborString, forceCborString, isCborObj} from "@harmoniclabs/cbor";
import { ToJson } from "../../utils/ToJson"
import { canBeUInteger, CanBeUInteger } from "@harmoniclabs/cbor/dist/utils/ints";
import { ConwayBlock } from '../conway/block/ConwayBlock';
import { BabbageBlock } from '../babbage/block/BabbageBlock';

export interface IMultiEraBlock {
    era: CanBeUInteger;
    block: ConwayBlock | BabbageBlock 
}

export class MultiEraBlock implements 
IMultiEraBlock
{
    readonly era: CanBeUInteger;
    readonly block: ConwayBlock | BabbageBlock

    constructor(
        block: IMultiEraBlock,
        readonly cborRef: SubCborRef | undefined = undefined
    ) 
    {
        this.era = block.era;
        this.block = block.block;
    }
    )

}