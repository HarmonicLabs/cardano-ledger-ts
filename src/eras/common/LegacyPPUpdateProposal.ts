import { CborMap, CborObj, CborArray, CborUInt } from "@harmoniclabs/cbor";
import { isObject } from "@harmoniclabs/obj-utils";
import { GenesisHash } from "../../hashes/Hash28/GenesisHash";
import { CanBeUInteger, canBeUInteger, forceBigUInt } from "../../utils/ints";
import { Epoch } from "./ledger/Epoch";
import { Hash28 } from "../../hashes";
import { isRational, Rational } from "./Rational";

export type LegacyPPUpdateProposal = [ LegacyPPUpdateMap, Epoch ];

export type AnyEraPartialParams = { [paramName: string ]: Rational | CanBeUInteger };

export type LegacyPPUpdateMap = {
    genesisHash: Hash28, // GenesisHash
    changes: AnyEraPartialParams
}[];

export function isLegacyPPUpdateMap( something: object ): something is LegacyPPUpdateMap
{
    return (
        Array.isArray( something ) &&
        something.every( entry => {
            return (
                isObject( entry )
                && entry.genesisHash instanceof GenesisHash
                && isObject( entry.changes )
                && Object.entries( entry.changes ).every( ([paramName, value]) => 
                    typeof paramName === "string"
                    && ( canBeUInteger( value ) || isRational( value ) )
                )
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

export function protocolUpdateToJson(
    pUp: LegacyPPUpdateProposal,
    partialProtocolParamsToJson: ( params: AnyEraPartialParams ) => any
): object
{
    return {
        epoch: forceBigUInt( pUp[1] ).toString(),
        parametersUpdate: pUp[0].map( ({ genesisHash, changes }) => ({
            genesisHash: genesisHash.toString(),
            changes: partialProtocolParamsToJson( changes )
        }))
    }
}

export function LegacyPPUpdateMapToCborObj(
    ppUpdate: LegacyPPUpdateMap,
    partialProtocolParametersToCborObj: ( params: AnyEraPartialParams ) => CborObj
): CborMap
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

export function LegacyPPUpdateMapFromCborObj(
    cObj: CborObj,
    partialProtocolParametersFromCborObj: ( cObj: CborObj ) => AnyEraPartialParams
): LegacyPPUpdateMap
{
    if(!(cObj instanceof CborMap))
    throw new Error(`Invalid CBOR format for "LegacyPPUpdateProposal"`);

    return cObj.map.map( ({ k, v }) => ({
        genesisHash: GenesisHash.fromCborObj( k ),
        changes: partialProtocolParametersFromCborObj( v )
    }));
}

export function LegacyPPUpdateProposalToCborObj(
    protocolUpdate: LegacyPPUpdateProposal,
    LegacyPPUpdateMapToCborObj: ( params: LegacyPPUpdateMap ) => CborObj
): CborObj
{
    return new CborArray([
        LegacyPPUpdateMapToCborObj( protocolUpdate[0] ),
        new CborUInt( forceBigUInt( protocolUpdate[1] ))
    ])
}

export function LegacyPPUpdateProposalFromCborObj(
    cObj: CborObj,
    LegacyPPUpdateMapFromCborObj: ( cObj: CborObj ) => LegacyPPUpdateMap
): LegacyPPUpdateProposal
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