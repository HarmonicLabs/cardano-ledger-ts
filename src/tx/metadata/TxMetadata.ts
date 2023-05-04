import { ToCbor, CborString, Cbor, CborObj, CborMap, CborUInt, CanBeCborString, forceCborString } from "@harmoniclabs/cbor";
import { defineReadOnlyProperty } from "@harmoniclabs/obj-utils";
import { InvalidCborFormatError } from "../../utils/InvalidCborFormatError";
import { ToJson } from "../../utils/ToJson";
import { assert } from "../../utils/assert";
import { TxMetadatum, isTxMetadatum, txMetadatumFromCborObj } from "./TxMetadatum";

export type ITxMetadata = {
    [metadatum_label: number | string]: TxMetadatum 
}

type ITxMetadataStr = { [metadatum_label: string]: TxMetadatum };

export class TxMetadata
    implements ToCbor, ToJson
{
    readonly metadata!: ITxMetadataStr;

    constructor( metadata: ITxMetadata )
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
    
    toCbor(): CborString
    {
        return Cbor.encode( this.toCborObj() );
    }
    toCborObj(): CborObj
    {
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
        return TxMetadata.fromCborObj( Cbor.parse( forceCborString( cStr ) ) );
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

        return new TxMetadata( meta )
    }

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