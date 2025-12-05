"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const web3_js_1 = require("@solana/web3.js");
const dotenv_1 = __importDefault(require("dotenv"));
const transaction_adapter_1 = require("../transaction-adapter");
const utils_1 = require("../utils");
const decoders_1 = require("../decoders");
const constants_1 = require("../constants");
const instruction_classifier_1 = require("../instruction-classifier");
dotenv_1.default.config();
async function main() {
    const sig = "5MAif2xVG3HJLYW1ZpyM6xoJf8vRJiPBTUVwpWgWR2dZzb1DLEGFN6nximmu3oAu9r3AFZBncTEaxsoWR4KYJWZM";
    const rpcUrl = process.env.SOLANA_RPC_URL;
    const connection = new web3_js_1.Connection(rpcUrl);
    const tx = await connection.getTransaction(sig, { maxSupportedTransactionVersion: 0 });
    if (!tx)
        throw new Error("Transaction not found");
    const adapter = new transaction_adapter_1.TransactionAdapter(tx);
    console.log("=== Using InstructionClassifier ===");
    const classifier = new instruction_classifier_1.InstructionClassifier(adapter);
    const instructions = classifier.getInstructions(constants_1.DEX_PROGRAMS.METEORA_DBC.id);
    console.log("Classified instructions:", instructions.length);
    for (const inst of instructions) {
        console.log("\nClassified: outer=" + inst.outerIndex + ", inner=" + inst.innerIndex);
        const innerGroup = adapter.innerInstructions?.find((it) => it.index === inst.outerIndex);
        console.log("  Inner group found:", !!innerGroup);
        if (innerGroup) {
            console.log("  Inner group length:", innerGroup.instructions.length);
            for (const inner of innerGroup.instructions) {
                const data = (0, utils_1.getInstructionData)(inner);
                if (data.length >= 100) {
                    const buffer = Buffer.from(data);
                    const swapData = decoders_1.meteoraDBCDecoder.extractSwapData(buffer);
                    if (swapData) {
                        console.log("  Found swap data!");
                        console.log("    migrationThreshold:", String(swapData.migrationThreshold));
                    }
                }
            }
        }
    }
}
main().catch(console.error);
//# sourceMappingURL=debug-meteora-swap.js.map