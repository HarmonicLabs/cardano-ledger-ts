import { CborArray, CborObj, CborTag } from "@harmoniclabs/cbor";

export type WitnessSetFieldSources = ( CborObj | undefined )[];

/**
 * Cardano ledger's `nonempty_set<T>` accepts both the tagged (`#6.258`) and the
 * untagged array form. When a witness set is decoded and then mutated, key 0 is
 * rebuilt; keep the exact form the transaction arrived with so the only byte
 * change is the appended witness.
 */
export function encodeCborSetLike(
    sourceField: CborObj | undefined,
    elements: CborObj[]
): CborObj
{
    if(
        sourceField instanceof CborTag &&
        Number( sourceField.tag ) === 258 &&
        sourceField.data instanceof CborArray
    ) {
        return new CborTag( 258, new CborArray( elements ) );
    }

    return new CborArray( elements );
}

/**
 * For fields that `addVKeyWitness` does not touch, re-emit the exact decoded
 * field when we have it. That keeps the map/list redeemer form and any Tag 258
 * wrappers byte-identical until some other field changes.
 */
export function unchangedWitnessField(
    sourceField: CborObj | undefined,
    elements: CborObj[]
): CborObj
{
    return sourceField ?? new CborArray( elements );
}
