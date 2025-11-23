"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const web3_js_1 = require("@solana/web3.js");
const dotenv_1 = __importDefault(require("dotenv"));
const dex_parser_1 = require("../dex-parser");
const utils_1 = require("../utils");
dotenv_1.default.config();
const tests = [
    {
        type: 'SELL',
        inputToken: {
            mint: 'CzjoCP5QmjKGjSCcAHsn6qFcX8NpmDkmfL61GKaKpump',
            amount: 5637949.066881,
            amountRaw: '5637949066881',
            decimals: 6,
            authority: 'Fevtbxo5Bi6n8EkvkBe2tKUJu52ZrxrnVNXHgEcTGGtc',
            source: 'Dq4xmtydeWrzvJQmo6ou2S3T5twd2hvUyhcKCjaHPRT',
            destination: '9WkZzVeQVWP8fsCcPYBxbKMGUPnguT1pQXzpFWZk5vZr',
            destinationOwner: 'J7JcLqpT9vVQdzTQ9LCbCaPMGgxrkmAixB22fBBxFHJN',
            destinationBalance: {
                amount: '776645721331521',
                decimals: 6,
                uiAmount: 776645721.331521,
                uiAmountString: '776645721.331521'
            },
            destinationPreBalance: {
                amount: '771007772264640',
                decimals: 6,
                uiAmount: 771007772.26464,
                uiAmountString: '771007772.26464'
            },
            sourceBalance: { amount: '0', decimals: 6, uiAmount: null, uiAmountString: '0' },
            sourcePreBalance: {
                amount: '5637949066881',
                decimals: 6,
                uiAmount: 5637949.066881,
                uiAmountString: '5637949.066881'
            }
        },
        outputToken: {
            mint: 'So11111111111111111111111111111111111111112',
            amount: 0.168803601,
            amountRaw: '168803601',
            decimals: 9,
            authority: 'J7JcLqpT9vVQdzTQ9LCbCaPMGgxrkmAixB22fBBxFHJN',
            source: 'AH3hzZZ7M119bfWo7Kg3A3QydZXExbA2gLqae3SaTFwK',
            destination: 'G2fzxU1bQcjQmwu6nasZ1z1L6qcd12L3WMTSyh6NsLmH',
            destinationOwner: undefined,
            destinationBalance: undefined,
            destinationPreBalance: undefined,
            sourceBalance: {
                amount: '23142632867',
                decimals: 9,
                uiAmount: 23.142632867,
                uiAmountString: '23.142632867'
            },
            sourcePreBalance: {
                amount: '23311521082',
                decimals: 9,
                uiAmount: 23.311521082,
                uiAmountString: '23.311521082'
            }
        },
        fee: {
            mint: 'So11111111111111111111111111111111111111112',
            amount: 0.000084614,
            amountRaw: '84614',
            decimals: 9
        },
        user: 'Fevtbxo5Bi6n8EkvkBe2tKUJu52ZrxrnVNXHgEcTGGtc',
        programId: 'pAMMBay6oceH9fJKBRHGP5D4bD4sWpmSwMn52FMfXEA',
        amm: 'Pumpswap',
        route: '',
        slot: 335347841,
        timestamp: 1745402519,
        signature: '36Q2tYo1CPa42GF51bzA493nYQCG8fPbpQJEzRhZQURYuBcRKpj97HWBCLCzDwgQJ8tnVrW9fDZKWaPBdADEsxTE',
        idx: '5-3'
    },
    {
        type: 'SELL',
        inputToken: {
            mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
            amount: 0.050559,
            amountRaw: '50559',
            decimals: 6,
            authority: '5x5SDFa5KFw4dsvGX82aVsBeecGZawjvuWoGCEuiDBHF',
            source: '79jB258UVc8zkmhWYE8fH4kKXYJLBGuNpQ5qg6aH7xo7',
            destination: 'A3odJSA7wUVVRratLNTthGvbvdQTedQKseLqLnoFe4nC',
            destinationOwner: '6iYbJ5rfyNGjMPhk1CDjjZeTJvuRNw5iCTnVESLPtaKz',
            destinationBalance: {
                amount: '61740671',
                decimals: 6,
                uiAmount: 61.740671,
                uiAmountString: '61.740671'
            },
            destinationPreBalance: {
                amount: '61693652',
                decimals: 6,
                uiAmount: 61.693652,
                uiAmountString: '61.693652'
            },
            sourceBalance: {
                amount: '50558',
                decimals: 6,
                uiAmount: 0.050558,
                uiAmountString: '0.050558'
            },
            sourcePreBalance: {
                amount: '101117',
                decimals: 6,
                uiAmount: 0.101117,
                uiAmountString: '0.101117'
            }
        },
        outputToken: {
            mint: 'So11111111111111111111111111111111111111112',
            amount: 0.000334019,
            amountRaw: '334019',
            decimals: 9,
            authority: 'Enc6rB84ZwGxZU8aqAF41dRJxg3yesiJgD7uJFVhMraM',
            source: 'HZ5JFB1ZoZs6NQLr7bb4MMEXDgty4Vs1ZghoyX35mNnV',
            destination: '6h4MaafLZvU9B8C9BmUk8PLsovqv2FhswSrikkzrST9Z',
            destinationOwner: undefined,
            destinationBalance: undefined,
            destinationPreBalance: undefined,
            sourceBalance: {
                amount: '278093527449',
                decimals: 9,
                uiAmount: 278.093527449,
                uiAmountString: '278.093527449'
            },
            sourcePreBalance: {
                amount: '278093534147',
                decimals: 9,
                uiAmount: 278.093534147,
                uiAmountString: '278.093534147'
            }
        },
        user: '5x5SDFa5KFw4dsvGX82aVsBeecGZawjvuWoGCEuiDBHF',
        programId: 'JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4',
        amm: 'MeteoraDLMM',
        route: 'Jupiter',
        slot: 335639920,
        timestamp: 1745518426,
        signature: '61REaPYiK33zS9Ens8UHDH1YChrRmTqsd9P6kkqfJh1F4NrtHYiwnRtvxWFv7jUuYmGDPce18gKHhJ59kGgfnQDL',
        idx: '3-4'
    },
    {
        type: 'SELL',
        inputToken: {
            mint: '4A3qjPKQYJ4eYx2V5AhQfkkBLMc4LuvdDJhDx7iBpump',
            amount: 600802.269851,
            amountRaw: '600802269851',
            decimals: 6,
            authority: '7JfmqksXe1xLfKEAy2eBFwk85fGPMnd8Sj1eMAyFxN1f',
            source: 'AN33D7FrC9rJj14UCGsc5SaJf26MTh2PLhAy5xmUspn4',
            destination: '75zvUDce7ukrD8vaaJn5NwHaQ9vJLZvUwU9YYo7DwppE',
            destinationOwner: 'CapuXNQoDviLvU1PxFiizLgPNQCxrsag1uMeyk6zLVps',
            destinationBalance: {
                amount: '31562511306',
                decimals: 6,
                uiAmount: 31562.511306,
                uiAmountString: '31562.511306'
            },
            destinationPreBalance: {
                amount: '31562511306',
                decimals: 6,
                uiAmount: 31562.511306,
                uiAmountString: '31562.511306'
            },
            sourceBalance: { amount: '0', decimals: 6, uiAmount: null, uiAmountString: '0' },
            sourcePreBalance: {
                amount: '605952869239',
                decimals: 6,
                uiAmount: 605952.869239,
                uiAmountString: '605952.869239'
            }
        },
        outputToken: {
            mint: '3aTajDPu3oLmvP7wQ2PyR3xaDZsm2XWsjMUKiC92pump',
            amount: 2462052.039133,
            amountRaw: '2462052039133',
            decimals: 6,
            authority: '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1',
            source: 'FHmv3xrz3bfSL7bmF6ptCq8xjm6FDF6ZMTPyqLQnr4kh',
            destination: '2WiuVZ2okSczMacjVxKd3kinLikmeD3E2CTPGBEj9Mch',
            destinationOwner: 'CapuXNQoDviLvU1PxFiizLgPNQCxrsag1uMeyk6zLVps',
            destinationBalance: {
                amount: '3061280729',
                decimals: 6,
                uiAmount: 3061.280729,
                uiAmountString: '3061.280729'
            },
            destinationPreBalance: {
                amount: '3061280729',
                decimals: 6,
                uiAmount: 3061.280729,
                uiAmountString: '3061.280729'
            },
            sourceBalance: {
                amount: '620081446007472',
                decimals: 6,
                uiAmount: 620081446.007472,
                uiAmountString: '620081446.007472'
            },
            sourcePreBalance: {
                amount: '622543498046605',
                decimals: 6,
                uiAmount: 622543498.046605,
                uiAmountString: '622543498.046605'
            }
        },
        user: '7JfmqksXe1xLfKEAy2eBFwk85fGPMnd8Sj1eMAyFxN1f',
        programId: 'JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4',
        amm: 'Pumpswap',
        route: 'Jupiter',
        slot: 333533173,
        timestamp: 1744683291,
        signature: '4txewy5B76FNPmogsAaWPTJREgqzCrexCDG6dhFiFh9bq5MYRFmu12icLmQVwujck8yY6DT27QBHiuEXTTJvGJJ4',
        idx: '3-8'
    },
    {
        type: 'SELL',
        inputToken: {
            mint: 'wuZ6vfM35my4BcNEBXWjr4twBvPtU7CGT5Boyxjpump',
            amount: 780555.819889,
            amountRaw: '780555819889',
            decimals: 6,
            authority: 'GhX31G4aCfCn9DKdZC39xhYz2KMNc2CQLgcVB4fJuWap',
            source: 'B3GyUNFM1wC8VZNZnZcXRMnqwV7MhBnojhWtVtFYXXoo',
            destination: '355GZMSqhKe81Zo2vYgRhBPQYSy4Q6BAUvkNqCoDA8R5',
            destinationOwner: 'CfG2JkAdxwHtFELppkBmDJAuSSqqHfocf8BBAx3cXRxB',
            destinationBalance: {
                amount: '85446237532519',
                decimals: 6,
                uiAmount: 85446237.532519,
                uiAmountString: '85446237.532519'
            },
            destinationPreBalance: {
                amount: '84665681712630',
                decimals: 6,
                uiAmount: 84665681.71263,
                uiAmountString: '84665681.71263'
            },
            sourceBalance: { amount: '0', decimals: 6, uiAmount: null, uiAmountString: '0' },
            sourcePreBalance: {
                amount: '780555819889',
                decimals: 6,
                uiAmount: 780555.819889,
                uiAmountString: '780555.819889'
            }
        },
        outputToken: {
            mint: 'So11111111111111111111111111111111111111112',
            amount: 3.460649261,
            amountRaw: '3460649261',
            decimals: 9,
            authority: 'CfG2JkAdxwHtFELppkBmDJAuSSqqHfocf8BBAx3cXRxB',
            source: '5ETTtX4Whcd2Gg9sMJktkndkCFyXupwjMG3mx2C7UayK',
            destination: '7LeHCVW4A3cvJXE1icz1ps9oxiVThspJnUWEzvaBTzE9',
            destinationOwner: undefined,
            destinationBalance: undefined,
            destinationPreBalance: undefined,
            sourceBalance: {
                amount: '376318988286',
                decimals: 9,
                uiAmount: 376.318988286,
                uiAmountString: '376.318988286'
            },
            sourcePreBalance: {
                amount: '379781372209',
                decimals: 9,
                uiAmount: 379.781372209,
                uiAmountString: '379.781372209'
            }
        },
        user: 'GhX31G4aCfCn9DKdZC39xhYz2KMNc2CQLgcVB4fJuWap',
        programId: 'JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4',
        amm: 'Pumpswap',
        route: 'Jupiter',
        slot: 335703208,
        timestamp: 1745543554,
        signature: '46rMXoH7t2SydLTv84nzjT2oogZbpu3LMcUACk4W8UQJ3bDFBb311pjddStCEDdsR5X4eCR8QXuTrr6HSm6u1CWB',
        idx: '3-5'
    },
    {
        type: 'SELL',
        inputToken: {
            mint: 'jupSoLaHXQiZZTSfEWMTRRgpnyFm8f6sZdosWBjx93v',
            amount: 24.644450433,
            amountRaw: '24644450433',
            decimals: 9,
            authority: 'EP2E3tCCnAyJiaBvaMEUR8YsKsfM27gZRsJEo3jT8frc',
            source: '89BJ4uHGGUpTrtUjRpqKGyRFPYK5feChX7RhN5MFA7Nx',
            destination: 'CdRr1RX5uFdJes33NiFiiG5TZNd6gvXWts9u9xjiCVRq',
            destinationOwner: 'DtYKbQELgMZ3ihFUrCcCs9gy4djcUuhwgR7UpxVpP2Tg',
            destinationBalance: {
                amount: '5438796574117',
                decimals: 9,
                uiAmount: 5438.796574117,
                uiAmountString: '5438.796574117'
            },
            destinationPreBalance: {
                amount: '5414152123684',
                decimals: 9,
                uiAmount: 5414.152123684,
                uiAmountString: '5414.152123684'
            },
            sourceBalance: {
                amount: '8009813395',
                decimals: 9,
                uiAmount: 8.009813395,
                uiAmountString: '8.009813395'
            },
            sourcePreBalance: {
                amount: '17550170',
                decimals: 9,
                uiAmount: 0.01755017,
                uiAmountString: '0.01755017'
            }
        },
        outputToken: {
            mint: 'So11111111111111111111111111111111111111112',
            amount: 27.162139956,
            amountRaw: '27162139956',
            decimals: 9,
            authority: 'DtYKbQELgMZ3ihFUrCcCs9gy4djcUuhwgR7UpxVpP2Tg',
            source: '3AfqjdDWMof5p2gEH4MRPZQyhDC36spx8GJk5LZJQRnP',
            destination: '7dk5eETsMUJi4RkFZYRuP8mprELgWn4HZoapco7FGa82',
            destinationOwner: undefined,
            destinationBalance: undefined,
            destinationPreBalance: undefined,
            sourceBalance: {
                amount: '4304437918401',
                decimals: 9,
                uiAmount: 4304.437918401,
                uiAmountString: '4304.437918401'
            },
            sourcePreBalance: {
                amount: '4331600058357',
                decimals: 9,
                uiAmount: 4331.600058357,
                uiAmountString: '4331.600058357'
            }
        },
        user: 'EP2E3tCCnAyJiaBvaMEUR8YsKsfM27gZRsJEo3jT8frc',
        programId: 'JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4',
        amm: 'Orca',
        route: 'Jupiter',
        slot: 335703208,
        timestamp: 1745543554,
        signature: '5JfxWaTCJcLu8H8WcFcxxLSLyHDfdP2A2VUTKGsi3VHkBHbEtUQdu26PzsYZGD8UvgW2FsfNXAaMNx4Mmnv4vQDv',
        idx: '16-3'
    },
    {
        type: 'BUY',
        inputToken: {
            mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
            amount: 4.0296,
            amountRaw: '4029600',
            decimals: 6
        },
        outputToken: {
            mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
            amount: 4.03475,
            amountRaw: '4034750',
            decimals: 6,
            authority: 'Enc6rB84ZwGxZU8aqAF41dRJxg3yesiJgD7uJFVhMraM',
            source: 'AHFAv95Z67xnPYuHTf5a9uMEHdXFvbQvwc4EazY3tpt7',
            destination: 'C62R5ajbrn4qtfZwGmpZU3kDZebf3BfWq1xhhmLB5MWX',
            destinationOwner: 'EQyYgCnwwZxuh3SfnrFBEiFqDUUSfpqiDorf66eqdEcz',
            destinationBalance: {
                amount: '285177794',
                decimals: 6,
                uiAmount: 285.177794,
                uiAmountString: '285.177794'
            },
            destinationPreBalance: {
                amount: '285172644',
                decimals: 6,
                uiAmount: 285.172644,
                uiAmountString: '285.172644'
            },
            sourceBalance: {
                amount: '42433007479',
                decimals: 6,
                uiAmount: 42433.007479,
                uiAmountString: '42433.007479'
            },
            sourcePreBalance: {
                amount: '42437042229',
                decimals: 6,
                uiAmount: 42437.042229,
                uiAmountString: '42437.042229'
            }
        },
        user: 'EQyYgCnwwZxuh3SfnrFBEiFqDUUSfpqiDorf66eqdEcz',
        programId: 'JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4',
        amm: 'MeteoraPools',
        route: 'Jupiter',
        slot: 335703207,
        timestamp: 1745543553,
        signature: '55VfB9g52vYyi6eGYmiCUe2sLpbBsH16DqN6rXpA9UKkXg6oo4y1ohZa7Dc1QJFfrkiLD5b8b7ZVBhA9p56xVzMG',
        idx: '2-8'
    },
    {
        type: 'BUY',
        inputToken: {
            mint: 'So11111111111111111111111111111111111111112',
            amount: 0.069625217,
            amountRaw: '69625217',
            decimals: 9,
            authority: '7uYtrfQYb7ZrtKm1VQC2RkYqgy4ddq458AAva1a7dgxK',
            source: '9jmY13Awm4qe7zvGCHLBMPgy91WNkvf6YgWBdtmtuXNu',
            destination: '5VEdspvwNHAEp7fTPXru5ZnQzWdC7HLDus6DypMrQDdc',
            destinationOwner: '8e8EiakqpXzeJoZ1h5ZrTSN6SsXXukP2JN2E9N6cFwKm',
            destinationBalance: {
                amount: '3676175685039',
                decimals: 9,
                uiAmount: 3676.175685039,
                uiAmountString: '3676.175685039'
            },
            destinationPreBalance: {
                amount: '3676106059822',
                decimals: 9,
                uiAmount: 3676.106059822,
                uiAmountString: '3676.106059822'
            },
            sourceBalance: {
                amount: '7778811274',
                decimals: 9,
                uiAmount: 7.778811274,
                uiAmountString: '7.778811274'
            },
            sourcePreBalance: {
                amount: '7778804323',
                decimals: 9,
                uiAmount: 7.778804323,
                uiAmountString: '7.778804323'
            }
        },
        outputToken: {
            mint: 'So11111111111111111111111111111111111111112',
            amount: 0.069632191,
            amountRaw: '69632191',
            decimals: 9,
            authority: '8sLbNZoA1cfnvMJLPfp98ZLAnFSYCFApfJKMbiXNLwxj',
            source: '6P4tvbzRY6Bh3MiWDHuLqyHywovsRwRpfskPvyeSoHsz',
            destination: '9jmY13Awm4qe7zvGCHLBMPgy91WNkvf6YgWBdtmtuXNu',
            destinationOwner: '7uYtrfQYb7ZrtKm1VQC2RkYqgy4ddq458AAva1a7dgxK',
            destinationBalance: {
                amount: '7778811274',
                decimals: 9,
                uiAmount: 7.778811274,
                uiAmountString: '7.778811274'
            },
            destinationPreBalance: {
                amount: '7778804323',
                decimals: 9,
                uiAmount: 7.778804323,
                uiAmountString: '7.778804323'
            },
            sourceBalance: {
                amount: '19794448099483',
                decimals: 9,
                uiAmount: 19794.448099483,
                uiAmountString: '19794.448099483'
            },
            sourcePreBalance: {
                amount: '19794517731674',
                decimals: 9,
                uiAmount: 19794.517731674,
                uiAmountString: '19794.517731674'
            }
        },
        user: '7uYtrfQYb7ZrtKm1VQC2RkYqgy4ddq458AAva1a7dgxK',
        programId: 'JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4',
        amm: 'MeteoraDLMM',
        route: 'Jupiter',
        slot: 335703556,
        timestamp: 1745543691,
        signature: 'RzdF8ugQfCBAjjCEqhRzM7MpuYAiRc8HVsgvd2R9jF7buKHD5o1ytF63u5oeB4UmySaaETHxLoLxekpaQYqzEau',
        idx: '2-4'
    }
];
describe('FinalSwap', () => {
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
        it(`${test.type} > ${test.route} > ${test.amm} > ${test.signature} `, async () => {
            const tx = await connection.getTransaction(test.signature, {
                maxSupportedTransactionVersion: 0,
            });
            if (!tx)
                throw new Error('Transaction not found');
            const parser = new dex_parser_1.DexParser();
            const { trades } = parser.parseAll(tx);
            const finalSwap = (0, utils_1.getFinalSwap)(trades);
            expect(finalSwap).toBeDefined();
            expect(finalSwap.type).toEqual(test.type);
            expect(finalSwap.route).toEqual(test.route);
            expect(finalSwap.amm).toEqual(test.amm);
            expect(finalSwap.inputToken.mint).toEqual(test.inputToken.mint);
            expect(finalSwap.inputToken.amount).toEqual(test.inputToken.amount);
            expect(finalSwap.inputToken.amountRaw).toEqual(test.inputToken.amountRaw);
            expect(finalSwap.inputToken.decimals).toEqual(test.inputToken.decimals);
            expect(finalSwap.outputToken.mint).toEqual(test.outputToken.mint);
            expect(finalSwap.outputToken.amount).toEqual(test.outputToken.amount);
            expect(finalSwap.outputToken.amountRaw).toEqual(test.outputToken.amountRaw);
            expect(finalSwap.outputToken.decimals).toEqual(test.outputToken.decimals);
            expect(finalSwap.user).toEqual(test.user);
            expect(finalSwap.slot).toEqual(test.slot);
            expect(finalSwap.signature).toEqual(test.signature);
            expect(finalSwap.idx).toEqual(test.idx);
        });
    });
});
//# sourceMappingURL=parse-finalswap.test.js.map