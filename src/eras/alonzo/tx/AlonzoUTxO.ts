import { ToCbor, CborString, Cbor, CborArray, CanBeCborString, forceCborString, CborObj, SubCborRef } from "@harmoniclabs/cbor";
import { Cloneable } from "@harmoniclabs/cbor/dist/utils/Cloneable";
import { ToData, Data, DataConstr } from "@harmoniclabs/plutus-data";
import { isObject, hasOwn, defineReadOnlyProperty } from "@harmoniclabs/obj-utils";
import { InvalidCborFormatError } from "../../../utils/InvalidCborFormatError";
import { ToJson } from "../../../utils/ToJson";
import { IAlonzoTxOut, isIAlonzoTxOut, AlonzoTxOut } from "./AlonzoTxOut";
import { ITxOutRef, isITxOutRef, TxOutRef } from "../../common/tx/TxOutRef";
import { lexCompare } from "@harmoniclabs/uint8array-utils";
import { ToDataVersion } from "../../../toData/defaultToDataVersion";
import { getSubCborRef } from "../../../utils/getSubCborRef";

export interface IAlonzoUTxO {
    utxoRef: ITxOutRef,
    resolved: IAlonzoTxOut
}

export function isIAlonzoUTxO( stuff: any ): stuff is IAlonzoUTxO
{
    return (
        isObject( stuff ) &&
        hasOwn( stuff, "utxoRef" ) && isITxOutRef( stuff.utxoRef ) &&
        hasOwn( stuff, "resolved" ) && isIAlonzoTxOut( stuff.resolved )
    );
}

export class AlonzoUTxO
    implements IAlonzoUTxO, ToData, ToJson, ToCbor, Cloneable<AlonzoUTxO>
{
    readonly utxoRef!: TxOutRef
    readonly resolved!: AlonzoTxOut

    constructor(
        { 
            utxoRef, 
            resolved 
        }: IAlonzoUTxO,
        
        readonly cborRef: SubCborRef | undefined = undefined
    )
    {
        this.utxoRef = utxoRef instanceof TxOutRef ? utxoRef : new TxOutRef( utxoRef );

        this.resolved = resolved instanceof AlonzoTxOut ? resolved : new AlonzoTxOut( resolved );
    }

    clone(): AlonzoUTxO
    {
        return new AlonzoUTxO( this );
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

    static fromCbor( cStr: CanBeCborString ): AlonzoUTxO
    {
        return AlonzoUTxO.fromCborObj( Cbor.parse( forceCborString( cStr ), { keepRef: true } ) );
    }
    static fromCborObj( cObj: CborObj ): AlonzoUTxO
    {
        if(!(
            cObj instanceof CborArray
        ))
        throw new InvalidCborFormatError("AlonzoUTxO");

        const [ ref, res ] = cObj.array;

        let utxoRef: TxOutRef;
        let resolved: AlonzoTxOut;

        if( ref === undefined )
        throw new InvalidCborFormatError("AlonzoUTxO");

        if( res === undefined )
        throw new InvalidCborFormatError(
            "AlonzoUTxO",
            "if you are trying to parse only a TxOutRef instead (<hex>#<index>) you should use `TxOutRef.fromCborObj`"
        );

        utxoRef = TxOutRef.fromCborObj( ref );
        resolved = AlonzoTxOut.fromCborObj( res );

        return new AlonzoUTxO({
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

    static sort( a: IAlonzoUTxO, b: IAlonzoUTxO ): number
    {
        return TxOutRef.sort( a.utxoRef, b.utxoRef );
    }
}

export { TxOutRef };
