import { CanBeCborString, Cbor, CborMap, CborObj, CborString, forceCborString } from "@harmoniclabs/cbor";

/**
 * Byron `attributes = {* any => any}`.
 *
 * Per the Byron CDDL, attributes are not meaningfully deserialised (they carry
 * addressing/HD metadata that ledger validation ignores). We therefore preserve
 * the raw CBOR map verbatim so it round-trips byte-exactly. On mainnet blocks and
 * most txs this is the empty map (`a0`).
 */
export class ByronAttributes
{
    /** the raw attributes map, preserved as-is for fidelity */
    readonly map: CborMap;

    constructor( map: CborMap = new CborMap([]) )
    {
        if(!( map instanceof CborMap ))
        throw new Error("invalid Byron attributes; expected a CBOR map");
        this.map = map;
    }

    get isEmpty(): boolean { return this.map.map.length === 0; }

    clone(): ByronAttributes { return new ByronAttributes( this.map.clone() ); }

    toCborObj(): CborMap { return this.map; }
    toCbor(): CborString { return Cbor.encode( this.toCborObj() ) as any as CborString; }
    toCborBytes(): Uint8Array { return Cbor.encode( this.toCborObj() ); }

    static fromCborObj( cObj: CborObj ): ByronAttributes
    {
        if(!( cObj instanceof CborMap ))
        throw new Error("invalid CBOR for Byron attributes; expected a map");
        return new ByronAttributes( cObj );
    }
    static fromCbor( cStr: CanBeCborString ): ByronAttributes
    {
        return ByronAttributes.fromCborObj( Cbor.parse( forceCborString( cStr ) ) );
    }

    toJSON() { return this.toJson(); }
    toJson() { return this.isEmpty ? {} : this.map.toRawObj(); }
}
