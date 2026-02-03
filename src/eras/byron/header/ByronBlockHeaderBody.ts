import { CanBeCborString, Cbor, CborArray, CborObj, CborString, forceCborString, CborUInt, CborBytes } from "@harmoniclabs/cbor";
import { isObject } from "@harmoniclabs/obj-utils";
import { Hash, Hash32 } from "../../../hashes";

export interface IByronBlockHeaderBody {
    protocolMagic: number;
    prevBlock: Hash32;
    bodyProof: IByronBlockProof;
    consensusData: IByronBlockConsensus;
    extraData: IByronBlockHeaderExtra;
}

export interface IByronBlockProof {
    txProof: { n: number; root: Hash32; witnessesHash: Hash32 };
    sscProof: [number, Hash32, Hash32] | [number, Hash32];
    dlgProof: Hash32;
    updProof: Hash32;
}

export interface IByronBlockConsensus {
    slotId: { epoch: bigint; slot: bigint };
    pubkey: Uint8Array;
    difficulty: [bigint];
    blockSig: [number, Uint8Array] | [number, any]; // signature variants
}

export interface IByronBlockHeaderExtra {
    blockVersion: [number, number, number];
    softwareVersion: [string, number];
    attributes: any;
    extraProof: Hash32;
}

export class ByronBlockHeaderBody implements IByronBlockHeaderBody {
    readonly protocolMagic: number;
    readonly prevBlock: Hash32;
    readonly bodyProof: IByronBlockProof;
    readonly consensusData: IByronBlockConsensus;
    readonly extraData: IByronBlockHeaderExtra;

    constructor(headerBody: IByronBlockHeaderBody) {
        if(!(
            isObject(headerBody) &&
            typeof headerBody.protocolMagic === "number" &&
            headerBody.prevBlock instanceof Hash32 &&
            isObject(headerBody.bodyProof) &&
            isObject(headerBody.consensusData) &&
            isObject(headerBody.extraData)
            
        )) {
            throw new Error("Invalid ByronBlockHeaderBody params");
        }

        this.protocolMagic = headerBody.protocolMagic;
        this.prevBlock = headerBody.prevBlock;
        this.bodyProof = headerBody.bodyProof;
        this.consensusData = headerBody.consensusData;
        this.extraData = headerBody.extraData;
    }

    toJson() {
        return {
            protocolMagic: this.protocolMagic,
            prevBlock: this.prevBlock.toString(),
            bodyProof: {
                txProof: {
                    n: this.bodyProof.txProof.n,
                    root: this.bodyProof.txProof.root.toString(),
                    witnessesHash: this.bodyProof.txProof.witnessesHash.toString()
                },
                sscProof: this.bodyProof.sscProof,
                dlgProof: this.bodyProof.dlgProof.toString(),
                updProof: this.bodyProof.updProof.toString()
            },
            consensusData: {
                slotId: {
                    epoch: this.consensusData.slotId.epoch.toString(),
                    slot: this.consensusData.slotId.slot.toString()
                },
                pubkey: Buffer.from(this.consensusData.pubkey).toString("hex"),
                difficulty: this.consensusData.difficulty.map(d => d.toString()),
                blockSig: this.consensusData.blockSig
            },
            extraData: this.extraData
        };
    }

    toCbor(): CborString {
        return Cbor.encode(this.toCborObj());
    }

    toCborObj(): CborArray {
        // blockhead = [ protocolMagic, prevBlock, bodyProof, consensusData, extraData ]
        return new CborArray([
            new CborUInt(this.protocolMagic),
            this.prevBlock.toCborObj(),
            this._bodyProofToCborObj(),
            this._consensusDataToCborObj(),
            this._extraDataToCborObj()
        ]);
    }

    private _bodyProofToCborObj(): CborArray {
        return new CborArray([
            new CborArray([
                new CborUInt(this.bodyProof.txProof.n),
                this.bodyProof.txProof.root.toCborObj(),
                this.bodyProof.txProof.witnessesHash.toCborObj()
            ]),
            new CborArray(this.bodyProof.sscProof.map(v => 
                v instanceof Hash32 ? v.toCborObj() : new CborUInt(v)
            )),
            this.bodyProof.dlgProof.toCborObj(),
            this.bodyProof.updProof.toCborObj()
        ]);
    }

    private _consensusDataToCborObj(): CborArray {
        return new CborArray([
            new CborArray([
                new CborUInt(this.consensusData.slotId.epoch),
                new CborUInt(this.consensusData.slotId.slot)
            ]),
            new CborBytes(this.consensusData.pubkey),
            new CborArray([new CborUInt(this.consensusData.difficulty[0])]),
            new CborArray(this.consensusData.blockSig.map(v => 
                v instanceof Uint8Array ? new CborBytes(v) : new CborUInt(v)
            ))
        ]);
    }

    private _extraDataToCborObj(): CborArray {
        return new CborArray([
            new CborArray(this.extraData.blockVersion.map(v => new CborUInt(v))),
            new CborArray([
                new CborString(this.extraData.softwareVersion[0]),
                new CborUInt(this.extraData.softwareVersion[1])
            ]),
            new CborArray([]), // attributes (empty for now)
            this.extraData.extraProof.toCborObj()
        ]);
    }

    static fromCbor(cStr: CanBeCborString): ByronBlockHeaderBody {
        return ByronBlockHeaderBody.fromCborObj(Cbor.parse(forceCborString(cStr)));
    }

    static fromCborObj(cObj: CborObj): ByronBlockHeaderBody {
        if (!(cObj instanceof CborArray)) {
            throw new Error("invalid CBOR for Byron block header body");
        }

        const arr = cObj.array;
        if (arr.length !== 5) {
            throw new Error("invalid Byron block header body array length");
        }

        // Parse protocolMagic
        const protocolMagicObj = arr[0];
        const protocolMagic = protocolMagicObj instanceof CborUInt 
            ? Number(protocolMagicObj.num) 
            : 0;

        // Parse prevBlock
        const prevBlock = Hash32.fromCborObj(arr[1]);

        // Parse bodyProof (simplified - full parsing would be more complex)
        const bodyProofArr = arr[2] as CborArray;
        const txProofArr = bodyProofArr.array[0] as CborArray;
        const bodyProof: IByronBlockProof = {
            txProof: { 
                n: 0, 
                root: Hash32.fromCborObj(txProofArr.array[1]), 
                witnessesHash: Hash32.fromCborObj(txProofArr.array[2]) 
            },
            sscProof: [0, Hash32.fromCborObj((bodyProofArr.array[1] as CborArray).array[0])],
            dlgProof: Hash32.fromCborObj(bodyProofArr.array[2]),
            updProof: Hash32.fromCborObj(bodyProofArr.array[3])
        };

        // Parse consensusData (simplified)
        const consensusArr = arr[3] as CborArray;
        const consensusData: IByronBlockConsensus = {
            slotId: { epoch: BigInt(0), slot: BigInt(0) },
            pubkey: new Uint8Array(),
            difficulty: [BigInt(0)],
            blockSig: [0, new Uint8Array()]
        };

        // Parse extraData (simplified)
        const extraData: IByronBlockHeaderExtra = {
            blockVersion: [0, 0, 0],
            softwareVersion: ["", 0],
            attributes: {},
            extraProof: Hash32.fromCborObj((arr[4] as CborArray).array[3])
        };

        return new ByronBlockHeaderBody({
            protocolMagic,
            prevBlock,
            bodyProof,
            consensusData,
            extraData
        });
    }
}