import { isObject } from "@harmoniclabs/obj-utils";
import { GovActionInfo, isIGovActionInfo } from "../GovActionInfo";
import { GovActionLike, isGovActionLike } from "../GovActionLike";
import { GovActionType } from "../GovActionType";


describe("isGovActionLike", () => {

    function testTrue( govActionLike: GovActionLike )
    {
        const govActionLikeStr = typeof govActionLike.govActionType === "number" ?
            GovActionType[govActionLike.govActionType] :
            String(govActionLike);
        test(govActionLikeStr, () => {
            expect( isGovActionLike( govActionLike ) ).toBe( true );
        });
    }

    testTrue( new GovActionInfo() );

});