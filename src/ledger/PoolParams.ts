
import { boundedRational, boundedText, cborArray, cborSet, cborUInt, definiteBytes, noDuplicates, nullOr, rewardAccountBytes, urlMaxBytes } from "../utils/strictCbor";
import { Coin } from "./Coin";
import { PubKeyHash } from "../credentials/PubKeyHash";
import { CanBeHash32, Hash32, canBeHash32 } from "../hashes/Hash32/Hash32";
import { PoolKeyHash } from "../hashes/Hash28/PoolKeyHash";
import { VRFKeyHash } from "../hashes/Hash32/VRFKeyHash";
import { CborPositiveRational, CborObj, CborUInt, CborArray, CborSimple, CborText, CborTag, CborBytes, SubCborRef, Cbor } from "@harmoniclabs/cbor";
import { CanBeHash28, Hash, Hash28, canBeHash28 } from "../hashes";
import { canBeUInteger, forceBigUInt } from "../utils/ints";
import { PoolRelay, isPoolRelay, poolRelayToCborObj, poolRelayFromCborObj, poolRelayToJson } from "./PoolRelay";
import { isObject, hasOwn, defineReadOnlyProperty } from "@harmoniclabs/obj-utils";
import { assert } from "../utils/assert";
import { Rational, cborFromRational, isRational } from "./protocol/Rational";
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
        ( stuff.hash instanceof Hash || canBeHash32( stuff.hash ) )
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
        hash: hash instanceof Hash32 ? hash : hash instanceof Hash ? hash as Hash32 : new Hash32( hash )
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
    
    toCborObj(): CborObj
    {
        if( this.cborRef instanceof SubCborRef ) return Cbor.parse( this.cborRef.toBuffer() );

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

    /**
     * the nine pool parameter fields of a pool registration certificate, as
     * cardano-ledger's `decodeStakePoolParamsFlat` reads them (below protocol version 12):
     * operator (28-byte key hash), VRF key hash (32 bytes), pledge and cost (Word64),
     * margin (`UnitInterval`), reward account, owners (a set of key hashes), relays
     * (a list) and metadata (`null` or `[url, bytes]`, `decodeRecordNamed`).
     */
    static fromCborObjArray( fields: CborObj[] ): PoolParams
    {
        if( fields.length !== 9 ) throw new Error(`Invlid CBOR format for "PoolParams"; expected 9 fields, got ${fields.length}`);
        const [
            _operator,
            _vrfKeyHash,
            _pledge,
            _cost,
            _margin,
            _rewAccount,
            _owners,
            _relays,
            _metadata
        ] = fields;

        const margin = boundedRational( _margin, "unit", "PoolParams margin" );

        const owners = noDuplicates(
            cborSet( _owners, "PoolParams owners" ).map( PubKeyHash.fromCborObj ),
            h => h.toString(),
            "PoolParams owners"
        );

        const metadata = nullOr( _metadata, m => {
            const [ url, hash ] = cborArray( m, "PoolMetadata", { len: 2 } );
            const hashBytes = definiteBytes( hash, "PoolMetadata hash" );
            return {
                poolMetadataUrl: boundedText( url, urlMaxBytes(), "PoolMetadata url" ),
                // `pmHash :: ByteArray`: any length (a 32-byte hash in practice)
                hash: hashBytes.length === 32 ? Hash32.fromCborObj( hash ) : new Hash( hashBytes ) as Hash32
            };
        });

        return new PoolParams({
            operator: PoolKeyHash.fromCborObj( _operator ),
            vrfKeyHash: VRFKeyHash.fromCborObj( _vrfKeyHash ),
            pledge: cborUInt( _pledge, "PoolParams pledge" ),
            cost: cborUInt( _cost, "PoolParams cost" ),
            margin: new CborPositiveRational( margin.num, margin.den ),
            rewardAccount: StakeAddress.fromBytes( rewardAccountBytes( _rewAccount, "PoolParams reward account" ) ),
            owners,
            relays: cborArray( _relays, "PoolParams relays" ).map( poolRelayFromCborObj ),
            metadata
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