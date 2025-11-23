"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const web3_js_1 = require("@solana/web3.js");
const dotenv_1 = __importDefault(require("dotenv"));
const dex_parser_1 = require("../dex-parser");
dotenv_1.default.config();
const tests = [
    [
        {
            "type": "cancelOrder",
            "programId": "j1o2qRpjcyUwEvwtcfhEQefh773ZgjxcVRry7LDqg5X",
            "info": {
                "authority": "69aq5LxYg5QsEw4x3xMm89ubDWYF1PtR6dW13YoovaG4",
                "source": "HunAXXXoYrkz7tBHnDmeg5yjwvzkyri2Pen8Z76u4bmo",
                "destination": "DW5Rvpy2g1jFPftivnqHLgesdFsyoxAA12xzkLTKepFQ",
                "destinationOwner": "HorYvNnZeHwrSW3T9NBFJhd4yJyuDwgz38Aw43zt8uz",
                "mint": "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
                "tokenAmount": {
                    "amount": "30000000",
                    "uiAmount": 30,
                    "decimals": 6
                },
                "destinationBalance": {
                    "amount": "417901120",
                    "decimals": 6,
                    "uiAmount": 417.90112,
                    "uiAmountString": "417.90112"
                },
                "destinationPreBalance": {
                    "amount": "207901120",
                    "decimals": 6,
                    "uiAmount": 207.90112,
                    "uiAmountString": "207.90112"
                }
            },
            "idx": "3-0",
            "timestamp": 1746861920,
            "signature": "4ciwk55AB5jjV3YrZX6heuDMPgEyN1Hp8PAfFCRzDUWJKn9R4CraUJsXkTK7sseCjV2imJd63SdQvr6KoWh8Dvgm"
        },
        {
            "type": "cancelOrder",
            "programId": "j1o2qRpjcyUwEvwtcfhEQefh773ZgjxcVRry7LDqg5X",
            "info": {
                "authority": "69aq5LxYg5QsEw4x3xMm89ubDWYF1PtR6dW13YoovaG4",
                "source": "HunAXXXoYrkz7tBHnDmeg5yjwvzkyri2Pen8Z76u4bmo",
                "destination": "HorYvNnZeHwrSW3T9NBFJhd4yJyuDwgz38Aw43zt8uz",
                "mint": "So11111111111111111111111111111111111111112",
                "tokenAmount": {
                    "amount": "27584176",
                    "uiAmount": 0.027584176,
                    "decimals": 9
                },
                "destinationBalance": {
                    "amount": "94504187",
                    "uiAmount": 0.094504187,
                    "decimals": 9
                },
                "destinationPreBalance": {
                    "amount": "66920011",
                    "uiAmount": 0.066920011,
                    "decimals": 9
                }
            },
            "idx": "3-0",
            "timestamp": 1746861920,
            "signature": "4ciwk55AB5jjV3YrZX6heuDMPgEyN1Hp8PAfFCRzDUWJKn9R4CraUJsXkTK7sseCjV2imJd63SdQvr6KoWh8Dvgm",
            "isFee": true
        },
        {
            "type": "cancelOrder",
            "programId": "j1o2qRpjcyUwEvwtcfhEQefh773ZgjxcVRry7LDqg5X",
            "info": {
                "authority": "6FJXnwvRqrZkbPd2EtcAAMoP2Cqiby7fkYmrFE1jhfk3",
                "source": "BRvs6kbwDYcEZWKb3qoA62vZNSUxSdQcS2drETCfwgNB",
                "destination": "DW5Rvpy2g1jFPftivnqHLgesdFsyoxAA12xzkLTKepFQ",
                "destinationOwner": "HorYvNnZeHwrSW3T9NBFJhd4yJyuDwgz38Aw43zt8uz",
                "mint": "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
                "tokenAmount": {
                    "amount": "30000000",
                    "uiAmount": 30,
                    "decimals": 6
                },
                "destinationBalance": {
                    "amount": "417901120",
                    "decimals": 6,
                    "uiAmount": 417.90112,
                    "uiAmountString": "417.90112"
                },
                "destinationPreBalance": {
                    "amount": "207901120",
                    "decimals": 6,
                    "uiAmount": 207.90112,
                    "uiAmountString": "207.90112"
                }
            },
            "idx": "5-0",
            "timestamp": 1746861920,
            "signature": "4ciwk55AB5jjV3YrZX6heuDMPgEyN1Hp8PAfFCRzDUWJKn9R4CraUJsXkTK7sseCjV2imJd63SdQvr6KoWh8Dvgm"
        },
        {
            "type": "cancelOrder",
            "programId": "j1o2qRpjcyUwEvwtcfhEQefh773ZgjxcVRry7LDqg5X",
            "info": {
                "authority": "6FJXnwvRqrZkbPd2EtcAAMoP2Cqiby7fkYmrFE1jhfk3",
                "source": "BRvs6kbwDYcEZWKb3qoA62vZNSUxSdQcS2drETCfwgNB",
                "destination": "HorYvNnZeHwrSW3T9NBFJhd4yJyuDwgz38Aw43zt8uz",
                "mint": "So11111111111111111111111111111111111111112",
                "tokenAmount": {
                    "amount": "27584176",
                    "uiAmount": 0.027584176,
                    "decimals": 9
                },
                "destinationBalance": {
                    "amount": "94504187",
                    "uiAmount": 0.094504187,
                    "decimals": 9
                },
                "destinationPreBalance": {
                    "amount": "66920011",
                    "uiAmount": 0.066920011,
                    "decimals": 9
                }
            },
            "idx": "5-0",
            "timestamp": 1746861920,
            "signature": "4ciwk55AB5jjV3YrZX6heuDMPgEyN1Hp8PAfFCRzDUWJKn9R4CraUJsXkTK7sseCjV2imJd63SdQvr6KoWh8Dvgm",
            "isFee": true
        },
        {
            "type": "cancelOrder",
            "programId": "j1o2qRpjcyUwEvwtcfhEQefh773ZgjxcVRry7LDqg5X",
            "info": {
                "authority": "GMXGS3Tiah9WjBQcr9bnUshKxeC9wFoqZ1vVXe5hSsms",
                "source": "JBSeYxZJjQimpLvbPTb75x6jkaixB7VMwbDRB4A5Tfdu",
                "destination": "DW5Rvpy2g1jFPftivnqHLgesdFsyoxAA12xzkLTKepFQ",
                "destinationOwner": "HorYvNnZeHwrSW3T9NBFJhd4yJyuDwgz38Aw43zt8uz",
                "mint": "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
                "tokenAmount": {
                    "amount": "50000000",
                    "uiAmount": 50,
                    "decimals": 6
                },
                "destinationBalance": {
                    "amount": "417901120",
                    "decimals": 6,
                    "uiAmount": 417.90112,
                    "uiAmountString": "417.90112"
                },
                "destinationPreBalance": {
                    "amount": "207901120",
                    "decimals": 6,
                    "uiAmount": 207.90112,
                    "uiAmountString": "207.90112"
                }
            },
            "idx": "7-0",
            "timestamp": 1746861920,
            "signature": "4ciwk55AB5jjV3YrZX6heuDMPgEyN1Hp8PAfFCRzDUWJKn9R4CraUJsXkTK7sseCjV2imJd63SdQvr6KoWh8Dvgm"
        },
        {
            "type": "cancelOrder",
            "programId": "j1o2qRpjcyUwEvwtcfhEQefh773ZgjxcVRry7LDqg5X",
            "info": {
                "authority": "GMXGS3Tiah9WjBQcr9bnUshKxeC9wFoqZ1vVXe5hSsms",
                "source": "JBSeYxZJjQimpLvbPTb75x6jkaixB7VMwbDRB4A5Tfdu",
                "destination": "HorYvNnZeHwrSW3T9NBFJhd4yJyuDwgz38Aw43zt8uz",
                "mint": "So11111111111111111111111111111111111111112",
                "tokenAmount": {
                    "amount": "27584176",
                    "uiAmount": 0.027584176,
                    "decimals": 9
                },
                "destinationBalance": {
                    "amount": "94504187",
                    "uiAmount": 0.094504187,
                    "decimals": 9
                },
                "destinationPreBalance": {
                    "amount": "66920011",
                    "uiAmount": 0.066920011,
                    "decimals": 9
                }
            },
            "idx": "7-0",
            "timestamp": 1746861920,
            "signature": "4ciwk55AB5jjV3YrZX6heuDMPgEyN1Hp8PAfFCRzDUWJKn9R4CraUJsXkTK7sseCjV2imJd63SdQvr6KoWh8Dvgm",
            "isFee": true
        },
        {
            "type": "cancelOrder",
            "programId": "j1o2qRpjcyUwEvwtcfhEQefh773ZgjxcVRry7LDqg5X",
            "info": {
                "authority": "E2PAVAnYGqui8uq1xc3jWQwcfQ89375ScQ4e8EYYQ6GF",
                "source": "GP9iEeLfGhHgicptSjDUhy1TPEL7cUqezB6fdKfrp3wK",
                "destination": "DW5Rvpy2g1jFPftivnqHLgesdFsyoxAA12xzkLTKepFQ",
                "destinationOwner": "HorYvNnZeHwrSW3T9NBFJhd4yJyuDwgz38Aw43zt8uz",
                "mint": "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
                "tokenAmount": {
                    "amount": "50000000",
                    "uiAmount": 50,
                    "decimals": 6
                },
                "destinationBalance": {
                    "amount": "417901120",
                    "decimals": 6,
                    "uiAmount": 417.90112,
                    "uiAmountString": "417.90112"
                },
                "destinationPreBalance": {
                    "amount": "207901120",
                    "decimals": 6,
                    "uiAmount": 207.90112,
                    "uiAmountString": "207.90112"
                }
            },
            "idx": "9-0",
            "timestamp": 1746861920,
            "signature": "4ciwk55AB5jjV3YrZX6heuDMPgEyN1Hp8PAfFCRzDUWJKn9R4CraUJsXkTK7sseCjV2imJd63SdQvr6KoWh8Dvgm"
        },
        {
            "type": "cancelOrder",
            "programId": "j1o2qRpjcyUwEvwtcfhEQefh773ZgjxcVRry7LDqg5X",
            "info": {
                "authority": "E2PAVAnYGqui8uq1xc3jWQwcfQ89375ScQ4e8EYYQ6GF",
                "source": "GP9iEeLfGhHgicptSjDUhy1TPEL7cUqezB6fdKfrp3wK",
                "destination": "HorYvNnZeHwrSW3T9NBFJhd4yJyuDwgz38Aw43zt8uz",
                "mint": "So11111111111111111111111111111111111111112",
                "tokenAmount": {
                    "amount": "27584176",
                    "uiAmount": 0.027584176,
                    "decimals": 9
                },
                "destinationBalance": {
                    "amount": "94504187",
                    "uiAmount": 0.094504187,
                    "decimals": 9
                },
                "destinationPreBalance": {
                    "amount": "66920011",
                    "uiAmount": 0.066920011,
                    "decimals": 9
                }
            },
            "idx": "9-0",
            "timestamp": 1746861920,
            "signature": "4ciwk55AB5jjV3YrZX6heuDMPgEyN1Hp8PAfFCRzDUWJKn9R4CraUJsXkTK7sseCjV2imJd63SdQvr6KoWh8Dvgm",
            "isFee": true
        },
        {
            "type": "cancelOrder",
            "programId": "j1o2qRpjcyUwEvwtcfhEQefh773ZgjxcVRry7LDqg5X",
            "info": {
                "authority": "6w3wES3GMKj12iotcKRfNRgvWcbeKZbnBTu43CJvMpNr",
                "source": "8X74Vj4Noh96TT97QQQdrbDru7Xmq6aBmAKZAAfcPZcA",
                "destination": "DW5Rvpy2g1jFPftivnqHLgesdFsyoxAA12xzkLTKepFQ",
                "destinationOwner": "HorYvNnZeHwrSW3T9NBFJhd4yJyuDwgz38Aw43zt8uz",
                "mint": "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
                "tokenAmount": {
                    "amount": "50000000",
                    "uiAmount": 50,
                    "decimals": 6
                },
                "destinationBalance": {
                    "amount": "417901120",
                    "decimals": 6,
                    "uiAmount": 417.90112,
                    "uiAmountString": "417.90112"
                },
                "destinationPreBalance": {
                    "amount": "207901120",
                    "decimals": 6,
                    "uiAmount": 207.90112,
                    "uiAmountString": "207.90112"
                }
            },
            "idx": "11-0",
            "timestamp": 1746861920,
            "signature": "4ciwk55AB5jjV3YrZX6heuDMPgEyN1Hp8PAfFCRzDUWJKn9R4CraUJsXkTK7sseCjV2imJd63SdQvr6KoWh8Dvgm"
        },
        {
            "type": "cancelOrder",
            "programId": "j1o2qRpjcyUwEvwtcfhEQefh773ZgjxcVRry7LDqg5X",
            "info": {
                "authority": "6w3wES3GMKj12iotcKRfNRgvWcbeKZbnBTu43CJvMpNr",
                "source": "8X74Vj4Noh96TT97QQQdrbDru7Xmq6aBmAKZAAfcPZcA",
                "destination": "HorYvNnZeHwrSW3T9NBFJhd4yJyuDwgz38Aw43zt8uz",
                "mint": "So11111111111111111111111111111111111111112",
                "tokenAmount": {
                    "amount": "27584176",
                    "uiAmount": 0.027584176,
                    "decimals": 9
                },
                "destinationBalance": {
                    "amount": "94504187",
                    "uiAmount": 0.094504187,
                    "decimals": 9
                },
                "destinationPreBalance": {
                    "amount": "66920011",
                    "uiAmount": 0.066920011,
                    "decimals": 9
                }
            },
            "idx": "11-0",
            "timestamp": 1746861920,
            "signature": "4ciwk55AB5jjV3YrZX6heuDMPgEyN1Hp8PAfFCRzDUWJKn9R4CraUJsXkTK7sseCjV2imJd63SdQvr6KoWh8Dvgm",
            "isFee": true
        }
    ],
    [
        {
            "type": "initializeOrder",
            "programId": "j1o2qRpjcyUwEvwtcfhEQefh773ZgjxcVRry7LDqg5X",
            "info": {
                "authority": "E4qe2XfHQ5AKVdPU33MugNPD2T6RgnzqH2QFP9b7J1Wy",
                "source": "9yfUqgUaMpDQuimfEKPStbo6PcL5Wrbot1K5CV25P94Q",
                "destination": "7w3MPg1mypPsRLRztcqR7gQ6mdVXTSbKYsozEKXCG4bz",
                "mint": "So11111111111111111111111111111111111111112",
                "tokenAmount": {
                    "amount": "300000000",
                    "uiAmount": 0.3,
                    "decimals": 9
                },
                "sourceBalance": {
                    "amount": "68310005",
                    "uiAmount": 0.068310005,
                    "decimals": 9
                },
                "sourcePreBalance": {
                    "amount": "373876285",
                    "uiAmount": 0.373876285,
                    "decimals": 9
                }
            },
            "idx": "5-7",
            "timestamp": 1733745610,
            "signature": "2Y2GZ3WydaReL5ujWLLXL58n77fof9Bq9DAX8ahz55UU5K8RrZmVjqnWthVPYHd8iZT9hvnCndda4htGegnaf2Lu"
        }
    ],
    [
        {
            "type": "cancelOrder",
            "programId": "j1o2qRpjcyUwEvwtcfhEQefh773ZgjxcVRry7LDqg5X",
            "info": {
                "authority": "BzGkFrx74frShAURpXJshVAkWQReT4vn6Hktn1XboNFw",
                "source": "GkE3Q3r7SGxrEhx3dqSc88kcL2b8cjuFzWwxLBU4yi7E",
                "destination": "529tkaVaNkGw4eAG8Xd6TpTyNuzvetQVz8z7q5BqosgW",
                "mint": "So11111111111111111111111111111111111111112",
                "tokenAmount": {
                    "amount": "10005513850",
                    "uiAmount": 10.00551385,
                    "decimals": 9
                },
                "destinationBalance": {
                    "amount": "25289189802",
                    "uiAmount": 25.289189802,
                    "decimals": 9
                },
                "destinationPreBalance": {
                    "amount": "15283675952",
                    "uiAmount": 15.283675952,
                    "decimals": 9
                }
            },
            "idx": "2-0",
            "timestamp": 1746864043,
            "signature": "3UEVGvkLRyBKveR6eQvqcf2Dq4tHKVt5ic92uBKgST5ptS1Mdx2oi6M3xYSroXHiD2o3AfMcVDQF4NoCwJqBd4hC"
        }
    ],
    [
        {
            "type": "cancelOrder",
            "programId": "j1o2qRpjcyUwEvwtcfhEQefh773ZgjxcVRry7LDqg5X",
            "info": {
                "authority": "4qTDSNLMMY8uxCniWxhs7S267yVJPJqLy3Zn52RY2wFT",
                "source": "B18d9svDby8JPx2Ns5pA6Xt1TzgAh1wLfdNjYryqWJcb",
                "destination": "A94YL4cb8sKuokSFVdJNmJbgrcoAmquSSzuofdVFNMUq",
                "destinationOwner": "28L3a4GupveucQEAwY5PDVcYLjRCwEH8fYQ96N8RBRgV",
                "mint": "27G8MtK7VtTcCHkpASjSDdkWWYfoqT6ggEuKidVJidD4",
                "tokenAmount": {
                    "amount": "41384036",
                    "uiAmount": 41.384036,
                    "decimals": 6
                },
                "destinationBalance": {
                    "amount": "545501609",
                    "decimals": 6,
                    "uiAmount": 545.501609,
                    "uiAmountString": "545.501609"
                },
                "destinationPreBalance": {
                    "amount": "504117573",
                    "decimals": 6,
                    "uiAmount": 504.117573,
                    "uiAmountString": "504.117573"
                }
            },
            "idx": "3-0",
            "timestamp": 1746867592,
            "signature": "DZoHM9tqV82q3R4MHEejBMFzLs8SeKGqQGcQExUqQXwPhfe661LmzRVAw5vHK9Yf8PvBYNxza8FHzBFUZo133Yp"
        },
        {
            "type": "cancelOrder",
            "programId": "j1o2qRpjcyUwEvwtcfhEQefh773ZgjxcVRry7LDqg5X",
            "info": {
                "authority": "4qTDSNLMMY8uxCniWxhs7S267yVJPJqLy3Zn52RY2wFT",
                "source": "B18d9svDby8JPx2Ns5pA6Xt1TzgAh1wLfdNjYryqWJcb",
                "destination": "28L3a4GupveucQEAwY5PDVcYLjRCwEH8fYQ96N8RBRgV",
                "mint": "So11111111111111111111111111111111111111112",
                "tokenAmount": {
                    "amount": "5513430",
                    "uiAmount": 0.00551343,
                    "decimals": 9
                },
                "destinationBalance": {
                    "amount": "104408557",
                    "uiAmount": 0.104408557,
                    "decimals": 9
                },
                "destinationPreBalance": {
                    "amount": "98895127",
                    "uiAmount": 0.098895127,
                    "decimals": 9
                }
            },
            "idx": "3-0",
            "timestamp": 1746867592,
            "signature": "DZoHM9tqV82q3R4MHEejBMFzLs8SeKGqQGcQExUqQXwPhfe661LmzRVAw5vHK9Yf8PvBYNxza8FHzBFUZo133Yp",
            "isFee": true
        }
    ]
];
describe('Jupiter Limit Order v2 Transfers', () => {
    let connection;
    beforeAll(async () => {
        // Initialize connection
        const rpcUrl = process.env.SOLANA_RPC_URL;
        if (!rpcUrl) {
            throw new Error('SOLANA_RPC_URL environment variable is not set');
        }
        connection = new web3_js_1.Connection(rpcUrl);
    });
    Object.values(tests)
        .forEach((testItem) => {
        const test = testItem[0];
        it(`${test.type} > ${test.programId} > ${test.signature} `, async () => {
            const tx = await connection.getTransaction(test.signature, {
                maxSupportedTransactionVersion: 0,
            });
            if (!tx)
                throw new Error('Transaction not found');
            const parser = new dex_parser_1.DexParser();
            const { transfers } = parser.parseAll(tx, test.timestamp);
            console.log('transfers', JSON.stringify(transfers, null, 2));
            expect(transfers.length).toEqual(testItem.length);
            testItem.forEach((item, idx) => {
                const transfer = transfers[idx];
                if (!transfer)
                    throw new Error('Transfer not found');
                expect(transfer.type).toEqual(item.type);
                expect(transfer.programId).toEqual(item.programId);
                expect(transfer.info.mint).toEqual(item.info.mint);
                expect(transfer.info.tokenAmount.amount).toEqual(item.info.tokenAmount.amount);
                expect(transfer.info.tokenAmount.uiAmount).toEqual(item.info.tokenAmount.uiAmount);
                expect(transfer.info.tokenAmount.decimals).toEqual(item.info.tokenAmount.decimals);
                expect(transfer.info.source).toEqual(item.info.source);
                expect(transfer.info.destination).toEqual(item.info.destination);
                expect(transfer.timestamp).toEqual(item.timestamp);
                expect(transfer.signature).toEqual(item.signature);
                expect(transfer.idx).toEqual(item.idx);
            });
        });
    });
});
//# sourceMappingURL=parse-jupiter-limit-v2.test.js.map