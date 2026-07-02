import { CanBeCborString, Cbor, CborArray, CborObj, CborString, CborUInt, forceCborString } from "@harmoniclabs/cbor";

export interface IByronSlotId {
    epoch: bigint;
    slot: bigint;
}

/**
 * Byron `slotid = [ epoch: epochid, slot: u64 ]`.
 */
export class ByronSlotId implements IByronSlotId
{
    readonly epoch: bigint;
    readonly slot: bigint;

    constructor( slotId: IByronSlotId )
    {
        this.epoch = BigInt( slotId.epoch );
        this.slot = BigInt( slotId.slot );
    }

    clone(): ByronSlotId { return new ByronSlotId( this ); }

    toCborObj(): CborArray
    {
        return new CborArray([ new CborUInt( this.epoch ), new CborUInt( this.slot ) ]);
    }
    toCbor(): CborString { return Cbor.encode( this.toCborObj() ) as any as CborString; }
    toCborBytes(): Uint8Array { return Cbor.encode( this.toCborObj() ); }

    static fromCborObj( cObj: CborObj ): ByronSlotId
    {
        if(!(
            cObj instanceof CborArray &&
            cObj.array.length === 2 &&
            cObj.array[0] instanceof CborUInt &&
            cObj.array[1] instanceof CborUInt
        )) throw new Error("invalid CBOR for Byron slotid");
        return new ByronSlotId({ epoch: cObj.array[0].num, slot: cObj.array[1].num });
    }
    static fromCbor( cStr: CanBeCborString ): ByronSlotId
    {
        return ByronSlotId.fromCborObj( Cbor.parse( forceCborString( cStr ) ) );
    }

    toJSON() { return this.toJson(); }
    toJson() { return { epoch: this.epoch.toString(), slot: this.slot.toString() }; }
}
