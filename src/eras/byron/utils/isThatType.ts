import { EpochId, Difficulty, ProtocolMagic, SlotNo, DlgProof, UpdProof, Signature, Issuer, Delegate, PubKey, ExtraProof, BlockId, StakeholderId, AddressId, TxId } from "./types";
import { isHash, isHash28, isHash32, isWord32, isWord64 } from "../../../utils/isThatType";

// Uint8Array

export function isSignature( stuff: Signature ): stuff is Signature 
{
    return isHash( stuff );
}

export function isPubKey( stuff: PubKey ): stuff is PubKey 
{
    return isHash( stuff );
}

// U8Arr28

export function isAddressId( stuff: AddressId ): stuff is AddressId 
{
    return isHash28( stuff );
}

export function isStakeholderId( stuff: StakeholderId ): stuff is StakeholderId 
{
    return isHash28( stuff );
}

// U8Arr32

export function isTxId( stuff: TxId ): stuff is TxId 
{
    return isHash32( stuff );
}

export function isIssuer( stuff: Issuer ): stuff is Issuer 
{
    return isHash32( stuff );
}

export function isDelegate( stuff: Delegate ): stuff is Delegate 
{
    return isHash32( stuff );
}

export function isDlgProof( stuff: DlgProof ): stuff is DlgProof 
{
    return isHash32( stuff );
}

export function isUpdProof( stuff: UpdProof ): stuff is UpdProof 
{
    return isHash32( stuff );
}

export function isExtraProof( stuff: ExtraProof ): stuff is ExtraProof 
{
    return isHash32( stuff );
}

export function isBlockId( stuff: BlockId ): stuff is BlockId 
{
    return isHash32( stuff );
}

// number

export function isProtocolMagic( stuff: ProtocolMagic ): stuff is ProtocolMagic 
{
    if( typeof stuff === "number" ) 
    {
        return( isWord32( stuff ) );
    }

    return false;
}

// bigint

export function isDifficulty( stuff: Difficulty ): stuff is Difficulty 
{
    if( typeof stuff === "bigint" ) 
    {
        return( isWord64( stuff ) );
    }

    return false;
}

export function isEpochId( stuff: EpochId ): stuff is EpochId 
{
    if( typeof stuff === "bigint" ) 
    {
        return( isWord64( stuff ) );
    }

    return false;
}

export function isSlotNo( stuff: SlotNo ): stuff is SlotNo 
{
    if( typeof stuff === "bigint" ) 
    {
        return( isWord64( stuff ) );
    }

    return false;
}