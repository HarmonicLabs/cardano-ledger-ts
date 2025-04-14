import { ToCbor, CborString, Cbor, CborArray, CanBeCborString, forceCborString, CborObj, SubCborRef } from "@harmoniclabs/cbor";
import { Cloneable } from "@harmoniclabs/cbor/dist/utils/Cloneable";
import { ToData, Data, DataConstr } from "@harmoniclabs/plutus-data";
import { isObject, hasOwn, defineReadOnlyProperty } from "@harmoniclabs/obj-utils";
import { InvalidCborFormatError } from "../../../utils/InvalidCborFormatError";
import { ToJson } from "../../../utils/ToJson";
import { IAllegraTxOut, isIAllegraTxOut, AllegraTxOut } from "./AllegraTxOut";
import { ITxOutRef, isITxOutRef, TxOutRef } from "../../common/TxOutRef";
import { lexCompare } from "@harmoniclabs/uint8array-utils";
import { ToDataVersion } from "../../../toData/defaultToDataVersion";
import { getSubCborRef } from "../../../utils/getSubCborRef";

export interface IAllegraUTxO {
    utxoRef: ITxOutRef,
    resolved: IAllegraTxOut
}

export function isIAllegraUTxO( stuff: any ): stuff is IAllegraUTxO
{
    return (
        isObject( stuff ) &&
        hasOwn( stuff, "utxoRef" ) && isITxOutRef( stuff.utxoRef ) &&
        hasOwn( stuff, "resolved" ) && isIAllegraTxOut( stuff.resolved )
    );
}

export class AllegraUTxO
    implements IAllegraUTxO, ToData, ToJson, ToCbor, Cloneable<AllegraUTxO>
{
    readonly utxoRef!: TxOutRef
    readonly resolved!: AllegraTxOut

    constructor(
        { 
            utxoRef, 
            resolved 
        }: IAllegraUTxO,
        
        readonly cborRef: SubCborRef | undefined = undefined
    )
    {
        this.utxoRef = utxoRef instanceof TxOutRef ? utxoRef : new TxOutRef( utxoRef );

        this.resolved = resolved instanceof AllegraTxOut ? resolved : new AllegraTxOut( resolved );
    }

    clone(): AllegraUTxO
    {
        return new AllegraUTxO( this );
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

    static fromCbor( cStr: CanBeCborString ): AllegraUTxO
    {
        return AllegraUTxO.fromCborObj( Cbor.parse( forceCborString( cStr ), { keepRef: true } ) );
    }
    static fromCborObj( cObj: CborObj ): AllegraUTxO
    {
        if(!(cObj instanceof CborArray))
        throw new InvalidCborFormatError("AllegraUTxO");

        const [ ref, res ] = cObj.array;

        let utxoRef: TxOutRef;
        let resolved: AllegraTxOut;

        if( ref === undefined )
        throw new InvalidCborFormatError("AllegraUTxO");

        if( res === undefined )
        throw new InvalidCborFormatError(
            "AllegraUTxO",
            "if you are trying to parse only a TxOutRef instead (<hex>#<index>) you should use `TxOutRef.fromCborObj`"
        );

        utxoRef = TxOutRef.fromCborObj( ref );
        resolved = AllegraTxOut.fromCborObj( res );

        return new AllegraUTxO({
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

    static sort( a: IAllegraUTxO, b: IAllegraUTxO ): number
    {
        return TxOutRef.sort( a.utxoRef, b.utxoRef );
    }
}

export { TxOutRef };
