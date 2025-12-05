"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MeteoraDBCConfigCache = void 0;
const web3_js_1 = require("@solana/web3.js");
const bs58_1 = __importDefault(require("bs58"));
/**
 * MeteoraDBCConfigCache - In-memory cache for Meteora DBC config data
 *
 * Meteora DBC uses reusable configurations that are created separately from pools.
 * When a token is created (EvtInitializePool), it references an existing config.
 * The config contains important parameters like migration_quote_threshold (totalQuoteFundRaising).
 *
 * This cache stores config data extracted from EvtCreateConfig events so that
 * when processing EvtInitializePool (CREATE) events, we can look up the threshold.
 *
 * Usage:
 * 1. Process create_config transactions to populate the cache (call processTransaction on config creation txs)
 * 2. Or manually set config data using MeteoraDBCConfigCache.set()
 * 3. Or fetch config data via RPC using MeteoraDBCConfigCache.fetchFromRpc()
 * 4. When processing CREATE events, the parser will automatically look up the cache
 */
// PoolConfig account layout offsets (calculated from IDL)
// - 8 bytes: Anchor discriminator
// - 32 bytes: quote_mint
// - 32 bytes: fee_claimer
// - 32 bytes: leftover_receiver
// - 128 bytes: pool_fees (PoolFeesConfig)
// - 17 bytes: u8 fields (collect_fee_mode, migration_option, activation_type, token_decimal, ...)
// - 7 bytes: _padding_0
// Total before swap_base_amount: 256 bytes
const QUOTE_MINT_OFFSET = 8;
const TOKEN_DECIMAL_OFFSET = 8 + 32 * 3 + 128 + 3; // 235
const MIGRATION_QUOTE_THRESHOLD_OFFSET = 256 + 8; // 264 (after swap_base_amount)
const SQRT_START_PRICE_OFFSET = 392; // After many fields including locked_vesting_config
// PoolConfig discriminator [26, 108, 14, 123, 116, 230, 129, 43]
const POOL_CONFIG_DISCRIMINATOR = Buffer.from([26, 108, 14, 123, 116, 230, 129, 43]);
class MeteoraDBCConfigCacheClass {
    constructor() {
        this.cache = new Map();
        // Maximum cache size to prevent memory issues
        this.MAX_CACHE_SIZE = 10000;
        // Cache TTL in milliseconds (24 hours)
        this.CACHE_TTL_MS = 24 * 60 * 60 * 1000;
    }
    /**
     * Store config data in cache
     */
    set(configAddress, data) {
        // Evict old entries if cache is full
        if (this.cache.size >= this.MAX_CACHE_SIZE) {
            this.evictOldest();
        }
        const now = Date.now();
        this.cache.set(configAddress, {
            ...data,
            createdAt: now,
            lastAccessedAt: now,
        });
    }
    /**
     * Get config data from cache
     */
    get(configAddress) {
        const data = this.cache.get(configAddress);
        if (data) {
            // Update last accessed time
            data.lastAccessedAt = Date.now();
            return data;
        }
        return undefined;
    }
    /**
     * Check if config exists in cache
     */
    has(configAddress) {
        return this.cache.has(configAddress);
    }
    /**
     * Get migration quote threshold for a config
     * Returns undefined if not in cache
     */
    getMigrationQuoteThreshold(configAddress) {
        const data = this.get(configAddress);
        return data?.migrationQuoteThreshold;
    }
    /**
     * Get sqrt start price for a config
     * Returns undefined if not in cache
     */
    getSqrtStartPrice(configAddress) {
        const data = this.get(configAddress);
        return data?.sqrtStartPrice;
    }
    /**
     * Clear expired entries from cache
     */
    clearExpired() {
        const now = Date.now();
        for (const [key, value] of this.cache.entries()) {
            if (now - value.lastAccessedAt > this.CACHE_TTL_MS) {
                this.cache.delete(key);
            }
        }
    }
    /**
     * Evict oldest entries when cache is full
     */
    evictOldest() {
        // Sort by lastAccessedAt and remove oldest 10%
        const entries = Array.from(this.cache.entries()).sort((a, b) => a[1].lastAccessedAt - b[1].lastAccessedAt);
        const toRemove = Math.floor(entries.length * 0.1) || 1;
        for (let i = 0; i < toRemove; i++) {
            this.cache.delete(entries[i][0]);
        }
    }
    /**
     * Get cache size
     */
    get size() {
        return this.cache.size;
    }
    /**
     * Clear entire cache
     */
    clear() {
        this.cache.clear();
    }
    /**
     * Fetch config data from RPC and populate cache
     * Use this when the config was created in a different transaction and is not in cache
     *
     * @param connection Solana RPC connection
     * @param configAddress The config account address (e.g., from platformConfig field in CREATE event)
     * @returns The config data, or undefined if account not found or invalid
     */
    async fetchFromRpc(connection, configAddress) {
        // Check cache first
        const cached = this.get(configAddress);
        if (cached)
            return cached;
        try {
            const accountInfo = await connection.getAccountInfo(new web3_js_1.PublicKey(configAddress));
            if (!accountInfo || accountInfo.data.length < SQRT_START_PRICE_OFFSET + 16) {
                return undefined;
            }
            const data = accountInfo.data;
            // Verify discriminator
            if (!data.subarray(0, 8).equals(POOL_CONFIG_DISCRIMINATOR)) {
                return undefined;
            }
            // Parse account data
            const configData = MeteoraDBCConfigCacheClass.decodePoolConfigAccount(configAddress, data);
            if (!configData)
                return undefined;
            // Store in cache
            this.set(configAddress, configData);
            return this.get(configAddress);
        }
        catch {
            return undefined;
        }
    }
    /**
     * Fetch multiple configs from RPC in a single batch request
     *
     * @param connection Solana RPC connection
     * @param configAddresses Array of config account addresses
     * @returns Map of address -> config data for successfully fetched configs
     */
    async fetchMultipleFromRpc(connection, configAddresses) {
        const results = new Map();
        // Filter out addresses already in cache
        const toFetch = [];
        for (const addr of configAddresses) {
            const cached = this.get(addr);
            if (cached) {
                results.set(addr, cached);
            }
            else {
                toFetch.push(addr);
            }
        }
        if (toFetch.length === 0)
            return results;
        try {
            const pubkeys = toFetch.map((addr) => new web3_js_1.PublicKey(addr));
            const accounts = await connection.getMultipleAccountsInfo(pubkeys);
            for (let i = 0; i < toFetch.length; i++) {
                const addr = toFetch[i];
                const accountInfo = accounts[i];
                if (!accountInfo || accountInfo.data.length < SQRT_START_PRICE_OFFSET + 16) {
                    continue;
                }
                const data = accountInfo.data;
                // Verify discriminator
                if (!data.subarray(0, 8).equals(POOL_CONFIG_DISCRIMINATOR)) {
                    continue;
                }
                const configData = MeteoraDBCConfigCacheClass.decodePoolConfigAccount(addr, data);
                if (configData) {
                    this.set(addr, configData);
                    const cached = this.get(addr);
                    if (cached)
                        results.set(addr, cached);
                }
            }
        }
        catch {
            // Silently ignore batch fetch errors
        }
        return results;
    }
    /**
     * Decode PoolConfig account data
     * Static method for direct use without cache
     *
     * @param configAddress The config account address
     * @param data Raw account data buffer
     * @returns Decoded config data or undefined if invalid
     */
    static decodePoolConfigAccount(configAddress, data) {
        try {
            if (data.length < SQRT_START_PRICE_OFFSET + 16)
                return undefined;
            // Verify discriminator
            if (!data.subarray(0, 8).equals(POOL_CONFIG_DISCRIMINATOR)) {
                return undefined;
            }
            // Read quote_mint (pubkey at offset 8)
            const quoteMint = bs58_1.default.encode(data.subarray(QUOTE_MINT_OFFSET, QUOTE_MINT_OFFSET + 32));
            // Read token_decimal (u8 at offset 235)
            const tokenDecimal = data[TOKEN_DECIMAL_OFFSET];
            // Read migration_quote_threshold (u64 at offset 264)
            const migrationQuoteThreshold = data.readBigUInt64LE(MIGRATION_QUOTE_THRESHOLD_OFFSET);
            // Read sqrt_start_price (u128 = 2 x u64 at offset 392)
            const sqrtLow = data.readBigUInt64LE(SQRT_START_PRICE_OFFSET);
            const sqrtHigh = data.readBigUInt64LE(SQRT_START_PRICE_OFFSET + 8);
            const sqrtStartPrice = sqrtLow + (sqrtHigh << 64n);
            return {
                configAddress,
                quoteMint,
                tokenDecimal,
                migrationQuoteThreshold,
                sqrtStartPrice,
            };
        }
        catch {
            return undefined;
        }
    }
}
// Export singleton instance
exports.MeteoraDBCConfigCache = new MeteoraDBCConfigCacheClass();
//# sourceMappingURL=meteora-dbc-config-cache.js.map