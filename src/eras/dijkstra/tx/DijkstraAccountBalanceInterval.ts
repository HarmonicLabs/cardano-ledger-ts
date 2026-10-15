import { ToCbor, SubCborRef, CborString, Cbor, CborObj, CborArray, CborBytes, CborMap, CborUInt, CborSimple, CanBeCborString, forceCborString } from "@harmoniclabs/cbor";
import { CanBeUInteger, canBeUInteger, forceBigUInt } from "@harmoniclabs/cbor/dist/utils/ints";
import { isObject } from "@harmoniclabs/obj-utils";
import { Credential, CredentialType } from "../../../credentials";
import { Hash28 } from "../../../hashes";
import { getSubCborRef } from "../../../utils/getSubCborRef";
import { InvalidCborFormatError } from "../../../utils/InvalidCborFormatError";
import { ToJson } from "../../../utils/ToJson";

/**
 * CDDL (Dijkstra):
 * ```cddl
 * account_balance_interval =
 *   [inclusive_lower_bound : coin, exclusive_upper_bound : coin/ nil]
 *   / [inclusive_lower_bound : coin/ nil, exclusive_upper_bound : coin]
 *   / coin
 * ```
 * The bare `coin` form is `AccountBalanceExact` (Scripts.hs). Both bounds
 * `nil` is a decoding error.
 */
export interface IDijkstraAccountBalanceInterval {
    inclusiveLowerBound: CanBeUInteger | null;
    exclusiveUpperBound: CanBeUInteger | null;
    /** the bare `coin` form; when set both bounds must be null */
    exact?: CanBeUInteger | null;
}

export function isIDijkstraAccountBalanceInterval( stuff: any ): stuff is IDijkstraAccountBalanceInterval
{
    if( !isObject( stuff ) ) return false;
    const { inclusiveLowerBound: lower, exclusiveUpperBound: upper, exact } = stuff as IDijkstraAccountBalanceInterval;
    if( exact !== undefined && exact !== null ) return canBeUInteger( exact ) && ( lower === null || lower === undefined ) && ( upper === null || upper === undefined );
    return (
        ( lower === null || canBeUInteger( lower ) ) &&
        ( upper === null || canBeUInteger( upper ) ) &&
        !( lower === null && upper === null )
    );
}

export class DijkstraAccountBalanceInterval
    implements ToCbor, ToJson
{
    readonly inclusiveLowerBound: bigint | null;
    readonly exclusiveUpperBound: bigint | null;
    readonly exact: bigint | null;

    constructor(
        interval: IDijkstraAccountBalanceInterval,
        readonly cborRef: SubCborRef | undefined = undefined
    )
    {
        if( !isIDijkstraAccountBalanceInterval( interval ) )
        throw new Error("invalid 'account_balance_interval'");
        const { inclusiveLowerBound, exclusiveUpperBound, exact } = interval;
        this.exact = exact === undefined || exact === null ? null : forceBigUInt( exact );
        this.inclusiveLowerBound = this.exact !== null || inclusiveLowerBound === null ? null : forceBigUInt( inclusiveLowerBound );
        this.exclusiveUpperBound = this.exact !== null || exclusiveUpperBound === null ? null : forceBigUInt( exclusiveUpperBound );
    }

    /** true if `balance` is inside the interval (`[lower, upper)`, or equal to `exact`) */
    contains( balance: bigint ): boolean
    {
        if( this.exact !== null ) return balance === this.exact;
        if( this.inclusiveLowerBound !== null && balance < this.inclusiveLowerBound ) return false;
        if( this.exclusiveUpperBound !== null && balance >= this.exclusiveUpperBound ) return false;
        return true;
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
        if( this.exact !== null ) return new CborUInt( this.exact );
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
        if( cObj instanceof CborUInt )
        return new DijkstraAccountBalanceInterval({ inclusiveLowerBound: null, exclusiveUpperBound: null, exact: cObj.num }, getSubCborRef( cObj ));

        if(!(
            cObj instanceof CborArray &&
            cObj.array.length === 2
        )) throw new InvalidCborFormatError("DijkstraAccountBalanceInterval");

        const bound = ( c: CborObj ): bigint | null => {
            if( c instanceof CborUInt ) return c.num;
            if( c instanceof CborSimple && c.simple === null ) return null;
            throw new InvalidCborFormatError("DijkstraAccountBalanceInterval: bound must be coin or nil");
        };
        const lower = bound( cObj.array[0] );
        const upper = bound( cObj.array[1] );
        if( lower === null && upper === null )
        throw new InvalidCborFormatError("AccountBalanceInterval: Both interval bounds cannot be nil.");

        return new DijkstraAccountBalanceInterval({
            inclusiveLowerBound: lower,
            exclusiveUpperBound: upper
        }, getSubCborRef( cObj ));
    }

    toJSON() { return this.toJson(); }
    toJson()
    {
        if( this.exact !== null ) return { exact: this.exact.toString() };
        return {
            inclusiveLowerBound: this.inclusiveLowerBound?.toString() ?? null,
            exclusiveUpperBound: this.exclusiveUpperBound?.toString() ?? null
        };
    }
}

/** true for a 29-byte reward (account) address: header type 14 (key) or 15 (script). */
export function isRewardAccountBytes( bytes: Uint8Array ): boolean
{
    return bytes.length === 29 && ( ( bytes[0] >> 4 ) === 0xe || ( bytes[0] >> 4 ) === 0xf );
}

/** the stake credential of a reward account address */
export function rewardAccountCredential( bytes: Uint8Array ): Credential
{
    if( !isRewardAccountBytes( bytes ) ) throw new Error("not a reward account address");
    return new Credential({
        type: ( bytes[0] >> 4 ) === 0xf ? CredentialType.Script : CredentialType.KeyHash,
        hash: new Hash28( bytes.slice( 1 ) )
    });
}

export type IDijkstraAccountBalanceIntervalsEntry = {
    /** `reward_account` bytes (29 bytes, header 0xe_ or 0xf_) */
    rewardAccount: Uint8Array,
    interval: DijkstraAccountBalanceInterval | IDijkstraAccountBalanceInterval
};

export type DijkstraAccountBalanceIntervalsEntry = {
    rewardAccount: Uint8Array,
    interval: DijkstraAccountBalanceInterval
};

/** encodes `account_balance_intervals = {+ reward_account => account_balance_interval}` */
export function accountBalanceIntervalsToCborObj( entries: DijkstraAccountBalanceIntervalsEntry[] ): CborMap
{
    return new CborMap( entries.map( e => ({
        k: new CborBytes( e.rewardAccount ),
        v: e.interval.toCborObj()
    }) ) );
}

/** decodes `account_balance_intervals` (also `starting_account_balance_intervals`) */
export function accountBalanceIntervalsFromCborObj( cObj: CborObj ): DijkstraAccountBalanceIntervalsEntry[]
{
    if(!( cObj instanceof CborMap ))
    throw new InvalidCborFormatError("account balance intervals");

    return cObj.map.map(({ k, v }) => {
        if(!( k instanceof CborBytes && isRewardAccountBytes( k.bytes ) ))
        throw new InvalidCborFormatError("account balance intervals contains an invalid reward account");
        return {
            rewardAccount: k.bytes,
            interval: DijkstraAccountBalanceInterval.fromCborObj( v )
        };
    });
}

export function normalizeAccountBalanceIntervals( entries: IDijkstraAccountBalanceIntervalsEntry[] ): DijkstraAccountBalanceIntervalsEntry[]
{
    return entries.map( e => {
        if(!( e.rewardAccount instanceof Uint8Array && isRewardAccountBytes( e.rewardAccount ) ))
        throw new Error("account balance intervals contains an invalid reward account");
        return {
            rewardAccount: e.rewardAccount,
            interval: e.interval instanceof DijkstraAccountBalanceInterval ? e.interval : new DijkstraAccountBalanceInterval( e.interval )
        };
    });
}
