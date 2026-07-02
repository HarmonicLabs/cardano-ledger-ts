import { CanBeCborString, Cbor, CborArray, CborObj, CborString, forceCborString, CborUInt, CborBytes, CborText, CborMap } from "@harmoniclabs/cbor";
import { isObject } from "@harmoniclabs/obj-utils";
import { toHex } from "@harmoniclabs/uint8array-utils";
import { Hash32 } from "../../../hashes";

export interface IByronBlockHeaderBody {
    protocolMagic: number;
    prevBlock: Hash32;
    bodyProof: IByronBlockProof;
    consensusData: IByronBlockConsensus;
    extraData: IByronBlockHeaderExtra;
}

export interface IByronBlockProof {
    txProof: { n: number; root: Hash32; witnessesHash: Hash32 };
    // sscproof variants: [0|1|2, hash, hash] (comm/openings/shares) or [3, hash] (certificates)
    sscProof: [number, Hash32, Hash32] | [number, Hash32];
    dlgProof: Hash32;
    updProof: Hash32;
}

export interface IByronBlockConsensus {
    slotId: { epoch: bigint; slot: bigint };
    pubkey: Uint8Array;
    difficulty: [bigint];
    // blocksig = [tag, signature]; tag 0 -> signature bytes, proxy variants (1/2) carry a nested structure
    blockSig: [number, Uint8Array | CborObj];
}

export interface IByronBlockHeaderExtra {
    blockVersion: [number, number, number]; // bver = [u16, u16, u8]
    softwareVersion: [string, number];       // [text, u32]
    // attributes = {* any => any}; kept as the raw CBOR item so it round-trips verbatim
    attributes: CborObj | Record<string, never>;
    extraProof: Hash32;
}

function isCborObj( v: any ): v is CborObj
{
    return isObject( v ) && typeof (v as any).toRawObj === "function";
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
                sscProof: [
                    this.bodyProof.sscProof[0],
                    ...this.bodyProof.sscProof.slice(1).map( h => (h as Hash32).toString() )
                ],
                dlgProof: this.bodyProof.dlgProof.toString(),
                updProof: this.bodyProof.updProof.toString()
            },
            consensusData: {
                slotId: {
                    epoch: this.consensusData.slotId.epoch.toString(),
                    slot: this.consensusData.slotId.slot.toString()
                },
                pubkey: toHex(this.consensusData.pubkey),
                difficulty: this.consensusData.difficulty.map(d => d.toString()),
                blockSig: [
                    this.consensusData.blockSig[0],
                    this.consensusData.blockSig[1] instanceof Uint8Array ?
                        toHex(this.consensusData.blockSig[1]) : this.consensusData.blockSig[1]
                ]
            },
            extraData: {
                blockVersion: this.extraData.blockVersion,
                softwareVersion: this.extraData.softwareVersion,
                extraProof: this.extraData.extraProof.toString()
            }
        };
    }

    toCbor(): CborString {
        return Cbor.encode(this.toCborObj()) as any as CborString;
    }

    toCborBytes(): Uint8Array {
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
        const sig = this.consensusData.blockSig[1];
        return new CborArray([
            new CborArray([
                new CborUInt(this.consensusData.slotId.epoch),
                new CborUInt(this.consensusData.slotId.slot)
            ]),
            new CborBytes(this.consensusData.pubkey),
            new CborArray([new CborUInt(this.consensusData.difficulty[0])]),
            new CborArray([
                new CborUInt(this.consensusData.blockSig[0]),
                sig instanceof Uint8Array ? new CborBytes(sig) : sig
            ])
        ]);
    }

    private _extraDataToCborObj(): CborArray {
        const attrs = this.extraData.attributes;
        return new CborArray([
            new CborArray(this.extraData.blockVersion.map(v => new CborUInt(v))),
            new CborArray([
                new CborText(this.extraData.softwareVersion[0]),
                new CborUInt(this.extraData.softwareVersion[1])
            ]),
            // attributes = {* any => any}; re-emit the preserved map (empty on mainnet blocks)
            isCborObj(attrs) ? attrs : new CborMap([]),
            this.extraData.extraProof.toCborObj()
        ]);
    }

    static fromCbor(cStr: CanBeCborString): ByronBlockHeaderBody {
        return ByronBlockHeaderBody.fromCborObj(Cbor.parse(forceCborString(cStr)));
    }

    static fromCborObj(cObj: CborObj): ByronBlockHeaderBody {
        if (!(cObj instanceof CborArray) || cObj.array.length !== 5) {
            throw new Error("invalid CBOR for Byron block header body");
        }

        const [ pmObj, prevObj, bodyProofObj, consObj, extraObj ] = cObj.array;

        // protocolMagic : u32
        if (!(pmObj instanceof CborUInt))
            throw new Error("invalid Byron header: protocolMagic");
        const protocolMagic = Number(pmObj.num);

        // prevBlock : hash
        const prevBlock = Hash32.fromCborObj(prevObj);

        // bodyProof = [ txproof, sscproof, dlgProof, updProof ]
        if (!(bodyProofObj instanceof CborArray) || bodyProofObj.array.length !== 4)
            throw new Error("invalid Byron header: bodyProof");
        const [ txProofObj, sscProofObj, dlgProofObj, updProofObj ] = bodyProofObj.array;

        // txproof = [u32, hash, hash]
        if (!(txProofObj instanceof CborArray) || txProofObj.array.length !== 3 || !(txProofObj.array[0] instanceof CborUInt))
            throw new Error("invalid Byron header: txProof");
        const txProof = {
            n: Number(txProofObj.array[0].num),
            root: Hash32.fromCborObj(txProofObj.array[1]),
            witnessesHash: Hash32.fromCborObj(txProofObj.array[2])
        };

        // sscproof = [ tag, hash, (hash)? ]
        if (!(sscProofObj instanceof CborArray) || sscProofObj.array.length < 2 || !(sscProofObj.array[0] instanceof CborUInt))
            throw new Error("invalid Byron header: sscProof");
        const sscTag = Number(sscProofObj.array[0].num);
        const sscHashes = sscProofObj.array.slice(1).map(h => Hash32.fromCborObj(h));
        const sscProof = [ sscTag, ...sscHashes ] as IByronBlockProof["sscProof"];

        const bodyProof: IByronBlockProof = {
            txProof,
            sscProof,
            dlgProof: Hash32.fromCborObj(dlgProofObj),
            updProof: Hash32.fromCborObj(updProofObj)
        };

        // consensusData = [ [epoch, slot], pubkey, [difficulty], [tag, sig] ]
        if (!(consObj instanceof CborArray) || consObj.array.length !== 4)
            throw new Error("invalid Byron header: consensusData");
        const [ slotIdObj, pubkeyObj, diffObj, blockSigObj ] = consObj.array;

        if (!(slotIdObj instanceof CborArray) || slotIdObj.array.length !== 2 ||
            !(slotIdObj.array[0] instanceof CborUInt) || !(slotIdObj.array[1] instanceof CborUInt))
            throw new Error("invalid Byron header: slotId");
        const slotId = { epoch: slotIdObj.array[0].num, slot: slotIdObj.array[1].num };

        if (!(pubkeyObj instanceof CborBytes))
            throw new Error("invalid Byron header: pubkey");
        const pubkey = pubkeyObj.bytes;

        if (!(diffObj instanceof CborArray) || diffObj.array.length < 1 || !(diffObj.array[0] instanceof CborUInt))
            throw new Error("invalid Byron header: difficulty");
        const difficulty: [bigint] = [ diffObj.array[0].num ];

        if (!(blockSigObj instanceof CborArray) || blockSigObj.array.length < 2 || !(blockSigObj.array[0] instanceof CborUInt))
            throw new Error("invalid Byron header: blockSig");
        const blockSigTag = Number(blockSigObj.array[0].num);
        const blockSigVal = blockSigObj.array[1];
        const blockSig: [number, Uint8Array | CborObj] = [
            blockSigTag,
            blockSigVal instanceof CborBytes ? blockSigVal.bytes : blockSigVal
        ];

        const consensusData: IByronBlockConsensus = { slotId, pubkey, difficulty, blockSig };

        // extraData = [ bver, [text, u32], attributes, hash ]
        if (!(extraObj instanceof CborArray) || extraObj.array.length !== 4)
            throw new Error("invalid Byron header: extraData");
        const [ bverObj, swObj, attrsObj, extraProofObj ] = extraObj.array;

        if (!(bverObj instanceof CborArray) || bverObj.array.length !== 3)
            throw new Error("invalid Byron header: blockVersion");
        const blockVersion = bverObj.array.map(v => Number((v as CborUInt).num)) as [number, number, number];

        if (!(swObj instanceof CborArray) || swObj.array.length !== 2 ||
            !(swObj.array[0] instanceof CborText) || !(swObj.array[1] instanceof CborUInt))
            throw new Error("invalid Byron header: softwareVersion");
        const softwareVersion: [string, number] = [ swObj.array[0].text, Number(swObj.array[1].num) ];

        const extraData: IByronBlockHeaderExtra = {
            blockVersion,
            softwareVersion,
            attributes: attrsObj, // preserved verbatim for round-trip fidelity
            extraProof: Hash32.fromCborObj(extraProofObj)
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
