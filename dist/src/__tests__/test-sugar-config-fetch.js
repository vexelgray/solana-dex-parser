"use strict";
/**
 * Test Sugar Config Cache - Fetch initial reserves from State account
 */
Object.defineProperty(exports, "__esModule", { value: true });
const web3_js_1 = require("@solana/web3.js");
const sugar_config_cache_1 = require("../parsers/sugar/sugar-config-cache");
// Known Sugar State account address (derived from program)
// This is the global config for the Sugar program
const SUGAR_PROGRAM_ID = 'deus4Bvftd5QKcEkE5muQaWGWDoma8GrySvPFrBPjhS';
async function findStateAccount() {
    // State PDA is typically derived with seeds like ["state"] or ["global"]
    // Let's try to find it by looking at a known transaction
    const [statePda] = web3_js_1.PublicKey.findProgramAddressSync([Buffer.from('state')], new web3_js_1.PublicKey(SUGAR_PROGRAM_ID));
    return statePda.toBase58();
}
async function testSugarConfigFetch() {
    const connection = new web3_js_1.Connection('https://api.mainnet-beta.solana.com', 'confirmed');
    // Try to find the State account PDA
    const stateAddress = await findStateAccount();
    console.log('Sugar State PDA:', stateAddress);
    console.log('\nFetching config from RPC...');
    const config = await sugar_config_cache_1.SugarConfigCache.fetchFromRpc(connection, stateAddress);
    if (config) {
        console.log('\n=== Sugar State Account Config ===');
        console.log('State Address:', config.stateAddress);
        console.log('Fee BPS:', config.feeBps.toString());
        console.log('Initial Virtual Token Reserve:', config.initialVirtualTokenReserve.toString());
        console.log('Initial Virtual SOL Reserve:', config.initialVirtualSolReserve.toString());
        console.log('Total Supply:', config.totalSupply.toString());
        console.log('Graduation Threshold:', config.graduationThreshold.toString());
        // Convert to UI values
        console.log('\n=== UI Values ===');
        console.log('Initial Virtual Token (UI):', Number(config.initialVirtualTokenReserve) / 1e6, 'tokens');
        console.log('Initial Virtual SOL (UI):', Number(config.initialVirtualSolReserve) / 1e9, 'SOL');
        console.log('Total Supply (UI):', Number(config.totalSupply) / 1e6, 'tokens');
        console.log('Graduation Threshold (UI):', Number(config.graduationThreshold) / 1e9, 'SOL');
    }
    else {
        console.log('Failed to fetch config. Using defaults:');
        const defaults = sugar_config_cache_1.SugarConfigCache.getDefaults();
        console.log('Initial Virtual Token Reserve:', defaults.initialVirtualTokenReserve.toString());
        console.log('Initial Virtual SOL Reserve:', defaults.initialVirtualSolReserve.toString());
        console.log('Total Supply:', defaults.totalSupply.toString());
        console.log('Graduation Threshold:', defaults.graduationThreshold.toString());
    }
}
testSugarConfigFetch().catch(console.error);
//# sourceMappingURL=test-sugar-config-fetch.js.map