import { ToCbor, CborString, Cbor, CborObj, CborArray, CborBytes, CanBeCborString, forceCborString, SubCborRef } from "@harmoniclabs/cbor";
import { Cloneable } from "@harmoniclabs/cbor/dist/utils/Cloneable";
import { defineReadOnlyProperty } from "@harmoniclabs/obj-utils";
import { Hash32 } from "../../hashes/Hash32/Hash32";
import { Signature } from "../../hashes/Signature";
import { InvalidCborFormatError } from "../../utils/InvalidCborFormatError";
import { ToJson } from "../../utils/ToJson";
import { assert } from "../../utils/assert";
import { VKey } from "./VKeyWitness/VKey";
import { isUint8Array, toHex } from "@harmoniclabs/uint8array-utils";
import { getSubCborRef } from "../../utils/getSubCborRef";

export class BootstrapWitness
    implements ToCbor, Cloneable<BootstrapWitness>, ToJson
{
    readonly pubKey!: VKey;
    readonly signature!: Signature;
    readonly chainCode!: Hash32;
    readonly attributes!: Uint8Array;

    constructor(
        pubKey: Hash32,
        signature: Signature,
        chainCode: Hash32,
        attributes: Uint8Array,
        readonly cborRef: SubCborRef | undefined = undefined
    )
    {
        assert(
            pubKey instanceof Hash32,
            "invalid 'pubKey' constructing 'BootstrapWitness'"
        );
        defineReadOnlyProperty(
            this,
            "pubKey",
            pubKey instanceof VKey ? pubKey : new VKey( pubKey )
        );

        assert(
            signature instanceof Signature,
            "invalid 'signature' constructing 'BootstrapWitness'"
        );
        defineReadOnlyProperty(
            this,
            "signature",
            signature
        );

        assert(
            chainCode instanceof Hash32,
            "invalid 'chainCode' constructing 'BootstrapWitness'"
        );
        defineReadOnlyProperty(
            this,
            "chainCode",
            chainCode
        );

        assert(
            isUint8Array( attributes ),
            "invalid 'attributes' constructing 'BootstrapWitness'"
        );
        defineReadOnlyProperty(
            this,
            "attributes",
            Uint8Array.from( attributes )
        );
    }

    clone(): BootstrapWitness
    {
        return new BootstrapWitness(
            this.pubKey.clone(),
            this.signature.clone(),
            this.chainCode.clone(),
            this.attributes.slice()
        )
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
        return new CborArray([
            this.pubKey.toCborObj(),
            this.signature.toCborObj(),
            this.chainCode.toCborObj(),
            new CborBytes( this.attributes )
        ])
    }

    static fromCbor( cStr: CanBeCborString ): BootstrapWitness
    {
        return BootstrapWitness.fromCborObj( Cbor.parse( forceCborString( cStr ), { keepRef: true } ) );
    }
    static fromCborObj( cObj: CborObj ): BootstrapWitness
    {
        if(!(
            cObj instanceof CborArray &&
            cObj.array[3] instanceof CborBytes
        ))
        throw new InvalidCborFormatError("BootstrapWitness");

        return new BootstrapWitness(
            Hash32.fromCborObj( cObj.array[0] ),
            Signature.fromCborObj( cObj.array[1] ),
            Hash32.fromCborObj( cObj.array[2] ),
            cObj.array[3].bytes,
            getSubCborRef( cObj )
        );
    }

    toJSON() { return this.toJson(); }
    toJson()
    {
        this.chainCode;

        return {
            pubKey:     this.pubKey   .toString(),
            signature:  this.signature.toString(),
            chainCode:  this.chainCode.toString(),
            attributes: toHex( this.attributes )
        }
    }
}