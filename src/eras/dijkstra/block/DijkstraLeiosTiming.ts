import { CanBeUInteger } from "@harmoniclabs/cbor/dist/utils/ints";
import { forceBigUInt } from "../../../utils/ints";

/**
 * Leios certification timing from gouroboros `ledger/dijkstra/dijkstra.go`
 * (`DijkstraProtocolParameters`) and dingo `leios_certification.go`:
 *
 *   t_slot = uint64(SlotLengthMs)
 *   total  = 3*LeiosAnnouncementPeriodLength
 *          +   LeiosVotePeriodLength
 *          +   LeiosDiffusionPeriodLength
 *   slots  = ceil(total / t_slot)
 *
 * A certified block must be at a slot strictly greater than the slot of the
 * block that announced the endorser block, and at least `slots` later.
 */
export interface ILeiosTimingProtocolParameters
{
    leiosAnnouncementPeriodLength: CanBeUInteger;
    leiosVotePeriodLength: CanBeUInteger;
    leiosDiffusionPeriodLength: CanBeUInteger;
}

export interface ILeiosAnnouncingHeader
{
    slot: CanBeUInteger;
    ebAnnouncement?: { size?: CanBeUInteger } | null;
}

export interface ILeiosCertifiedHeader
{
    slot: CanBeUInteger;
    leiosCertified: boolean;
    ebAnnouncement?: { size?: CanBeUInteger } | null;
}

const MAX_UINT64 = BigInt("18446744073709551615");

export function leiosCertificationWindowMillis( pp: ILeiosTimingProtocolParameters ): bigint
{
    const announcement = forceBigUInt( pp.leiosAnnouncementPeriodLength );
    const vote = forceBigUInt( pp.leiosVotePeriodLength );
    const diffusion = forceBigUInt( pp.leiosDiffusionPeriodLength );
    const total = BigInt( 3 ) * announcement + vote + diffusion;
    if( total > MAX_UINT64 ) throw new Error("Leios certification window exceeds uint64");
    return total;
}

/** alias kept for callers that read the window in slots; it is milliseconds before rounding */
export const leiosCertificationWindowSlots = leiosCertificationWindowMillis;

/**
 * earliest slot at which a certification for the endorser block announced in
 * `announcingSlot` may appear.
 *
 * `slotLengthMs` is truncated the way dingo/gouroboros do (`uint64(duration)`);
 * pass milliseconds, not seconds.
 */
export function leiosEarliestCertificationSlot(
    announcingSlot: CanBeUInteger,
    slotLengthMs: number | bigint,
    pp: ILeiosTimingProtocolParameters
): bigint
{
    const tSlot = typeof slotLengthMs === "bigint" ? slotLengthMs : BigInt( Math.trunc( slotLengthMs ) );
    if( tSlot <= BigInt( 0 ) ) throw new Error("slot length must be positive");
    const total = leiosCertificationWindowMillis( pp );
    const slots = ( total + tSlot - BigInt( 1 ) ) / tSlot;
    const earliest = forceBigUInt( announcingSlot ) + slots;
    if( earliest > MAX_UINT64 ) throw new Error("Leios certification slot exceeds uint64");
    return earliest;
}

/**
 * Checks a certified block against its predecessor (the announcing block).
 * Returns the earliest allowed slot so callers can assert on it.
 */
export function validateLeiosCertificationTiming(
    certified: ILeiosCertifiedHeader,
    announcing: ILeiosAnnouncingHeader | null | undefined,
    slotLengthMs: number | bigint,
    pp: ILeiosTimingProtocolParameters
): bigint
{
    if( !certified.leiosCertified )
        throw new Error("block is not Leios-certified");
    if( announcing === null || announcing === undefined )
        throw new Error("no predecessor block to announce an endorser block");
    if( announcing.ebAnnouncement === null || announcing.ebAnnouncement === undefined )
        throw new Error("predecessor block carries no eb_references_announcement");
    const announcingSlot = forceBigUInt( announcing.slot );
    const earliest = leiosEarliestCertificationSlot( announcingSlot, slotLengthMs, pp );
    const certifiedSlot = forceBigUInt( certified.slot );
    if( certifiedSlot <= announcingSlot )
        throw new Error("certified block must be in a slot after the announcing block");
    if( certifiedSlot < earliest )
        throw new Error(
            "certified block slot " + certifiedSlot.toString() +
            " is earlier than " + earliest.toString() +
            " for the announcement at slot " + announcingSlot.toString()
        );
    return earliest;
}
