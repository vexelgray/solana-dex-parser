"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const web3_js_1 = require("@solana/web3.js");
const decoders_1 = require("../decoders");
const constants_1 = require("../constants");
const RPC_URL = process.env.RPC_URL || 'https://api.mainnet-beta.solana.com';
// Anchor self-CPI event prefix
const ANCHOR_EVENT_PREFIX = Buffer.from([228, 69, 165, 46, 81, 203, 154, 29]);
async function verifyConfigTx() {
    const connection = new web3_js_1.Connection(RPC_URL, 'confirmed');
    // Config transaction from Nov 27
    const configSignature = '4xapPGhszA9tmuiziFD7KKEmnxzLbvoifD9fZp3JECcmDC3oWniZd2UuUR3zw7R4E8XpAXUYhCJUCcYF61D1rYEN';
    console.log('=== Analyzing create_config transaction ===');
    console.log('Signature:', configSignature);
    const tx = await connection.getTransaction(configSignature, {
        maxSupportedTransactionVersion: 0,
    });
    if (!tx) {
        console.error('Transaction not found');
        return;
    }
    // Get all account keys
    const message = tx.transaction.message;
    const accountKeys = message.staticAccountKeys?.map(k => k.toBase58()) || [];
    const loadedAddresses = tx.meta?.loadedAddresses;
    if (loadedAddresses) {
        accountKeys.push(...loadedAddresses.writable.map(k => k.toBase58()));
        accountKeys.push(...loadedAddresses.readonly.map(k => k.toBase58()));
    }
    // Check outer instructions
    console.log('\n=== OUTER INSTRUCTIONS ===');
    const instructions = message.compiledInstructions;
    for (let i = 0; i < instructions.length; i++) {
        const inst = instructions[i];
        const programId = accountKeys[inst.programIdIndex];
        const data = Buffer.from(inst.data);
        console.log(`\nInstruction ${i}:`);
        console.log('  Program:', programId);
        console.log('  First 8 bytes:', data.subarray(0, 8).toString('hex'));
        if (programId === constants_1.DEX_PROGRAMS.METEORA_DBC.id) {
            const allInstrDiscs = decoders_1.meteoraDBCDecoder.getAllInstructionDiscriminators();
            for (const [name, disc] of allInstrDiscs) {
                if (data.subarray(0, 8).equals(disc)) {
                    console.log('  -> INSTRUCTION:', name);
                }
            }
        }
    }
    // Check inner instructions for EvtCreateConfig
    console.log('\n=== INNER INSTRUCTIONS (Meteora DBC only) ===');
    const innerInstructions = tx.meta?.innerInstructions || [];
    for (const group of innerInstructions) {
        for (let j = 0; j < group.instructions.length; j++) {
            const inner = group.instructions[j];
            const programId = accountKeys[inner.programIdIndex];
            if (programId !== constants_1.DEX_PROGRAMS.METEORA_DBC.id)
                continue;
            const data = Buffer.from(inner.data, 'base64');
            console.log(`\nOuter ${group.index}, Inner ${j}:`);
            console.log('  Data length:', data.length);
            console.log('  First 8 bytes:', data.subarray(0, 8).toString('hex'));
            console.log('  Has Anchor prefix?', data.subarray(0, 8).equals(ANCHOR_EVENT_PREFIX));
            // Check if it's EvtCreateConfig or EvtCreateConfigV2
            const EVT_CREATE_CONFIG = Buffer.from([131, 207, 180, 174, 180, 73, 165, 54]);
            const EVT_CREATE_CONFIG_V2 = Buffer.from([163, 74, 66, 187, 119, 195, 26, 144]);
            // Search for discriminator anywhere in buffer
            const v1Idx = data.indexOf(EVT_CREATE_CONFIG);
            const v2Idx = data.indexOf(EVT_CREATE_CONFIG_V2);
            console.log('  EvtCreateConfig found at:', v1Idx);
            console.log('  EvtCreateConfigV2 found at:', v2Idx);
            // Try brute force decoder
            const configData = decoders_1.meteoraDBCDecoder.bruteForceDecodeCreateConfig(data);
            if (configData) {
                console.log('  *** BRUTE FORCE SUCCESS ***');
                console.log('  Config:', configData.config);
                console.log('  migrationQuoteThreshold:', configData.migrationQuoteThreshold.toString());
                console.log('  sqrtStartPrice:', configData.sqrtStartPrice.toString());
            }
        }
    }
}
verifyConfigTx().catch(console.error);
//# sourceMappingURL=verify-config-tx.js.map