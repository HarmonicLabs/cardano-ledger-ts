import {
    Cbor, CborArray, CborBytes, CborMap, CborObj, CborTag, CborUInt,
} from "@harmoniclabs/cbor";
import { toHex } from "@harmoniclabs/uint8array-utils";
import { Hash32, Signature } from "../../../hashes";
import { VKey } from "../VKey";
import { VKeyWitness } from "../VKeyWitness/VKeyWitness";
import { ConwayTxWitnessSet } from "../../../eras/conway/tx/ConwayTxWitnessSet";
import { DijkstraTxWitnessSet } from "../../../eras/dijkstra/tx/DijkstraTxWitnessSet";

const KEY_A = new Uint8Array(32).fill( 1 );
const KEY_B = new Uint8Array(32).fill( 2 );
const SIG = new Uint8Array(64).fill( 3 );

function vkeyBytes(): CborArray {
    return new CborArray([
        new CborBytes( KEY_A ),
        new CborBytes( SIG )
    ]);
}

const VKEY_SET = new CborTag( 258, new CborArray([ vkeyBytes() ]) );
const REDEEMERS_MAP = new CborMap([{
    k: new CborArray([ new CborUInt( 0 ), new CborUInt( 0 ) ]),
    v: new CborArray([
        new CborUInt( 42 ),
        new CborArray([ new CborUInt( 1_000 ), new CborUInt( 2_000 ) ])
    ])
}]);
const SCRIPTS_SET = new CborTag( 258, new CborArray([ new CborBytes( new Uint8Array([ 4, 5, 6 ]) ) ]) );

function fixtureCbor( scriptsKey: number ): Uint8Array {
    return Cbor.encode( new CborMap([
        { k: new CborUInt( 0 ), v: VKEY_SET },
        { k: new CborUInt( 5 ), v: REDEEMERS_MAP },
        { k: new CborUInt( scriptsKey ), v: SCRIPTS_SET },
    ]));
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

describe( "era witness sets keep their encoded form when a witness is appended", () => {

    test( "ConwayTxWitnessSet invalidates its cache and keeps map redeemers + Tag 258", () => {
        const bytes = fixtureCbor( 7 );
        const ws = ConwayTxWitnessSet.fromCbor( toHex( bytes ) );
        expect( toHex( ws.toCbor() ) ).toBe( toHex( bytes ) );

        ws.addVKeyWitness( newWitness( KEY_B ) );

        const decoded = ConwayTxWitnessSet.fromCbor( toHex( ws.toCbor() ) );
        expect( decoded.vkeyWitnesses?.length ).toBe( 2 );
        expect( decoded.vkeyWitnesses?.every( wit => toHex( wit.vkey.toBuffer() ) === toHex( KEY_A ) || toHex( wit.vkey.toBuffer() ) === toHex( KEY_B ) ) ).toBe( true );

        const out = ws.toCborObj();
        expect( out instanceof CborMap ).toBe( true );
        if(!( out instanceof CborMap )) throw new Error( "not a map" );
        const vkeyField = field( out, 0 );
        expect( vkeyField instanceof CborTag ).toBe( true );
        if(!( vkeyField instanceof CborTag )) throw new Error( "key 0 lost Tag 258" );
        expect( Number( vkeyField.tag ) ).toBe( 258 );
        expect( (vkeyField.data as CborArray).array.length ).toBe( 2 );
        expect( field( out, 5 ) instanceof CborMap ).toBe( true );
        const scriptField = field( out, 7 );
        expect( scriptField instanceof CborTag ).toBe( true );
        expect( toHex( Cbor.encode( scriptField as CborObj ) ) ).toBe( toHex( Cbor.encode( SCRIPTS_SET ) ) );
    });

    test( "DijkstraTxWitnessSet invalidates its cache and keeps key 8 Tag 258", () => {
        const bytes = fixtureCbor( 8 );
        const ws = DijkstraTxWitnessSet.fromCbor( toHex( bytes ) );
        expect( toHex( ws.toCbor() ) ).toBe( toHex( bytes ) );

        ws.addVKeyWitness( newWitness( KEY_B ) );

        const decoded = DijkstraTxWitnessSet.fromCbor( toHex( ws.toCbor() ) );
        expect( decoded.vkeyWitnesses?.length ).toBe( 2 );
        expect( decoded.plutusV4Scripts?.length ).toBe( 1 );

        const out = ws.toCborObj();
        expect( out instanceof CborMap ).toBe( true );
        if(!( out instanceof CborMap )) throw new Error( "not a map" );
        expect( field( out, 0 ) instanceof CborTag ).toBe( true );
        expect( field( out, 5 ) instanceof CborMap ).toBe( true );
        const scriptField = field( out, 8 );
        expect( scriptField instanceof CborTag ).toBe( true );
        expect( toHex( Cbor.encode( scriptField as CborObj ) ) ).toBe( toHex( Cbor.encode( SCRIPTS_SET ) ) );
    });

});
