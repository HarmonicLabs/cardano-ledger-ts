import { ToCbor, CborString, Cbor, CborArray, CanBeCborString, forceCborString, CborObj, SubCborRef } from "@harmoniclabs/cbor";
import { Cloneable } from "@harmoniclabs/cbor/dist/utils/Cloneable";
import { isObject, hasOwn } from "@harmoniclabs/obj-utils";
import { InvalidCborFormatError } from "../../../utils/InvalidCborFormatError";
import { ToJson } from "../../../utils/ToJson";
import { IMaryTxOut, isIMaryTxOut, MaryTxOut } from "./MaryTxOut";
import { ITxOutRef, isITxOutRef, TxOutRef } from "../../common/tx/TxOutRef";
import { getSubCborRef } from "../../../utils/getSubCborRef";

export interface IMaryUTxO {
    utxoRef: ITxOutRef,
    resolved: IMaryTxOut
}

export function isIMaryUTxO( stuff: any ): stuff is IMaryUTxO
{
    return (
        isObject( stuff ) &&
        hasOwn( stuff, "utxoRef" ) && isITxOutRef( stuff.utxoRef ) &&
        hasOwn( stuff, "resolved" ) && isIMaryTxOut( stuff.resolved )
    );
}

export class MaryUTxO
    implements IMaryUTxO, ToJson, ToCbor, Cloneable<MaryUTxO>
{
    readonly utxoRef!: TxOutRef
    readonly resolved!: MaryTxOut

    constructor(
        { 
            utxoRef, 
            resolved 
        }: IMaryUTxO,
        
        readonly cborRef: SubCborRef | undefined = undefined
    )
    {
        this.utxoRef = utxoRef instanceof TxOutRef ? utxoRef : new TxOutRef( utxoRef );

        this.resolved = resolved instanceof MaryTxOut ? resolved : new MaryTxOut( resolved );
    }

    clone(): MaryUTxO
    {
        return new MaryUTxO( this );
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

    static fromCbor( cStr: CanBeCborString ): MaryUTxO
    {
        return MaryUTxO.fromCborObj( Cbor.parse( forceCborString( cStr ), { keepRef: true } ) );
    }
    static fromCborObj( cObj: CborObj ): MaryUTxO
    {
        if(!(
            cObj instanceof CborArray
        ))
        throw new InvalidCborFormatError("MaryUTxO");

        const [ ref, res ] = cObj.array;

        let utxoRef: TxOutRef;
        let resolved: MaryTxOut;

        if( ref === undefined )
        throw new InvalidCborFormatError("MaryUTxO");

        if( res === undefined )
        throw new InvalidCborFormatError(
            "MaryUTxO",
            "if you are trying to parse only a TxOutRef instead (<hex>#<index>) you should use `TxOutRef.fromCborObj`"
        );

        utxoRef = TxOutRef.fromCborObj( ref );
        resolved = MaryTxOut.fromCborObj( res );

        return new MaryUTxO({
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

    static sort( a: IMaryUTxO, b: IMaryUTxO ): number
    {
        return TxOutRef.sort( a.utxoRef, b.utxoRef );
    }
}

export { TxOutRef };
