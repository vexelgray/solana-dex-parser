export declare class JupiterVAFillLayout {
    valueAverage: Uint8Array;
    user: Uint8Array;
    keeper: Uint8Array;
    inputMint: Uint8Array;
    outputMint: Uint8Array;
    inputAmount: bigint;
    outputAmount: bigint;
    fee: bigint;
    newActualUsdcValue: bigint;
    supposedUsdcValue: bigint;
    value: bigint;
    inLeft: bigint;
    inUsed: bigint;
    outReceived: bigint;
    constructor(fields: {
        valueAverage: Uint8Array;
        user: Uint8Array;
        keeper: Uint8Array;
        inputMint: Uint8Array;
        outputMint: Uint8Array;
        inputAmount: bigint;
        outputAmount: bigint;
        fee: bigint;
        newActualUsdcValue: bigint;
        supposedUsdcValue: bigint;
        value: bigint;
        inLeft: bigint;
        inUsed: bigint;
        outReceived: bigint;
    });
    static schema: Map<typeof JupiterVAFillLayout, {
        kind: string;
        fields: (string | number[])[][];
    }>;
    toObject(): {
        valueAverage: string;
        user: string;
        keeper: string;
        inputMint: string;
        outputMint: string;
        inputAmount: bigint;
        outputAmount: bigint;
        fee: bigint;
        newActualUsdcValue: bigint;
        supposedUsdcValue: bigint;
        value: bigint;
        inLeft: bigint;
        inUsed: bigint;
        outReceived: bigint;
    };
}
export declare class JupiterVAOpenLayout {
    user: Uint8Array;
    valueAverage: Uint8Array;
    deposit: bigint;
    inputMint: Uint8Array;
    outputMint: Uint8Array;
    referralFeeAccount: Uint8Array;
    orderInterval: bigint;
    incrementUsdcValue: bigint;
    createdAt: bigint;
    constructor(fields: {
        user: Uint8Array;
        valueAverage: Uint8Array;
        deposit: bigint;
        inputMint: Uint8Array;
        outputMint: Uint8Array;
        referralFeeAccount: Uint8Array;
        orderInterval: bigint;
        incrementUsdcValue: bigint;
        createdAt: bigint;
    });
    static schema: Map<typeof JupiterVAOpenLayout, {
        kind: string;
        fields: (string | number[])[][];
    }>;
    static deserialize(data: Buffer): JupiterVAOpenLayout;
    toObject(): {
        user: string;
        valueAverage: string;
        deposit: bigint;
        inputMint: string;
        outputMint: string;
        referralFeeAccount: string;
        orderInterval: bigint;
        incrementUsdcValue: bigint;
        createdAt: bigint;
    };
}
export declare class JupiterVADepositLayout {
    depositor: Uint8Array;
    valueAverage: Uint8Array;
    mint: Uint8Array;
    amount: bigint;
    inDeposited: bigint;
    inLeft: bigint;
    constructor(fields: {
        depositor: Uint8Array;
        valueAverage: Uint8Array;
        mint: Uint8Array;
        amount: bigint;
        inDeposited: bigint;
        inLeft: bigint;
    });
    static schema: Map<typeof JupiterVADepositLayout, {
        kind: string;
        fields: (string | number[])[][];
    }>;
    toObject(): {
        depositor: string;
        valueAverage: string;
        mint: string;
        amount: bigint;
        inDeposited: bigint;
        inLeft: bigint;
    };
}
export declare class JupiterVAWithdrawLayout {
    valueAverage: Uint8Array;
    mint: Uint8Array;
    amount: bigint;
    inOrOut: string;
    userWithdraw: boolean;
    inLeft: bigint;
    inWithdrawn: bigint;
    outWithdrawn: bigint;
    constructor(fields: {
        valueAverage: Uint8Array;
        mint: Uint8Array;
        amount: bigint;
        inOrOut: string;
        userWithdraw: boolean;
        inLeft: bigint;
        inWithdrawn: bigint;
        outWithdrawn: bigint;
    });
    static deserialize(data: Buffer): JupiterVAWithdrawLayout;
    toObject(): {
        valueAverage: string;
        mint: string;
        amount: bigint;
        inOrOut: string;
        userWithdraw: boolean;
        inLeft: bigint;
        inWithdrawn: bigint;
        outWithdrawn: bigint;
    };
}
export declare class JupiterVACloseLayout {
    user: Uint8Array;
    valueAverage: Uint8Array;
    createdAt: bigint;
    closedAt: bigint;
    executor: Uint8Array;
    constructor(fields: {
        user: Uint8Array;
        valueAverage: Uint8Array;
        createdAt: bigint;
        closedAt: bigint;
        executor: Uint8Array;
    });
    static schema: Map<typeof JupiterVACloseLayout, {
        kind: string;
        fields: (string | number[])[][];
    }>;
    toObject(): {
        user: string;
        valueAverage: string;
        createdAt: bigint;
        closedAt: bigint;
        executor: string;
    };
}
