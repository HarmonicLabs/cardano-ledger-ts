
import { Coin } from "./Coin";
import { PubKeyHash } from "../credentials/PubKeyHash";
import { CanBeHash32, Hash32, canBeHash32 } from "../hashes/Hash32/Hash32";
import { PoolKeyHash } from "../hashes/Hash28/PoolKeyHash";
import { VRFKeyHash } from "../hashes/Hash32/VRFKeyHash";
import { ByteString } from "@harmoniclabs/bytestring";
import { CborPositiveRational, CborObj, CborUInt, CborArray, CborSimple, CborText, CborTag, CborBytes } from "@harmoniclabs/cbor";
import { CanBeHash28, Hash28, canBeHash28 } from "../hashes";
import { canBeUInteger, forceBigUInt } from "../utils/ints";
import { PoolRelay, isPoolRelay, poolRelayToCborObj, poolRelayFromCborObj, poolRelayToJson } from "./PoolRelay";
import { isObject, hasOwn, defineReadOnlyProperty } from "@harmoniclabs/obj-utils";
import { assert } from "../utils/assert";
import { Rational, cborFromRational, isRational } from "./protocol/Rational";

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
    rewardAccount: CanBeHash28,
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
    rewardAccount: Hash28,
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
    readonly rewardAccount!: Hash28;
    readonly owners!: PubKeyHash[];
    readonly relays!: PoolRelay[];
    readonly metadata?: ITypedPoolParamsMetadata;

    constructor( params: IPoolParams )
    {
        assert(
            isObject( params ) &&
            hasOwn( params, "operator" ) &&
            hasOwn( params, "vrfKeyHash" ) &&
            hasOwn( params, "pledge" ) &&
            hasOwn( params, "cost" ) &&
            hasOwn( params, "margin" ) &&
            hasOwn( params, "rewardAccount" ) &&
            hasOwn( params, "owners" ) &&
            hasOwn( params, "relays" ),
            "invalid pool parameters passed to construct a 'PoopParams' instance"
        );

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

        assert(
            canBeHash28( operator ),
            "invalid 'operator' constructing 'PoolParams'"
        );
        defineReadOnlyProperty( this, "operator", new PoolKeyHash( operator ) );

        assert(
            canBeHash32( vrfKeyHash ),
            "invalid 'vrfKeyHash' constructing 'PoolParams'"
        );
        defineReadOnlyProperty( this, "vrfKeyHash", new VRFKeyHash( vrfKeyHash ) );

        assert(
            canBeUInteger( pledge ),
            "invalid 'pledge' constructing 'PoolParams'"
        );
        defineReadOnlyProperty( this, "pledge", forceBigUInt( pledge ) );
        
        assert(
            canBeUInteger( cost ),
            "invalid 'cost' constructing 'PoolParams'"
        );
        defineReadOnlyProperty( this, "cost", forceBigUInt( cost ) );

        assert(
            isRational( margin ),
            "invalid 'margin' constructing 'PoolParams'"
        );
        defineReadOnlyProperty( this, "margin", cborFromRational( margin ) );

        assert(
            canBeHash28( rewardAccount ),
            "invalid 'rewardAccount' constructing 'PoolParams'"
        );
        defineReadOnlyProperty( this, "rewardAccount", new Hash28( rewardAccount ) );

        assert(
            Array.isArray( owners ) &&
            owners.every( canBeHash28 ),
            "invalid 'owners' constructing 'PoolParams'"
        );
        defineReadOnlyProperty( this, "owners", Object.freeze( owners.map( hash => new Hash28( hash ) ) ) );

        assert(
            Array.isArray( relays ) &&
            relays.every( isPoolRelay ),
            "invalid 'relays' constructing 'PoolParams'"
        );
        defineReadOnlyProperty( this, "relays", Object.freeze( relays ) );

        assert(
            metadata === undefined ||
            isIPoolParamsMetadata( metadata ),
            "invalid 'metadata' filed for 'PoolParams'"
        );
        defineReadOnlyProperty(
            this,
            "metadata",
            metadata === undefined ? undefined:
            typedPoolParamsMetadata( metadata )
        );

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
            _owners instanceof CborArray &&
            _relays instanceof CborArray &&
            _margin instanceof CborTag && _margin.data instanceof CborArray &&
            _margin.data.array.every( n => n instanceof CborUInt ) && _margin.data.array.length >= 2
        ))
        throw new Error(`Invlid CBOR format for "PoolParams"`);

        const [ margin_num, margin_den ] = _margin.data.array.map( n => (n as CborUInt).num )

        return new PoolParams({
            operator: PoolKeyHash.fromCborObj( _operator ),
            vrfKeyHash: VRFKeyHash.fromCborObj( _vrfKeyHash ),
            pledge: _pledge.num,
            cost: _cost.num,
            margin: new CborPositiveRational( margin_num, margin_den ),
            rewardAccount: Hash28.fromCborObj( _rewAccount ),
            owners: _owners.array.map( PubKeyHash.fromCborObj ),
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

    toJson()
    {
        return {
            operator: this.operator.asString,
            vrfKeyHash: this.vrfKeyHash.asString,
            pledge: this.pledge.toString(),
            cost: this.cost.toString(),
            margin: Number( this.margin.num ) / Number( this.margin.den ),
            rewardAccount: this.rewardAccount.asString,
            owners: this.owners.map( owner => owner.asString ),
            relays: this.relays.map( poolRelayToJson ),
            metadata: this.metadata === undefined ? undefined : {
                poolMetadataUrl: this.metadata.poolMetadataUrl,
                hash: this.metadata.hash.toString()
            }
        }
    }
};