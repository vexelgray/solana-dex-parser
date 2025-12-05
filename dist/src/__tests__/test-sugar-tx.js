"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const web3_js_1 = require("@solana/web3.js");
const bs58_1 = __importDefault(require("bs58"));
const decoders_1 = require("../decoders");
async function testSugarTx() {
    const connection = new web3_js_1.Connection('https://api.mainnet-beta.solana.com');
    const sig = '2gVGGVrifPFC3zkRWamNsGGiRAB23kLRHp6DfHyh6QqVunDtgQWoALhsgPokJm3HdJNwhHDzgw9es9BkzFWNP2S';
    const tx = await connection.getTransaction(sig, {
        maxSupportedTransactionVersion: 0
    });
    if (!tx) {
        console.log('Transaction not found');
        return;
    }
    console.log('=== Transaction Info ===');
    console.log('Slot:', tx.slot);
    console.log('Block Time:', tx.blockTime ? new Date(tx.blockTime * 1000).toISOString() : 'N/A');
    // Check inner instructions for CPI events
    const innerInstructions = tx.meta?.innerInstructions || [];
    console.log('\n=== Searching for Sugar Events ===');
    let eventsFound = 0;
    for (const inner of innerInstructions) {
        for (const ix of inner.instructions) {
            if ('data' in ix) {
                const data = Buffer.from(bs58_1.default.decode(ix.data));
                // Check if it's a potential Sugar event
                if (decoders_1.sugarDecoder.isSugarEvent(data)) {
                    const eventName = decoders_1.sugarDecoder.identifyEvent(data);
                    console.log('\nFound Sugar event type:', eventName);
                    // Try to decode
                    const event = decoders_1.sugarDecoder.decodeAnyEvent(data);
                    if (event) {
                        eventsFound++;
                        console.log('\n=== SUGAR EVENT ===');
                        console.log('Type:', event.type);
                        console.log('Data:', JSON.stringify(event.data, (_, v) => typeof v === 'bigint' ? v.toString() : v, 2));
                    }
                }
            }
        }
    }
    if (eventsFound === 0) {
        console.log('No Sugar CPI events found in inner instructions');
        console.log('\nChecking log messages for event data...');
    }
    // Print log messages
    console.log('\n=== Log Messages ===');
    const logs = tx.meta?.logMessages || [];
    logs.forEach((log) => console.log(log));
}
testSugarTx().catch(console.error);
//# sourceMappingURL=test-sugar-tx.js.map