import { Cbor, CborArray, CborBytes, CborObj, CborString, CborUInt, SubCborRef, ToCbor } from "@harmoniclabs/cbor";
import { govActionFromCborObj } from "./govActionFromCborObj";
import { Credential } from "../credentials";
import { getSubCborRef } from "../utils/getSubCborRef";
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
        return this.toCbor();
    }
    toCbor(): CborString
    {
        if( this.cborRef instanceof SubCborRef )
        {
            // TODO: validate cbor structure
            // we assume correctness here
            return this.cborRef.toBuffer();
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

    /** `[deposit, reward_account (29 bytes), gov_action, anchor]`; the reward account is also accepted in credential form (this class's own encoding). */
    static fromCborObj( cObj: CborObj ): ProposalProcedure
    {
        if(!( cObj instanceof CborArray && cObj.array.length >= 4 && cObj.array[0] instanceof CborUInt ))
        throw new Error("invalid CBOR for proposal_procedure");
        const [ deposit, acct, action, anchor ] = cObj.array;
        let rewardAccount: StakeAddress;
        if( acct instanceof CborBytes ) rewardAccount = StakeAddress.fromBytes( acct.bytes );
        else
        {
            const cred = Credential.fromCborObj( acct! );
            rewardAccount = new StakeAddress({ network: "mainnet", credentials: cred.hash, type: cred.type === 1 ? "script" : "stakeKey" } as any);
        }
        return new ProposalProcedure({
            deposit: (deposit as CborUInt).num,
            rewardAccount,
            govAction: govActionFromCborObj( action! ) as any,
            anchor: Anchor.fromCborObj( anchor! )
        }, getSubCborRef( cObj ));
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