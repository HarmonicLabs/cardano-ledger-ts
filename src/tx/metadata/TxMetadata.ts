import { ToCbor, CborString, Cbor, CborObj, CborMap, CborUInt, CanBeCborString, forceCborString, SubCborRef } from "@harmoniclabs/cbor";
import { cborMapEntries, cborUInt, noDuplicates } from "../../utils/strictCbor";
import { defineReadOnlyProperty } from "@harmoniclabs/obj-utils";
import { InvalidCborFormatError } from "../../utils/InvalidCborFormatError";
import { ToJson } from "../../utils/ToJson";
import { TxMetadatum, isTxMetadatum, txMetadatumFromCborObj } from "./TxMetadatum";
import { getSubCborRef, subCborRefOrUndef } from "../../utils/getSubCborRef";

export type ITxMetadata = {
    [metadatum_label: number | string]: TxMetadatum 
}

type ITxMetadataStr = { [metadatum_label: string]: TxMetadatum };

export class TxMetadata
    implements ToCbor, ToJson
{
    readonly metadata!: ITxMetadataStr;

    constructor(
        metadata: ITxMetadata,
        readonly cborRef: SubCborRef | undefined = undefined
    )
    {
        const _metadata = {};
        
        Object.keys( metadata )
        .forEach( k =>
            defineReadOnlyProperty(
                _metadata,
                BigInt( k ).toString(),
                (() => {
                    const v = metadata[k];
                    if(!(
                        isTxMetadatum( v )
                    ))throw new Error("metatdatum with label " + k + " was not instace of 'TxMetadatum'")

                    return v;
                })()
            )
        );

        this.metadata = _metadata;
         /* Done: this.cboRref params */
        this.cborRef = cborRef ?? subCborRefOrUndef( metadata );
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

    toCborObj(): CborObj
    {
        if( this.cborRef instanceof SubCborRef )
        {
            // TODO: validate cbor structure
            // we assume correctness here
            return Cbor.parse( this.cborRef.toBuffer() );
        }
        
        return new CborMap(
            Object.keys( this.metadata ).map( labelStr => {
                return {
                    k: new CborUInt( BigInt( labelStr ) ),
                    v: this.metadata[labelStr].toCborObj()
                }
            })
        )
    }

    static fromCbor( cStr: CanBeCborString ): TxMetadata
    {
        return TxMetadata.fromCborObj( Cbor.parse( forceCborString( cStr ), { keepRef: true } ) );
    }

    /**
     * cardano-ledger `Metadata`: `Map Word64 Metadatum` (`decodeMap`: from protocol
     * version 9 a repeated label fails; before, the last one wins)
     */
    static fromCborObj( cObj: CborObj ): TxMetadata
    {
        const entries = noDuplicates(
            cborMapEntries( cObj, "TxMetadata" ),
            ({ k }) => cborUInt( k, "TxMetadata label" ).toString(),
            "TxMetadata"
        );

        const meta = {};
        const len = entries.length;

        for( let i = 0; i < len; i++ )
        {
            const { k, v } = entries[i];
            if(!( k instanceof CborUInt ))
            throw new InvalidCborFormatError("TxMetadata: " + k)

            defineReadOnlyProperty(
                meta, 
                k.num.toString(), 
                txMetadatumFromCborObj( v )
            )
        }

        return new TxMetadata( meta, getSubCborRef( cObj ) );
    }

    toJSON() { return this.toJson(); }

    toJson()
    {
        const json = {};

        const ks = Object.keys( this.metadata );

        for(const k of ks)
        {
            defineReadOnlyProperty(
                json, k, this.metadata[k].toJson()
            )
        };
        return json as any;
    };
}