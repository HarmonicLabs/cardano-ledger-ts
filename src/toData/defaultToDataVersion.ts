import { ToData } from "@harmoniclabs/plutus-data";

type NotUndefined<T> = Exclude<T, undefined>;
type MaybeToDataVersion = Parameters<ToData["toData"]>[0];
type ToDataVersion = NotUndefined<MaybeToDataVersion>

export const defaultToDataVersion: ToDataVersion = "v2";

export function definitelyToDataVersion( maybe: MaybeToDataVersion ): ToDataVersion
{
    return typeof maybe === "string" ? maybe : defaultToDataVersion;
}