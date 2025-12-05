import { Connection } from '@solana/web3.js';
export interface HeavenConfigData {
    configAddress: string;
    createPoolFee: bigint;
    initialTokenBAmount: number;
    initialTokenAAmount: bigint;
    totalSupply: bigint;
    graduationThreshold: bigint;
    createdAt: number;
    lastAccessedAt: number;
}
/**
 * Input for setting config data (without timestamps)
 */
export interface HeavenConfigInput {
    configAddress: string;
    createPoolFee: bigint;
    initialTokenBAmount: number;
    initialTokenAAmount: bigint;
}
declare class HeavenConfigCacheClass {
    private cache;
    private readonly MAX_CACHE_SIZE;
    private readonly CACHE_TTL_MS;
    private readonly DEFAULT_INITIAL_TOKEN_B_AMOUNT;
    private readonly DEFAULT_INITIAL_TOKEN_A_AMOUNT;
    private readonly DEFAULT_TOTAL_SUPPLY;
    private readonly DEFAULT_GRADUATION_THRESHOLD;
    private readonly DEFAULT_CREATE_POOL_FEE;
    /**
     * Store config data in cache
     */
    set(configAddress: string, input: HeavenConfigInput): void;
    /**
     * Get config data from cache
     */
    get(configAddress: string): HeavenConfigData | undefined;
    /**
     * Get default config values (when ProtocolConfig account is not available)
     */
    getDefaults(): Omit<HeavenConfigData, 'configAddress' | 'createdAt' | 'lastAccessedAt'>;
    /**
     * Check if config exists in cache
     */
    has(configAddress: string): boolean;
    /**
     * Fetch config data from RPC and populate cache
     *
     * @param connection Solana RPC connection
     * @param configAddress The ProtocolConfig account address
     * @returns The config data, or undefined if account not found or invalid
     */
    fetchFromRpc(connection: Connection, configAddress: string): Promise<HeavenConfigData | undefined>;
    /**
     * Decode ProtocolConfig account data
     * Note: Uses bytemuck (C repr) serialization, not Borsh
     */
    private decodeProtocolConfig;
    /**
     * Calculate graduation threshold based on bonding curve parameters
     *
     * Heaven uses a constant product curve similar to other platforms.
     * The graduation threshold is typically when the pool reaches a certain
     * market cap in SOL terms.
     */
    private calculateGraduationThreshold;
    /**
     * Evict the oldest cache entry
     */
    private evictOldest;
    /**
     * Clear all cached data
     */
    clear(): void;
    /**
     * Get cache size
     */
    size(): number;
}
export declare const HeavenConfigCache: HeavenConfigCacheClass;
export {};
