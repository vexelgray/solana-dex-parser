"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const web3_js_1 = require("@solana/web3.js");
const dotenv_1 = __importDefault(require("dotenv"));
const dex_parser_1 = require("../dex-parser");
dotenv_1.default.config();
const tests = {
    CREATE: [
        [
            {
                user: 'Hn1MyYYiynSCP2WLBMFxgwNJeAheVAfbXD92mFWKY39E',
                type: 'CREATE',
                programId: 'cpamdpZCGKUy5JxQXB4dcpGPiikHawvSWAd6mEn1sGG',
                amm: 'MeteoraDammV2',
                slot: 339064117,
                timestamp: 1746871454,
                signature: '3874qjiBkmSNk3rRMEst2fAfwSx9jPNNi3sCcFBxETzEYxpPeRnU9emKz26M2x3ttxJGJmjV4ctZziQMFmDgKBkZ',
                idx: '3',
                poolId: '65xR8hF9DVBZ2V7CoWNmAQ5YRE9XWJE6HGomHcLQnQ7e',
                poolLpMint: 'AwCc8Q85v5RMLKC4GKr4JcWuNfUqapNs4hDy7T3K17Zd',
                token0Mint: 'ArP293mAg3ons5UQtAnesqCrTBGSuUyxuE6hZWfPpump',
                token1Mint: 'So11111111111111111111111111111111111111112',
                token0Amount: 737317.749263,
                token0AmountRaw: '737317749263',
                token1Amount: 0.502886096,
                token1AmountRaw: '502886096',
                token0Decimals: 6,
                token1Decimals: 9,
                lpAmount: 0,
                lpAmountRaw: undefined
            }
        ],
        [
            {
                user: 'HYPyoNqTTqqJ1QsamFdsBpKzqmEcbBXZqkYysWVuKzVS',
                type: 'CREATE',
                programId: 'cpamdpZCGKUy5JxQXB4dcpGPiikHawvSWAd6mEn1sGG',
                amm: 'MeteoraDammV2',
                slot: 335864495,
                timestamp: 1745607428,
                signature: '3qiyKhA1zXD6Mvu7sxDfi8CpY5pfGhTJbRSjSPdsTmmr5kapM4EMYfqyWvAWxVLeUa53BtbxxxXMEar3wbDtaD9r',
                idx: '4',
                poolId: '8g9K8u5U1HxhvM7M6Mv8jq8p8NpVGRLUB6Gi6D46QbPG',
                poolLpMint: 'Gi2U3vpWeE7ge6GNEEFkcbkcnDixy9vnSXQ7iutuTebm',
                token0Mint: 'GVDaS4pKd7GAmtPd8oDy98ksqfuKbKd29HiTTwRoiMzr',
                token1Mint: 'So11111111111111111111111111111111111111112',
                token0Amount: 197482850,
                token0AmountRaw: '197482850000000014',
                token1Amount: 78.9931396,
                token1AmountRaw: '78993139600',
                token0Decimals: 9,
                token1Decimals: 9,
                lpAmount: 1,
                lpAmountRaw: '1'
            }
        ],
        [
            {
                user: '9PDNMpu6XbiCWscsbZ8m5A49gWa1vVftH8MiAAELNh25',
                type: 'CREATE',
                programId: 'cpamdpZCGKUy5JxQXB4dcpGPiikHawvSWAd6mEn1sGG',
                amm: 'MeteoraDammV2',
                slot: 339006535,
                timestamp: 1746848820,
                signature: '5A4t1CD7GwU6yPyzG9tDbyKkBAKTQpWaWL1Lc7LaXvh5ypAWoqmLuRM8TFJ1GkZhvveYvFc3HeGntNSGqQmZhoTg',
                idx: '2',
                poolId: '6Xzp9hP9mwabA7bWvRXwWuKeZ6YrLgUbtoY4sA87zmbx',
                poolLpMint: 'GgNM84L3Q86euzkpChLxqKHfiLWeDnMUiSwz6CE1Le4D',
                token0Mint: '6zrwCY2XE9RLL78gTQmAQfczT1XsVXmB9WQW2TawBunj',
                token1Mint: 'So11111111111111111111111111111111111111112',
                token0Amount: 1000000000,
                token0AmountRaw: '1000000000',
                token1Amount: 0,
                token1AmountRaw: '0',
                token0Decimals: 0,
                token1Decimals: 9,
                lpAmount: 1,
                lpAmountRaw: '1'
            }
        ]
    ],
    ADD: [
        [
            {
                user: 'DwuKDPu6wpVhq1SsZuD2CSqhVrmziZzXkGmwRDB59vDo',
                type: 'ADD',
                programId: 'cpamdpZCGKUy5JxQXB4dcpGPiikHawvSWAd6mEn1sGG',
                amm: 'MeteoraDammV2',
                slot: 339063010,
                timestamp: 1746871019,
                signature: '3qCwS4QxAF9E3SCiMGk8j2wWsTve4AYVbwcXUzYxB4H4xmyGJsahDUmbAY4oo16YSQXozvY4VsnyTZ8dmm4jAaso',
                idx: '1',
                poolId: 'DiQWNk7aLpfF5XNwwfWfWVoSvzsSonz9B4unwW7CFsAB',
                poolLpMint: '8Z6JW82mqVP3hagctHPhPE3UWsMe8g6eWCCvNxieVX42',
                token0Mint: 'Cf1ZjYZi5UPbAyC7LhLkJYvebxrwam4AWVacymaBbonk',
                token1Mint: 'CDBdbNqmrLu1PcgjrFG52yxg71QnFhBZcUE6PSFdbonk',
                token0Amount: 23190961.833072,
                token0AmountRaw: '23190961833072',
                token1Amount: 67.012807,
                token1AmountRaw: '67012807',
                token0Decimals: 6,
                token1Decimals: 6
            }
        ],
        [
            {
                user: 'GMtwcuktJfrRcnyGktWW4Vab8cfjPcBy3xbuZgRegw6E',
                type: 'ADD',
                programId: 'cpamdpZCGKUy5JxQXB4dcpGPiikHawvSWAd6mEn1sGG',
                amm: 'MeteoraDammV2',
                slot: 339038373,
                timestamp: 1746861357,
                signature: '59mLJKYYhqauwRCrTRqoQGfF3aucjtf7MZ9MvbxTRuV7Nt1eBGXn3XdrcYMqqvYfSY3wSHHUVg918rUiDJ2vLqEk',
                idx: '5',
                poolId: '8g9K8u5U1HxhvM7M6Mv8jq8p8NpVGRLUB6Gi6D46QbPG',
                poolLpMint: '2WwBCZyfBV2QS1im6A7pwnvo6vJQkn2CQE55XkT4cfXJ',
                token0Mint: 'GVDaS4pKd7GAmtPd8oDy98ksqfuKbKd29HiTTwRoiMzr',
                token1Mint: 'So11111111111111111111111111111111111111112',
                token0Amount: 104.044154629,
                token0AmountRaw: '104044154629',
                token1Amount: 0.000440912,
                token1AmountRaw: '440912',
                token0Decimals: 9,
                token1Decimals: 9
            }
        ]
    ],
    REMOVE: [
        [
            {
                user: '3kY331sSeL5szGUQmBkbRDAsVsAFe3HxzHLDZeyHBSs7',
                type: 'REMOVE',
                programId: 'cpamdpZCGKUy5JxQXB4dcpGPiikHawvSWAd6mEn1sGG',
                amm: 'MeteoraDammV2',
                slot: 338955181,
                timestamp: 1746828630,
                signature: '5S7ikDVhmBxHiRoVxCECYr9NZzXgoUaJKxSNmqcvfDTVh2FVnCQfyo8sQoUcFdAjBgGNsSHYCBD8vadhf7k2kQ3w',
                idx: '1',
                poolId: '7U2CcTGM2qPXfhRi2XytcWPXYP6nRkNaNyFaB93uBXxb',
                poolLpMint: '6ma9rRg97qCM2WEgkbH6UfjtR2YLkTBRZqpLpScgxVSH',
                token0Mint: '7C5SPivzYtk2umHScjLXN7WZnstLFf1r5TCsMNaTpump',
                token1Mint: 'So11111111111111111111111111111111111111112',
                token0Amount: 10385.838519,
                token0AmountRaw: '10385838519',
                token1Amount: 0.056694087,
                token1AmountRaw: '56694087',
                token0Decimals: 6,
                token1Decimals: 9
            },
            {
                user: '3kY331sSeL5szGUQmBkbRDAsVsAFe3HxzHLDZeyHBSs7',
                type: 'REMOVE',
                programId: 'cpamdpZCGKUy5JxQXB4dcpGPiikHawvSWAd6mEn1sGG',
                amm: 'MeteoraDammV2',
                slot: 338955181,
                timestamp: 1746828630,
                signature: '5S7ikDVhmBxHiRoVxCECYr9NZzXgoUaJKxSNmqcvfDTVh2FVnCQfyo8sQoUcFdAjBgGNsSHYCBD8vadhf7k2kQ3w',
                idx: '2',
                poolId: '7U2CcTGM2qPXfhRi2XytcWPXYP6nRkNaNyFaB93uBXxb',
                poolLpMint: '6ma9rRg97qCM2WEgkbH6UfjtR2YLkTBRZqpLpScgxVSH',
                token0Mint: '7C5SPivzYtk2umHScjLXN7WZnstLFf1r5TCsMNaTpump',
                token1Mint: 'So11111111111111111111111111111111111111112',
                token0Amount: 28880994.227987,
                token0AmountRaw: '28880994227987',
                token1Amount: 36.532330648,
                token1AmountRaw: '36532330648',
                token0Decimals: 6,
                token1Decimals: 9
            }
        ],
    ],
};
describe('Liquidity', () => {
    let connection;
    beforeAll(async () => {
        // Initialize connection
        const rpcUrl = process.env.SOLANA_RPC_URL;
        if (!rpcUrl) {
            throw new Error('SOLANA_RPC_URL environment variable is not set');
        }
        connection = new web3_js_1.Connection(rpcUrl);
    });
    describe('Meteora DAMM', () => {
        Object.values(tests)
            .flat()
            .forEach((testItem) => {
            const test = testItem[0];
            it(`${test.type} > ${test.amm} > ${test.signature} `, async () => {
                const tx = await connection.getTransaction(test.signature, {
                    maxSupportedTransactionVersion: 0,
                });
                if (!tx)
                    throw new Error('Transaction not found');
                const parser = new dex_parser_1.DexParser();
                const { liquidities } = parser.parseAll(tx);
                expect(liquidities.length).toEqual(testItem.length);
                testItem.forEach((item, idx) => {
                    const liquidity = liquidities[idx];
                    expect(liquidity.user).toEqual(item.user);
                    expect(liquidity.programId).toEqual(item.programId);
                    expect(liquidity.amm).toEqual(item.amm);
                    expect(liquidity.type).toEqual(item.type);
                    expect(liquidity.poolId).toEqual(item.poolId);
                    expect(liquidity.token0Mint).toEqual(item.token0Mint);
                    expect(liquidity.token0Amount).toEqual(item.token0Amount);
                    expect(liquidity.token1Mint).toEqual(item.token1Mint);
                    expect(liquidity.token1Amount).toEqual(item.token1Amount);
                    expect(liquidity.token0Decimals).toEqual(item.token0Decimals);
                    expect(liquidity.token1Decimals).toEqual(item.token1Decimals);
                    expect(liquidity.signature).toEqual(item.signature);
                });
            });
        });
    });
});
//# sourceMappingURL=liquidity-meteora-damm.test.js.map