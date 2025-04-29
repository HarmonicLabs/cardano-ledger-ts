import { ToCbor, SubCborRef, CborString, Cbor, CborObj, CborArray, CanBeCborString, forceCborString } from "@harmoniclabs/cbor";
import { Cloneable } from "@harmoniclabs/cbor/dist/utils/Cloneable";
import { Hash32, Signature } from "../../hashes";
import { subCborRefOrUndef, getSubCborRef } from "../../utils/getSubCborRef";
import { InvalidCborFormatError } from "../../utils/InvalidCborFormatError";
import { ToJson } from "../../utils/ToJson";
import { VKey } from "./VKey";



export interface IVkey {
    vkey: Hash32,
    signature: Signature
}

export class VKeyWitness
    implements ToCbor, Cloneable<VKeyWitness>, ToJson
{
    readonly vkey!: VKey
    readonly signature!: Signature

    constructor(
        vkeys: IVkey,
        readonly cborRef: SubCborRef | undefined = undefined
    )
    {
        const { 
            vkey, 
            signature 
        } = vkeys;

        if(!(
            vkey instanceof Hash32
        ))throw new Error("can't construct 'VKeyWitness' without a 'VKey' as first argument");
        this.vkey = new VKey( vkey )

        if(!(
            signature instanceof Signature
        ))throw new Error("can't construct 'VKeyWitness' without a 'Signature' as second argument");

        this.signature = signature;
        
        this.cborRef = cborRef ?? subCborRefOrUndef(vkeys);
    }

    clone(): VKeyWitness
    {
        return new VKeyWitness({
            vkey: new VKey( this.vkey ),
            signature: new Signature( this.signature )
        }, this.cborRef?.clone());
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
            this.vkey.toCborObj(),
            this.signature.toCborObj()
        ])
    }

    static fromCbor( cStr: CanBeCborString ): VKeyWitness
    {
        return VKeyWitness.fromCborObj( Cbor.parse( forceCborString( cStr ), { keepRef: true } ) );
    }
    static fromCborObj( cObj: CborObj ): VKeyWitness
    {
        if(!(
            cObj instanceof CborArray
        ))throw new InvalidCborFormatError("VKeyWitness");

        return new VKeyWitness({
            vkey: Hash32.fromCborObj( cObj.array[0] ),
            signature: Signature.fromCborObj( cObj.array[1] ),
        }, getSubCborRef( cObj ));
    }

    toJSON() { return this.toJson(); }
    toJson()
    {
        return {
            vkey: this.vkey.asString,
            signature: this.signature.asString
        }
    }
}