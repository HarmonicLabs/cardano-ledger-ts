import { ToCbor, CborString, Cbor, CborArray, CanBeCborString, forceCborString, CborObj, SubCborRef } from "@harmoniclabs/cbor";
import { Cloneable } from "@harmoniclabs/cbor/dist/utils/Cloneable";
import { ToData, Data, DataConstr } from "@harmoniclabs/plutus-data";
import { isObject, hasOwn, defineReadOnlyProperty } from "@harmoniclabs/obj-utils";
import { InvalidCborFormatError } from "../../../utils/InvalidCborFormatError";
import { ToJson } from "../../../utils/ToJson";
import { IDijkstraTxOut, isIDijkstraTxOut, DijkstraTxOut } from "./DijkstraTxOut";
import { ITxOutRef, isITxOutRef, TxOutRef } from "../../common/tx/TxOutRef";
import { ToDataVersion } from "../../../toData/defaultToDataVersion";
import { getSubCborRef } from "../../../utils/getSubCborRef";

export interface IDijkstraUTxO {
    utxoRef: ITxOutRef,
    resolved: IDijkstraTxOut
}

export function isIDijkstraUTxO( stuff: any ): stuff is IDijkstraUTxO
{
    return (
        isObject( stuff ) &&
        hasOwn( stuff, "utxoRef" ) && isITxOutRef( stuff.utxoRef ) &&
        hasOwn( stuff, "resolved" ) && isIDijkstraTxOut( stuff.resolved )
    );
}

export class DijkstraUTxO
    implements IDijkstraUTxO, ToData, ToJson, ToCbor, Cloneable<DijkstraUTxO>
{
    readonly utxoRef!: TxOutRef
    readonly resolved!: DijkstraTxOut

    constructor(
        { 
            utxoRef, 
            resolved 
        }: IDijkstraUTxO,
        
        readonly cborRef: SubCborRef | undefined = undefined
    )
    {
        this.utxoRef = utxoRef instanceof TxOutRef ? utxoRef : new TxOutRef( utxoRef );

        this.resolved = resolved instanceof DijkstraTxOut ? resolved : new DijkstraTxOut( resolved );
    }

    clone(): DijkstraUTxO
    {
        return new DijkstraUTxO( this );
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
        return this.toCbor();
    }
    toCbor(): CborString
    {
        if( this.cborRef instanceof SubCborRef )
        {
            // TODO: validate cbor structure
            // we assume correctness here
            return this.cborRef.toBuffer();
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

    static fromCbor( cStr: CanBeCborString ): DijkstraUTxO
    {
        return DijkstraUTxO.fromCborObj( Cbor.parse( forceCborString( cStr ), { keepRef: true } ) );
    }
    static fromCborObj( cObj: CborObj ): DijkstraUTxO
    {
        if(!(cObj instanceof CborArray))
        throw new InvalidCborFormatError("DijkstraUTxO");

        const [ ref, res ] = cObj.array;

        let utxoRef: TxOutRef;
        let resolved: DijkstraTxOut;

        if( ref === undefined )
        throw new InvalidCborFormatError("DijkstraUTxO");

        if( res === undefined )
        throw new InvalidCborFormatError(
            "DijkstraUTxO",
            "if you are trying to parse only a TxOutRef instead (<hex>#<index>) you should use `TxOutRef.fromCborObj`"
        );

        utxoRef = TxOutRef.fromCborObj( ref );
        resolved = DijkstraTxOut.fromCborObj( res );

        return new DijkstraUTxO({
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

    static sort( a: IDijkstraUTxO, b: IDijkstraUTxO ): number
    {
        return TxOutRef.sort( a.utxoRef, b.utxoRef );
    }
}

export { TxOutRef };
