import { CborMap, CborObj, CborArray, CborUInt } from "@harmoniclabs/cbor";
import { isObject } from "@harmoniclabs/obj-utils";
import { GenesisHash } from "../../../hashes/Hash28/GenesisHash";
import { canBeUInteger, forceBigUInt } from "../../../utils/ints";
import { Epoch } from "../../common/ledger/Epoch";
import { BabbageProtocolParameters, isPartialProtocolParameters, partialProtocolParametersFromCborObj, partialProtocolParametersToCborObj, partialProtocolParamsToJson } from "./BabbageProtocolParameters";
import { Hash28 } from "../../../hashes";

export type LegacyPPUpdateProposal = [ LegacyPPUpdateMap, Epoch ];

export type LegacyPPUpdateMap = {
    genesisHash: Hash28, // GenesisHash
    changes: Partial<BabbageProtocolParameters>
}[];

export function isLegacyPPUpdateMap( something: object ): something is LegacyPPUpdateMap
{
    return (
        Array.isArray( something ) &&
        something.every( entry => {
            return (
                isObject( entry ) &&
                entry.genesisHash instanceof GenesisHash &&
                isPartialProtocolParameters( entry.changes )
            )
        })
    );
}

export function isLegacyPPUpdateProposal( something: any ): something is LegacyPPUpdateProposal
{
    return (
        Array.isArray( something ) &&
        something.length >= 2 &&
        isLegacyPPUpdateMap( something[0] ) &&
        canBeUInteger( something[1] )
    );
}

export function protocolUpdateToJson( pUp: LegacyPPUpdateProposal ): object
{
    return {
        epoch: forceBigUInt( pUp[1] ).toString(),
        parametersUpdate: pUp[0].map( ({ genesisHash, changes }) => ({
            genesisHash: genesisHash.toString(),
            changes: partialProtocolParamsToJson( changes )
        }))
    }
}

export function LegacyPPUpdateMapToCborObj( ppUpdate: LegacyPPUpdateMap ): CborMap
{
    return new CborMap(
        ppUpdate.map( entry => {
            return {
                k: entry.genesisHash.toCborObj(),
                v: partialProtocolParametersToCborObj( entry.changes )
            }
        })
    )
}

export function LegacyPPUpdateMapFromCborObj( cObj: CborObj ): LegacyPPUpdateMap
{
    if(!(cObj instanceof CborMap))
    throw new Error(`Invalid CBOR format for "LegacyPPUpdateProposal"`);

    return cObj.map.map( ({ k, v }) => ({
        genesisHash: GenesisHash.fromCborObj( k ),
        changes: partialProtocolParametersFromCborObj( v )
    }));
}

export function LegacyPPUpdateProposalToCborObj( protocolUpdate: LegacyPPUpdateProposal ): CborObj
{
    return new CborArray([
        LegacyPPUpdateMapToCborObj( protocolUpdate[0] ),
        new CborUInt( forceBigUInt( protocolUpdate[1] ) )
    ])
}

export function LegacyPPUpdateProposalFromCborObj( cObj: CborObj ): LegacyPPUpdateProposal
{
    if(!(cObj instanceof CborArray))
    throw new Error(`Invalid CBOR format for "LegacyPPUpdateProposal"`);

    const [
        proposalMap,
        epoch
    ] = cObj.array;

    if(!( epoch instanceof CborUInt))
    throw new Error(`Invalid CBOR format for "LegacyPPUpdateProposal"`);

    return [
        LegacyPPUpdateMapFromCborObj( proposalMap ),
        epoch.num
    ]
}