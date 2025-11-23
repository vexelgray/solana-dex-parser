export declare const tx: {
    filters: string[];
    account: undefined;
    slot: undefined;
    transaction: {
        transaction: {
            signature: Buffer<ArrayBuffer>;
            isVote: boolean;
            transaction: {
                signatures: Buffer<ArrayBuffer>[];
                message: {
                    header: {
                        numRequiredSignatures: number;
                        numReadonlySignedAccounts: number;
                        numReadonlyUnsignedAccounts: number;
                    };
                    accountKeys: Buffer<ArrayBuffer>[];
                    recentBlockhash: Buffer<ArrayBuffer>;
                    instructions: ({
                        programIdIndex: number;
                        accounts: Uint8Array<ArrayBuffer>;
                        data: Buffer<ArrayBuffer>;
                    } | {
                        programIdIndex: number;
                        accounts: Buffer<ArrayBuffer>;
                        data: Buffer<ArrayBuffer>;
                    })[];
                    versioned: boolean;
                    addressTableLookups: {
                        accountKey: Buffer<ArrayBuffer>;
                        writableIndexes: Buffer<ArrayBuffer>;
                        readonlyIndexes: Buffer<ArrayBuffer>;
                    }[];
                };
            };
            meta: {
                err: {
                    err: Buffer<ArrayBuffer>;
                };
                fee: string;
                preBalances: string[];
                postBalances: string[];
                innerInstructions: {
                    index: number;
                    instructions: {
                        programIdIndex: number;
                        accounts: Buffer<ArrayBuffer>;
                        data: Buffer<ArrayBuffer>;
                        stackHeight: number;
                    }[];
                }[];
                innerInstructionsNone: boolean;
                logMessages: string[];
                logMessagesNone: boolean;
                preTokenBalances: {
                    accountIndex: number;
                    mint: string;
                    uiTokenAmount: {
                        uiAmount: number;
                        decimals: number;
                        amount: string;
                        uiAmountString: string;
                    };
                    owner: string;
                    programId: string;
                }[];
                postTokenBalances: {
                    accountIndex: number;
                    mint: string;
                    uiTokenAmount: {
                        uiAmount: number;
                        decimals: number;
                        amount: string;
                        uiAmountString: string;
                    };
                    owner: string;
                    programId: string;
                }[];
                rewards: never[];
                loadedWritableAddresses: Buffer<ArrayBuffer>[];
                loadedReadonlyAddresses: Buffer<ArrayBuffer>[];
                returnData: undefined;
                returnDataNone: boolean;
                computeUnitsConsumed: string;
            };
            index: string;
        };
        slot: string;
    };
    transactionStatus: undefined;
    block: undefined;
    ping: undefined;
    pong: undefined;
    blockMeta: undefined;
    entry: undefined;
};
export declare const tx2: {
    filters: string[];
    account: undefined;
    slot: undefined;
    transaction: {
        transaction: {
            signature: Buffer<ArrayBuffer>;
            isVote: boolean;
            transaction: {
                signatures: Buffer<ArrayBuffer>[];
                message: {
                    header: {
                        numRequiredSignatures: number;
                        numReadonlySignedAccounts: number;
                        numReadonlyUnsignedAccounts: number;
                    };
                    accountKeys: Buffer<ArrayBuffer>[];
                    recentBlockhash: Buffer<ArrayBuffer>;
                    instructions: ({
                        programIdIndex: number;
                        accounts: Uint8Array<ArrayBuffer>;
                        data: Buffer<ArrayBuffer>;
                    } | {
                        programIdIndex: number;
                        accounts: Buffer<ArrayBuffer>;
                        data: Buffer<ArrayBuffer>;
                    })[];
                    versioned: boolean;
                    addressTableLookups: {
                        accountKey: Buffer<ArrayBuffer>;
                        writableIndexes: Uint8Array<ArrayBuffer>;
                        readonlyIndexes: Buffer<ArrayBuffer>;
                    }[];
                };
            };
            meta: {
                err: undefined;
                fee: string;
                preBalances: string[];
                postBalances: string[];
                innerInstructions: {
                    index: number;
                    instructions: {
                        programIdIndex: number;
                        accounts: Buffer<ArrayBuffer>;
                        data: Buffer<ArrayBuffer>;
                        stackHeight: number;
                    }[];
                }[];
                innerInstructionsNone: boolean;
                logMessages: string[];
                logMessagesNone: boolean;
                preTokenBalances: {
                    accountIndex: number;
                    mint: string;
                    uiTokenAmount: {
                        uiAmount: number;
                        decimals: number;
                        amount: string;
                        uiAmountString: string;
                    };
                    owner: string;
                    programId: string;
                }[];
                postTokenBalances: {
                    accountIndex: number;
                    mint: string;
                    uiTokenAmount: {
                        uiAmount: number;
                        decimals: number;
                        amount: string;
                        uiAmountString: string;
                    };
                    owner: string;
                    programId: string;
                }[];
                rewards: never[];
                loadedWritableAddresses: never[];
                loadedReadonlyAddresses: Buffer<ArrayBuffer>[];
                returnData: undefined;
                returnDataNone: boolean;
                computeUnitsConsumed: string;
            };
            index: string;
        };
        slot: string;
    };
    transactionStatus: undefined;
    block: undefined;
    ping: undefined;
    pong: undefined;
    blockMeta: undefined;
    entry: undefined;
};
