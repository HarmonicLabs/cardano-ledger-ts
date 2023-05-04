import { Hash32 } from "./Hash32";

export class AuxiliaryDataHash extends Hash32
{
    clone(): AuxiliaryDataHash
    {
        return new AuxiliaryDataHash( this );
    }
};