import { ToData } from "@harmoniclabs/plutus-data";

export type ToDataVersion = "v1" | "v2" | "v3";

export const defaultToDataVersion: ToDataVersion = "v3";

export function definitelyToDataVersion( maybe?: ToDataVersion | undefined ): ToDataVersion
{
    return typeof maybe === "string" ? maybe : defaultToDataVersion;
}