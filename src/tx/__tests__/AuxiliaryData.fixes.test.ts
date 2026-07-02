import { ConwayAuxiliaryData } from "../../eras/conway/tx/ConwayAuxiliaryData";
import { BabbageAuxiliaryData } from "../../eras/babbage/tx/BabbageAuxiliaryData";
import { AllegraAuxiliaryData } from "../../eras/allegra/tx/AllegraAuxiliaryData";
import { AuxiliaryData } from "../AuxiliaryData";
import { TxMetadata } from "../../index";
import { TxMetadatumInt } from "../metadata/TxMetadatum";
import { Script } from "../../script";

const md = () => new TxMetadata({ 0: new TxMetadatumInt( 42 ) });
const pv1 = () => Script.plutusV1( new Uint8Array([ 0x46, 0x01, 0x00, 0x00, 0x22, 0x22, 0x00 ]) );

describe("AuxiliaryData era fixes (tag-259 hijack + strict-native)", () => {

    test("Conway: tag-259 with scripts round-trips and PRESERVES scripts (hijack fix)", () => {
        const aux = new ConwayAuxiliaryData({ metadata: md(), plutusV1Scripts: [ pv1() ] });
        const cbor = aux.toCbor();
        const decoded = ConwayAuxiliaryData.fromCbor( cbor );
        expect( decoded.plutusV1Scripts?.length ).toBe( 1 );          // was dropped before the fix
        expect( decoded.metadata ).toBeDefined();
        expect( decoded.toCbor().toString() ).toBe( cbor.toString() );
    });

    test("Conway: metadata-only tag-259 round-trips", () => {
        const aux = new ConwayAuxiliaryData({ metadata: md() });
        const decoded = ConwayAuxiliaryData.fromCbor( aux.toCbor() );
        expect( decoded.metadata ).toBeDefined();
        expect( decoded.plutusV1Scripts ).toBeUndefined();
    });

    test("Babbage: tag-259 with scripts round-trips and PRESERVES scripts (hijack fix)", () => {
        const aux = new BabbageAuxiliaryData({ metadata: md(), plutusV1Scripts: [ pv1() ] });
        const cbor = aux.toCbor();
        const decoded = BabbageAuxiliaryData.fromCbor( cbor );
        expect( decoded.plutusV1Scripts?.length ).toBe( 1 );
        expect( decoded.toCbor().toString() ).toBe( cbor.toString() );
    });

    test("Allegra: metadata-only round-trips (strict-native fix)", () => {
        const aux = new AllegraAuxiliaryData({ metadata: md() });
        expect(() => AllegraAuxiliaryData.fromCbor( aux.toCbor() )).not.toThrow();
    });
});

describe("TxMetadata single-identity (dual-class dedup)", () => {

    test("root TxMetadata is the same class the default AuxiliaryData checks against", () => {
        // Before the dedup, the root exported the eras/common copy while AuxiliaryData
        // checked `instanceof` the src/tx copy → this threw on every metadata build.
        const metadata = new TxMetadata({ 0: new TxMetadatumInt( 7 ) });
        expect( metadata instanceof TxMetadata ).toBe( true );
        expect(() => new AuxiliaryData({ metadata })).not.toThrow();
    });
});
