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
    ADD: [
        {
            signature: '2vkT747Y9udxkiCD6bqGTME65G47xnrQ9mtvwoHXBwPNQJ2he6XBCGemxiD55oDeKcZ4vHbfgTYiX8ofr1a4phD6',
            type: 'ADD',
            desc: 'Meteora DLMM Program: addLiquidity',
            name: 'SPL Token',
            poolId: 'GHfVqcnXhGLEHhvUZuTKyE68cHwsvnvYMatapWETgASC', // lpMint
            token0Mint: '7w4XU7wWKoCB3bfM7Vi7zmHVSokoPP7Nb2oQuceiWb3s',
            token0Amount: 8.240658,
            token1Mint: 'So11111111111111111111111111111111111111112',
            token1Amount: 0,
        },
        {
            signature: '5oMPfyxsWgDnCSpxriQa4QR3jCuW6SUqCix1aD4T1a9As36uoxURH5KiZS1xTbRrwVRsLxrtW8hY1655LiVREBkL',
            type: 'ADD',
            desc: 'Meteora DLMM Program: addLiquidity',
            name: 'KAOS16',
            poolId: '7q1WMhzQyqTT49xiSF6AXMvUNjFxTcS81nxuQQUyqp1P', // lpPair
            token0Mint: 'jz4nRUM5ScvhzCEdRxtJ2fQt4zyBgbvn7VYemHiKrYC',
            token0Amount: 250109.689531,
            token1Mint: 'So11111111111111111111111111111111111111112',
            token1Amount: 0,
        },
        {
            signature: '4HAaBUNWYGQZsEf1VJAvzAtF6sLL8pb7CEMeBxNdivrWwP6XhNVNBH446NpoVtVyFoGuT1bu8jSpVHa8xe1yXtf',
            type: 'ADD',
            desc: ' Meteora DLMM Program: addLiquidityByStrategyOneSide',
            name: 'USDC',
            poolId: 'ARwi1S4DaiTG5DX7S4M4ZsrXqpMD1MrTmbu9ue2tpmEq', // lpMint
            token0Mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', //USDC
            token0Amount: 3000.405339,
            token1Mint: undefined, //"Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB",  //USDT
            token1Amount: 0,
        },
        {
            signature: '4BAG7T3kBo2immawL7eHecG7wretTnJ3C7Xcg3ouftZSVf7KcHPaLm93yD7KUgzKeqzkErg15UWV92kD3wSo6NUj',
            type: 'ADD',
            desc: ' Meteora DLMM Program: addLiquidityByStrategyOneSide',
            name: 'michi',
            poolId: '27M7AnaFpW68thenG1oVAc7TCVnjPGM3LeZr3HixmQRG',
            token0Mint: undefined, // '8pgE1iTWquNbmnbfv95CKe4784u6yZKfHBG7XmwoZDK6',
            token0Amount: 0,
            token1Mint: 'So11111111111111111111111111111111111111112',
            token1Amount: 4.999999982,
        },
        {
            signature: '65iaEBLYVvv6vrxTTsPhi6vhtYi5XhsuXBqbugRL8fZ6PQXZ4L7ocHZxXxBNAz2LsXCqBk56Gb6vGP2BA5PvmqJ1',
            type: 'ADD',
            desc: 'Meteora DLMM Program: addLiquidityOneSide',
            name: 'SBF',
            poolId: '5fU1WwLVRkDg8RiDkzvcETSSLqxcd3ry4tFmRW6oRcNN',
            token0Mint: undefined, // 'BodGrpbebFrVJ8gAhoKfS1knsUaLAjRWhZAbDgKfmby4',
            token0Amount: 0,
            token1Mint: 'So11111111111111111111111111111111111111112',
            token1Amount: 7.99999999,
        },
        {
            signature: '2japn1cjrYtPjS5RZj8kE4cuCZKSq2ihP6ZbyaA3x4CpuYyJtbbfx8mctCpCg7hRpNrwNcxiGYkrveDmcQLuBGP2',
            type: 'ADD',
            desc: 'Meteora DLMM Program: addLiquidityOneSidePrecise',
            name: 'SFM',
            poolId: '4FCeBszj9XeS2whpRbVKjxi7Z6AEws9hoaFDu7ctnjkR',
            token0Mint: '5jctYwusTPnD3PQoanMuqDstini9RnUPPP4NKbzWwgY',
            token0Amount: 847432538,
            token1Mint: undefined, //'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
            token1Amount: 0,
            items: [
                {
                    signature: '2japn1cjrYtPjS5RZj8kE4cuCZKSq2ihP6ZbyaA3x4CpuYyJtbbfx8mctCpCg7hRpNrwNcxiGYkrveDmcQLuBGP2',
                    type: 'ADD',
                    desc: 'Meteora DLMM Program: addLiquidityOneSide',
                    name: 'SFM',
                    poolId: '4FCeBszj9XeS2whpRbVKjxi7Z6AEws9hoaFDu7ctnjkR',
                    token0Mint: '5jctYwusTPnD3PQoanMuqDstini9RnUPPP4NKbzWwgY',
                    token0Amount: 47,
                    token1Mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
                    token1Amount: 0,
                },
            ],
        },
        {
            signature: 'PZbntZdTgAh99WvNZ2emugv6wV8FwT94vZhP1FjBaqBm8bHuSpJZ5tS3vqi53jVErHWZ1MNMLwtDgnr7VNn2dbf',
            type: 'ADD',
            desc: 'Meteora DLMM Program: addLiquidityByWeight',
            name: 'JitoSOL',
            poolId: 'BoeMUkCLHchTD31HdXsbDExuZZfcUppSLpYtV3LZTH6U',
            token0Mint: 'J1toso1uCk3RLmjorhTtrVwY9HJ7X8V9yYac6Y7kGCPn',
            token0Amount: 243.51585425,
            token1Mint: 'So11111111111111111111111111111111111111112',
            token1Amount: 60.589950682,
        },
        {
            signature: '4AZBcYYZfHTsrPXttv8UCAqKLBj8j8roEHW5evbpCYdx34e6Sxsb5P1VGiPMjScKy1caTtwGEfQH9rFUhvDdJxMU',
            type: 'ADD',
            desc: 'Meteora DLMM Program: addLiquidityByStrategy',
            name: 'PAIN',
            poolId: '8Bn5BW27CSPosSWqzBywXruKoBLjGgSfdys15uP9RavL',
            token0Mint: '1Qf8gESP4i6CFNWerUSDdLKJ9U1LpqTYvjJ2MM4pain',
            token0Amount: 0,
            token1Mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', //USDC
            token1Amount: 69730.4961,
        },
        {
            signature: '3b536UNQGGwrfHsDA9tLTKHwcy5G2eMZMSPxDqWhGbQbNrFSd5QaPHMzuufotiv5sBQWNvLvfcmToHGLoLoU1jz5',
            type: 'ADD',
            desc: 'Meteora DLMM Program: addLiquidityByStrategy',
            name: 'TRUMP',
            poolId: '9d9mb8kooFfaD3SctgZtkxQypkshx6ezhbKio89ixyy2',
            token0Mint: '6p6xgHyF7AeE6TZkSmFsko444wqoP15icUSqi2jfGiPN',
            token0Amount: 0,
            token1Mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', //USDC
            token1Amount: 619500.976753,
        },
    ],
    REMOVE: [
        {
            signature: 'sYGH1o3g8crh5dcgzn3WBD29wPxaKKXhPL1Baf1tac79yUTWmQ484vXbyf48Gr85RAgTHFc8scjPvyMaJnW24NA',
            type: 'REMOVE',
            desc: 'Meteora DLMM Program: removeLiquidityByRange',
            name: 'PAIN',
            poolId: '8Bn5BW27CSPosSWqzBywXruKoBLjGgSfdys15uP9RavL',
            token0Mint: '1Qf8gESP4i6CFNWerUSDdLKJ9U1LpqTYvjJ2MM4pain',
            token0Amount: 0,
            token1Mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', //USDC
            token1Amount: 69730.496031,
        },
        {
            signature: '38HUTGqsFeMzQkcqcV1DsmPfs6N4JhJEoa3vESHs7Zic4KyW3HkRTNyWmhCbw1YBub12sRcQ2VAjkUJcGVQpzYXg',
            type: 'REMOVE',
            desc: 'Meteora DLMM Program: removeLiquidityByRange',
            name: 'TRUMP',
            poolId: '9d9mb8kooFfaD3SctgZtkxQypkshx6ezhbKio89ixyy2',
            token0Mint: '6p6xgHyF7AeE6TZkSmFsko444wqoP15icUSqi2jfGiPN',
            token0Amount: 20.919301,
            token1Mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
            token1Amount: 110.714287,
        },
        {
            signature: '2mNBApzw9HXF3TJXsLoBtSxc3DqC6XVYbtwchmyUA9mvt9oVamYzpHa9axF62y9aNnXMzyKTzpfCcsHNsLgUcSnE',
            type: 'REMOVE',
            desc: 'Meteora DLMM Program: removeAllLiquidity',
            name: 'USDC',
            poolId: '5rCf1DM8LjKTw4YqhnoLcngyZYeNnQqztScTogYHAS6',
            token0Mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
            token0Amount: 0.108148,
            token1Mint: 'So11111111111111111111111111111111111111112',
            token1Amount: 0.000233718,
        },
        {
            signature: '9Wr5VreyNGZQ2vEqmnbZ1sAWPFrHKaxfM9m1qMiTcSzwvz6tJVWt9NWHuNeRoWxvWoZi3bDko1C6kS1jHVwSf9H',
            type: 'REMOVE',
            desc: 'Meteora DLMM Program: removeAllLiquidity',
            name: 'HOOD',
            poolId: '6ehEi3xc5DX3SVPiBpnRwPW3nQJBTzDynA26ce3AnYPp',
            token0Mint: 'h5NciPdMZ5QCB5BYETJMYBMpVx9ZuitR6HcVjyBhood',
            token0Amount: 3342.210433,
            token1Mint: 'So11111111111111111111111111111111111111112',
            token1Amount: 1.384101939,
        },
        {
            signature: 'Cj2c5dEmHvmMWwkMa4QMauQE6aBbyRz5mn4fEYARez2bHqukkJ3nbYAdst9ixQsAMh9G9tUNntAxEXpgrz5T1Qi',
            type: 'REMOVE',
            desc: 'Meteora DLMM Program: removeLiquidity',
            name: 'JitoSOL',
            poolId: 'BoeMUkCLHchTD31HdXsbDExuZZfcUppSLpYtV3LZTH6U',
            token0Mint: 'J1toso1uCk3RLmjorhTtrVwY9HJ7X8V9yYac6Y7kGCPn',
            token0Amount: 18.504862033,
            token1Mint: 'So11111111111111111111111111111111111111112',
            token1Amount: 6.074752463,
            test: true,
        },
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
    describe('Meteora DLMM', () => {
        Object.values(tests)
            .flat()
            //  .filter((test: any) => test.test == true) // test only
            .forEach((test) => {
            it(`${test.type} > ${test.name} > ${test.desc} > ${test.signature}`, async () => {
                const tx = await connection.getTransaction(test.signature, {
                    maxSupportedTransactionVersion: 0,
                });
                if (!tx)
                    throw new Error('Transaction not found');
                const parser = new dex_parser_1.DexParser();
                const events = parser.parseLiquidity(tx);
                // console.log(events);
                expect(events.length).toBeGreaterThanOrEqual(1);
                expect(events[0].type).toEqual(test.type);
                expect(events[0].poolId).toEqual(test.poolId);
                expect(events[0].token0Mint).toEqual(test.token0Mint);
                expect(events[0].token0Amount).toEqual(test.token0Amount);
                expect(events[0].token1Mint).toEqual(test.token1Mint);
                expect(events[0].token1Amount).toEqual(test.token1Amount);
            });
        });
    });
});
//# sourceMappingURL=liquidity-meteora.test.js.map