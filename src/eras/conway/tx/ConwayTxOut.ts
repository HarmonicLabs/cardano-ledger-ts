import { ToCbor, CborString, Cbor, CborMap, CborUInt, CborArray, CanBeCborString, CborObj, SubCborRef } from "@harmoniclabs/cbor";
import { definiteBytes, expectSize, expectTag, parseCborFull, recordSum, sparseMapKeys } from "../../../utils/strictCbor";
import { Cloneable } from "@harmoniclabs/cbor/dist/utils/Cloneable";
import { isObject, hasOwn } from "@harmoniclabs/obj-utils";
import { Data, isData, ToData, DataConstr, dataFromCborObj } from "@harmoniclabs/plutus-data";
import { Hash32 } from "../../../hashes";
import { Address, AddressStr, Value, IValue, isAddressStr, isIValue } from "../../common/ledger";
import { Script } from "../../../script";
import { InvalidCborFormatError } from "../../../utils/InvalidCborFormatError";
import { ToJson } from "../../../utils/ToJson";
import { maybeData } from "../../../utils/maybeData";
import { BasePlutsError } from "../../../utils/BasePlutsError";
import { ToDataVersion } from "../../../toData/defaultToDataVersion";
import { getSubCborRef, subCborRefOrUndef } from "../../../utils/getSubCborRef";
import { txOutToCborObj } from "../../../tx/body/output/txOutCbor";


export interface IConwayTxOut {
    address: Address | AddressStr,
    value: Value | IValue,
    datum?: Hash32 | Data,
    refScript?: Script
}

export function isIConwayTxOut( stuff: any ): stuff is IConwayTxOut
{
    return (
        isObject( stuff ) &&
        hasOwn( stuff, "address" ) && (
            stuff.address instanceof Address || isAddressStr( stuff.address )
        ) &&
        hasOwn( stuff, "value" ) && (
            stuff.value instanceof Value || isIValue( stuff.value )
        ) &&
        ( stuff.datum === undefined || stuff.datum instanceof Hash32 || isData( stuff.datum ) ) &&
        ( stuff.refScript === undefined || stuff.refScript instanceof Script )
    );
}

export class ConwayTxOut
    implements IConwayTxOut, ToCbor, Cloneable<ConwayTxOut>, ToData, ToJson
{
    readonly address!: Address
    readonly value!: Value
    readonly datum?: Hash32 | Data
    readonly refScript?: Script

    /**
     * @param cborRef the bytes the output was decoded from, when it was decoded. They are kept
     * for readers of the source bytes (e.g. the UTxO metadata a node derives from an output as it
     * appeared in its block) and are **not** re-emitted: an output is re-encoded from its fields,
     * as cardano-ledger does (see `toCborObj`).
     */
    constructor(
        ConwayTxOutput: IConwayTxOut,
        readonly cborRef: SubCborRef | undefined = undefined
    )
    {
        if(!(
            isObject( ConwayTxOutput ) &&
            hasOwn( ConwayTxOutput, "address" ) &&
            hasOwn( ConwayTxOutput, "value" )
        )) throw new Error("ConwayTxOutput is missing some necessary fields");

        let {
            address,
            value,
            datum,
            refScript
        } = ConwayTxOutput;
        
        if (isAddressStr(address))
        {
            address = Address.fromString(address) as Address; // Byron addresses are rejected by the `instanceof Address` guard below
        }
        if(!(
            address instanceof Address
        )) throw new Error("invalid 'address' while constructing 'ConwayTxOut'");

        if(!(
            value instanceof Value
        )) throw new Error("invalid 'value' while constructing 'ConwayTxOut'");

        this.address = address;

        this.value = value;

        if( datum !== undefined )
            if(!(
                datum instanceof Hash32 || isData( datum )
            ))throw new Error("invalid 'datum' field")
        
        this.datum = datum;

        if( refScript !== undefined )
            if(!(
                refScript instanceof Script
            )) throw new Error("invalid 'refScript' field");
        
        this.refScript = refScript;

        this.cborRef = cborRef ?? subCborRefOrUndef( ConwayTxOutput );
    }

    clone(): ConwayTxOut
    {
        return new ConwayTxOut({
            address: this.address.clone(),
            value: this.value.clone(),
            datum: this.datum?.clone(),
            refScript: this.refScript?.clone() 
        })
    }

    static get fake(): ConwayTxOut
    {
        return new ConwayTxOut({
            address: Address.fake,
            value: Value.lovelaces( 0 ),
            datum: undefined,
            refScript: undefined
        })
    }

    toData( version: ToDataVersion = "v2" ): Data
    {
        if( version === "v1" )
        {
            if( isData( this.datum ) )
            throw new BasePlutsError(
                "trying to convert v2 utxo to v1"
            );

            return new DataConstr(
                0,
                [
                    this.address.toData( version),
                    this.value.toData( version),
                    maybeData( this.datum?.toData( version ) )
                ]
            )
        }

        const datumData =
            this.datum === undefined ?
                new DataConstr( 0, [] ) : 
            this.datum instanceof Hash32 ?
                new DataConstr( 1, [ this.datum.toData( version ) ]) :
            new DataConstr( // inline
                2, [ this.datum.clone() ]
            );

        return new DataConstr(
            0,
            [
                this.address.toData( version ),
                this.value.toData( version ),
                datumData,
                maybeData( this.refScript?.hash.toData( version ) )
            ]
        )
    }

    toCborBytes(): Uint8Array
    {
        return this.toCbor();
    }
    toCbor(): CborString
    {
        return Cbor.encode( this.toCborObj() );
    }
    /**
     * The output re-encoded from its fields exactly as cardano-ledger re-encodes a decoded
     * `BabbageTxOut` (`txOutToCborObj`): the legacy array `[address, value]` /
     * `[address, value, datum_hash]` when there is no script reference and no inline datum,
     * the definite map `{0: address, 1: value, 2?: datum_option, 3?: script_ref}` otherwise;
     * address, datum `Data` and script payload bytes as decoded, the value canonical, the
     * `[tag, payload]` script wrapper and the datum option rebuilt. The bytes the output was
     * decoded from (`cborRef`) are not re-emitted.
     */
    toCborObj(): CborArray | CborMap
    {
        if( !Value.isPositive( this.value ) )
        {
            console.error(
                JSON.stringify(
                    this.toJson(),
                    undefined,
                    2
                )
            )
            throw new BasePlutsError("ConwayTxOut values can only be positive; value was: " + JSON.stringify( this.value.toJson() ));
        }
        return txOutToCborObj( this );
    }

    static fromCbor( cStr: CanBeCborString ): ConwayTxOut
    {
        return ConwayTxOut.fromCborObj( parseCborFull( cStr, "ConwayTxOut" ) );
    }
    /**
     * cardano-ledger `decodeBabbageTxOut` (below protocol version 12):
     *
     * - legacy form: `[address, value]` or `[address, value, datum_hash]`, definite or
     *   indefinite;
     * - map form (`SparseKeyed "TxOut"`): keys 0 address, 1 value (both required),
     *   2 datum option, 3 script reference; a repeated or unknown key fails;
     * - datum option (`Summands "Datum"`): `[0, hash32]` or `[1, #6.24(bytes)]` whose
     *   bytes are exactly one Plutus Data item;
     * - script reference: `#6.24(bytes)` (the tag number is compared) whose bytes are
     *   exactly one script (`decodeCIC`).
     *
     * The source bytes are kept in `cborRef` for readers; re-encoding rebuilds the output
     * from its fields as cardano-ledger does (`toCborObj`), so a legacy output stays in the
     * array form (585) and a wrapper the encoder rebuilds (datum option, script `[tag, payload]`)
     * comes out definite whatever form it was decoded in.
     */
    static fromCborObj( cObj: CborObj ): ConwayTxOut
    {
        // legacy
        if( cObj instanceof CborArray )
        {
            const n = cObj.array.length;
            if(!( n === 2 || n === 3 )) throw new InvalidCborFormatError("ConwayTxOut", "wrong number of terms in a legacy output");
            const [ _addr, _val, _dat ] = cObj.array;
            
            return new ConwayTxOut({
                address: Address.fromCborObj( _addr ),
                value: Value.fromCborObj( _val ),
                datum: _dat === undefined ? undefined : Hash32.fromCborObj( _dat ),
            }, getSubCborRef( cObj ));
        }

        const keys = sparseMapKeys( cObj, "ConwayTxOut" );
        if( keys.some( k => k > 3 ) ) throw new InvalidCborFormatError("ConwayTxOut", "unknown output field");

        let fields: (CborObj | undefined )[] = new Array( 4 ).fill( undefined );
        for( const { k, v } of ( cObj as CborMap ).map ) fields[ Number( ( k as CborUInt ).num ) ] = v;

        const [
            _addr,
            _amt,
            _dat,
            _refScript
        ] = fields;

        if( _addr === undefined || _amt === undefined )
        throw new InvalidCborFormatError("ConwayTxOut", "missing address or value");

        let datum: Hash32 | Data | undefined = undefined;

        if( _dat !== undefined )
        {
            const { tag: opt, fields: dFields, size } = recordSum( _dat, "ConwayTxOut datum" );
            expectSize( size, 2, "ConwayTxOut datum" );
            const [ _1 ] = dFields;

            if( opt === 0 )
            {
                datum = Hash32.fromCborObj( _1 );
            }
            else if( opt === 1 )
            {
                const payload = definiteBytes( expectTag( _1, 24, "ConwayTxOut inline datum" ), "ConwayTxOut inline datum" );
                datum = dataFromCborObj( parseCborFull( payload, "ConwayTxOut inline datum" ) );
            }
            else throw new InvalidCborFormatError("ConwayTxOut");
        }

        let refScript: Script | undefined = undefined;
        if( _refScript !== undefined )
        {
            refScript = Script.fromCbor( definiteBytes( expectTag( _refScript, 24, "ConwayTxOut script_ref" ), "ConwayTxOut script_ref" ) );
        }

        return new ConwayTxOut({
            address: Address.fromCborObj( _addr ),
            value:  Value.fromCborObj( _amt ),
            datum,
            refScript
        }, getSubCborRef( cObj ));
    }

    toJSON() { return this.toJson(); }
    toJson()
    {
        return {
            address: this.address.toString(),
            value: this.value.toJson(),
            datum: this.datum === undefined ? undefined :
            this.datum instanceof Hash32 ?
                this.datum.toString() :
                this.datum.toJson(),
            refScript: this.refScript?.toJson()
        }
    }

}