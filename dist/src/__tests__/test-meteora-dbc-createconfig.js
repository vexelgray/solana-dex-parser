"use strict";
/**
 * Test script for Meteora DBC create_config brute force decoder
 *
 * Tests the brute force discriminator search that finds EvtCreateConfig events
 * without requiring the standard Anchor self-CPI prefix
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const web3_js_1 = require("@solana/web3.js");
const dex_parser_1 = require("../dex-parser");
const bs58_1 = __importDefault(require("bs58"));
const RPC_ENDPOINT = process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com';
const connection = new web3_js_1.Connection(RPC_ENDPOINT);
// Test signatures:
// create_config transaction: ui5vj8y4KkJ1SU8VCQEEgXtyWR94mv6xfAbfUNC16bNRV5yQkzphhCyAMp27RHCgcFPACXDQSSQsAYQYrhvqPZZ
// CREATE transaction: 5fdumNjfRMkdXEfVRNCduQ6dBYPGcGzMLjk3B7WgadM5KAhwUhwCthQ55p6tChyZ64rguowE5CDDGX9qo7eY8wDL
async function testCreateConfigDecoder() {
    console.log('Testing Meteora DBC create_config brute force decoder...\n');
    const parser = new dex_parser_1.DexParser();
    // Test 1: Fetch and parse a create_config transaction
    const createConfigSig = 'ui5vj8y4KkJ1SU8VCQEEgXtyWR94mv6xfAbfUNC16bNRV5yQkzphhCyAMp27RHCgcFPACXDQSSQsAYQYrhvqPZZ';
    console.log(`Fetching create_config tx: ${createConfigSig}`);
    const createConfigTx = await connection.getTransaction(createConfigSig, {
        maxSupportedTransactionVersion: 0,
    });
    if (!createConfigTx) {
        console.error('Failed to fetch create_config transaction');
        return;
    }
    console.log('Transaction fetched successfully');
    console.log(`Inner instructions groups: ${createConfigTx.meta?.innerInstructions?.length || 0}`);
    // Analyze inner instructions to find the event
    const innerGroups = createConfigTx.meta?.innerInstructions || [];
    for (const group of innerGroups) {
        console.log(`\nOuter index ${group.index}: ${group.instructions.length} inner instructions`);
        for (let i = 0; i < group.instructions.length; i++) {
            const inner = group.instructions[i];
            const data = inner.data;
            if (data && typeof data === 'string') {
                const decoded = bs58_1.default.decode(data);
                if (decoded.length >= 8) {
                    const firstBytes = Buffer.from(decoded).subarray(0, 16);
                    console.log(`  [${i}] length=${decoded.length}, first 16 bytes: [${Array.from(firstBytes).join(', ')}]`);
                    // If this is EvtCreateConfigV2, let's analyze the full buffer
                    if (decoded.length > 200 && decoded[8] === 163 && decoded[9] === 74) {
                        console.log('    >>> Detected EvtCreateConfigV2, analyzing full buffer:');
                        const buffer = Buffer.from(decoded);
                        // Skip Anchor prefix (8) + discriminator (8) = 16 bytes
                        const eventData = buffer.subarray(16);
                        console.log(`    eventData length: ${eventData.length}`);
                        // Read pubkeys
                        const config = bs58_1.default.encode(eventData.subarray(0, 32));
                        const quoteMint = bs58_1.default.encode(eventData.subarray(32, 64));
                        console.log(`    config: ${config}`);
                        console.log(`    quoteMint: ${quoteMint}`);
                        // ConfigParameters should start at offset 128 (4 pubkeys)
                        // Let's dump bytes from there
                        console.log(`    Bytes at offset 128-160: [${Array.from(eventData.subarray(128, 160)).join(', ')}]`);
                        console.log(`    Bytes at offset 160-192: [${Array.from(eventData.subarray(160, 192)).join(', ')}]`);
                        console.log(`    Bytes at offset 192-224: [${Array.from(eventData.subarray(192, 224)).join(', ')}]`);
                        console.log(`    Bytes at offset 224-256: [${Array.from(eventData.subarray(224, 256)).join(', ')}]`);
                        // Try to find migration_quote_threshold (should be 200000000000 = 0x2E90EDD000)
                        // 200000000000 in hex: 00 00 00 2E 90 ED D0 00 (big endian) or D0 00 ED 90 2E 00 00 00 (little endian)
                        // Actually: 200_000_000_000 = 0x2E_90_ED_D0_00
                        // In little endian bytes: [0, 208, 237, 144, 46, 0, 0, 0]
                        console.log(`    Looking for 200000000000 (200 SOL) pattern in buffer...`);
                        for (let j = 128; j < eventData.length - 8; j++) {
                            const val = eventData.readBigUInt64LE(j);
                            if (val === 200000000000n) {
                                console.log(`    FOUND at offset ${j}!`);
                            }
                        }
                    }
                }
            }
        }
    }
    // Parse the transaction to test our decoder
    console.log('\n--- Parsing create_config transaction ---');
    const events1 = parser.parseAll(createConfigTx);
    console.log(`Meme events: ${events1.memeEvents.length}`);
    for (const event of events1.memeEvents) {
        console.log(`  Type: ${event.type}, totalQuoteFundRaising: ${event.totalQuoteFundRaising}`);
    }
    // Test 2: Fetch and parse the CREATE transaction
    const createSig = '5fdumNjfRMkdXEfVRNCduQ6dBYPGcGzMLjk3B7WgadM5KAhwUhwCthQ55p6tChyZ64rguowE5CDDGX9qo7eY8wDL';
    console.log(`\n\nFetching CREATE tx: ${createSig}`);
    const createTx = await connection.getTransaction(createSig, {
        maxSupportedTransactionVersion: 0,
    });
    if (!createTx) {
        console.error('Failed to fetch CREATE transaction');
        return;
    }
    console.log('Transaction fetched successfully');
    // Parse the CREATE transaction
    console.log('\n--- Parsing CREATE transaction ---');
    const events2 = parser.parseAll(createTx);
    console.log(`Meme events: ${events2.memeEvents.length}`);
    for (const event of events2.memeEvents) {
        if (event.type === 'CREATE') {
            console.log(`  Type: ${event.type}`);
            console.log(`  Name: ${event.name}, Symbol: ${event.symbol}`);
            console.log(`  Pool: ${event.pool}`);
            console.log(`  totalQuoteFundRaising: ${event.totalQuoteFundRaising}`);
            console.log(`  virtualSolReserves: ${event.virtualSolReserves}`);
            console.log(`  virtualTokenReserves: ${event.virtualTokenReserves}`);
        }
    }
}
testCreateConfigDecoder().catch(console.error);
//# sourceMappingURL=test-meteora-dbc-createconfig.js.map