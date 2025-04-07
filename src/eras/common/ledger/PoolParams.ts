
import { Coin } from "./Coin";
import { PubKeyHash } from "../credentials/PubKeyHash";
import { CanBeHash32, Hash32, canBeHash32 } from "../hashes/Hash32/Hash32";
import { PoolKeyHash } from "../hashes/Hash28/PoolKeyHash";
import { VRFKeyHash } from "../hashes/Hash32/VRFKeyHash";
import { CborPositiveRational, CborObj, CborUInt, CborArray, CborSimple, CborText, CborTag, CborBytes, SubCborRef, Cbor } from "@harmoniclabs/cbor";
import { CanBeHash28, Hash28, canBeHash28 } from "../hashes";
import { canBeUInteger, forceBigUInt } from "../utils/ints";
import { PoolRelay, isPoolRelay, poolRelayToCborObj, poolRelayFromCborObj, poolRelayToJson } from "./PoolRelay";
import { isObject, hasOwn, defineReadOnlyProperty } from "@harmoniclabs/obj-utils";
import { assert } from "../utils/assert";
import { Rational, cborFromRational, isRational } from "../protocol/Rational";
import { StakeAddress } from "./StakeAddress";
import { Network } from "./Network";
import { getCborSet } from "../utils/getCborSet";
import { getSubCborRef, subCborRefOrUndef } from "../utils/getSubCborRef";

export interface IPoolParamsMetadata {
    poolMetadataUrl: string,
    hash: CanBeHash32
}

export function isIPoolParamsMetadata( stuff: any ): stuff is IPoolParamsMetadata
{
    return isObject( stuff ) && (
        typeof stuff.poolMetadataUrl === "string" &&
        canBeHash32( stuff.hash )
    );
}

export interface ITypedPoolParamsMetadata {
    poolMetadataUrl: string,
    hash: Hash32
}

export function typedPoolParamsMetadata({ poolMetadataUrl, hash }: IPoolParamsMetadata ): ITypedPoolParamsMetadata
{
    return {
        poolMetadataUrl,
        hash: new Hash32( hash )
    };
}

export interface IPoolParams {
    operator: CanBeHash28,// PoolKeyHash,
    vrfKeyHash: CanBeHash32,// VRFKeyHash,
    pledge: Coin,
    cost: Coin,
    margin: Rational, //CborPositiveRational,
    rewardAccount: StakeAddress | CanBeHash28,
    owners: CanBeHash28[], // PubKeyHash[],
    relays: PoolRelay[],
    metadata?: IPoolParamsMetadata
}

export interface ITypedPoolParams {
    operator: PoolKeyHash,
    vrfKeyHash: VRFKeyHash,
    pledge: bigint,
    cost: bigint,
    margin: CborPositiveRational,
    rewardAccount: StakeAddress,
    owners: PubKeyHash[],
    relays: PoolRelay[],
    metadata?: ITypedPoolParamsMetadata
}

export class PoolParams
    implements ITypedPoolParams
{
    readonly operator!: PoolKeyHash;
    readonly vrfKeyHash!: VRFKeyHash;
    readonly pledge!: bigint;
    readonly cost!: bigint;
    readonly margin!: CborPositiveRational;
    readonly rewardAccount!: StakeAddress;
    readonly owners!: PubKeyHash[];
    readonly relays!: PoolRelay[];
    readonly metadata?: ITypedPoolParamsMetadata;

    constructor( 
        params: IPoolParams,
        readonly cborRef: SubCborRef | undefined = undefined
    )
    {
        if(!(
            isObject( params ) &&
            hasOwn( params, "operator" ) &&
            hasOwn( params, "vrfKeyHash" ) &&
            hasOwn( params, "pledge" ) &&
            hasOwn( params, "cost" ) &&
            hasOwn( params, "margin" ) &&
            hasOwn( params, "rewardAccount" ) &&
            hasOwn( params, "owners" ) &&
            hasOwn( params, "relays" )
        ))throw new Error("invalid pool parameters passed to construct a 'PoopParams' instance")

        const {
            operator,
            vrfKeyHash,
            pledge,
            cost,
            margin,
            rewardAccount,
            owners,
            relays,
            metadata 
        } = params;

        if(!(
            canBeHash28( operator )
        ))throw new Error("invalid 'operator' constructing 'PoolParams'");
        this.operator = new PoolKeyHash( operator );

        if(!(
            canBeHash32( vrfKeyHash )
        ))throw new Error("invalid 'vrfKeyHash' constructing 'PoolParams'");
        this.vrfKeyHash =  new VRFKeyHash( vrfKeyHash );

        if(!(
            canBeUInteger( pledge )
        ))throw new Error("invalid 'pledge' constructing 'PoolParams'");
        this.pledge = forceBigUInt( pledge );

        if(!(
            canBeUInteger( cost )
        ))throw new Error("invalid 'cost' constructing 'PoolParams'");
        this.cost = forceBigUInt( cost )

        if(!(
            isRational( margin )
        ))throw new Error("invalid 'margin' constructing 'PoolParams'");
        this.margin = cborFromRational( margin )

        if( canBeHash28( rewardAccount ) )
        {
            this.rewardAccount = new StakeAddress({
                network: "mainnet",
                credentials: new Hash28( rewardAccount ),
                type: "stakeKey"
            });
        }
        else
        {
            if(!(
                rewardAccount instanceof StakeAddress
            ))throw new Error("invalid 'rewardAccount' constructing 'PoolParams'")
            this.rewardAccount = rewardAccount.clone();
        }
        
        if(!(
            Array.isArray( owners ) &&
            owners.every( canBeHash28 )
        ))throw new Error("invalid 'owners' constructing 'PoolParams'")

        this.owners = owners.map( hash => new Hash28( hash ) ) 

        if(!(
            Array.isArray( relays ) &&
            relays.every( isPoolRelay )
        ))throw new Error("invalid 'relays' constructing 'PoolParams'")

        this.relays = relays 

        if(!(
            metadata === undefined ||
            isIPoolParamsMetadata( metadata )
        ))throw new Error("invalid 'metadata' filed for 'PoolParams'")

        this.metadata = metadata === undefined ? undefined : typedPoolParamsMetadata( metadata )
        
        this.cborRef = cborRef ?? subCborRefOrUndef( params );
        
    }

    toCborObjArray(): CborObj[]
    {
        return Object.freeze([
            this.operator.toCborObj(),
            this.vrfKeyHash.toCborObj(),
            new CborUInt( this.pledge ),
            new CborUInt( this.cost ),
            this.margin,
            this.rewardAccount.toCborObj(),
            new CborArray( this.owners.map( owner => owner.toCborObj() ) ),
            new CborArray( this.relays.map( poolRelayToCborObj ) ),
            this.metadata === undefined || this.metadata === null ?
                new CborSimple( null ) :
                new CborArray([
                    new CborText( this.metadata.poolMetadataUrl ),
                    this.metadata.hash.toCborObj()
                ])
        ]) as any;
    }

    //*TO DO: should I remove the toCborObjArray when added this one? //*
    toCborObj(): CborObj
    {
        if( this.cborRef instanceof SubCborRef )
        {
            return Cbor.parse( this.cborRef.toBuffer() )
        }
        return new CborArray([
            this.operator.toCborObj(),
            this.vrfKeyHash.toCborObj(),
            new CborUInt( this.pledge ),
            new CborUInt( this.cost ),
            this.margin,
            this.rewardAccount.toCborObj(),
            new CborArray( this.owners.map( owner => owner.toCborObj() ) ),
            new CborArray( this.relays.map( poolRelayToCborObj ) ),
            this.metadata === undefined || this.metadata === null ?
                new CborSimple( null ) :
                new CborArray([
                    new CborText( this.metadata.poolMetadataUrl ),
                    this.metadata.hash.toCborObj()
                ])
        ])
    }

    static fromCborObjArray([
        _operator,
        _vrfKeyHash,
        _pledge,
        _cost,
        _margin,
        _rewAccount,
        _owners,
        _relays,
        _metadata
    ]: CborObj[]): PoolParams
    {
        if(!(
            _pledge instanceof CborUInt &&
            _cost instanceof CborUInt &&
            // _owners instanceof CborArray &&
            _relays instanceof CborArray &&
            _margin instanceof CborTag && _margin.data instanceof CborArray &&
            _rewAccount instanceof CborBytes &&
            _margin.data.array.every( n => n instanceof CborUInt ) && _margin.data.array.length >= 2
        ))
        throw new Error(`Invlid CBOR format for "PoolParams"`);

        const [ margin_num, margin_den ] = _margin.data.array.map( n => (n as CborUInt).num );

        const rewAccountBytes = _rewAccount.bytes;
        const rewardAccount =
            rewAccountBytes.length === 28 ?
            new Hash28( rewAccountBytes ) :
            StakeAddress.fromBytes( rewAccountBytes );

        return new PoolParams({
            operator: PoolKeyHash.fromCborObj( _operator ),
            vrfKeyHash: VRFKeyHash.fromCborObj( _vrfKeyHash ),
            pledge: _pledge.num,
            cost: _cost.num,
            margin: new CborPositiveRational( margin_num, margin_den ),
            rewardAccount,
            owners: getCborSet( _owners ).map( PubKeyHash.fromCborObj ),
            relays: _relays.array.map( poolRelayFromCborObj ),
            metadata: (
                _metadata instanceof CborArray &&
                _metadata.array[0] instanceof CborText &&
                _metadata.array[1] instanceof CborBytes
            ) ? 
            {
                poolMetadataUrl: _metadata.array[0].text,
                hash: Hash32.fromCborObj( _metadata.array[1] )
            }
            : undefined
        })
    }

    toJSON() { return this.toJson(); }
    toJson()
    {
        return {
            operator: this.operator.toString(),
            vrfKeyHash: this.vrfKeyHash.toString(),
            pledge: this.pledge.toString(),
            cost: this.cost.toString(),
            margin: Number( this.margin.num ) / Number( this.margin.den ),
            rewardAccount: this.rewardAccount, // cloned in constructor
            owners: this.owners.map( owner => owner.toString() ),
            relays: this.relays.map( poolRelayToJson ),
            metadata: this.metadata === undefined ? undefined : {
                poolMetadataUrl: this.metadata.poolMetadataUrl,
                hash: this.metadata.hash.toString()
            }
        }
    }
};