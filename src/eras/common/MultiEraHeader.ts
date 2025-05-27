import { ConwayHeader } from '../conway/header/ConwayHeader';
import { BabbageHeader } from '../babbage/header/BabbageHeader';
import { AlonzoHeader } from '../alonzo/header/AlonzoHeader';
import { MaryHeader } from '../mary/header/MaryHeader';
import { AllegraHeader } from '../allegra/header/AllegraHeader';
import { ShelleyHeader } from '../shelley/header/ShelleyHeader';
import { CborArray, ToCbor, SubCborRef, CborString, Cbor, CborObj, CborUInt, CanBeCborString, forceCborString } from "@harmoniclabs/cbor";
import { ToJson } from "../../utils/ToJson"
import { getSubCborRef } from "../../utils/getSubCborRef";
import { InvalidCborFormatError } from "../../utils/InvalidCborFormatError"
import { toHex } from "@harmoniclabs/uint8array-utils";

export type CardanoEra = number;

export interface IMultiEraHeader {
    era: CardanoEra;
    header: ConwayHeader | BabbageHeader | AlonzoHeader | MaryHeader | AllegraHeader | ShelleyHeader;
}

export class MultiEraHeader implements 
IMultiEraHeader, ToCbor, ToJson 
{
    readonly era: CardanoEra;
    readonly header: ConwayHeader | BabbageHeader | AlonzoHeader | MaryHeader | AllegraHeader | ShelleyHeader;

    constructor(
        header: IMultiEraHeader,
        readonly cborRef: SubCborRef | undefined = undefined
    ) 
    { 
        this.era = header.era;
        this.header = header.header;
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
            this.header.toCborObj()
        ]);
    }

    static fromCbor(cbor: CanBeCborString): MultiEraHeader {
        const bytes = cbor instanceof Uint8Array ? cbor : forceCborString(cbor).toBuffer();
        return MultiEraHeader.fromCborObj(Cbor.parse(bytes, { keepRef: true }), bytes);
    }

    static fromCborObj(cObj: CborObj, _originalBytes?: Uint8Array): MultiEraHeader 
    {
        // console.log("multiEraHeader.fromCborObj", cObj);
        if(!(
            cObj instanceof CborArray 
            && cObj.array.length >= 2
        ))throw new InvalidCborFormatError("Invalid CBOR for MultiEraHeader");

        const _era = cObj.array[0];
        const _headerData = cObj.array[1];
        // console.log("_multiEraHeaderData", _headerData)

        if(!(
            _era instanceof CborUInt
        ))throw new InvalidCborFormatError("Era must be a CborUInt");
        

        let header: ConwayHeader | BabbageHeader | AlonzoHeader | MaryHeader | AllegraHeader | ShelleyHeader;
        switch (Number(_era.num)) {
            case 7: // Conway era
                header = ConwayHeader.fromCborObj(_headerData);
                break;
            case 6: // Babbage era
                header = BabbageHeader.fromCborObj(_headerData);
                break;
            case 5: // Alonzo era
                header = AlonzoHeader.fromCborObj(_headerData);
                break;
            case 4: // Mary era
                header = MaryHeader.fromCborObj(_headerData);
                break;
            case 3 : // Allegra era
                header = AllegraHeader.fromCborObj(_headerData);
                break;
            case 2: // Shelley era
                header = ShelleyHeader.fromCborObj(_headerData);
                break;
            default:
                throw new Error(`Unsupported era: ${_era.num}`);
        }

        const multiEraHeader =new MultiEraHeader({
            era: Number(_era.num),
            header
        }, getSubCborRef(cObj, _originalBytes));
        
        /*
        console.log("multiEraHeader", 
            JSON.stringify(multiEraHeader.toJSON(),
            (k, v) => {
              if (typeof v === "bigint") return v.toString();
              if (v instanceof Uint8Array) return toHex(v);
              return v;
            },
            2 // indentation
          )
        );
        //*/

        return multiEraHeader;
    }

    toJSON() 
    { 
        return this.toJson(); 
    };

    toJson() {
        return {
            era: this.era,
            header: this.header
        };
    }
}
