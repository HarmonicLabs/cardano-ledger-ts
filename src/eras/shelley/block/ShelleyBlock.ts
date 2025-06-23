import { CborArray, ToCbor, SubCborRef, CborString, Cbor, CborObj, CborMap, CborUInt, CanBeCborString, forceCborString, isCborObj } from "@harmoniclabs/cbor";
import { InvalidCborFormatError } from "../../../utils/InvalidCborFormatError";
import { IShelleyHeader, ShelleyHeader } from "../header/ShelleyHeader";
import { IShelleyTxBody, ShelleyTxBody } from "../tx/ShelleyTxBody";
import { IShelleyTxWitnessSet, ShelleyTxWitnessSet } from "../tx/ShelleyTxWitnessSet";
import { ITxMetadata, TxMetadata } from "../../common/tx";
import { ToJson } from "../../../utils/ToJson";
import { getSubCborRef } from "../../../utils/getSubCborRef";

// Helper function to extract the correct input for TxMetadata constructor
function getTxMetadataInput(value: ITxMetadata | TxMetadata): ITxMetadata {
    if (value instanceof TxMetadata) {
        return value.metadata as ITxMetadata;
    } else {
        return value;
    }
}

export interface IShelleyBlock {
    header: IShelleyHeader;
    transactionBodies: IShelleyTxBody[];
    transactionWitnessSets: IShelleyTxWitnessSet[];
    metadataSet: { [transactionIndex: number]: ITxMetadata | TxMetadata };
}

export class ShelleyBlock 
    implements IShelleyBlock, ToCbor, ToJson 
{
    readonly header: ShelleyHeader;
    readonly transactionBodies: ShelleyTxBody[];
    readonly transactionWitnessSets: ShelleyTxWitnessSet[];
    readonly metadataSet: { [transactionIndex: number]: TxMetadata };

    constructor(
        block: IShelleyBlock,
        readonly cborRef: SubCborRef | undefined = undefined
    ) 
    {
        // Validate transaction bodies and witness sets have same length
        if (block.transactionBodies.length !== block.transactionWitnessSets.length) {
            throw new Error("Transaction bodies and witness sets must have the same length");
        }
        // Validate metadataSet keys are non-negative integers
        Object.entries(block.metadataSet).forEach(([key, _]) => {
            const txIndex = Number(key);
            if (!Number.isSafeInteger(txIndex) || txIndex < 0) {
                throw new Error(`Invalid transaction index in metadataSet: ${key}`);
            }
        });
        this.header = new ShelleyHeader(block.header);
        this.transactionBodies = block.transactionBodies.map(tb => new ShelleyTxBody(tb));
        this.transactionWitnessSets = block.transactionWitnessSets.map(tws => new ShelleyTxWitnessSet(tws));
        this.metadataSet = Object.fromEntries(
            Object.entries(block.metadataSet).map(([key, value]) => [key, new TxMetadata(getTxMetadataInput(value))])
        );
        this.cborRef = cborRef;
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
        if (this.cborRef instanceof SubCborRef) {
            return Cbor.parse(this.cborRef.toBuffer()) as CborArray;
        }
        return new CborArray([
            this.header.toCborObj(),
            new CborArray(this.transactionBodies.map(tb => tb.toCborObj())),
            new CborArray(this.transactionWitnessSets.map(tws => tws.toCborObj())),
            new CborMap(
                Object.entries(this.metadataSet).map(([k, v]) => ({
                    k: new CborUInt(BigInt(k)),
                    v: v.toCborObj()
                }))
            )
        ]);
    }

    static fromCbor(cbor: CanBeCborString): ShelleyBlock {
        const bytes = cbor instanceof Uint8Array ? cbor : forceCborString(cbor).toBuffer();
        return ShelleyBlock.fromCborObj(Cbor.parse(bytes, { keepRef: true }), bytes);
    }

    static fromCborObj(cObj: CborObj, _originalBytes?: Uint8Array): ShelleyBlock {
        if (!(
            cObj instanceof CborArray 
            // && cObj.array.length === 4
        ))throw new InvalidCborFormatError("ShelleyBlock");

        const _header = cObj.array[0];
        const _txBodies = cObj.array[1];
        const _txWitnessSets = cObj.array[2];
        const _metadataDataSet = cObj.array[3];

        // console.log("shelley metadataDataSet: ", _metadataDataSet);

        // Process header
        if (!(
             _header instanceof CborArray 
             && _header.array.length >= 2
        ))throw new InvalidCborFormatError("Header");
        
        const header = ShelleyHeader.fromCborObj(_header);

        // Process transaction bodies
        if (!(_txBodies instanceof CborArray)) {
            throw new InvalidCborFormatError("Transaction bodies must be a CBOR array");
        }
        const transactionBodies = _txBodies.array.map((tb, index) => {
            if (!isCborObj(tb)) {
                throw new InvalidCborFormatError(`Invalid CBOR object at transaction_bodies[${index}]`);
            }
            return ShelleyTxBody.fromCborObj(tb);
        });

        // Process transaction witness sets
        if (!(_txWitnessSets instanceof CborArray)) {
            throw new InvalidCborFormatError("Transaction witness sets must be a CBOR array");
        }
        const transactionWitnessSets = _txWitnessSets.array.map((tws, index) => {
            if (!isCborObj(tws)) {
                throw new InvalidCborFormatError(`Invalid CBOR object at transaction_witness_sets[${index}]`);
            }
            return ShelleyTxWitnessSet.fromCborObj(tws);
        });

        // Process metadata set
        if (!(_metadataDataSet instanceof CborMap)) {
            throw new InvalidCborFormatError("Metadata set must be a CBOR map");
        }
        const metadataSet: { [transactionIndex: number]: TxMetadata } = {};
        for (const entry of _metadataDataSet.map) {
            const { k, v } = entry;
            // console.log("metadataSet entry", entry);
            if (!(k instanceof CborUInt))throw new InvalidCborFormatError("Invalid key in metadata_set");

            const txIndex = Number(k.num);
            if (!Number.isSafeInteger(txIndex))throw new InvalidCborFormatError(`Invalid transaction index: ${k.num}`);
            // console.log("metadataSet txIndex", txIndex, "v", v);

            if (!isCborObj(v)) {
                throw new InvalidCborFormatError(`Invalid metadata CBOR object at index ${txIndex}`);
            }
            // console.log("metadataSet[txIndex]", metadataSet)
            metadataSet[txIndex] = TxMetadata.fromCborObj(v);

        }

        const shelleyBlock = new ShelleyBlock({
            header,
            transactionBodies,
            transactionWitnessSets,
            metadataSet
        }, getSubCborRef(cObj));

        return shelleyBlock;
    }

    toJSON() {
        return this.toJson();
    }

    toJson() {
        return {
            header: this.header,
            transactionBodies: this.transactionBodies.map(txBody => txBody.toJson()),
            transactionWitnessSets: this.transactionWitnessSets.map(txWitSet => txWitSet.toJson()),
            metadataSet: Object.entries(this.metadataSet).reduce(
                (acc, [k, v]) => ({ ...acc, [k]: v.toJson() }),
                {}
            )
        };
    }
}