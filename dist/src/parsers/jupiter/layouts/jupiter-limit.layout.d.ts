export declare class JupiterLimitOrderV2TradeLayout {
    orderKey: Uint8Array;
    taker: Uint8Array;
    remainingMakingAmount: bigint;
    remainingTakingAmount: bigint;
    makingAmount: bigint;
    takingAmount: bigint;
    constructor(fields: {
        orderKey: Uint8Array;
        taker: Uint8Array;
        remainingMakingAmount: bigint;
        remainingTakingAmount: bigint;
        makingAmount: bigint;
        takingAmount: bigint;
    });
    static schema: Map<typeof JupiterLimitOrderV2TradeLayout, {
        kind: string;
        fields: (string | number[])[][];
    }>;
    toObject(): {
        orderKey: string;
        taker: string;
        remainingMakingAmount: bigint;
        remainingTakingAmount: bigint;
        makingAmount: bigint;
        takingAmount: bigint;
    };
}
export declare class JupiterLimitOrderV2CreateOrderLayout {
    orderKey: Uint8Array;
    maker: Uint8Array;
    inputMint: Uint8Array;
    outputMint: Uint8Array;
    inputTokenProgram: Uint8Array;
    outputTokenProgram: Uint8Array;
    makingAmount: bigint;
    takingAmount: bigint;
    expiredAt: bigint | null;
    feeBps: number;
    feeAccount: Uint8Array;
    constructor(fields: {
        orderKey: Uint8Array;
        maker: Uint8Array;
        inputMint: Uint8Array;
        outputMint: Uint8Array;
        inputTokenProgram: Uint8Array;
        outputTokenProgram: Uint8Array;
        makingAmount: bigint;
        takingAmount: bigint;
        expiredAt: bigint | null;
        feeBps: number;
        feeAccount: Uint8Array;
    });
    static schema: Map<typeof JupiterLimitOrderV2CreateOrderLayout, {
        kind: string;
        fields: ((string | number[])[] | (string | {
            option: string;
        })[])[];
    }>;
    static deserialize(data: Buffer): JupiterLimitOrderV2CreateOrderLayout;
    toObject(): {
        orderKey: string;
        maker: string;
        inputMint: string;
        outputMint: string;
        inputTokenProgram: string;
        outputTokenProgram: string;
        makingAmount: bigint;
        takingAmount: bigint;
        expiredAt: string | null;
        feeBps: number;
        feeAccount: string;
    };
}
