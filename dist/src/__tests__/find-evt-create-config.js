"use strict";
// Let's search for a transaction that actually emits EvtCreateConfig
// by fetching recent transactions from Meteora DBC program
Object.defineProperty(exports, "__esModule", { value: true });
const web3_js_1 = require("@solana/web3.js");
const constants_1 = require("../constants");
const RPC_URL = process.env.RPC_URL || 'https://api.mainnet-beta.solana.com';
async function findEvtCreateConfig() {
    const connection = new web3_js_1.Connection(RPC_URL, 'confirmed');
    // Anchor self-CPI event prefix
    const ANCHOR_EVENT_PREFIX = Buffer.from([228, 69, 165, 46, 81, 203, 154, 29]);
    // EvtCreateConfig discriminator
    const EVT_CREATE_CONFIG = Buffer.from([131, 207, 180, 174, 180, 73, 165, 54]);
    const EVT_CREATE_CONFIG_V2 = Buffer.from([163, 74, 66, 187, 119, 195, 26, 144]);
    console.log('Looking for EvtCreateConfig or EvtCreateConfigV2 in recent transactions...');
    console.log('Anchor prefix:', ANCHOR_EVENT_PREFIX.toString('hex'));
    console.log('EvtCreateConfig:', EVT_CREATE_CONFIG.toString('hex'));
    console.log('EvtCreateConfigV2:', EVT_CREATE_CONFIG_V2.toString('hex'));
    // Get recent signatures
    const signatures = await connection.getSignaturesForAddress(new web3_js_1.PublicKey(constants_1.DEX_PROGRAMS.METEORA_DBC.id), { limit: 50 });
    console.log(`\nChecking ${signatures.length} recent transactions...`);
    for (const sig of signatures.slice(0, 20)) {
        try {
            const tx = await connection.getTransaction(sig.signature, {
                maxSupportedTransactionVersion: 0,
            });
            if (!tx)
                continue;
            // Check inner instructions
            for (const group of tx.meta?.innerInstructions || []) {
                for (const inner of group.instructions) {
                    const data = Buffer.from(inner.data, 'base64');
                    // Look for Anchor prefix followed by EvtCreateConfig
                    if (data.length >= 16 &&
                        data.subarray(0, 8).equals(ANCHOR_EVENT_PREFIX)) {
                        const eventDisc = data.subarray(8, 16);
                        if (eventDisc.equals(EVT_CREATE_CONFIG)) {
                            console.log('\n*** FOUND EvtCreateConfig ***');
                            console.log('Signature:', sig.signature);
                            console.log('Full data:', data.toString('hex'));
                            return;
                        }
                        if (eventDisc.equals(EVT_CREATE_CONFIG_V2)) {
                            console.log('\n*** FOUND EvtCreateConfigV2 ***');
                            console.log('Signature:', sig.signature);
                            console.log('Full data:', data.toString('hex'));
                            return;
                        }
                    }
                }
            }
        }
        catch (e) {
            continue;
        }
    }
    console.log('\nNo EvtCreateConfig events found in recent transactions');
    console.log('This may mean the program doesn\'t emit this event as a self-CPI');
}
findEvtCreateConfig().catch(console.error);
//# sourceMappingURL=find-evt-create-config.js.map