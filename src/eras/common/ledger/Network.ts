
export enum Network {
    mainnet = "mainnet",
    testnet = "testnet"
}

Object.freeze( Network );

export type NetworkT = Network | "mainnet" | "testnet";