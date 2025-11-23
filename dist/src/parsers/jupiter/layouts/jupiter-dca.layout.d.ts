export declare class JupiterDCAFilledLayout {
    userKey: Uint8Array;
    dcaKey: Uint8Array;
    inputMint: Uint8Array;
    outputMint: Uint8Array;
    inAmount: bigint;
    outAmount: bigint;
    feeMint: Uint8Array;
    fee: bigint;
    constructor(fields: {
        userKey: Uint8Array;
        dcaKey: Uint8Array;
        inputMint: Uint8Array;
        outputMint: Uint8Array;
        inAmount: bigint;
        outAmount: bigint;
        feeMint: Uint8Array;
        fee: bigint;
    });
    static schema: Map<typeof JupiterDCAFilledLayout, {
        kind: string;
        fields: (string | number[])[][];
    }>;
    toObject(): {
        userKey: string;
        dcaKey: string;
        inputMint: string;
        outputMint: string;
        inAmount: bigint;
        outAmount: bigint;
        feeMint: string;
        fee: bigint;
    };
}
