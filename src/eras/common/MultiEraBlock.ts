import { ConwayBlock } from '../conway/block/ConwayBlock';
import { BabbageBlock } from '../babbage/block/BabbageBlock';
import { AlonzoBlock } from '../alonzo/block/AlonzoBlock';
import { MaryBlock } from '../mary/block/MaryBlock';
import { AllegraBlock } from '../allegra/block/AllegraBlock';
import { ShelleyBlock } from '../shelley/block/ShelleyBlock';
import { CborArray, ToCbor, SubCborRef, CborString, Cbor, CborObj, CborUInt, CanBeCborString, forceCborString } from "@harmoniclabs/cbor";
import { ToJson } from "../../utils/ToJson"
import { getSubCborRef } from "../../utils/getSubCborRef";
import { InvalidCborFormatError } from "../../utils/InvalidCborFormatError"
import { CardanoEra } from "./types/CardanoEra";

export interface IMultiEraBlock {
    era: CardanoEra;
    block: ConwayBlock | BabbageBlock | AlonzoBlock | MaryBlock | AllegraBlock | ShelleyBlock;
}

export class MultiEraBlock implements 
IMultiEraBlock, ToCbor, ToJson 
{
    readonly era: CardanoEra;
    readonly block: ConwayBlock | BabbageBlock | AlonzoBlock | MaryBlock | AllegraBlock | ShelleyBlock;

    constructor(
        block: IMultiEraBlock,
        readonly cborRef: SubCborRef | undefined = undefined
    ) 
    { 
        this.era = block.era;
        this.block = block.block;
    }

    toCborBytes(): Uint8Array {
        if (this.cborRef instanceof SubCborRef) return this.cborRef.toBuffer();
        return this.toCbor().toBuffer();
    }

    toCbor(): CborString {
        if (this.cborRef instanceof SubCborRef) return new CborString(this.cborRef.toBuffer());
        return Cbor.encode(this.toCborObj());
    }

    toCborObj(): CborArray {
        if (this.cborRef instanceof SubCborRef) return Cbor.parse(this.cborRef.toBuffer()) as CborArray;
        return new CborArray([
            new CborUInt(BigInt(this.era)),
            this.block.toCborObj()
        ]);
    }

    static fromCbor(cbor: CanBeCborString): MultiEraBlock {
        const bytes = cbor instanceof Uint8Array ? cbor : forceCborString(cbor).toBuffer();
        return MultiEraBlock.fromCborObj(Cbor.parse(bytes, { keepRef: true }), bytes);
    }

    static fromCborObj(cObj: CborObj, _originalBytes?: Uint8Array): MultiEraBlock {
        if(!(
            cObj instanceof CborArray 
            && cObj.array.length >= 2
        ))throw new InvalidCborFormatError("Invalid CBOR for MultiEraBlock");

        const _era = cObj.array[0];
        const _blockData = cObj.array[1];

        if(!(_era instanceof CborUInt

        ))throw new InvalidCborFormatError("Era must be a CborUInt");
        

        let block: ConwayBlock | BabbageBlock | AlonzoBlock | MaryBlock | AllegraBlock | ShelleyBlock;
        switch (Number(_era.num)) {
            case 7: // Conway era
                block = ConwayBlock.fromCborObj(_blockData);
                break;
            case 6: // Babbage era
                block = BabbageBlock.fromCborObj(_blockData);
                break;
            case 5: // Alonzo era
                block = AlonzoBlock.fromCborObj(_blockData);
                break;
            case 4: // Mary era
                block = MaryBlock.fromCborObj(_blockData);
                break;
            case 3 : // Allegra era
                block = AllegraBlock.fromCborObj(_blockData);
                break;
            case 2: // Shelley era
                block = ShelleyBlock.fromCborObj(_blockData);
                break;
            default:
                throw new Error(`Unsupported era: ${_era.num}`);
        }

        const multiEraBlock =new MultiEraBlock({
            era: Number(_era.num),
            block
        }, getSubCborRef(cObj, _originalBytes));
        // console.log("multiEraBlock", multiEraBlock.toJSON());
        return multiEraBlock;
    }

    toJSON() 
    { 
        return this.toJson(); 
    };

    toJson() {
        return {
            era: this.era,
            block: this.block.toJson()
        };
    }
}
