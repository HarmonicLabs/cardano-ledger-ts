import { Cbor, CborArray, CborObj, CborString, CborUInt, SubCborRef } from "@harmoniclabs/cbor";
import { DataConstr } from "@harmoniclabs/plutus-data";
import { CanBeHash28, CanBeHash32, Hash28, Hash32 } from "../../../../hashes";
import { roDescr } from "../../../../utils/roDescr";
import { CertificateType, certTypeToString } from "./CertificateType";
import { ICert } from "./ICert";
import { ToDataVersion, definitelyToDataVersion } from "../../../../toData/defaultToDataVersion";
import { getSubCborRef } from "../../../../utils/getSubCborRef";

/** @deprecated */
export interface ICertGenesisKeyDelegation {
    genesisHash: CanBeHash28,
    genesisDelegateHash: CanBeHash28,
    vrfKeyHash: CanBeHash32
}

/** @deprecated */
export class CertGenesisKeyDelegation
    implements ICert, ICertGenesisKeyDelegation
{
    readonly certType: CertificateType.GenesisKeyDelegation;
    readonly genesisHash: Hash28;
    readonly genesisDelegateHash: Hash28;
    readonly vrfKeyHash: Hash32;

    constructor(
        { genesisHash, genesisDelegateHash, vrfKeyHash }: ICertGenesisKeyDelegation,
        readonly cborRef: SubCborRef | undefined = undefined
    )
    {
        Object.defineProperties(
            this, {
                certType: { value: CertificateType.GenesisKeyDelegation, ...roDescr },
                genesisHash: { value: new Hash28( genesisHash ), ...roDescr },
                genesisDelegateHash: { value: new Hash28( genesisDelegateHash ), ...roDescr },
                vrfKeyHash: { value: new Hash32( vrfKeyHash ), ...roDescr },
            }
        )
    }
    

    toData( version?: ToDataVersion | undefined): DataConstr
    {
        version = definitelyToDataVersion( version );

        if( version !== "v1" && version !== "v2" )
        throw new Error(
            "Genesis Key delegation was deprecated with plutus v3; version:" + version
        );

        return new DataConstr( 5, [] );
    }

    getRequiredSigners(): Hash28[]
    {
        return [ this.genesisHash.clone() ];
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
        if( 
            this.cborRef instanceof SubCborRef 
        ) return Cbor.parse( this.cborRef.toBuffer() ) as CborArray;
        
        return new CborArray([
            new CborUInt( this.certType ),
            this.genesisHash.toCborObj(),
            this.genesisDelegateHash.toCborObj(),
            this.vrfKeyHash.toCborObj(),
        ]);
    }

    static fromCborObj( cbor: CborObj ): CertGenesisKeyDelegation
    {
        if(!(
            cbor instanceof CborArray &&
            cbor.array.length >= 4 &&
            
            cbor.array[0] instanceof CborUInt &&
            Number( cbor.array[0].num ) === CertificateType.GenesisKeyDelegation
        )) throw new Error("Invalid cbor for 'CertGenesisKeyDelegation'");

        return new CertGenesisKeyDelegation({
            genesisHash: Hash28.fromCborObj( cbor.array[1] ),
            genesisDelegateHash: Hash28.fromCborObj( cbor.array[2] ),
            vrfKeyHash: Hash32.fromCborObj( cbor.array[2] )
        }, getSubCborRef( cbor ));
    }

    toJSON() { return this.toJson(); }
    toJson()
    {
        return {
            certType: certTypeToString( this.certType ),
            genesisHash: this.genesisHash.toString(),
            genesisDelegateHash: this.genesisDelegateHash.toString(),
            vrfKeyHash: this.vrfKeyHash.toString(),   
        };
    }
}