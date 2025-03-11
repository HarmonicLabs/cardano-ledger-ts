import { ToCbor, CborString, Cbor, CborArray, CanBeCborString, forceCborString, CborObj, SubCborRef } from "@harmoniclabs/cbor";
import { Cloneable } from "@harmoniclabs/cbor/dist/utils/Cloneable";
import { isObject, hasOwn, defineReadOnlyProperty } from "@harmoniclabs/obj-utils";
import { ToData, Data, DataConstr } from "@harmoniclabs/plutus-data";
import { InvalidCborFormatError } from "../../../utils/InvalidCborFormatError";
import { ToJson } from "../../../utils/ToJson";
import { ITxOut, isITxOut, TxOut } from "./TxOut";
import { ITxOutRef, isITxOutRef, TxOutRef } from "./TxOutRef";
import { lexCompare } from "@harmoniclabs/uint8array-utils";
import { ToDataVersion } from "../../../toData/defaultToDataVersion";
import { getSubCborRef } from "../../../utils/getSubCborRef";

export interface IUTxO {
    utxoRef: ITxOutRef,
    resolved: ITxOut
}

export function isIUTxO( stuff: any ): stuff is IUTxO
{
    return (
        isObject( stuff ) &&
        hasOwn( stuff, "utxoRef" ) && isITxOutRef( stuff.utxoRef ) &&
        hasOwn( stuff, "resolved" ) && isITxOut( stuff.resolved )
    );
}

export class UTxO
    implements IUTxO, ToData, ToJson, ToCbor, Cloneable<UTxO>
{
    readonly utxoRef!: TxOutRef
    readonly resolved!: TxOut

    constructor(
        { 
            utxoRef, 
            resolved 
        }: IUTxO,
        
        readonly cborRef: SubCborRef | undefined = undefined
    )
    {
        this.utxoRef = utxoRef instanceof TxOutRef ? utxoRef : new TxOutRef( utxoRef );

        this.resolved = resolved instanceof TxOut ? resolved : new TxOut( resolved );
    }

    clone(): UTxO
    {
        return new UTxO( this );
    }

    toData( version?: ToDataVersion ): Data
    {
        return new DataConstr(
            0, // PTxInInfo only constructor
            [
                this.utxoRef.toData( version ),
                this.resolved.toData( version ) // PTxOut based on specified version
            ]
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

    static fromCbor( cStr: CanBeCborString ): UTxO
    {
        return UTxO.fromCborObj( Cbor.parse( forceCborString( cStr ), { keepRef: true } ) );
    }
    static fromCborObj( cObj: CborObj ): UTxO
    {
        if(!(cObj instanceof CborArray))
        throw new InvalidCborFormatError("UTxO");

        const [ ref, res ] = cObj.array;

        let utxoRef: TxOutRef;
        let resolved: TxOut;

        if( ref === undefined )
        throw new InvalidCborFormatError("UTxO");

        if( res === undefined )
        throw new InvalidCborFormatError(
            "UTxO",
            "if you are trying to parse only a TxOutRef instead (<hex>#<index>) you should use `TxOutRef.fromCborObj`"
        );

        utxoRef = TxOutRef.fromCborObj( ref );
        resolved = TxOut.fromCborObj( res );

        return new UTxO({
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

    static sort( a: IUTxO, b: IUTxO ): number
    {
        return TxOutRef.sort( a.utxoRef, b.utxoRef );
    }
}

export { TxOutRef };
