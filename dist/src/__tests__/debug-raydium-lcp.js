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
const decoders_1 = require("../decoders");
dotenv_1.default.config();
async function main() {
    const rpcUrl = process.env.SOLANA_RPC_URL;
    if (!rpcUrl) {
        throw new Error('SOLANA_RPC_URL environment variable is not set');
    }
    const connection = new web3_js_1.Connection(rpcUrl);
    const signature = '59GoUQr2vMfDqXnopTHwHQDXwT4SnJQxcVUfsNS5erYGgstK3ep9r1Ru5djyEJ5uCkDXmkHkNjvRFfnEjTZpGtAB';
    console.log('\n============================================================');
    console.log('=== Debug Raydium Launchpad TradeEvent Raw Data ===');
    console.log('============================================================\n');
    const tx = await connection.getTransaction(signature, {
        maxSupportedTransactionVersion: 0,
    });
    if (!tx) {
        console.error('Transaction not found');
        return;
    }
    const adapter = new transaction_adapter_1.TransactionAdapter(tx);
    // Find the BUY instruction (idx 7) and its inner TradeEvent
    console.log('Looking for TradeEvent in inner instructions...\n');
    for (let i = 0; i < adapter.instructions.length; i++) {
        const innerGroup = adapter.innerInstructions?.find(ig => ig.index === i);
        if (innerGroup?.instructions?.length) {
            for (let j = 0; j < innerGroup.instructions.length; j++) {
                const inner = innerGroup.instructions[j];
                const data = (0, utils_1.getInstructionData)(inner);
                // Check if this is a TradeEvent (16-byte prefix)
                if (data.length > 100) {
                    const eventData = Buffer.from(data).subarray(16);
                    const decoded = decoders_1.raydiumLaunchpadDecoder.parseTradeEventDirect(eventData);
                    if (decoded) {
                        console.log(`Found TradeEvent at instruction ${i}-${j}:`);
                        console.log('Raw decoded data:');
                        console.log(JSON.stringify({
                            poolState: decoded.poolState,
                            totalBaseSell: decoded.totalBaseSell.toString(),
                            virtualBase: decoded.virtualBase.toString(),
                            virtualQuote: decoded.virtualQuote.toString(),
                            realBaseBefore: decoded.realBaseBefore.toString(),
                            realQuoteBefore: decoded.realQuoteBefore.toString(),
                            realBaseAfter: decoded.realBaseAfter.toString(),
                            realQuoteAfter: decoded.realQuoteAfter.toString(),
                            amountIn: decoded.amountIn.toString(),
                            amountOut: decoded.amountOut.toString(),
                            tradeDirection: decoded.tradeDirection,
                        }, null, 2));
                        console.log('\n');
                    }
                }
            }
        }
    }
    // Also parse with DexParser to see current output
    const parser = new dex_parser_1.DexParser();
    const result = parser.parseAll(tx);
    console.log('--- Current Parser Output ---');
    if (result.memeEvents) {
        for (const event of result.memeEvents) {
            if (event.type === 'BUY' || event.type === 'SELL') {
                console.log(`\n${event.type} Event:`);
                console.log(JSON.stringify({
                    virtualTokenReserves: event.virtualTokenReserves,
                    virtualSolReserves: event.virtualSolReserves,
                    realTokenReserves: event.realTokenReserves,
                    realSolReserves: event.realSolReserves,
                }, null, 2));
            }
        }
    }
}
main().catch(console.error);
//# sourceMappingURL=debug-raydium-lcp.js.map