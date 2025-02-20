import { isObject } from "@harmoniclabs/obj-utils";
import { IPraosHeader } from "../../common/interfaces/IPraosHeader";
import { isKesSignature, KesSignature, KesSignatureBytes } from "../../common/Kes";
import { IConwayHeaderBody } from "./ConwayHeaderBody";

/* header = [header_body, body_signature : $kes_signature] */

export interface IConwayHeader
{
    body: IConwayHeaderBody;
    kesSignature: KesSignatureBytes;
}

export function isIConwayHeader( thing: any ): thing is IConwayHeader
{
    return isObject( thing ) && (
        isIConwayHeaderBody( thing.body ) &&
        isKesSignature( thing.kesSignature )
    );
}

export class ConwayHeader
    implements IPraosHeader, IConwayHeader
{
    readonly body: IConwayHeaderBody;
    readonly kesSignature: KesSignature;
}