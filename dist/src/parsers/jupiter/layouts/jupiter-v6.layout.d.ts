import { JupiterSwapEvent } from '../../../types/jupiter';
export declare class JupiterSwapLayout {
    amm: Uint8Array;
    inputMint: Uint8Array;
    inputAmount: bigint;
    outputMint: Uint8Array;
    outputAmount: bigint;
    constructor(fields: {
        amm: Uint8Array;
        inputMint: Uint8Array;
        inputAmount: bigint;
        outputMint: Uint8Array;
        outputAmount: bigint;
    });
    static schema: Map<typeof JupiterSwapLayout, {
        kind: string;
        fields: (string | number[])[][];
    }>;
    toSwapEvent(): JupiterSwapEvent;
}
