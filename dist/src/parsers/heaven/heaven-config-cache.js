"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HeavenConfigCache = void 0;
const web3_js_1 = require("@solana/web3.js");
/**
 * HeavenConfigCache - In-memory cache for Heaven ProtocolConfig account data
 *
 * Heaven uses ProtocolConfig accounts that store bonding curve parameters
 * including initial_token_a_amount, initial_token_b_amount, and migration_market_cap_threshold.
 *
 * ProtocolConfig layout (from IDL, bytemuck serialization with C repr):
 * - 8 bytes: create_pool_fee (u64)
 * - 8 bytes: initial_token_b_amount (f64) - initial SOL/WSOL reserve
 * - 8 bytes: initial_token_a_amount (u64) - initial token reserve
 * - 8 bytes: unstaked_wsol_reserve (u64)
 * - 8 bytes: total_sol_spent (u64)
 * - 8 bytes: total_msol_received (u64)
 * - 8 bytes: total_realized_profit (u64)
 * - 8 bytes: pool_count (u64)
 * - 8 bytes: max_supply_per_wallet (u64)
 * - 8 bytes: creator_trading_fee_trading_volume_threshold (f64)
 * - N bytes: market_cap_based_fees (struct)
 * - 2 bytes: buffer_bps (u16)
 * - 2 bytes: auto_staking_threshold_bps (u16)
 * - 2 bytes: version (u16)
 * - 1 byte: protocol_config_state_bump (u8)
 * - 1 byte: allow_create_pool (u8)
 * - 1 byte: supported_pool_type (u8)
 * - 1 byte: default_leader_slot_window (u8)
 * - 1 byte: auto_staking_enabled (u8)
 * - 1 byte: leader_slot_window (u8)
 * - 1 byte: sandwich_resistence_enabled (u8)
 * - 1 byte: token_a_decimals (u8)
 * - 2 bytes: migration_market_cap_threshold (u16) - in SOL
 */
// Field offsets for ProtocolConfig (after discriminator)
const DISCRIMINATOR_SIZE = 8;
const CREATE_POOL_FEE_OFFSET = DISCRIMINATOR_SIZE;
const INITIAL_TOKEN_B_OFFSET = CREATE_POOL_FEE_OFFSET + 8; // f64 - SOL reserve
const INITIAL_TOKEN_A_OFFSET = INITIAL_TOKEN_B_OFFSET + 8; // u64 - token reserve
class HeavenConfigCacheClass {
    constructor() {
        this.cache = new Map();
        // Maximum cache size
        this.MAX_CACHE_SIZE = 100;
        // Cache TTL in milliseconds (24 hours)
        this.CACHE_TTL_MS = 24 * 60 * 60 * 1000;
        // Default values based on typical Heaven ProtocolConfig
        // Heaven uses ~30 SOL virtual reserve and 1B tokens with 9 decimals
        this.DEFAULT_INITIAL_TOKEN_B_AMOUNT = 35; // ~35 SOL virtual reserve
        this.DEFAULT_INITIAL_TOKEN_A_AMOUNT = BigInt('1000000000000000000'); // 1B tokens (9 decimals)
        this.DEFAULT_TOTAL_SUPPLY = BigInt('1000000000000000000'); // 1B tokens
        this.DEFAULT_GRADUATION_THRESHOLD = BigInt('85000000000'); // ~85 SOL (similar to other platforms)
        this.DEFAULT_CREATE_POOL_FEE = BigInt('10000000'); // 0.01 SOL
    }
    /**
     * Store config data in cache
     */
    set(configAddress, input) {
        if (this.cache.size >= this.MAX_CACHE_SIZE) {
            this.evictOldest();
        }
        const now = Date.now();
        // Calculate graduation threshold based on bonding curve math
        const graduationThreshold = this.calculateGraduationThreshold(input.initialTokenAAmount, input.initialTokenBAmount);
        this.cache.set(configAddress, {
            ...input,
            totalSupply: this.DEFAULT_TOTAL_SUPPLY,
            graduationThreshold,
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
            data.lastAccessedAt = Date.now();
            return data;
        }
        return undefined;
    }
    /**
     * Get default config values (when ProtocolConfig account is not available)
     */
    getDefaults() {
        return {
            createPoolFee: this.DEFAULT_CREATE_POOL_FEE,
            initialTokenBAmount: this.DEFAULT_INITIAL_TOKEN_B_AMOUNT,
            initialTokenAAmount: this.DEFAULT_INITIAL_TOKEN_A_AMOUNT,
            totalSupply: this.DEFAULT_TOTAL_SUPPLY,
            graduationThreshold: this.DEFAULT_GRADUATION_THRESHOLD,
        };
    }
    /**
     * Check if config exists in cache
     */
    has(configAddress) {
        return this.cache.has(configAddress);
    }
    /**
     * Fetch config data from RPC and populate cache
     *
     * @param connection Solana RPC connection
     * @param configAddress The ProtocolConfig account address
     * @returns The config data, or undefined if account not found or invalid
     */
    async fetchFromRpc(connection, configAddress) {
        // Check cache first
        const cached = this.get(configAddress);
        if (cached)
            return cached;
        try {
            const accountInfo = await connection.getAccountInfo(new web3_js_1.PublicKey(configAddress));
            if (!accountInfo || accountInfo.data.length < 32) {
                return undefined;
            }
            const data = accountInfo.data;
            // Parse account data
            const configData = this.decodeProtocolConfig(configAddress, data);
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
     * Decode ProtocolConfig account data
     * Note: Uses bytemuck (C repr) serialization, not Borsh
     */
    decodeProtocolConfig(configAddress, data) {
        try {
            // Read the key fields
            const createPoolFee = data.readBigUInt64LE(CREATE_POOL_FEE_OFFSET);
            const initialTokenBAmount = data.readDoubleLE(INITIAL_TOKEN_B_OFFSET);
            const initialTokenAAmount = data.readBigUInt64LE(INITIAL_TOKEN_A_OFFSET);
            return {
                configAddress,
                createPoolFee,
                initialTokenBAmount,
                initialTokenAAmount,
            };
        }
        catch {
            return null;
        }
    }
    /**
     * Calculate graduation threshold based on bonding curve parameters
     *
     * Heaven uses a constant product curve similar to other platforms.
     * The graduation threshold is typically when the pool reaches a certain
     * market cap in SOL terms.
     */
    calculateGraduationThreshold(virtualToken, virtualSolFloat) {
        // Convert SOL to lamports
        const virtualSol = BigInt(Math.floor(virtualSolFloat * 1e9));
        // k = virtualSol * virtualToken
        const k = virtualSol * virtualToken;
        // Tokens remaining after selling all (total supply)
        const totalSupply = this.DEFAULT_TOTAL_SUPPLY;
        const tokensRemaining = virtualToken - totalSupply;
        if (tokensRemaining <= 0n) {
            return this.DEFAULT_GRADUATION_THRESHOLD;
        }
        // New virtual SOL after all tokens sold
        const newVirtualSol = k / tokensRemaining;
        // Real SOL collected = new virtual - initial virtual
        const realSolCollected = newVirtualSol - virtualSol;
        return realSolCollected > 0n ? realSolCollected : this.DEFAULT_GRADUATION_THRESHOLD;
    }
    /**
     * Evict the oldest cache entry
     */
    evictOldest() {
        let oldestKey = null;
        let oldestTime = Infinity;
        for (const [key, data] of this.cache) {
            if (data.lastAccessedAt < oldestTime) {
                oldestTime = data.lastAccessedAt;
                oldestKey = key;
            }
        }
        if (oldestKey) {
            this.cache.delete(oldestKey);
        }
    }
    /**
     * Clear all cached data
     */
    clear() {
        this.cache.clear();
    }
    /**
     * Get cache size
     */
    size() {
        return this.cache.size;
    }
}
// Export singleton instance
exports.HeavenConfigCache = new HeavenConfigCacheClass();
//# sourceMappingURL=heaven-config-cache.js.map