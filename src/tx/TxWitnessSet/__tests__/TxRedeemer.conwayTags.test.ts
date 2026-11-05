import { Cbor, CborArray, CborMap, CborUInt } from "@harmoniclabs/cbor";
import { DataI } from "@harmoniclabs/plutus-data";
import { ExBudget } from "@harmoniclabs/plutus-machine";
import { toHex } from "@harmoniclabs/uint8array-utils";
import { TxRedeemer, TxRedeemerTag } from "../TxRedeemer";
import { TxWitnessSet } from "../TxWitnessSet";

// Conway adds the Voting (4) and Proposing (5) redeemer purposes.
describe("TxRedeemer Conway tags", () => {

    const exUnits = () => new CborArray([ new CborUInt( 1_000 ), new CborUInt( 2_000 ) ]);
    const mapEntry = ( tag: number ) => ({
        k: new CborArray([ new CborUInt( tag ), new CborUInt( 1 ) ]),
        v: new CborArray([ new CborUInt( 42 ), exUnits() ])
    });

    test.each([ TxRedeemerTag.Voting, TxRedeemerTag.Proposing ])("constructs tag %s", ( tag ) => {
        const redeemer = new TxRedeemer({ tag, index: 0, data: new DataI( 42 ), execUnits: new ExBudget({ mem: 1_000, cpu: 2_000 }) });
        expect( redeemer.tag ).toBe( tag );
        expect( redeemer.clone().tag ).toBe( tag );
    });

    test.each([ TxRedeemerTag.Voting, TxRedeemerTag.Proposing ])("decodes tag %s in the array form, bytes unchanged", ( tag ) => {
        const bytes = Cbor.encode( new CborArray([ new CborUInt( tag ), new CborUInt( 0 ), new CborUInt( 42 ), exUnits() ]) );
        const redeemer = TxRedeemer.fromCbor( toHex( bytes ) );
        expect( redeemer.tag ).toBe( tag );
        expect( toHex( redeemer.toCbor() ) ).toBe( toHex( bytes ) );
    });

    test("TxWitnessSet decodes voting and proposing redeemers in the map form", () => {
        const ws = TxWitnessSet.fromCbor( toHex( Cbor.encode( new CborMap([
            { k: new CborUInt( 5 ), v: new CborMap([ mapEntry( TxRedeemerTag.Voting ), mapEntry( TxRedeemerTag.Proposing ) ]) }
        ]) ) ) );
        expect( ws.redeemers?.map( r => r.tag ) ).toEqual([ TxRedeemerTag.Voting, TxRedeemerTag.Proposing ]);
    });

    test("an unknown tag still throws", () => {
        expect( () => TxRedeemer.fromCborMapEntry( mapEntry( 6 ) ) ).toThrow( "invalid redeemer tag" );
    });
});
