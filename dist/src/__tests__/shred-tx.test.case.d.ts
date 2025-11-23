export declare const txs: {
    skipTest: boolean;
    filters: string[];
    transaction: {
        transaction: {
            signatures: {
                type: string;
                data: number[];
            }[];
            message: {
                header: {
                    numRequiredSignatures: number;
                    numReadonlySignedAccounts: number;
                    numReadonlyUnsignedAccounts: number;
                };
                accountKeys: {
                    type: string;
                    data: number[];
                }[];
                recentBlockhash: {
                    type: string;
                    data: number[];
                };
                instructions: ({
                    programIdIndex: number;
                    accounts: {
                        type: string;
                        data: number[];
                    };
                    data: {
                        type: string;
                        data: number[];
                    };
                } | {
                    programIdIndex: number;
                    accounts: {
                        type?: undefined;
                        data?: undefined;
                    };
                    data: {
                        type: string;
                        data: number[];
                    };
                })[];
                versioned: boolean;
                addressTableLookups: ({
                    accountKey: {
                        type: string;
                        data: number[];
                    };
                    writableIndexes: {
                        type: string;
                        data: number[];
                    };
                    readonlyIndexes: {
                        type?: undefined;
                        data?: undefined;
                    };
                } | {
                    accountKey: {
                        type: string;
                        data: number[];
                    };
                    writableIndexes: {
                        type: string;
                        data: number[];
                    };
                    readonlyIndexes: {
                        type: string;
                        data: number[];
                    };
                } | {
                    accountKey: {
                        type: string;
                        data: number[];
                    };
                    writableIndexes: {
                        type?: undefined;
                        data?: undefined;
                    };
                    readonlyIndexes: {
                        type: string;
                        data: number[];
                    };
                })[];
            };
        };
        slot: string;
    };
    createdAt: string;
}[];
