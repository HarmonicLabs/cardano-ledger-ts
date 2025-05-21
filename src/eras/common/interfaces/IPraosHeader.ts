
import { U8Arr32 } from "../../../utils/U8Arr";
import { VrfCert } from "../../common/Vrf";
import { KesSignature } from "../../common/Kes";
import { PoolOperationalCert } from "../../common/certs/PoolOperationalCert";

export interface IPraosHeader{
    /* from `ToCborBytes` */
    /**
     * (if implemented correctly)
     * @returns the exact same bytes present on chain for the header
     * 
     * needed for deriving the hash of the header
    **/
    toCborBytes: () => Uint8Array;
    /**
    **/
    readonly body: IPraosHeaderBody;
    /**
     * signature of the header body using current KES (Key Evolving Signature) 
    **/
    readonly kesSignature: KesSignature;
}

/**
 * infos strictly needed by consensus for header validation
 * 
 * this excludes stuff like block size etc.
 */
export interface IPraosHeaderBody {
    /* from `ToCborBytes` */
    /**
     * (if implemented correctly)
     * @returns the exact same bytes present on chain for the header
     * 
     * needed for kes signature validaton
    **/
    toCborBytes: () => Uint8Array;
    /**
     * previous header hash
    **/
    readonly prevHash: U8Arr32 | undefined;
    /**
     * slot number of block
    **/
    readonly slot: bigint;
    /**
     * 
     */
    readonly issuerPubKey: U8Arr32;
    /**
     * pool vrf pub key
    **/
    readonly vrfPubKey: U8Arr32;
    /**
     * 
     * from shelley to alonzo: `this.leaderVrfResult.vrfOutput`
     * 
     * https://github.com/txpipe/pallas/blob/2ddb5b066bbde9d2ed55014b286f47ad370b828e/pallas-primitives/src/babbage/model.rs#L296-L317
     * babbage and later: `sha2_256( [0x4c].concat( this.vrfResult.vrfOutput ) )` (0x4c is "L" indicating leader)
    **/
    leaderVrfOutput: () => U8Arr32;
    /**
     * 
     * from shelley to alonzo: `this.nonceVrfResult.vrfOutput`
     * 
     * https://github.com/txpipe/pallas/blob/2ddb5b066bbde9d2ed55014b286f47ad370b828e/pallas-primitives/src/babbage/model.rs#L296-L317
     * babbage and later: `sha2_256( [0x4e].concat( this.vrfResult.vrfOutput ) )` (0x4e is "N" indicating nonce)
    **/
    nonceVrfOutput: () => U8Arr32;

    // getLeaderVrfCert: () => VrfCert;
    // getNonceVrfCert: () => VrfCert;
    /**
     * 
     */
    /**
     * 
     */
    readonly opCert: PoolOperationalCert;
}