import { ToCbor, CborString, Cbor, CborArray, CanBeCborString, forceCborString, CborObj, SubCborRef } from "@harmoniclabs/cbor";
import { Cloneable } from "@harmoniclabs/cbor/dist/utils/Cloneable";
import { isObject, hasOwn, defineReadOnlyProperty } from "@harmoniclabs/obj-utils";
import { InvalidCborFormatError } from "../../../utils/InvalidCborFormatError";
import { ToJson } from "../../../utils/ToJson";
import { IShelleyTxOut, isIShelleyTxOut, ShelleyTxOut } from "./ShelleyTxOut";
import { ITxOutRef, isITxOutRef, TxOutRef } from "../../common/TxOutRef";
import { getSubCborRef } from "../../../utils/getSubCborRef";

export interface IShelleyUTxO {
    utxoRef: ITxOutRef,
    resolved: IShelleyTxOut
}

export function isIShelleyUTxO( stuff: any ): stuff is IShelleyUTxO
{
    return (
        isObject( stuff ) &&
        hasOwn( stuff, "utxoRef" ) && isITxOutRef( stuff.utxoRef ) &&
        hasOwn( stuff, "resolved" ) && isIShelleyTxOut( stuff.resolved )
    );
}

export class ShelleyUTxO
    implements IShelleyUTxO, ToJson, ToCbor, Cloneable<ShelleyUTxO>
{
    readonly utxoRef!: TxOutRef
    readonly resolved!: ShelleyTxOut

    constructor(
        { 
            utxoRef, 
            resolved 
        }: IShelleyUTxO,
        
        readonly cborRef: SubCborRef | undefined = undefined
    )
    {
        this.utxoRef = utxoRef instanceof TxOutRef ? utxoRef : new TxOutRef( utxoRef );

        this.resolved = resolved instanceof ShelleyTxOut ? resolved : new ShelleyTxOut( resolved );
    }

    clone(): ShelleyUTxO
    {
        return new ShelleyUTxO( this );
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
        
        return Cbor.encode( this.toCborObj() )
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
            this.utxoRef.toCborObj(),
            this.resolved.toCborObj()
        ])
    }

    static fromCbor( cStr: CanBeCborString ): ShelleyUTxO
    {
        return ShelleyUTxO.fromCborObj( Cbor.parse( forceCborString( cStr ), { keepRef: true } ) );
    }
    static fromCborObj( cObj: CborObj ): ShelleyUTxO
    {
        if(!(cObj instanceof CborArray))
        throw new InvalidCborFormatError("ShelleyUTxO");

        const [ ref, res ] = cObj.array;

        let utxoRef: TxOutRef;
        let resolved: ShelleyTxOut;

        if( ref === undefined )
        throw new InvalidCborFormatError("ShelleyUTxO");

        if( res === undefined )
        throw new InvalidCborFormatError(
            "ShelleyUTxO",
            "if you are trying to parse only a TxOutRef instead (<hex>#<index>) you should use `TxOutRef.fromCborObj`"
        );

        utxoRef = TxOutRef.fromCborObj( ref );
        resolved = ShelleyTxOut.fromCborObj( res );

        return new ShelleyUTxO({
            utxoRef,
            resolved
        }, getSubCborRef( cObj ));
    }

    toJSON() { return this.toJson(); }
    toJson()
    {
        return {
            utxoRef: this.utxoRef.toJson(),
            resolved: this.resolved.toJson()
        }
    }

    static sort( a: IShelleyUTxO, b: IShelleyUTxO ): number
    {
        return TxOutRef.sort( a.utxoRef, b.utxoRef );
    }
}

export { TxOutRef };
