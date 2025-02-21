import { ToCbor, CborString, Cbor, CborObj, CborMap, CborUInt, CanBeCborString, forceCborString, SubCborRef } from "@harmoniclabs/cbor";
import { defineReadOnlyProperty } from "@harmoniclabs/obj-utils";
import { InvalidCborFormatError } from "../../utils/InvalidCborFormatError";
import { ToJson } from "../../utils/ToJson";
import { assert } from "../../utils/assert";
import { TxMetadatum, isTxMetadatum, txMetadatumFromCborObj } from "./TxMetadatum";
import { getSubCborRef } from "../../utils/getSubCborRef";

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
                    assert(
                        isTxMetadatum( v ),
                        "metatdatum with label " + k + " was not instace of 'TxMetadatum'"
                    );

                    return v;
                })()
            )

        );

        defineReadOnlyProperty(
            this,
            "metadata",
            _metadata
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
    static fromCborObj( cObj: CborObj ): TxMetadata
    {
        if(!( cObj instanceof CborMap ))
        throw new InvalidCborFormatError("TxMetadata")

        const meta = {};
        const len = cObj.map.length;

        for( let i = 0; i < len; i++ )
        {
            const { k, v } = cObj.map[i];

            if(!( k instanceof CborUInt ))
            throw new InvalidCborFormatError("TxMetadata")

            defineReadOnlyProperty(
                meta, k.num.toString(), txMetadatumFromCborObj( v )
            )
        }

        return new TxMetadata( meta, getSubCborRef( cObj ) );
    }

    toJSON() { return this.toJson(); }
    toJson()
    {
        const json = {}

        const ks = Object.keys( this.metadata );

        for(const k of ks)
        {
            defineReadOnlyProperty(
                json, k, this.metadata[k].toJson()
            )
        }

        return json as any;
    }
}