"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const web3_js_1 = require("@solana/web3.js");
const decoders_1 = require("../decoders");
const RPC_URL = process.env.RPC_URL || 'https://api.mainnet-beta.solana.com';
// Event discriminators
const EVT_CREATE_CONFIG_DISCRIMINATOR = Buffer.from([131, 207, 180, 174, 180, 73, 165, 54]);
const EVT_CREATE_CONFIG_V2_DISCRIMINATOR = Buffer.from([163, 74, 66, 187, 119, 195, 26, 144]);
async function debugCreateConfig() {
    const connection = new web3_js_1.Connection(RPC_URL, 'confirmed');
    // Transaction with create_config
    const configSignature = 'tNQqMopu37Fxk7hSA7uxdTQizXvq7dVaczvo3niJyJ55wBbJWZyGJj9hrazi5TKfJRa4xB7UjU5Wf5QvQWXDJVs';
    console.log('=== Debugging create_config transaction ===');
    console.log('Signature:', configSignature);
    console.log('Looking for discriminators:');
    console.log('  V1:', EVT_CREATE_CONFIG_DISCRIMINATOR.toString('hex'));
    console.log('  V2:', EVT_CREATE_CONFIG_V2_DISCRIMINATOR.toString('hex'));
    const tx = await connection.getTransaction(configSignature, {
        maxSupportedTransactionVersion: 0,
    });
    if (!tx) {
        console.error('Transaction not found');
        return;
    }
    // Get accounts
    const message = tx.transaction.message;
    const accountKeys = message.staticAccountKeys?.map(k => k.toBase58()) || [];
    const loadedAddresses = tx.meta?.loadedAddresses;
    if (loadedAddresses) {
        accountKeys.push(...loadedAddresses.writable.map(k => k.toBase58()));
        accountKeys.push(...loadedAddresses.readonly.map(k => k.toBase58()));
    }
    console.log('\n=== Inner Instructions ===');
    const innerInstructions = tx.meta?.innerInstructions || [];
    for (const group of innerInstructions) {
        console.log('\nOuter index: ' + group.index);
        for (let j = 0; j < group.instructions.length; j++) {
            const inner = group.instructions[j];
            const programId = accountKeys[inner.programIdIndex];
            const data = Buffer.from(inner.data, 'base64');
            if (programId === 'dbcij3LWUppWqq96dh6gJWwBifmcGfLSB5D4DuSMaqN') {
                console.log('\n  Inner ' + j + ': Meteora DBC');
                console.log('    Data length: ' + data.length + ' bytes');
                console.log('    Full data (hex): ' + data.toString('hex'));
                // Search for discriminator anywhere in the buffer
                const v1Index = data.indexOf(EVT_CREATE_CONFIG_DISCRIMINATOR);
                const v2Index = data.indexOf(EVT_CREATE_CONFIG_V2_DISCRIMINATOR);
                console.log('    V1 discriminator found at index: ' + v1Index);
                console.log('    V2 discriminator found at index: ' + v2Index);
                if (v1Index >= 0 || v2Index >= 0) {
                    // Try brute force decoding
                    const configData = decoders_1.meteoraDBCDecoder.bruteForceDecodeCreateConfig(data);
                    if (configData) {
                        console.log('    *** Found config data! ***');
                        console.log('    Config: ' + configData.config);
                        console.log('    QuoteMint: ' + configData.quoteMint);
                        console.log('    TokenDecimal: ' + configData.tokenDecimal);
                        console.log('    MigrationQuoteThreshold: ' + configData.migrationQuoteThreshold);
                        console.log('    SqrtStartPrice: ' + configData.sqrtStartPrice);
                        // Version not in return type
                    }
                    else {
                        console.log('    Brute force decoding returned null');
                    }
                }
            }
        }
    }
}
debugCreateConfig().catch(console.error);
//# sourceMappingURL=debug-create-config.js.map