"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const web3_js_1 = require("@solana/web3.js");
const dotenv_1 = __importDefault(require("dotenv"));
const dex_parser_1 = require("../dex-parser");
const transaction_adapter_1 = require("../transaction-adapter");
const utils_1 = require("../utils");
dotenv_1.default.config();
const parser = new dex_parser_1.DexParser();
async function testCreateEvent(name, signature, debug = false) {
    const rpcUrl = process.env.SOLANA_RPC_URL;
    if (!rpcUrl) {
        throw new Error('SOLANA_RPC_URL environment variable is not set');
    }
    const connection = new web3_js_1.Connection(rpcUrl);
    console.log(`\n${'='.repeat(60)}`);
    console.log(`=== Testing ${name} CREATE Event ===`);
    console.log(`${'='.repeat(60)}\n`);
    console.log(`Signature: ${signature}\n`);
    const tx = await connection.getTransaction(signature, {
        maxSupportedTransactionVersion: 0,
    });
    if (!tx) {
        console.error('Transaction not found');
        return;
    }
    // Debug: show instruction discriminators
    if (debug) {
        const adapter = new transaction_adapter_1.TransactionAdapter(tx);
        console.log('--- Debug: Instructions ---\n');
        for (let i = 0; i < adapter.instructions.length; i++) {
            const inst = adapter.instructions[i];
            const programId = adapter.getInstructionProgramId(inst);
            const data = (0, utils_1.getInstructionData)(inst);
            const disc = Buffer.from(data.slice(0, 8)).toString('hex');
            console.log(`[${i}] Program: ${programId}`);
            console.log(`    Discriminator: ${disc}`);
            console.log(`    Data length: ${data.length}`);
            // Show inner instructions for this outer instruction
            const innerGroup = adapter.innerInstructions?.find((ig) => ig.index === i);
            if (innerGroup?.instructions?.length) {
                console.log(`    Inner instructions: ${innerGroup.instructions.length}`);
                for (let j = 0; j < innerGroup.instructions.length; j++) {
                    const inner = innerGroup.instructions[j];
                    const innerProgramId = adapter.getInstructionProgramId(inner);
                    const innerData = (0, utils_1.getInstructionData)(inner);
                    const innerDisc = Buffer.from(innerData.slice(0, 16)).toString('hex');
                    console.log(`      [${j}] Program: ${innerProgramId}`);
                    console.log(`          Discriminator (16 bytes): ${innerDisc}`);
                    console.log(`          Data length: ${innerData.length}`);
                }
            }
            console.log('');
        }
    }
    // Use DexParser.parseAll() like you would in production
    const result = parser.parseAll(tx);
    console.log('\n--- Parsing Results ---\n');
    console.log('result:', result);
    console.log('--- Full Result ---');
    console.log('state:', result.state);
    console.log('trades:', result.trades?.length || 0);
    console.log('memeEvents:', result.memeEvents?.length || 0);
    console.log('liquidities:', result.liquidities?.length || 0);
    if (result.memeEvents && result.memeEvents.length > 0) {
        console.log('\n--- memeEvents Details ---\n');
        for (let i = 0; i < result.memeEvents.length; i++) {
            const event = result.memeEvents[i];
            console.log(`memeEvent[${i}]:`);
            console.log(JSON.stringify(event, (key, value) => (typeof value === 'bigint' ? value.toString() : value), 2));
            console.log('\n');
        }
    }
}
async function main() {
    // Test Meteora DBC CREATE
    await testCreateEvent('Meteora DBC CREATE', '2DGU5NzJo7W4GG4jVu6t3DfbrsnX7Kz3pvJSDG7cK7ds5CS9yZjk6CPRkUkbWK9ronXKhfokrJm1NuZ3iZajL8LD', false);
    // Test Meteora DBC BUY (to see reserves)
    await testCreateEvent('Meteora DBC BUY', '5MAif2xVG3HJLYW1ZpyM6xoJf8vRJiPBTUVwpWgWR2dZzb1DLEGFN6nximmu3oAu9r3AFZBncTEaxsoWR4KYJWZM', false);
}
main().catch(console.error);
//# sourceMappingURL=test-create-events.js.map