import { CborArray, CborBytes, CborMap, CborMapEntry, CborObj, CborTag, CborUInt } from "@harmoniclabs/cbor";
import { Data, dataToCbor } from "@harmoniclabs/plutus-data";
import { Hash32 } from "../../../hashes";
import { Script } from "../../../script";
import { Address } from "../../../eras/common/ledger/Address";
import { Value } from "../../../eras/common/ledger/Value/Value";

export interface ITxOutFields {
    address: Address;
    value: Value;
    datum?: Hash32 | Data;
    refScript?: Script;
}

/**
 * a byte string as cardano-ledger's `encCBOR` of a `ShortByteString` emits it: one
 * definite-length string with a minimal head (a decoded `Address` / `Hash` re-emits the
 * head it was decoded with)
 */
function definiteByteString( cObj: CborObj ): CborObj
{
    return cObj instanceof CborBytes ? new CborBytes( cObj.bytes ) : cObj;
}

/**
 * The Babbage-and-later output encoding, as cardano-ledger rebuilds it from the decoded
 * fields (`EncCBOR (BabbageTxOut era)`, eras/babbage/impl/src/Cardano/Ledger/Babbage/TxOut.hs):
 *
 * ```haskell
 * encCBOR = \case
 *   TxOutCompactRefScript addr cv d rs -> encodeTxOut addr cv d (SJust rs)
 *   TxOutCompactDatum addr cv d        -> encodeTxOut addr cv (Datum d) SNothing
 *   TxOutCompactDH addr cv dh          -> encodeListLen 3 <> encCBOR addr <> encCBOR cv <> encCBOR dh
 *   TxOutCompact addr cv               -> encodeListLen 2 <> encCBOR addr <> encCBOR cv
 * ```
 *
 * so the form does not depend on the form the output was decoded in: without a script
 * reference and without an inline datum it is the legacy definite array (`[address, value]`,
 * `[address, value, datum_hash]`); otherwise it is the map built by `encodeTxOut`
 * (`Keyed`: a definite map with keys 0 address, 1 value, 2 datum unless `NoDatum`,
 * 3 `encodeNestedCbor script`). The parts keep exactly what cardano-ledger keeps:
 *
 * - address: the `CompactAddr` bytes, one definite byte string;
 * - value: `fromCompact cVal`, the canonical `Value` encoding (`Value.toCborObj`);
 * - datum (`EncCBOR (Datum era)`, libs/cardano-ledger-core/src/Cardano/Ledger/Plutus/Data.hs):
 *   `Sum DatumHash 0 !> To dh` is `[0, hash32]`, `Sum Datum 1 !> To binaryData` is
 *   `[1, #6.24(bytes)]` with the `BinaryData` bytes as decoded (`dataToCbor` re-emits them);
 * - script reference: `#6.24(bytes)` of the script's `[tag, payload]` wrapper, which
 *   `Script.toCbor` rebuilds around the payload bytes cardano-ledger keeps (Alonzo
 *   `encodeScript`: `Sum NativeScript 0 !> To timelock`, `Sum PlutusScript n !> To plutusBinary`).
 */
export function txOutToCborObj( out: ITxOutFields ): CborArray | CborMap
{
    const { address, value, datum, refScript } = out;

    const addr = definiteByteString( address.toCborObj() );
    const val = value.toCborObj();
    const inlineDatum = datum !== undefined && !( datum instanceof Hash32 );

    if( refScript === undefined && !inlineDatum )
    {
        // TxOutCompact / TxOutCompactDH
        return new CborArray(
            datum === undefined ?
                [ addr, val ] :
                [ addr, val, definiteByteString( ( datum as Hash32 ).toCborObj() ) ]
        );
    }

    // encodeTxOut
    const entries: CborMapEntry[] = [
        { k: new CborUInt( 0 ), v: addr },
        { k: new CborUInt( 1 ), v: val }
    ];

    if( datum !== undefined )
    {
        entries.push({
            k: new CborUInt( 2 ),
            v: datum instanceof Hash32 ?
                new CborArray([
                    new CborUInt( 0 ),
                    definiteByteString( datum.toCborObj() )
                ]) :
                new CborArray([
                    new CborUInt( 1 ),
                    new CborTag( 24, new CborBytes( dataToCbor( datum ) ) )
                ])
        });
    }

    if( refScript !== undefined )
    {
        entries.push({
            k: new CborUInt( 3 ),
            v: new CborTag( 24, new CborBytes( refScript.toCbor() ) )
        });
    }

    return new CborMap( entries );
}
