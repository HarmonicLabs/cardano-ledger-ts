import { ToCbor, SubCborRef, CborString, Cbor, CborObj, CborArray, CborBytes, CanBeCborString, forceCborString } from "@harmoniclabs/cbor";
import { Cloneable } from "@harmoniclabs/cbor/dist/utils/Cloneable";
import { toHex } from "@harmoniclabs/uint8array-utils";
import { isUint8Array } from "util/types";
import { Hash, Hash32, Signature } from "../../hashes";
import { VKey } from "../../tx";
import { subCborRefOrUndef, getSubCborRef } from "../../utils/getSubCborRef";
import { InvalidCborFormatError } from "../../utils/InvalidCborFormatError";
import { ToJson } from "../../utils/ToJson";

export interface IBootstrapWitness {
    pubKey: Hash | Hash32;
    signature: Signature;
    chainCode: Hash | Hash32;
    attributes: Uint8Array;
}
export class BootstrapWitness
    implements ToCbor, Cloneable<BootstrapWitness>, ToJson
{
    readonly pubKey!: VKey;
    readonly signature!: Signature;
    readonly chainCode!: Hash | Hash32;
    readonly attributes!: Uint8Array;

    constructor(
        witness: IBootstrapWitness,
        readonly cborRef: SubCborRef | undefined = undefined
    )
    {
        const { 
            pubKey, 
            signature, 
            chainCode, 
            attributes 
        } = witness;
        
        // console.log("pubkKey: ", pubKey, pubKey.toString() );
        if(!(
            pubKey instanceof Hash32 
            || pubKey instanceof Hash
        ))throw new Error("invalid 'pubKey' constructing 'BootstrapWitness': " +  pubKey);
        this.pubKey =  pubKey instanceof VKey ? pubKey : new VKey( pubKey )

        // console.log("signature: ", signature, signature.toString() );
        if(!(
            signature instanceof Signature
        ))throw new Error("invalid 'signature' constructing 'BootstrapWitness'");
        this.signature = signature;

        // console.log("chainCode: ", chainCode, chainCode.toString() );
        if(!(
            chainCode instanceof Hash32 
            || chainCode instanceof Hash
        ))throw new Error("invalid 'chainCode' constructing 'BootstrapWitness'");
        this.chainCode = chainCode;
        
        // console.log("attributes: ", attributes, toHex( attributes ) );
        if(!(
            isUint8Array( attributes )
        ))throw new Error("invalid 'attributes' constructing 'BootstrapWitness'");
        this.attributes = Uint8Array.from( attributes );

        this.cborRef = cborRef ?? subCborRefOrUndef( witness );
    }

    clone(): BootstrapWitness
    {
        return new BootstrapWitness({
                pubKey: this.pubKey.clone(),
                signature: this.signature.clone(),
                chainCode: this.chainCode.clone(),
                attributes: this.attributes.slice()
            }, this.cborRef?.clone())
    }

    toCborBytes(): Uint8Array
    {
        if( 
            this.cborRef instanceof SubCborRef 
        ) return this.cborRef.toBuffer();

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
            // && cObj.array.length >= 4
        ))throw new InvalidCborFormatError("BootstrapWitness");
        
        return new BootstrapWitness(
            {
                pubKey: Hash32.fromCborObj(cObj.array[0]),
                signature: Signature.fromCborObj(cObj.array[1]),
                chainCode: Hash32.fromCborObj(cObj.array[2]),
                attributes: cObj.array[3].bytes
            },
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