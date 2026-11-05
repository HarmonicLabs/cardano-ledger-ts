import {
    Cbor, CborArray, CborBytes, CborMap, CborObj, CborTag, CborUInt,
} from "@harmoniclabs/cbor";
import { toHex } from "@harmoniclabs/uint8array-utils";
import { Hash32, Signature } from "../../../hashes";
import { Tx } from "../../Tx";
import { TxBody, UTxO } from "../../body";
import { TxOut } from "../../body/output";
import { TxWitnessSet } from "../TxWitnessSet";
import { VKey } from "../VKey";
import { VKeyWitness } from "../VKeyWitness/VKeyWitness";

const KEY_A = new Uint8Array(32).fill( 1 );
const KEY_B = new Uint8Array(32).fill( 2 );
const SIG = new Uint8Array(64).fill( 3 );

function vkeyBytes(): CborArray {
    return new CborArray([
        new CborBytes( KEY_A ),
        new CborBytes( SIG )
    ]);
}

function conwayWitnessSet(): {
    vkey: CborTag,
    redeemers: CborMap,
    scripts: CborTag,
    bytes: Uint8Array
} {
    const vkey = new CborTag( 258, new CborArray([ vkeyBytes() ]) );
    const redeemers = new CborMap([{
        k: new CborArray([ new CborUInt( 0 ), new CborUInt( 0 ) ]),
        v: new CborArray([
            new CborUInt( 42 ),
            new CborArray([ new CborUInt( 1_000 ), new CborUInt( 2_000 ) ])
        ])
    }]);
    const scripts = new CborTag( 258, new CborArray([ new CborBytes( new Uint8Array([ 1, 2, 3 ]) ) ]) );

    return {
        vkey,
        redeemers,
        scripts,
        bytes: Cbor.encode( new CborMap([
            { k: new CborUInt( 0 ), v: vkey },
            { k: new CborUInt( 5 ), v: redeemers },
            { k: new CborUInt( 7 ), v: scripts },
        ]))
    };
}

function field( ws: CborMap, key: number ): CborObj | undefined {
    return ws.map.find( ({ k }) => k instanceof CborUInt && Number( k.num ) === key )?.v;
}

function newWitness( key: Uint8Array ): VKeyWitness {
    return new VKeyWitness({
        vkey: new VKey( new Hash32( key ) ),
        signature: new Signature( SIG )
    });
}

describe( "TxWitnessSet Conway encoding fidelity after addVKeyWitness", () => {

    test( "keeps the map redeemers and Tag 258 sets while appending key 0", () => {
        const fixture = conwayWitnessSet();
        const ws = TxWitnessSet.fromCbor( toHex( fixture.bytes ) );
        expect( toHex( ws.toCbor() ) ).toBe( toHex( fixture.bytes ) );

        ws.addVKeyWitness( newWitness( KEY_B ) );

        const out = ws.toCborObj();
        expect( out instanceof CborMap ).toBe( true );
        if(!( out instanceof CborMap )) throw new Error( "not a map" );

        const vkeyField = field( out, 0 );
        expect( vkeyField instanceof CborTag ).toBe( true );
        if(!( vkeyField instanceof CborTag )) throw new Error( "key 0 lost Tag 258" );
        expect( Number( vkeyField.tag ) ).toBe( 258 );
        expect( (vkeyField.data as CborArray).array.length ).toBe( 2 );

        const redeemerField = field( out, 5 );
        expect( redeemerField instanceof CborMap ).toBe( true );
        if(!( redeemerField instanceof CborMap )) throw new Error( "key 5 lost map form" );
        expect( toHex( Cbor.encode( redeemerField ) ) ).toBe( toHex( Cbor.encode( fixture.redeemers ) ) );

        const scriptField = field( out, 7 );
        expect( scriptField instanceof CborTag ).toBe( true );
        if(!( scriptField instanceof CborTag )) throw new Error( "key 7 lost Tag 258" );
        expect( Number( scriptField.tag ) ).toBe( 258 );
        expect( toHex( Cbor.encode( scriptField ) ) ).toBe( toHex( Cbor.encode( fixture.scripts ) ) );
    });

    test( "Tx invalidates its cache and keeps the witness set's Conway encoding", () => {
        const fixture = conwayWitnessSet();
        const witnesses = TxWitnessSet.fromCbor( toHex( fixture.bytes ) );
        const tx = new Tx({
            body: new TxBody({
                inputs: [ new UTxO({
                    utxoRef: { id: "ff".repeat( 32 ), index: 0 },
                    resolved: TxOut.fake
                }) ],
                outputs: [],
                fee: 0
            }),
            witnesses
        });

        tx.addVKeyWitness( newWitness( KEY_B ) );

        const out = tx.toCborObj() as CborArray;
        expect( out instanceof CborArray ).toBe( true );
        const witMap = out.array[1];
        expect( witMap instanceof CborMap ).toBe( true );
        if(!( witMap instanceof CborMap )) throw new Error( "not a witness map" );
        expect( field( witMap, 0 ) instanceof CborTag ).toBe( true );
        expect( field( witMap, 5 ) instanceof CborMap ).toBe( true );
        expect( field( witMap, 7 ) instanceof CborTag ).toBe( true );
    });

});
