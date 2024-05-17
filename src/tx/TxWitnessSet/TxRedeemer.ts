import { ToCbor, CborString, Cbor, CborArray, CborUInt, CanBeCborString, forceCborString, CborObj, CborMapEntry } from "@harmoniclabs/cbor";
import { Cloneable } from "@harmoniclabs/cbor/dist/utils/Cloneable";
import { isObject, hasOwn, defineReadOnlyProperty, definePropertyIfNotPresent } from "@harmoniclabs/obj-utils";
import { Data, isData, dataToCborObj, dataFromCborObj } from "@harmoniclabs/plutus-data";
import { ExBudget } from "@harmoniclabs/plutus-machine";
import { BasePlutsError } from "../../utils/BasePlutsError";
import { InvalidCborFormatError } from "../../utils/InvalidCborFormatError";
import { ToJson } from "../../utils/ToJson";
import { assert } from "../../utils/assert";
import { CanBeUInteger, canBeUInteger, forceBigUInt } from "../../utils/ints";

export enum TxRedeemerTag {
    Spend       = 0,
    Mint        = 1,
    Cert        = 2,
    Withdraw    = 3,
    Voting      = 4,
    Proposing   = 5
};

Object.freeze( TxRedeemerTag );

/** @deprecated */
export function txRdmrTagToString( tag: TxRedeemerTag ): string
{
    switch( tag )
    {
        case TxRedeemerTag.Cert: return "Cert";
        case TxRedeemerTag.Mint: return "Mint";
        case TxRedeemerTag.Spend: return "Spend";
        case TxRedeemerTag.Withdraw: return "Withdraw";
        case TxRedeemerTag.Voting: return "Voting";
        case TxRedeemerTag.Proposing: return "Proposing";
        default: return "";
    }
}

export type TxRedeemerTagStr<Tag extends TxRedeemerTag> =
    Tag extends TxRedeemerTag.Spend     ? "Spend"       :
    Tag extends TxRedeemerTag.Mint      ? "Mint"        :
    Tag extends TxRedeemerTag.Cert      ? "Cert"        :
    Tag extends TxRedeemerTag.Withdraw  ? "Withdraw"    :
    Tag extends TxRedeemerTag.Voting    ? "Voting"      :
    Tag extends TxRedeemerTag.Proposing ? "Proposing"   :
    never;

export function txRedeemerTagToString<Tag extends TxRedeemerTag>( tag: Tag ): TxRedeemerTagStr<Tag>
{
    switch( tag )
    {
        case TxRedeemerTag.Spend:       return "Spend" as any;
        case TxRedeemerTag.Mint:        return "Mint" as any;
        case TxRedeemerTag.Cert:        return "Cert" as any;
        case TxRedeemerTag.Withdraw:    return "Withdraw" as any;
        case TxRedeemerTag.Voting:      return "Voting" as any;
        case TxRedeemerTag.Proposing:   return "Proposing" as any;
        default:
            throw new BasePlutsError("invalid TxRedeemerTag")
    }
}

export interface ITxRedeemer {
    tag: TxRedeemerTag
    index: CanBeUInteger
    data: Data
    execUnits: ExBudget
}

export class TxRedeemer
    implements ITxRedeemer, ToCbor, Cloneable<TxRedeemer>, ToJson
{
    
    readonly tag!: TxRedeemerTag
    /**
     * index of the input the redeemer corresponds to
    **/
    readonly index!: number
    /**
     * the actual value of the redeemer
    **/
    readonly data!: Data
    execUnits!: ExBudget

    constructor( redeemer: ITxRedeemer )
    {
        assert(
            isObject( redeemer ) &&
            hasOwn( redeemer, "tag" ) &&
            hasOwn( redeemer, "index" ) &&
            hasOwn( redeemer, "data" ) &&
            hasOwn( redeemer, "execUnits" ),
            "invalid object passed to construct a 'TxRedeemer'"
        );

        const {
            tag,
            index,
            data,
            execUnits
        } = redeemer;

        assert(
            tag === 0 || tag === 1 || tag === 2 || tag === 3,
            "invalid redeemer tag"
        );
        defineReadOnlyProperty(
            this,
            "tag",
            tag
        );

        assert(
            canBeUInteger( index ),
            "invlaid redeemer index"
        );
        defineReadOnlyProperty(
            this,
            "index",
            Number( forceBigUInt( index ) )
        );

        assert(
            isData( data ),
            "redeemer's data was not 'Data'"
        );
        defineReadOnlyProperty(
            this,
            "data",
            data
        );

        assert(
            execUnits instanceof ExBudget,
            "invalid 'execUnits' constructing 'TxRedeemer'"
        );

        let _exUnits = execUnits.clone();

        definePropertyIfNotPresent(
            this,
            "execUnits",
            {
                get: () => _exUnits,
                set: ( newExUnits: ExBudget ) => {
                    assert(
                        newExUnits instanceof ExBudget,
                        "invalid 'execUnits' constructing 'TxRedeemer'"
                    );
                    _exUnits = newExUnits.clone();
                },
                enumerable: true,
                configurable: false
            }
        );
    }

    clone(): TxRedeemer
    {
        return new TxRedeemer({
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
    
    static fromCborMapEntry( entry: CborMapEntry ): TxRedeemer
    {
        if(!(
            isObject( entry ) &&
            entry.k instanceof CborArray &&
            entry.k.array.length >= 2 &&
            entry.k.array[0] instanceof CborUInt &&
            entry.k.array[1] instanceof CborUInt &&
            entry.v instanceof CborArray &&
            entry.v.array.length >= 2
        )) throw new Error("invalid CborMapEntry building TxRedeemer");

        return new TxRedeemer({
            tag: Number( entry.k.array[0].num ),
            index: Number( entry.k.array[1].num ),
            data: dataFromCborObj( entry.v.array[0] ),
            execUnits: ExBudget.fromCborObj( entry.v.array[1] )
        });
    }

    toCbor(): CborString
    {
        return Cbor.encode( this.toCborObj() );
    }
    toCborObj(): CborArray
    {
        return new CborArray([
            new CborUInt( this.tag ),
            new CborUInt( this.index ),
            dataToCborObj( this.data ),
            this.execUnits.toCborObj()
        ])
    }

    static fromCbor( cStr: CanBeCborString ): TxRedeemer
    {
        return TxRedeemer.fromCborObj( Cbor.parse( forceCborString( cStr ) ) );
    }
    static fromCborObj( cObj: CborObj ): TxRedeemer
    {
        if(!(
            cObj instanceof CborArray &&
            cObj.array.length >= 4 &&
            cObj.array[0] instanceof CborUInt &&
            cObj.array[1] instanceof CborUInt
        ))
        throw new InvalidCborFormatError("TxRedeemer");

        return new TxRedeemer({
            tag: Number( cObj.array[0].num ) as any,
            index: cObj.array[1].num,
            data: dataFromCborObj( cObj.array[2] ),
            execUnits: ExBudget.fromCborObj( cObj.array[3] )
        });
    }

    toJson()
    {
        return {
            tag: txRedeemerTagToString( this.tag ),
            index: this.index,
            execUnits: this.execUnits.toJson(),
            data: this.data.toJson(),
        }
    }
}