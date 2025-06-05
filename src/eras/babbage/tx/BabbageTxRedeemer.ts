import { ToCbor, CborString, Cbor, CborArray, CborUInt, CanBeCborString, forceCborString, CborObj, CborMapEntry, SubCborRef } from "@harmoniclabs/cbor";
import { Cloneable } from "@harmoniclabs/cbor/dist/utils/Cloneable";
import { isObject, hasOwn } from "@harmoniclabs/obj-utils";
import { Data, isData, dataToCborObj, dataFromCborObj } from "@harmoniclabs/plutus-data";
import { ExBudget } from "@harmoniclabs/plutus-machine";
import { BasePlutsError } from "../../../utils/BasePlutsError";
import { InvalidCborFormatError } from "../../../utils/InvalidCborFormatError";
import { ToJson } from "../../../utils/ToJson";
import { CanBeUInteger, canBeUInteger, forceBigUInt } from "../../../utils/ints";
import { getSubCborRef, subCborRefOrUndef } from "../../../utils/getSubCborRef";

export enum BabbageTxRedeemerTag {
    Spend       = 0,
    Mint        = 1,
    Cert        = 2,
    Withdraw    = 3
};

Object.freeze( BabbageTxRedeemerTag );

export type BabbageTxRedeemerTagStr<Tag extends BabbageTxRedeemerTag> =
    Tag extends BabbageTxRedeemerTag.Spend     ? "Spend"       :
    Tag extends BabbageTxRedeemerTag.Mint      ? "Mint"        :
    Tag extends BabbageTxRedeemerTag.Cert      ? "Cert"        :
    Tag extends BabbageTxRedeemerTag.Withdraw  ? "Withdraw"    :
    never;

export function BabbageTxRedeemerTagToString<Tag extends BabbageTxRedeemerTag>( tag: Tag ): BabbageTxRedeemerTagStr<Tag>
{
    switch( tag )
    {
        case BabbageTxRedeemerTag.Spend:       return "Spend" as any;
        case BabbageTxRedeemerTag.Mint:        return "Mint" as any;
        case BabbageTxRedeemerTag.Cert:        return "Cert" as any;
        case BabbageTxRedeemerTag.Withdraw:    return "Withdraw" as any;
        default:
            throw new BasePlutsError("invalid BabbageTxRedeemerTag")
    }
}

export interface IBabbageTxRedeemer {
    tag: BabbageTxRedeemerTag
    index: CanBeUInteger
    data: Data
    execUnits: ExBudget
}

export class BabbageTxRedeemer
    implements IBabbageTxRedeemer, ToCbor, Cloneable<BabbageTxRedeemer>, ToJson
{
    
    readonly tag!: BabbageTxRedeemerTag
    /**
     * index of the input the redeemer corresponds to
    **/
    readonly index!: number
    /**
     * the actual value of the redeemer
    **/
    readonly data!: Data
    private _execUnits!: ExBudget

    get execUnits(): ExBudget {
        return this._execUnits;
    }

    set execUnits(newExUnits: ExBudget) {
        if (!(newExUnits instanceof ExBudget)) {
            throw new Error("invalid 'execUnits' setting 'BabbageTxRedeemer'");
        }
        this._execUnits = newExUnits;
    }

    constructor(
        redeemer: IBabbageTxRedeemer,
        readonly cborRef: SubCborRef | undefined = undefined
    )
    {
        if(!(
            isObject( redeemer ) &&
            hasOwn( redeemer, "tag" ) &&
            hasOwn( redeemer, "index" ) &&
            hasOwn( redeemer, "data" ) &&
            hasOwn( redeemer, "execUnits" )
        ))throw new Error( "invalid object passed to construct a 'BabbageTxRedeemer'");

        const {
            tag,
            index,
            data,
            execUnits
        } = redeemer;

        if(!(
            tag === 0 || 
            tag === 1 || 
            tag === 2 || 
            tag === 3
        ))throw new Error("invalid redeemer tag");
        this.tag = tag;

        if(!(
            canBeUInteger( index )
        ))throw new Error("invalid redeemer index");
        this.index = Number( forceBigUInt( index ) );

        if(!(
            isData( data )
        ))throw new Error("redeemer's data was not 'Data'");
        this.data = data;

        if(!( 
            execUnits instanceof ExBudget
        ))throw new Error("invalid 'execUnits' constructing 'BabbageTxRedeemer'");
        this._execUnits = execUnits.clone();

         /* Done: this.cboRref params */
        this.cborRef = cborRef ?? subCborRefOrUndef( redeemer );
    }

    clone(): BabbageTxRedeemer
    {
        return new BabbageTxRedeemer({
            ...this,
            data: this.data.clone(),
            execUnits: this.execUnits.clone()
        });
    }

    toCborMapEntry(): CborMapEntry
    {
        return {
            k: new CborArray([
                new CborUInt( this.tag ),
                new CborUInt( this.index ),
            ]),
            v: new CborArray([
                dataToCborObj( this.data ),
                this.execUnits.toCborObj()
            ])
        };
    }
    
    static fromCborMapEntry( entry: CborMapEntry ): BabbageTxRedeemer
    {
        if(!(
            isObject( entry ) &&
            entry.k instanceof CborArray &&
            entry.k.array.length >= 2 &&
            entry.k.array[0] instanceof CborUInt &&
            entry.k.array[1] instanceof CborUInt &&
            entry.v instanceof CborArray &&
            entry.v.array.length >= 2
        )) throw new Error("invalid CborMapEntry building BabbageTxRedeemer");

        return new BabbageTxRedeemer({
            tag: Number( entry.k.array[0].num ),
            index: Number( entry.k.array[1].num ),
            data: dataFromCborObj( entry.v.array[0] ),
            execUnits: ExBudget.fromCborObj( entry.v.array[1] )
        });
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
    toCborObj(): CborArray
    {
        if( this.cborRef instanceof SubCborRef )
        {
                // TODO: validate cbor structure
                // we assume correctness here
                return Cbor.parse( this.cborRef.toBuffer() ) as CborArray;
        }

        return new CborArray([
            new CborUInt( this.tag ),
            new CborUInt( this.index ),
            dataToCborObj( this.data ),
            this.execUnits.toCborObj()
        ])
    }

    static fromCbor( cStr: CanBeCborString ): BabbageTxRedeemer
    {
        return BabbageTxRedeemer.fromCborObj( Cbor.parse( forceCborString( cStr ), { keepRef: true } ) );
    }

    static fromCborObj( cObj: CborObj ): BabbageTxRedeemer
    {
        if(!(
            cObj instanceof CborArray &&
            cObj.array.length >= 4 &&
            cObj.array[0] instanceof CborUInt &&
            cObj.array[1] instanceof CborUInt
        ))throw new InvalidCborFormatError("BabbageTxRedeemer");

        const [ _tag, _index, _data, _execUnits ] = cObj.array;

        return new BabbageTxRedeemer({
            tag: Number( cObj.array[0].num ) as any,
            index: cObj.array[1].num,
            data: dataFromCborObj( cObj.array[2] ),
            execUnits: ExBudget.fromCborObj( cObj.array[3] )
        }, getSubCborRef( cObj ));
    }

    toJSON() { return this.toJson(); }
    toJson()
    {
        return {
            tag: BabbageTxRedeemerTagToString( this.tag ),
            index: this.index,
            execUnits: this.execUnits.toJson(),
            data: this.data.toJson(),
        }
    }
}