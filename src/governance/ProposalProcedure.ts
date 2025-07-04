import { Cbor, CborArray, CborString, CborUInt, SubCborRef, ToCbor } from "@harmoniclabs/cbor";
import { Coin } from "../ledger/Coin";
import { StakeAddress } from "../ledger/StakeAddress";
import { Anchor, IAnchor, isIAnchor } from "./Anchor";
import { GovActionLike, isGovActionLike, toRealGovAction } from "./GovAction/GovActionLike";
import { forceBigUInt } from "@harmoniclabs/cbor/dist/utils/ints";
import { roDescr } from "../utils/roDescr";
import { GovAction } from "./GovAction";
import { isObject } from "@harmoniclabs/obj-utils";
import { canBeUInteger } from "../utils/ints";
import { Data, DataConstr, DataI, ToData } from "@harmoniclabs/plutus-data";
import { ToDataVersion } from "../toData/defaultToDataVersion";

export interface IProposalProcedure {
    deposit: Coin,
    rewardAccount: StakeAddress,
    govAction: GovActionLike,
    anchor: IAnchor
}

export function isIProposalProcedure( stuff: any ): stuff is IProposalProcedure
{
    return isObject( stuff ) && (
        canBeUInteger( stuff.deposit ) &&
        stuff.rewardAccount instanceof StakeAddress &&
        isGovActionLike( stuff.govAction ) &&
        isIAnchor( stuff.anchor )
    );
}
//** To DO: add fromCborObj and toJson */
export class ProposalProcedure
    implements IProposalProcedure, ToCbor, ToData
{
    readonly deposit: bigint;
    readonly rewardAccount: StakeAddress;
    readonly govAction: GovAction;
    readonly anchor: Anchor;

    constructor(
        { deposit, rewardAccount, govAction, anchor }: IProposalProcedure,
        readonly cborRef: SubCborRef | undefined = undefined
    )
    {
        Object.defineProperties(
            this, {
                deposit: { value: forceBigUInt( deposit ), ...roDescr },
                rewardAccount: { value: StakeAddress.fromString( rewardAccount.toString() ), ...roDescr },
                govAction: { value: toRealGovAction( govAction ), ...roDescr },
                anchor: { value: new Anchor( anchor ), ...roDescr }
            }
        );
    }

    toCborBytes(): Uint8Array
    {
        if( this.cborRef instanceof SubCborRef ) return this.cborRef.toBuffer();
        return this.toCbor().toBuffer();
    }
    toCbor(): CborString
    {
        if( this.cborRef instanceof SubCborRef )
        {
            // TODO: validate cbor structure
            // we assume correctness here
            return new CborString( this.cborRef.toBuffer() );
        }
        
        return Cbor.encode( this.toCborObj() );
    }
    toCborObj(): CborArray
    {
        return new CborArray([
            new CborUInt( this.deposit ),
            this.rewardAccount.toCredential().toCborObj(),
            this.govAction.toCborObj(),
            this.anchor.toCborObj()
        ]);
    }

    toData( v?: ToDataVersion ): DataConstr
    {
        v = "v3"; // only supported so far

        return new DataConstr(
            0, [
                new DataI( this.deposit ),
                this.rewardAccount.toCredential().toData( v ),
                this.govAction.toData( v )
            ]
        );
    }
}