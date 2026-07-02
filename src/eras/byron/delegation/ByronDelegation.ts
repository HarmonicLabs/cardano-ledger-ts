import { CanBeCborString, Cbor, CborArray, CborBytes, CborObj, CborString, CborUInt, forceCborString } from "@harmoniclabs/cbor";
import { toHex } from "@harmoniclabs/uint8array-utils";

/**
 * Byron heavyweight delegation certificate:
 * `dlg = [ epoch: epochid, issuer: pubkey, delegate: pubkey, certificate: signature ]`.
 *
 * This is the `dlgPayload` element, and also the inner cert of a `dlgsig`
 * (the `blocksig` tag-2 variant used by every OBFT mainnet block).
 */
export class ByronDelegationCert
{
    readonly epoch: bigint;
    readonly issuer: Uint8Array;
    readonly delegate: Uint8Array;
    readonly certificate: Uint8Array;

    constructor( c: { epoch: bigint | number; issuer: Uint8Array; delegate: Uint8Array; certificate: Uint8Array } )
    {
        this.epoch = BigInt( c.epoch );
        this.issuer = c.issuer;
        this.delegate = c.delegate;
        this.certificate = c.certificate;
    }

    clone(): ByronDelegationCert
    {
        return new ByronDelegationCert({ epoch: this.epoch, issuer: this.issuer.slice(), delegate: this.delegate.slice(), certificate: this.certificate.slice() });
    }

    toCborObj(): CborArray
    {
        return new CborArray([
            new CborUInt( this.epoch ),
            new CborBytes( this.issuer ),
            new CborBytes( this.delegate ),
            new CborBytes( this.certificate )
        ]);
    }
    toCbor(): CborString { return Cbor.encode( this.toCborObj() ) as any as CborString; }
    toCborBytes(): Uint8Array { return Cbor.encode( this.toCborObj() ); }

    static fromCborObj( cObj: CborObj ): ByronDelegationCert
    {
        if(!(
            cObj instanceof CborArray && cObj.array.length === 4 &&
            cObj.array[0] instanceof CborUInt &&
            cObj.array[1] instanceof CborBytes &&
            cObj.array[2] instanceof CborBytes &&
            cObj.array[3] instanceof CborBytes
        )) throw new Error("invalid CBOR for Byron dlg");
        return new ByronDelegationCert({
            epoch: cObj.array[0].num,
            issuer: cObj.array[1].bytes,
            delegate: cObj.array[2].bytes,
            certificate: cObj.array[3].bytes
        });
    }
    static fromCbor( cStr: CanBeCborString ): ByronDelegationCert
    {
        return ByronDelegationCert.fromCborObj( Cbor.parse( forceCborString( cStr ) ) );
    }

    toJSON() { return this.toJson(); }
    toJson()
    {
        return { epoch: this.epoch.toString(), issuer: toHex(this.issuer), delegate: toHex(this.delegate), certificate: toHex(this.certificate) };
    }
}

/**
 * Byron heavyweight delegation signature: `dlgsig = [ dlg, signature ]`.
 * Carried inside `blocksig = [2, dlgsig]`.
 */
export class ByronDlgSig
{
    readonly cert: ByronDelegationCert;
    readonly signature: Uint8Array;

    constructor( s: { cert: ByronDelegationCert; signature: Uint8Array } )
    {
        this.cert = s.cert;
        this.signature = s.signature;
    }

    clone(): ByronDlgSig { return new ByronDlgSig({ cert: this.cert.clone(), signature: this.signature.slice() }); }

    toCborObj(): CborArray { return new CborArray([ this.cert.toCborObj(), new CborBytes( this.signature ) ]); }
    toCbor(): CborString { return Cbor.encode( this.toCborObj() ) as any as CborString; }
    toCborBytes(): Uint8Array { return Cbor.encode( this.toCborObj() ); }

    static fromCborObj( cObj: CborObj ): ByronDlgSig
    {
        if(!(
            cObj instanceof CborArray && cObj.array.length === 2 &&
            cObj.array[1] instanceof CborBytes
        )) throw new Error("invalid CBOR for Byron dlgsig");
        return new ByronDlgSig({ cert: ByronDelegationCert.fromCborObj( cObj.array[0] ), signature: cObj.array[1].bytes });
    }
    static fromCbor( cStr: CanBeCborString ): ByronDlgSig
    {
        return ByronDlgSig.fromCborObj( Cbor.parse( forceCborString( cStr ) ) );
    }

    toJSON() { return this.toJson(); }
    toJson() { return { cert: this.cert.toJson(), signature: toHex(this.signature) }; }
}

/**
 * Byron lightweight (proxy) delegation certificate:
 * `lwdlg = [ epochRange: [epochid, epochid], issuer: pubkey, delegate: pubkey, certificate: signature ]`.
 */
export class ByronLwDelegationCert
{
    readonly epochRange: [bigint, bigint];
    readonly issuer: Uint8Array;
    readonly delegate: Uint8Array;
    readonly certificate: Uint8Array;

    constructor( c: { epochRange: [bigint | number, bigint | number]; issuer: Uint8Array; delegate: Uint8Array; certificate: Uint8Array } )
    {
        this.epochRange = [ BigInt( c.epochRange[0] ), BigInt( c.epochRange[1] ) ];
        this.issuer = c.issuer;
        this.delegate = c.delegate;
        this.certificate = c.certificate;
    }

    clone(): ByronLwDelegationCert
    {
        return new ByronLwDelegationCert({ epochRange: [ this.epochRange[0], this.epochRange[1] ], issuer: this.issuer.slice(), delegate: this.delegate.slice(), certificate: this.certificate.slice() });
    }

    toCborObj(): CborArray
    {
        return new CborArray([
            new CborArray([ new CborUInt( this.epochRange[0] ), new CborUInt( this.epochRange[1] ) ]),
            new CborBytes( this.issuer ),
            new CborBytes( this.delegate ),
            new CborBytes( this.certificate )
        ]);
    }
    toCbor(): CborString { return Cbor.encode( this.toCborObj() ) as any as CborString; }
    toCborBytes(): Uint8Array { return Cbor.encode( this.toCborObj() ); }

    static fromCborObj( cObj: CborObj ): ByronLwDelegationCert
    {
        if(!(
            cObj instanceof CborArray && cObj.array.length === 4 &&
            cObj.array[0] instanceof CborArray && cObj.array[0].array.length === 2 &&
            cObj.array[1] instanceof CborBytes &&
            cObj.array[2] instanceof CborBytes &&
            cObj.array[3] instanceof CborBytes
        )) throw new Error("invalid CBOR for Byron lwdlg");
        const r = cObj.array[0].array;
        return new ByronLwDelegationCert({
            epochRange: [ (r[0] as CborUInt).num, (r[1] as CborUInt).num ],
            issuer: cObj.array[1].bytes,
            delegate: cObj.array[2].bytes,
            certificate: cObj.array[3].bytes
        });
    }
    static fromCbor( cStr: CanBeCborString ): ByronLwDelegationCert
    {
        return ByronLwDelegationCert.fromCborObj( Cbor.parse( forceCborString( cStr ) ) );
    }

    toJSON() { return this.toJson(); }
    toJson()
    {
        return { epochRange: this.epochRange.map(String), issuer: toHex(this.issuer), delegate: toHex(this.delegate), certificate: toHex(this.certificate) };
    }
}

/**
 * Byron lightweight (proxy) delegation signature: `lwdlgsig = [ lwdlg, signature ]`.
 * Carried inside `blocksig = [1, lwdlgsig]`.
 */
export class ByronLwDlgSig
{
    readonly cert: ByronLwDelegationCert;
    readonly signature: Uint8Array;

    constructor( s: { cert: ByronLwDelegationCert; signature: Uint8Array } )
    {
        this.cert = s.cert;
        this.signature = s.signature;
    }

    clone(): ByronLwDlgSig { return new ByronLwDlgSig({ cert: this.cert.clone(), signature: this.signature.slice() }); }

    toCborObj(): CborArray { return new CborArray([ this.cert.toCborObj(), new CborBytes( this.signature ) ]); }
    toCbor(): CborString { return Cbor.encode( this.toCborObj() ) as any as CborString; }
    toCborBytes(): Uint8Array { return Cbor.encode( this.toCborObj() ); }

    static fromCborObj( cObj: CborObj ): ByronLwDlgSig
    {
        if(!(
            cObj instanceof CborArray && cObj.array.length === 2 &&
            cObj.array[1] instanceof CborBytes
        )) throw new Error("invalid CBOR for Byron lwdlgsig");
        return new ByronLwDlgSig({ cert: ByronLwDelegationCert.fromCborObj( cObj.array[0] ), signature: cObj.array[1].bytes });
    }
    static fromCbor( cStr: CanBeCborString ): ByronLwDlgSig
    {
        return ByronLwDlgSig.fromCborObj( Cbor.parse( forceCborString( cStr ) ) );
    }

    toJSON() { return this.toJson(); }
    toJson() { return { cert: this.cert.toJson(), signature: toHex(this.signature) }; }
}
