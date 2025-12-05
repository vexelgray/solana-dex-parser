"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const web3_js_1 = require("@solana/web3.js");
const dex_parser_1 = require("../dex-parser");
const RPC_URL = process.env.RPC_URL || 'https://api.mainnet-beta.solana.com';
async function testMeteoraDBCCreate() {
    const connection = new web3_js_1.Connection(RPC_URL, 'confirmed');
    const parser = new dex_parser_1.DexParser();
    // First, process the create_config transaction to populate cache
    const configSignature = 'tNQqMopu37Fxk7hSA7uxdTQizXvq7dVaczvo3niJyJ55wBbJWZyGJj9hrazi5TKfJRa4xB7UjU5Wf5QvQWXDJVs';
    console.log('=== Processing create_config transaction ===');
    console.log('Signature:', configSignature);
    const configTx = await connection.getTransaction(configSignature, {
        maxSupportedTransactionVersion: 0,
    });
    if (!configTx) {
        console.error('Config transaction not found');
        return;
    }
    const configResult = parser.parseAll(configTx);
    console.log('Meme events from config tx:', configResult.memeEvents.length);
    if (configResult.memeEvents.length > 0) {
        console.log('Config events:', JSON.stringify(configResult.memeEvents, null, 2));
    }
    // Now process the CREATE transaction
    const createSignature = '2gQWdNyC4xsFqqfzWx9gYV1WUUZCHDBCB5RdTDQvfBqG6Burr1Ye5mMBiKpEtzXjQYEpPAHYvYzuZAP8zVuDujnN';
    console.log('\n=== Processing CREATE transaction ===');
    console.log('Signature:', createSignature);
    const createTx = await connection.getTransaction(createSignature, {
        maxSupportedTransactionVersion: 0,
    });
    if (!createTx) {
        console.error('Create transaction not found');
        return;
    }
    const createResult = parser.parseAll(createTx);
    console.log('Meme events from create tx:', createResult.memeEvents.length);
    for (const evt of createResult.memeEvents) {
        if (evt.type === 'CREATE') {
            console.log('\n=== CREATE Event (Normalized) ===');
            console.log(JSON.stringify({
                type: evt.type,
                protocol: evt.protocol,
                launchpad: evt.launchpad,
                launchpadPlatform: evt.launchpadPlatform,
                name: evt.name,
                symbol: evt.symbol,
                decimals: evt.decimals,
                baseMint: evt.baseMint,
                quoteMint: evt.quoteMint,
                pool: evt.pool,
                platformConfig: evt.platformConfig,
                creator: evt.creator,
                user: evt.user,
                // Reserves
                virtualTokenReserves: evt.virtualTokenReserves,
                virtualSolReserves: evt.virtualSolReserves,
                realTokenReserves: evt.realTokenReserves,
                tokenTotalSupply: evt.tokenTotalSupply,
                // Normalized fields
                curveType: evt.curveType,
                totalQuoteFundRaising: evt.totalQuoteFundRaising,
                totalBaseSell: evt.totalBaseSell,
                tokenProgram: evt.tokenProgram,
            }, null, 2));
        }
    }
}
testMeteoraDBCCreate().catch(console.error);
//# sourceMappingURL=test-meteora-dbc-create.js.map