import { EpochId, Difficulty, ProtocolMagic, SlotNo, DlgProof, UpdProof, Signature, Issuer, Delegate, PubKey, ExtraProof, BlockId, StakeholderId, AddressId, TxId, VssPubKey, VssEnc, VssSec, VssDec, UpdId } from "./types";
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

export function isVssPubKey( stuff: VssPubKey ): stuff is VssPubKey 
{
    return isHash( stuff );
}

export function isVssSec( stuff: VssSec ): stuff is VssSec 
{
    return isHash( stuff );
}

export function isVssDec( stuff: VssDec ): stuff is VssDec 
{
    return isHash( stuff );
}

export function isIssuer( stuff: Issuer ): stuff is Issuer 
{
    return isPubKey( stuff );
}

export function isDelegate( stuff: Delegate ): stuff is Delegate 
{
    return isPubKey( stuff );
}

// Uint8Array[]

export function isVssEnc( stuff: VssEnc ): stuff is VssEnc 
{
    return(
        Array.isArray( stuff ) &&
        stuff.every( isHash )
    );
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

export function isUpdId( stuff: UpdId ): stuff is UpdId 
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