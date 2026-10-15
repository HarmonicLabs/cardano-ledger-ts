import { ToCbor, CborString, Cbor, CborArray, CborUInt, CanBeCborString, forceCborString, CborObj, CborMapEntry, SubCborRef } from "@harmoniclabs/cbor";
import { cborArray, cborUInt, MAX_WORD32, parseCborFull } from "../../../utils/strictCbor";
import { checkExUnitsCbor } from "../protocol/conwayPParamsUpdateCbor";
import { Cloneable } from "@harmoniclabs/cbor/dist/utils/Cloneable";
import { isObject, hasOwn } from "@harmoniclabs/obj-utils";
import { Data, isData, dataToCborObj, dataFromCborObj } from "@harmoniclabs/plutus-data";
import { ExBudget } from "@harmoniclabs/plutus-machine";
import { BasePlutsError } from "../../../utils/BasePlutsError";
import { InvalidCborFormatError } from "../../../utils/InvalidCborFormatError";
import { ToJson } from "../../../utils/ToJson";
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
            tag === 3 ||
            tag === 4 ||
            tag === 5
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
        }, this.cborRef?.clone());
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
    
    /**
     * one entry of the map form of `redeemers`: `[tag, index] => [data, ex_units]`
     * (cardano-ledger: the key a `CBORGroup` purpose, the value a 2-tuple, which below
     * protocol version 12 is a definite array of two)
     */
    static fromCborMapEntry( entry: CborMapEntry ): ConwayTxRedeemer
    {
        const [ _tag, _index ] = cborArray( entry?.k, "ConwayTxRedeemer key", { len: 2 } );
        const [ _data, _execUnits ] = cborArray( entry?.v, "ConwayTxRedeemer value", { len: 2, definite: true } );
        const [ mem, cpu ] = checkExUnitsCbor( _execUnits, "ConwayTxRedeemer ex_units" );

        return new ConwayTxRedeemer({
            tag: conwayRedeemerTag( _tag ),
            index: Number( cborUInt( _index, "ConwayTxRedeemer index", MAX_WORD32 ) ),
            data: dataFromCborObj( _data ),
            execUnits: new ExBudget({ mem, cpu })
        });
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
        return ConwayTxRedeemer.fromCborObj( parseCborFull( cStr, "ConwayTxRedeemer" ) );
    }

    /**
     * list form `[tag, index, data, ex_units]` (cardano-ledger `decodeRecordNamed
     * "Redeemer"`: exactly four, definite or indefinite); the tag is a Word8 purpose
     * 0-5, the index a Word32 and the ex units a `RecD` record (definite array of two).
     */
    static fromCborObj( cObj: CborObj ): ConwayTxRedeemer
    {
        const [ _tag, _index, _data, _execUnits ] = cborArray( cObj, "ConwayTxRedeemer", { len: 4 } );
        const [ mem, cpu ] = checkExUnitsCbor( _execUnits, "ConwayTxRedeemer ex_units" );

        return new ConwayTxRedeemer({
            tag: conwayRedeemerTag( _tag ) as any,
            index: cborUInt( _index, "ConwayTxRedeemer index", MAX_WORD32 ),
            data: dataFromCborObj( _data ),
            execUnits: new ExBudget({ mem, cpu })
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
/** `ConwayPlutusPurpose` tag: `decodeWord8`, 0 spend .. 5 propose */
function conwayRedeemerTag( c: CborObj | undefined ): number
{
    const t = Number( cborUInt( c, "ConwayTxRedeemer tag", BigInt( 255 ) ) );
    if( t > 5 ) throw new InvalidCborFormatError( "ConwayTxRedeemer", "unexpected redeemer tag " + t );
    return t;
}
