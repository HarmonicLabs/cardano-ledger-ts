import { CanBeCborString, Cbor, CborArray, CborObj, CborString, CborUInt, forceCborString } from "@harmoniclabs/cbor";
import { ByronAddress } from "../ByronAddress";

export interface IByronTxOut {
    address: ByronAddress;
    amount: bigint;
}

/**
 * Byron `txout = [ address, u64 ]`.
 *
 * The address is embedded inline as its own 2-element CBOR array
 * `[ #6.24(payload), crc32 ]` (not a byte string, unlike Shelley outputs).
 */
export class ByronTxOut implements IByronTxOut
{
    readonly address: ByronAddress;
    readonly amount: bigint;

    constructor( txOut: IByronTxOut )
    {
        if(!( txOut?.address instanceof ByronAddress ))
        throw new Error("invalid Byron txout address");
        this.address = txOut.address;
        this.amount = BigInt( txOut.amount );
    }

    clone(): ByronTxOut { return new ByronTxOut({ address: this.address.clone(), amount: this.amount }); }

    toCborObj(): CborArray
    {
        // re-inline the address as its CBOR array (address.toBuffer() is the encoded array)
        return new CborArray([
            Cbor.parse( this.address.toBuffer() ),
            new CborUInt( this.amount )
        ]);
    }
    toCbor(): CborString { return Cbor.encode( this.toCborObj() ) as any as CborString; }
    toCborBytes(): Uint8Array { return Cbor.encode( this.toCborObj() ); }

    static fromCborObj( cObj: CborObj ): ByronTxOut
    {
        if(!(
            cObj instanceof CborArray &&
            cObj.array.length === 2 &&
            cObj.array[0] instanceof CborArray &&
            cObj.array[1] instanceof CborUInt
        )) throw new Error("invalid CBOR for Byron txout");
        return new ByronTxOut({
            address: ByronAddress.fromBytes( Cbor.encode( cObj.array[0] ) ),
            amount: cObj.array[1].num
        });
    }
    static fromCbor( cStr: CanBeCborString ): ByronTxOut
    {
        return ByronTxOut.fromCborObj( Cbor.parse( forceCborString( cStr ) ) );
    }

    toJSON() { return this.toJson(); }
    toJson()
    {
        return { address: this.address.toBase58(), amount: this.amount.toString() };
    }
}
