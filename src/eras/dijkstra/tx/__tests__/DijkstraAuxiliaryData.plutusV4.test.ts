import { CborTag, CborMap, CborUInt } from "@harmoniclabs/cbor";
import { DijkstraAuxiliaryData } from "../DijkstraAuxiliaryData";
import { Script } from "../../../../script";
import { TxMetadata } from "../../../common/tx/metadata/TxMetadata";

// auxiliary_data_map (#6.259) adds plutus_v4_script at key 5 in Dijkstra.
const V4 = Script.plutusV4( new Uint8Array([ 0x46, 0x01, 0x00, 0x00, 0x22, 0x22, 0x00 ]) );

describe("DijkstraAuxiliaryData Plutus V4 (aux_data_map key 5)", () => {

    test("encodes plutusV4Scripts under map key 5", () => {
        const aux = new DijkstraAuxiliaryData({ metadata: undefined, plutusV4Scripts: [ V4 ] });
        const tag = aux.toCborObj() as CborTag;
        const keys = (tag.data as CborMap).map.map( e => Number((e.k as CborUInt).num) );
        expect( keys ).toContain( 5 );
    });

    test("round-trips V4 scripts", () => {
        const aux = new DijkstraAuxiliaryData({
            metadata: new TxMetadata( [] ),
            plutusV4Scripts: [ V4 ]
        });
        const cbor = aux.toCbor();
        const decoded = DijkstraAuxiliaryData.fromCbor( cbor );
        expect( decoded.plutusV4Scripts?.length ).toBe( 1 );
        expect( decoded.plutusV4Scripts?.[0].type ).toBe( "PlutusScriptV4" );
        expect( decoded.toCbor().toString() ).toBe( cbor.toString() );
    });
});
