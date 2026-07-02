import { ToCbor, SubCborRef, CborString, Cbor, CborObj, CborArray, CborUInt, CborSimple, CanBeCborString, forceCborString } from "@harmoniclabs/cbor";
import { CanBeUInteger, canBeUInteger, forceBigUInt } from "@harmoniclabs/cbor/dist/utils/ints";
import { isObject } from "@harmoniclabs/obj-utils";
import { Coin } from "../../common/ledger";
import { Credential } from "../../../credentials";
import { getSubCborRef } from "../../../utils/getSubCborRef";
import { InvalidCborFormatError } from "../../../utils/InvalidCborFormatError";
import { ToJson } from "../../../utils/ToJson";

/**
 * CDDL (Dijkstra):
 * ```cddl
 * account_balance_interval =
 *   [  inclusive_lower_bound : coin, exclusive_upper_bound : coin/ nil
 *   // inclusive_lower_bound : coin/ nil, exclusive_upper_bound : coin
 *   ]
 * ```
 * Exactly one of the two bounds may be `nil`, never both.
 */
export interface IDijkstraAccountBalanceInterval {
    inclusiveLowerBound: CanBeUInteger | null;
    exclusiveUpperBound: CanBeUInteger | null;
}

export function isIDijkstraAccountBalanceInterval( stuff: any ): stuff is IDijkstraAccountBalanceInterval
{
    if( !isObject( stuff ) ) return false;
    const lower = (stuff as IDijkstraAccountBalanceInterval).inclusiveLowerBound;
    const upper = (stuff as IDijkstraAccountBalanceInterval).exclusiveUpperBound;
    return (
        ( lower === null || canBeUInteger( lower ) ) &&
        ( upper === null || canBeUInteger( upper ) ) &&
        // not both nil
        !( lower === null && upper === null )
    );
}

export class DijkstraAccountBalanceInterval
    implements ToCbor, ToJson
{
    readonly inclusiveLowerBound: bigint | null;
    readonly exclusiveUpperBound: bigint | null;

    constructor(
        interval: IDijkstraAccountBalanceInterval,
        readonly cborRef: SubCborRef | undefined = undefined
    )
    {
        const { inclusiveLowerBound, exclusiveUpperBound } = interval;

        if( inclusiveLowerBound === null && exclusiveUpperBound === null )
        throw new Error("invalid 'account_balance_interval'; both bounds are nil");

        this.inclusiveLowerBound = inclusiveLowerBound === null ? null : forceBigUInt( inclusiveLowerBound );
        this.exclusiveUpperBound = exclusiveUpperBound === null ? null : forceBigUInt( exclusiveUpperBound );
    }

    toCborBytes(): Uint8Array
    {
        if( this.cborRef instanceof SubCborRef ) return this.cborRef.toBuffer();
        return this.toCbor();
    }
    toCbor(): CborString
    {
        if( this.cborRef instanceof SubCborRef ) return this.cborRef.toBuffer();
        return Cbor.encode( this.toCborObj() );
    }
    toCborObj(): CborObj
    {
        if( this.cborRef instanceof SubCborRef ) return Cbor.parse( this.cborRef.toBuffer() );
        return new CborArray([
            this.inclusiveLowerBound === null ? new CborSimple( null ) : new CborUInt( this.inclusiveLowerBound ),
            this.exclusiveUpperBound === null ? new CborSimple( null ) : new CborUInt( this.exclusiveUpperBound )
        ]);
    }

    static fromCbor( cStr: CanBeCborString ): DijkstraAccountBalanceInterval
    {
        return DijkstraAccountBalanceInterval.fromCborObj( Cbor.parse( forceCborString( cStr ), { keepRef: true } ) );
    }
    static fromCborObj( cObj: CborObj ): DijkstraAccountBalanceInterval
    {
        if(!(
            cObj instanceof CborArray &&
            cObj.array.length === 2
        )) throw new InvalidCborFormatError("DijkstraAccountBalanceInterval");

        const [ _lower, _upper ] = cObj.array;

        return new DijkstraAccountBalanceInterval({
            inclusiveLowerBound: _lower instanceof CborUInt ? _lower.num : null,
            exclusiveUpperBound: _upper instanceof CborUInt ? _upper.num : null
        }, getSubCborRef( cObj ));
    }

    toJSON() { return this.toJson(); }
    toJson()
    {
        return {
            inclusiveLowerBound: this.inclusiveLowerBound?.toString() ?? null,
            exclusiveUpperBound: this.exclusiveUpperBound?.toString() ?? null
        };
    }
}

export type IDijkstraAccountBalanceIntervalsEntry = {
    credential: Credential,
    interval: DijkstraAccountBalanceInterval | IDijkstraAccountBalanceInterval
};

export type DijkstraAccountBalanceIntervalsEntry = {
    credential: Credential,
    interval: DijkstraAccountBalanceInterval
};
