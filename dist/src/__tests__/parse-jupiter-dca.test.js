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
    {
        "type": "OpenDca",
        "programId": "DCA265Vj8a9CEuX1eb1LWRnDT7uK6q1xMipnNyatn23M",
        "info": {
            "source": "E4qe2XfHQ5AKVdPU33MugNPD2T6RgnzqH2QFP9b7J1Wy",
            "destination": "tSJjJ8TtRTe4KZVCezs1vNBw5WS9AFZkA5gJqTtgYvr",
            "mint": "So11111111111111111111111111111111111111112",
            "tokenAmount": {
                "amount": "-509072160",
                "uiAmount": -0.50907216,
                "decimals": 9
            },
            "sourceBalance": {
                "amount": "490937840",
                "uiAmount": 0.49093784,
                "decimals": 9
            },
            "sourcePreBalance": {
                "amount": "1000010000",
                "uiAmount": 1.00001,
                "decimals": 9
            }
        },
        "idx": "5-0",
        "timestamp": 1733744710,
        "signature": "4PvkHqhgTJa61cChu52gCyPcBK1rXGoKSJk4vRStXteXNTvuw7o9VoH5aqAgoYKGjQWSVdNvpwfEbDvHi7tZQZqw"
    },
    {
        "type": "CloseDca",
        "programId": "DCA265Vj8a9CEuX1eb1LWRnDT7uK6q1xMipnNyatn23M",
        "info": {
            "destination": "E4qe2XfHQ5AKVdPU33MugNPD2T6RgnzqH2QFP9b7J1Wy",
            "mint": "So11111111111111111111111111111111111111112",
            "source": "tSJjJ8TtRTe4KZVCezs1vNBw5WS9AFZkA5gJqTtgYvr",
            "tokenAmount": {
                "amount": "256931275",
                "uiAmount": 0.256931275,
                "decimals": 9
            },
            "destinationBalance": {
                "amount": "747869515",
                "uiAmount": 0.747869515,
                "decimals": 9
            },
            "destinationPreBalance": {
                "amount": "490938240",
                "uiAmount": 0.49093824,
                "decimals": 9
            }
        },
        "idx": "0-0",
        "timestamp": 1733744880,
        "signature": "2oSCggfbBGsATMvzB5CBh4aF1r7E78dox6Hc7eTkt9FW7RCKAN7stZVhTLHUA2pBadDFEBpYsgmJBmCKu5rX3wez"
    },
    {
        "type": "CloseDca",
        "programId": "DCA265Vj8a9CEuX1eb1LWRnDT7uK6q1xMipnNyatn23M",
        "info": {
            "destination": "E4qe2XfHQ5AKVdPU33MugNPD2T6RgnzqH2QFP9b7J1Wy",
            "mint": "So11111111111111111111111111111111111111112",
            "source": "HasGZUp8RFFjPhAzb9eBN12CPnj7ZpFXjZqPXD6cfptU",
            "tokenAmount": {
                "amount": "6933880",
                "uiAmount": 0.00693388,
                "decimals": 9
            },
            "destinationBalance": {
                "amount": "695568225",
                "uiAmount": 0.695568225,
                "decimals": 9
            },
            "destinationPreBalance": {
                "amount": "688634345",
                "uiAmount": 0.688634345,
                "decimals": 9
            }
        },
        "idx": "1-0",
        "timestamp": 1733746114,
        "signature": "42A1smk5Trd8cdU7Vz19E17xtWXFsypBzMLkRE6UdccHA2nyRohZoT6GNXAzviuFGLfUT9ANhxHroTFQMkxJvNCU"
    }, {
        "type": "OpenDca",
        "programId": "DCA265Vj8a9CEuX1eb1LWRnDT7uK6q1xMipnNyatn23M",
        "info": {
            "source": "ByBxpqTdJUQt5NpnJJp9GzovBmnT3hmMx1CqhtRAKaK1",
            "destination": "CfBLHEJkCUqn5LrST6ptAG96UrkjB5pfZFc98LUQUY3g",
            "mint": "So11111111111111111111111111111111111111112",
            "tokenAmount": {
                "amount": "-11985880",
                "uiAmount": -0.01198588,
                "decimals": 9
            },
            "sourceBalance": {
                "amount": "1065026245",
                "uiAmount": 1.065026245,
                "decimals": 9
            },
            "sourcePreBalance": {
                "amount": "1077012125",
                "uiAmount": 1.077012125,
                "decimals": 9
            }
        },
        "idx": "2-0",
        "timestamp": 1739688566,
        "signature": "4vL1piuminnprE9PJ7eXkxAnsvH2fQTxSya1yBdAkx6mq5M9DeeZiLwsTP565pYXoQxQziPwRzL53MDAybRVsD2A"
    },
    {
        "type": "withdraw",
        "programId": "VALaaymxQh2mNy2trH9jUqHT1mTow76wpTcGmSWSwJe",
        "info": {
            "destination": "E4qe2XfHQ5AKVdPU33MugNPD2T6RgnzqH2QFP9b7J1Wy",
            "mint": "So11111111111111111111111111111111111111112",
            "source": "7FFJfHZQ3ZSdMf3ZHNVMnTcQuWnsbVMQaJYsEWa79xGz",
            "tokenAmount": {
                "amount": "64248301",
                "decimals": 9,
                "uiAmount": 0.064248301
            },
            "sourceBalance": {
                "amount": "0",
                "uiAmount": 0,
                "decimals": 9
            },
            "sourcePreBalance": {
                "amount": "0",
                "uiAmount": 0,
                "decimals": 9
            },
            "destinationBalance": {
                "amount": "249535139",
                "uiAmount": 0.249535139,
                "decimals": 9
            },
            "destinationPreBalance": {
                "amount": "178029324",
                "uiAmount": 0.178029324,
                "decimals": 9
            }
        },
        "idx": "0-9",
        "timestamp": 1733762197,
        "signature": "2BhdRHDAtPY4Cb8qSFHZTeQXKKenTQjuoCGCBe6y45pPbEDKKPRmLo2rxiTEssU7wXMJFztRWcUQUF5s8E8XD4Wi"
    }
];
describe('Jupiter DCA Transfers', () => {
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
        .flat()
        .forEach((test) => {
        it(`${test.type} > ${test.programId} > ${test.signature} `, async () => {
            const tx = await connection.getTransaction(test.signature, {
                maxSupportedTransactionVersion: 0,
            });
            if (!tx)
                throw new Error('Transaction not found');
            const parser = new dex_parser_1.DexParser();
            const { transfers } = parser.parseAll(tx, { tryUnknowDEX: false });
            const transfer = transfers[0];
            console.log('transfers', JSON.stringify(transfers, null, 2));
            expect(transfer.type).toEqual(test.type);
            expect(transfer.programId).toEqual(test.programId);
            expect(transfer.info.mint).toEqual(test.info.mint);
            expect(transfer.info.tokenAmount.amount).toEqual(test.info.tokenAmount.amount);
            expect(transfer.info.tokenAmount.uiAmount).toEqual(test.info.tokenAmount.uiAmount);
            expect(transfer.info.tokenAmount.decimals).toEqual(test.info.tokenAmount.decimals);
            expect(transfer.info.source).toEqual(test.info.source);
            expect(transfer.info.destination).toEqual(test.info.destination);
            expect(transfer.timestamp).toEqual(test.timestamp);
            expect(transfer.signature).toEqual(test.signature);
            expect(transfer.idx).toEqual(test.idx);
        });
    });
});
//# sourceMappingURL=parse-jupiter-dca.test.js.map