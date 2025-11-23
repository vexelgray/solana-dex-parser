import { PublicKey } from '@solana/web3.js';
export interface JupiterSwapEvent {
    amm: PublicKey;
    inputMint: PublicKey;
    inputAmount: bigint;
    outputMint: PublicKey;
    outputAmount: bigint;
}
export interface JupiterSwapEventData extends JupiterSwapEvent {
    inputMintDecimals: number;
    outputMintDecimals: number;
    idx: string;
}
export interface JupiterSwapInfo {
    amms: string[];
    tokenIn: Map<string, bigint>;
    tokenOut: Map<string, bigint>;
    decimals: Map<string, number>;
    idx: string;
}
