import { Cbor, CborArray, CborBytes, CborObj, CborString, CborUInt } from "@harmoniclabs/cbor";
import { Credential, PubKeyHash } from "../../credentials";
import { CanBeHash28, Hash28, canBeHash28 } from "../../hashes";
import { roDescr } from "../../utils/roDescr";
import { DRepType, drepTypeToString } from "./DRepType";
import { IDRep } from "./IDRep";
import { isObject } from "@harmoniclabs/obj-utils";
import { Data, DataConstr } from "@harmoniclabs/plutus-data";
import { definitelyToDataVersion } from "../../toData/defaultToDataVersion";

export interface IDRepKeyHash {
    hash: CanBeHash28
}

export function isIDRepKeyHash( stuff: any ): stuff is IDRepKeyHash
{
    return isObject( stuff ) && canBeHash28( stuff.hash );
}

export class DRepKeyHash
    implements IDRep, IDRepKeyHash
{
    readonly drepType: DRepType.KeyHash;
    readonly hash: PubKeyHash;

    constructor({ hash }: IDRepKeyHash)
    {
        Object.defineProperties(
            this, {
                drepType: { value: DRepType.KeyHash, ...roDescr },
                hash: { value: new PubKeyHash( hash ), ...roDescr }
            }
        );
    }

    toData(version?: "v1" | "v2" | "v3" | undefined): DataConstr
    {
        version = definitelyToDataVersion( version );

        if( version === "v1" || version === "v2" )
        throw new Error("DRep only supported after v3");

        return new DataConstr(
            0, // PDRep.DRep
            [ Credential.keyHash( this.hash ).toData( version ) ]
        );
    }

    toCbor(): CborString
    {
        return Cbor.encode( this.toCborObj() );
    }
    toCborObj(): CborArray
    {
        return new CborArray([
            new CborUInt( this.drepType ),
            this.hash.toCborObj()
        ]);
    }

    static fromCborObj( cbor: CborObj ): DRepKeyHash
    {
        if(!(
            cbor instanceof CborArray &&
            cbor.array.length >= 2 &&
            
            cbor.array[0] instanceof CborUInt &&
            Number( cbor.array[0].num ) === DRepType.KeyHash
        )) throw new Error("Invalid cbor for 'DRepKeyHash'");

        return new DRepKeyHash({
            hash: Hash28.fromCborObj( cbor.array[1] )
        });
    }

    toJson()
    {
        return {
            drepType: drepTypeToString( this.drepType ),
            hash: this.hash.toString()
        };
    }
}