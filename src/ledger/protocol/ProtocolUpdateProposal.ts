import { CborMap, CborObj, CborArray, CborUInt } from "@harmoniclabs/cbor";
import { isObject } from "@harmoniclabs/obj-utils";
import { GenesisHash } from "../../hashes/Hash28/GenesisHash";
import { canBeUInteger, forceBigUInt } from "../../utils/ints";
import { Epoch } from "../Epoch";
import { ProtocolParamters, isPartialProtocolParameters, partialProtocolParametersFromCborObj, partialProtocolParametersToCborObj, partialProtocolParamsToJson } from "./ProtocolParameters";

export type ProtocolUpdateProposal = [ ProtocolParametersUpdateMap, Epoch ];

export type ProtocolParametersUpdateMap = {
    genesisHash: GenesisHash
    changes: Partial<ProtocolParamters>
}[];

export function isProtocolParametersUpdateMap( something: object ): something is ProtocolParametersUpdateMap
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

export function isProtocolUpdateProposal( something: object ): something is ProtocolUpdateProposal
{
    return (
        Array.isArray( something ) &&
        something.length >= 2 &&
        isProtocolParametersUpdateMap( something[0] ) &&
        canBeUInteger( something[1] )
    );
}

export function protocolUpdateToJson( pUp: ProtocolUpdateProposal ): object
{
    return {
        epoch: forceBigUInt( pUp[1] ).toString(),
        parametersUpdate: pUp[0].map( ({ genesisHash, changes }) => ({
            genesisHash: genesisHash.asString,
            changes: partialProtocolParamsToJson( changes )
        }))
    }
}

export function protocolParametersUpdateMapToCborObj( ppUpdate: ProtocolParametersUpdateMap ): CborMap
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

export function protocolParametersUpdateMapFromCborObj( cObj: CborObj ): ProtocolParametersUpdateMap
{
    if(!(cObj instanceof CborMap))
    throw new Error(`Invalid CBOR format for "ProtocolUpdateProposal"`);

    return cObj.map.map( ({ k, v }) => ({
        genesisHash: GenesisHash.fromCborObj( k ),
        changes: partialProtocolParametersFromCborObj( v )
    }));
}

export function protocolUpdateProposalToCborObj( protocolUpdate: ProtocolUpdateProposal ): CborObj
{
    return new CborArray([
        protocolParametersUpdateMapToCborObj( protocolUpdate[0] ),
        new CborUInt( forceBigUInt( protocolUpdate[1] ) )
    ])
}

export function protocolUpdateProposalFromCborObj( cObj: CborObj ): ProtocolUpdateProposal
{
    if(!(cObj instanceof CborArray))
    throw new Error(`Invalid CBOR format for "ProtocolUpdateProposal"`);

    const [
        proposalMap,
        epoch
    ] = cObj.array;

    if(!( epoch instanceof CborUInt))
    throw new Error(`Invalid CBOR format for "ProtocolUpdateProposal"`);

    return [
        protocolParametersUpdateMapFromCborObj( proposalMap ),
        epoch.num
    ]
}