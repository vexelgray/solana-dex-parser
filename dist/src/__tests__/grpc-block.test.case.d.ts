export declare const blockSubscribe: {
    filters: string[];
    block: {
        slot: string;
        blockhash: string;
        rewards: {
            rewards: {
                pubkey: string;
                lamports: string;
                postBalance: string;
                rewardType: number;
                commission: string;
            }[];
        };
        blockTime: {
            timestamp: string;
        };
        blockHeight: {
            blockHeight: string;
        };
        parentSlot: string;
        parentBlockhash: string;
        executedTransactionCount: string;
        transactions: ({
            signature: string;
            isVote: boolean;
            transaction: {
                signatures: string[];
                message: {
                    header: {
                        numRequiredSignatures: number;
                        numReadonlySignedAccounts: number;
                        numReadonlyUnsignedAccounts: number;
                    };
                    accountKeys: string[];
                    recentBlockhash: string;
                    instructions: {
                        programIdIndex: number;
                        accounts: string;
                        data: string;
                    }[];
                    versioned: boolean;
                    addressTableLookups: {
                        accountKey: string;
                        writableIndexes: string;
                        readonlyIndexes: string;
                    }[];
                };
            };
            meta: {
                fee: string;
                preBalances: string[];
                postBalances: string[];
                innerInstructions: never[];
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
                loadedWritableAddresses: string[];
                loadedReadonlyAddresses: string[];
                returnDataNone: boolean;
                computeUnitsConsumed: string;
            };
            index: string;
        } | {
            signature: string;
            isVote: boolean;
            transaction: {
                signatures: string[];
                message: {
                    header: {
                        numRequiredSignatures: number;
                        numReadonlySignedAccounts: number;
                        numReadonlyUnsignedAccounts: number;
                    };
                    accountKeys: string[];
                    recentBlockhash: string;
                    instructions: {
                        programIdIndex: number;
                        accounts: string;
                        data: string;
                    }[];
                    versioned: boolean;
                    addressTableLookups: {
                        accountKey: string;
                        writableIndexes: string;
                        readonlyIndexes: string;
                    }[];
                };
            };
            meta: {
                fee: string;
                preBalances: string[];
                postBalances: string[];
                innerInstructions: {
                    index: number;
                    instructions: {
                        programIdIndex: number;
                        accounts: string;
                        data: string;
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
                loadedReadonlyAddresses: string[];
                returnDataNone: boolean;
                computeUnitsConsumed: string;
            };
            index: string;
        })[];
        updatedAccountCount: string;
        accounts: {
            pubkey: string;
            lamports: string;
            owner: string;
            executable: boolean;
            rentEpoch: string;
            data: string;
            writeVersion: string;
            txnSignature: string;
        }[];
        entriesCount: string;
        entries: never[];
    };
    createdAt: {};
};
