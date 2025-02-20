import { CanBeUInteger } from "@harmoniclabs/cbor/dist/utils/ints";
import { CanBeHash32 } from "../../../hashes";

export interface IConwayHeaderBody
{
    blockNumber: CanBeUInteger;
    slot: CanBeUInteger;
    prevBlockHash: CanBeHash32 | undefined;
    issuerVkey: CanBeHash32;
}

export class ConwayHeaderBody
    implements IConwayHeaderBody
{

}