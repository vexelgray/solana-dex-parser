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
        {
            signature: 'xZmKodPHYxesDJzPLHfjqG4VvKJcQpwuo3fTa2T64LY9nePfAa97xtSmzCvSWJ5EFzYjAURLD666zqV8oJL8kTp',
            type: 'CREATE',
            desc: 'Raydium CPMM: initialize',
            name: 'IMG',
            poolId: 'CXgcuECqdaBpvJWH5cwEir9Y5FY9SKTjhGutMc95bGy3',
            token0Mint: 'znv3FZt2HFAvzYf5LxzVyryh3mBXWuTRRng25gEZAjh',
            token0Amount: 1000000000,
            token1Mint: 'So11111111111111111111111111111111111111112',
            token1Amount: 20,
        },
        {
            signature: '55JBLGRP6Zcd4t8gxsQ27EbLN3kzzMMnwxA9iD1CUTsax2C2cJLNbW3nuRg1gCH56ojJ4YNpRcuzpDL1PbnRvh18',
            type: 'CREATE',
            desc: 'Raydium CPMM: initialize',
            name: 'TRUMP',
            poolId: 'HKuJrP5tYQLbEUdjKwjgnHs2957QKjR2iWhJKTtMa1xs',
            token0Mint: '6p6xgHyF7AeE6TZkSmFsko444wqoP15icUSqi2jfGiPN',
            token0Amount: 423.320786,
            token1Mint: 'So11111111111111111111111111111111111111112',
            token1Amount: 0.352896784,
        },
    ],
    ADD: [
        {
            signature: '2uVjffn9bwatwRnGZYRpJk5fhxTcGcGfvtc971FBdt1CgUhxESrG8qPN3DiahgaLDULC4JTqc1whSCfvZ5gzJRmL',
            type: 'ADD',
            desc: 'Raydium CPMM: deposit',
            name: 'IMG',
            poolId: 'CXgcuECqdaBpvJWH5cwEir9Y5FY9SKTjhGutMc95bGy3',
            token0Mint: 'znv3FZt2HFAvzYf5LxzVyryh3mBXWuTRRng25gEZAjh',
            token0Amount: 928.616834,
            token1Mint: 'So11111111111111111111111111111111111111112',
            token1Amount: 0.064818705,
        },
        {
            signature: '38Bf6HotXPuGcErvexLS4tCQVnLSuD1PtvhgNuCmhbbNwwDKXNSw8Gc6MQwgWwpU5FNUJwGac1ziSS6kKDJdW1Rr',
            type: 'ADD',
            desc: 'Raydium CPMM: deposit',
            name: 'TRUMP',
            poolId: 'HKuJrP5tYQLbEUdjKwjgnHs2957QKjR2iWhJKTtMa1xs',
            token0Mint: '6p6xgHyF7AeE6TZkSmFsko444wqoP15icUSqi2jfGiPN',
            token0Amount: 972.595817,
            token1Mint: 'So11111111111111111111111111111111111111112',
            token1Amount: 95.855640586,
        },
    ],
    REMOVE: [
        {
            signature: '5sYGW9tkSuh4UHUNGLwtLRSuAGHTTKQMqgaGtF7jB4r8EzADkVmq3nPfiWiQ7UhPn4vj2bpqNXvcKpqgMX1uWc97',
            type: 'REMOVE',
            desc: 'Raydium CPMM: withdraw',
            name: 'IMG',
            poolId: 'CXgcuECqdaBpvJWH5cwEir9Y5FY9SKTjhGutMc95bGy3',
            token0Mint: 'znv3FZt2HFAvzYf5LxzVyryh3mBXWuTRRng25gEZAjh',
            token0Amount: 1735.661744,
            token1Mint: 'So11111111111111111111111111111111111111112',
            token1Amount: 0.03501825,
        },
        {
            signature: '5eVe9LMAHgz6Ze7VrUn1XHgoaWJXinM2uoEvRciVoJsADCDc8v4HrewQorp4JUx3jAzBSw5p3RrSAYFqd95udWxR',
            type: 'REMOVE',
            desc: 'Raydium CPMM: withdraw',
            name: 'TRUMP',
            poolId: 'HKuJrP5tYQLbEUdjKwjgnHs2957QKjR2iWhJKTtMa1xs',
            token0Mint: '6p6xgHyF7AeE6TZkSmFsko444wqoP15icUSqi2jfGiPN',
            token0Amount: 977.537752,
            token1Mint: 'So11111111111111111111111111111111111111112',
            token1Amount: 95.417034698,
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
    describe('Raydium CPMM', () => {
        Object.values(tests)
            .flat()
            .forEach((test) => {
            it(`${test.type} > ${test.name} > ${test.desc} `, async () => {
                const tx = await connection.getTransaction(test.signature, {
                    maxSupportedTransactionVersion: 0,
                });
                if (!tx)
                    throw new Error('Transaction not found');
                const parser = new dex_parser_1.DexParser();
                const events = parser.parseLiquidity(tx);
                expect(events.length).toEqual(1);
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
//# sourceMappingURL=liquidity-raydium-cpmm.test.js.map