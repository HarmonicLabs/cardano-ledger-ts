import { ToCbor, CborString, Cbor, CborArray, CborUInt, CanBeCborString, forceCborString, CborObj, CborMapEntry, SubCborRef } from "@harmoniclabs/cbor";
import { Cloneable } from "@harmoniclabs/cbor/dist/utils/Cloneable";
import { isObject, hasOwn } from "@harmoniclabs/obj-utils";
import { Data, isData, dataToCborObj, dataFromCborObj } from "@harmoniclabs/plutus-data";
import { ExBudget } from "@harmoniclabs/plutus-machine";
import { BasePlutsError } from "../../../utils/BasePlutsError";
import { InvalidCborFormatError } from "../../../utils/InvalidCborFormatError";
import { ToJson } from "../../../utils/ToJson";
import { assert } from "../../../utils/assert";
import { CanBeUInteger, canBeUInteger, forceBigUInt } from "../../../utils/ints";
import { getSubCborRef, subCborRefOrUndef } from "../../../utils/getSubCborRef";

export enum ConwayTxRedeemerTag {
    Spend       = 0,
    Mint        = 1,
    Cert        = 2,
    Withdraw    = 3,
    Voting      = 4,
    Proposing   = 5
};

Object.freeze( ConwayTxRedeemerTag );

/** @deprecated */
export function txRdmrTagToString( tag: ConwayTxRedeemerTag ): string
{
    switch( tag )
    {
        case ConwayTxRedeemerTag.Cert: return "Cert";
        case ConwayTxRedeemerTag.Mint: return "Mint";
        case ConwayTxRedeemerTag.Spend: return "Spend";
        case ConwayTxRedeemerTag.Withdraw: return "Withdraw";
        case ConwayTxRedeemerTag.Voting: return "Voting";
        case ConwayTxRedeemerTag.Proposing: return "Proposing";
        default: return "";
    }
}

export type ConwayTxRedeemerTagStr<Tag extends ConwayTxRedeemerTag> =
    Tag extends ConwayTxRedeemerTag.Spend     ? "Spend"       :
    Tag extends ConwayTxRedeemerTag.Mint      ? "Mint"        :
    Tag extends ConwayTxRedeemerTag.Cert      ? "Cert"        :
    Tag extends ConwayTxRedeemerTag.Withdraw  ? "Withdraw"    :
    Tag extends ConwayTxRedeemerTag.Voting    ? "Voting"      :
    Tag extends ConwayTxRedeemerTag.Proposing ? "Proposing"   :
    never;

export function ConwayTxRedeemerTagToString<Tag extends ConwayTxRedeemerTag>( tag: Tag ): ConwayTxRedeemerTagStr<Tag>
{
    switch( tag )
    {
        case ConwayTxRedeemerTag.Spend:       return "Spend" as any;
        case ConwayTxRedeemerTag.Mint:        return "Mint" as any;
        case ConwayTxRedeemerTag.Cert:        return "Cert" as any;
        case ConwayTxRedeemerTag.Withdraw:    return "Withdraw" as any;
        case ConwayTxRedeemerTag.Voting:      return "Voting" as any;
        case ConwayTxRedeemerTag.Proposing:   return "Proposing" as any;
        default:
            throw new BasePlutsError("invalid ConwayTxRedeemerTag")
    }
}

export interface IConwayTxRedeemer {
    tag: ConwayTxRedeemerTag
    index: CanBeUInteger
    data: Data
    execUnits: ExBudget
}

export class ConwayTxRedeemer
    implements IConwayTxRedeemer, ToCbor, Cloneable<ConwayTxRedeemer>, ToJson
{
    
    readonly tag!: ConwayTxRedeemerTag
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
            throw new Error("invalid 'execUnits' setting 'ConwayTxRedeemer'");
        }
        this._execUnits = newExUnits;
    }

    constructor(
        redeemer: IConwayTxRedeemer,
        readonly cborRef: SubCborRef | undefined = undefined
    )
    {
        if(!(
            isObject( redeemer ) &&
            hasOwn( redeemer, "tag" ) &&
            hasOwn( redeemer, "index" ) &&
            hasOwn( redeemer, "data" ) &&
            hasOwn( redeemer, "execUnits" )
        ))throw new Error( "invalid object passed to construct a 'ConwayTxRedeemer'");

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
        ))throw new Error("invlaid redeemer index");
        this.index = Number( forceBigUInt( index ) );

        if(!(
            isData( data )
        ))throw new Error("redeemer's data was not 'Data'");
        this.data = data;

        if(!( 
            execUnits instanceof ExBudget
        ))throw new Error("invalid 'execUnits' constructing 'ConwayTxRedeemer'");
        this._execUnits = execUnits.clone();

         /* Done: this.cboRref params */
        this.cborRef = cborRef ?? subCborRefOrUndef( redeemer );
    }

    clone(): ConwayTxRedeemer
    {
        return new ConwayTxRedeemer({
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
    
    static fromCborMapEntry( entry: CborMapEntry ): ConwayTxRedeemer
    {
        if(!(
            isObject( entry ) &&
            entry.k instanceof CborArray &&
            entry.k.array.length >= 2 &&
            entry.k.array[0] instanceof CborUInt &&
            entry.k.array[1] instanceof CborUInt &&
            entry.v instanceof CborArray &&
            entry.v.array.length >= 2
        )) throw new Error("invalid CborMapEntry building ConwayTxRedeemer");

        return new ConwayTxRedeemer({
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

    static fromCbor( cStr: CanBeCborString ): ConwayTxRedeemer
    {
        return ConwayTxRedeemer.fromCborObj( Cbor.parse( forceCborString( cStr ), { keepRef: true } ) );
    }

    static fromCborObj( cObj: CborObj ): ConwayTxRedeemer
    {
        if(!(
            cObj instanceof CborArray &&
            cObj.array.length >= 4 &&
            cObj.array[0] instanceof CborUInt &&
            cObj.array[1] instanceof CborUInt
        ))throw new InvalidCborFormatError("ConwayTxRedeemer");

        //* TO DO: added array */
        const [ _tag, _index, _data, _execUnits ] = cObj.array;

        return new ConwayTxRedeemer({
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
            tag: ConwayTxRedeemerTagToString( this.tag ),
            index: this.index,
            execUnits: this.execUnits.toJson(),
            data: this.data.toJson(),
        }
    }
}