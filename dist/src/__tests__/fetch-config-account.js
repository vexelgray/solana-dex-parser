"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const web3_js_1 = require("@solana/web3.js");
const RPC_URL = process.env.RPC_URL || 'https://api.mainnet-beta.solana.com';
// PoolConfig layout offsets (calculated from IDL)
// - 8 bytes: Anchor discriminator
// - 32 bytes: quote_mint
// - 32 bytes: fee_claimer
// - 32 bytes: leftover_receiver
// - 128 bytes: pool_fees (PoolFeesConfig)
// - 17 bytes: u8 fields
// - 7 bytes: _padding_0
// Total before swap_base_amount: 256 bytes
const SWAP_BASE_AMOUNT_OFFSET = 256;
const MIGRATION_QUOTE_THRESHOLD_OFFSET = 264;
const MIGRATION_BASE_THRESHOLD_OFFSET = 272;
const MIGRATION_SQRT_PRICE_OFFSET = 280; // This is migration_sqrt_price, not sqrt_start_price!
// After migration_sqrt_price (16 bytes at 280), we have:
// - 48 bytes: locked_vesting_config
// - 8 bytes: pre_migration_token_supply
// - 8 bytes: post_migration_token_supply
// - 1 byte: migrated_collect_fee_mode
// - 1 byte: migrated_dynamic_fee
// - 2 bytes: migrated_pool_fee_bps
// - 12 bytes: _padding_1
// - 16 bytes: _padding_2
// = 280 + 16 + 48 + 8 + 8 + 4 + 12 + 16 = 392
const SQRT_START_PRICE_OFFSET = 392;
async function fetchConfigAccount() {
    const connection = new web3_js_1.Connection(RPC_URL, 'confirmed');
    // Config address from the CREATE transaction
    const configAddress = 'GybkUNYVNk1FZMt9myAfvpSVgoKBgaueMTvszwBN4qYx';
    console.log('Fetching config account:', configAddress);
    const accountInfo = await connection.getAccountInfo(new web3_js_1.PublicKey(configAddress));
    if (!accountInfo) {
        console.error('Account not found');
        return;
    }
    const data = accountInfo.data;
    console.log('\nAccount data length:', data.length);
    // Check discriminator (first 8 bytes)
    const discriminator = data.subarray(0, 8);
    console.log('Discriminator:', Array.from(discriminator));
    // Expected: [26, 108, 14, 123, 116, 230, 129, 43]
    // Read quote_mint
    const quoteMint = new web3_js_1.PublicKey(data.subarray(8, 40)).toBase58();
    console.log('quote_mint:', quoteMint);
    // Read token_decimal (offset 8 + 32*3 + 128 + 3 = 8 + 96 + 128 + 3 = 235)
    // Actually: 8 (disc) + 32*3 (pubkeys) = 8 + 96 = 104
    // + 128 (pool_fees) = 232
    // + 3 (collect_fee_mode, migration_option, activation_type) = 235
    // token_decimal is at 235
    const tokenDecimalOffset = 8 + 32 * 3 + 128 + 3;
    const tokenDecimal = data[tokenDecimalOffset];
    console.log('token_decimal (at offset', tokenDecimalOffset, '):', tokenDecimal);
    // Read migration_quote_threshold
    const migrationQuoteThreshold = data.readBigUInt64LE(MIGRATION_QUOTE_THRESHOLD_OFFSET);
    console.log('migration_quote_threshold (at offset', MIGRATION_QUOTE_THRESHOLD_OFFSET, '):', migrationQuoteThreshold.toString());
    console.log('  = ', Number(migrationQuoteThreshold) / 1e9, 'SOL');
    // Read sqrt_start_price (u128 = 2 x u64)
    const sqrtLow = data.readBigUInt64LE(SQRT_START_PRICE_OFFSET);
    const sqrtHigh = data.readBigUInt64LE(SQRT_START_PRICE_OFFSET + 8);
    const sqrtStartPrice = sqrtLow + (sqrtHigh << 64n);
    console.log('sqrt_start_price (at offset', SQRT_START_PRICE_OFFSET, '):', sqrtStartPrice.toString());
    // Calculate initial price from sqrt_start_price
    const Q64 = 18446744073709551616n; // 2^64
    const price = Number(sqrtStartPrice * sqrtStartPrice) / Number(Q64 * Q64);
    console.log('  = price:', price);
    // Calculate virtualSolReserves
    const VIRTUAL_TOKEN_SUPPLY = 1000000000000000n;
    const priceNumerator = sqrtStartPrice * sqrtStartPrice;
    const priceDenominator = Q64 * Q64;
    const virtualSolReserves = (VIRTUAL_TOKEN_SUPPLY * priceNumerator) / priceDenominator;
    console.log('  = virtualSolReserves:', virtualSolReserves.toString());
    console.log('  = ', Number(virtualSolReserves) / 1e9, 'SOL');
}
fetchConfigAccount().catch(console.error);
//# sourceMappingURL=fetch-config-account.js.map