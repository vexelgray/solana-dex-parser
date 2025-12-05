"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const web3_js_1 = require("@solana/web3.js");
const dotenv_1 = __importDefault(require("dotenv"));
const transaction_adapter_1 = require("../transaction-adapter");
const utils_1 = require("../utils");
const constants_1 = require("../constants");
dotenv_1.default.config();
async function main() {
    const rpcUrl = process.env.SOLANA_RPC_URL;
    if (!rpcUrl) {
        throw new Error('SOLANA_RPC_URL environment variable is not set');
    }
    const connection = new web3_js_1.Connection(rpcUrl);
    const signature = '3uuFJkmWDwXGnsYweffyoqM9EattcuKniFNN42K1rztkZ4xYsywuKWH7inF5hcafi9sRDHYzUp9rhfazP2tYQ5X4';
    console.log('\n============================================================');
    console.log('=== Debug Raydium Launchpad Route Transaction ===');
    console.log('============================================================\n');
    const tx = await connection.getTransaction(signature, {
        maxSupportedTransactionVersion: 0,
    });
    if (!tx) {
        console.error('Transaction not found');
        return;
    }
    const adapter = new transaction_adapter_1.TransactionAdapter(tx);
    console.log('=== Account Keys ===');
    const accountKeys = adapter.accountKeys;
    console.log(`Total accounts: ${accountKeys.length}`);
    // Check for Raydium LCP program
    const raydiumLcpId = constants_1.DEX_PROGRAMS.RAYDIUM_LCP.id;
    console.log(`\nRaydium LCP Program ID: ${raydiumLcpId}`);
    const hasRaydiumLcp = accountKeys.includes(raydiumLcpId);
    console.log(`Raydium LCP in accounts: ${hasRaydiumLcp}`);
    console.log('\n=== Outer Instructions ===');
    for (let i = 0; i < adapter.instructions.length; i++) {
        const instruction = adapter.instructions[i];
        const programId = adapter.getInstructionProgramId(instruction);
        const data = (0, utils_1.getInstructionData)(instruction);
        console.log(`[${i}] Program: ${programId}`);
        console.log(`    Data length: ${data.length}`);
        if (data.length >= 8) {
            console.log(`    Discriminator: ${Buffer.from(data.slice(0, 8)).toString('hex')}`);
        }
        // Check if this is Raydium LCP
        if (programId === raydiumLcpId) {
            console.log('    >>> THIS IS RAYDIUM LCP INSTRUCTION');
        }
    }
    console.log('\n=== Inner Instructions ===');
    for (const innerGroup of adapter.innerInstructions || []) {
        console.log(`\nOuter index ${innerGroup.index}:`);
        for (let j = 0; j < innerGroup.instructions.length; j++) {
            const inner = innerGroup.instructions[j];
            const data = (0, utils_1.getInstructionData)(inner);
            const programId = adapter.getInstructionProgramId(inner);
            console.log(`  [${innerGroup.index}-${j}] Program: ${programId}, Data: ${data.length} bytes`);
            if (programId === raydiumLcpId) {
                console.log('    >>> THIS IS RAYDIUM LCP INNER INSTRUCTION');
                if (data.length >= 8) {
                    console.log(`    Discriminator: ${Buffer.from(data.slice(0, 8)).toString('hex')}`);
                }
            }
        }
    }
}
main().catch(console.error);
//# sourceMappingURL=debug-route-tx.js.map