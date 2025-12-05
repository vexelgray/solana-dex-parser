"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const web3_js_1 = require("@solana/web3.js");
const decoders_1 = require("../decoders");
const constants_1 = require("../constants");
const RPC_URL = process.env.RPC_URL || 'https://api.mainnet-beta.solana.com';
async function analyzeTransaction() {
    const connection = new web3_js_1.Connection(RPC_URL, 'confirmed');
    // Transaction with create_config
    const configSignature = 'tNQqMopu37Fxk7hSA7uxdTQizXvq7dVaczvo3niJyJ55wBbJWZyGJj9hrazi5TKfJRa4xB7UjU5Wf5QvQWXDJVs';
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
    console.log('=== OUTER INSTRUCTIONS ===');
    const instructions = message.compiledInstructions;
    for (let i = 0; i < instructions.length; i++) {
        const inst = instructions[i];
        const programId = accountKeys[inst.programIdIndex];
        const data = Buffer.from(inst.data);
        console.log(`\nInstruction ${i}:`);
        console.log('  Program:', programId);
        console.log('  Data length:', data.length);
        console.log('  First 8 bytes:', data.subarray(0, 8).toString('hex'));
        if (programId === constants_1.DEX_PROGRAMS.METEORA_DBC.id) {
            // Check instruction discriminator
            const allInstrDiscs = decoders_1.meteoraDBCDecoder.getAllInstructionDiscriminators();
            for (const [name, disc] of allInstrDiscs) {
                if (data.subarray(0, 8).equals(disc)) {
                    console.log('  -> INSTRUCTION:', name);
                }
            }
        }
    }
    // Check inner instructions
    console.log('\n=== INNER INSTRUCTIONS ===');
    const innerInstructions = tx.meta?.innerInstructions || [];
    for (const group of innerInstructions) {
        console.log(`\nOuter index: ${group.index}`);
        for (let j = 0; j < group.instructions.length; j++) {
            const inner = group.instructions[j];
            const programId = accountKeys[inner.programIdIndex];
            const data = Buffer.from(inner.data, 'base64');
            console.log(`  Inner ${j}:`);
            console.log('    Program:', programId);
            console.log('    Data length:', data.length);
            console.log('    First 8 bytes:', data.subarray(0, 8).toString('hex'));
            if (programId === constants_1.DEX_PROGRAMS.METEORA_DBC.id) {
                // Check for Anchor self-CPI event prefix
                const ANCHOR_EVENT_PREFIX = Buffer.from([228, 69, 165, 46, 81, 203, 154, 29]);
                if (data.subarray(0, 8).equals(ANCHOR_EVENT_PREFIX)) {
                    console.log('    -> Has Anchor self-CPI prefix');
                    const eventDisc = data.subarray(8, 16);
                    console.log('    -> Event discriminator:', eventDisc.toString('hex'));
                    // Check event type
                    const allEventDiscs = decoders_1.meteoraDBCDecoder.getAllEventDiscriminators();
                    for (const [name, disc] of allEventDiscs) {
                        if (eventDisc.equals(disc)) {
                            console.log('    -> EVENT TYPE:', name);
                        }
                    }
                }
                else {
                    // Check instruction discriminator
                    const allInstrDiscs = decoders_1.meteoraDBCDecoder.getAllInstructionDiscriminators();
                    for (const [name, disc] of allInstrDiscs) {
                        if (data.subarray(0, 8).equals(disc)) {
                            console.log('    -> INSTRUCTION:', name);
                        }
                    }
                }
            }
        }
    }
}
analyzeTransaction().catch(console.error);
//# sourceMappingURL=full-tx-analysis.js.map