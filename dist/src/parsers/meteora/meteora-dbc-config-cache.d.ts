import { Connection } from '@solana/web3.js';
export interface MeteoraDBCConfigData {
    configAddress: string;
    quoteMint: string;
    migrationQuoteThreshold: bigint;
    sqrtStartPrice: bigint;
    tokenDecimal: number;
    createdAt: number;
    lastAccessedAt: number;
}
/**
 * Input for setting config data (without timestamps)
 */
export interface MeteoraDBCConfigInput {
    configAddress: string;
    quoteMint: string;
    migrationQuoteThreshold: bigint;
    sqrtStartPrice: bigint;
    tokenDecimal: number;
}
declare class MeteoraDBCConfigCacheClass {
    private cache;
    private readonly MAX_CACHE_SIZE;
    private readonly CACHE_TTL_MS;
    /**
     * Store config data in cache
     */
    set(configAddress: string, data: Omit<MeteoraDBCConfigData, 'createdAt' | 'lastAccessedAt'>): void;
    /**
     * Get config data from cache
     */
    get(configAddress: string): MeteoraDBCConfigData | undefined;
    /**
     * Check if config exists in cache
     */
    has(configAddress: string): boolean;
    /**
     * Get migration quote threshold for a config
     * Returns undefined if not in cache
     */
    getMigrationQuoteThreshold(configAddress: string): bigint | undefined;
    /**
     * Get sqrt start price for a config
     * Returns undefined if not in cache
     */
    getSqrtStartPrice(configAddress: string): bigint | undefined;
    /**
     * Clear expired entries from cache
     */
    clearExpired(): void;
    /**
     * Evict oldest entries when cache is full
     */
    private evictOldest;
    /**
     * Get cache size
     */
    get size(): number;
    /**
     * Clear entire cache
     */
    clear(): void;
    /**
     * Fetch config data from RPC and populate cache
     * Use this when the config was created in a different transaction and is not in cache
     *
     * @param connection Solana RPC connection
     * @param configAddress The config account address (e.g., from platformConfig field in CREATE event)
     * @returns The config data, or undefined if account not found or invalid
     */
    fetchFromRpc(connection: Connection, configAddress: string): Promise<MeteoraDBCConfigData | undefined>;
    /**
     * Fetch multiple configs from RPC in a single batch request
     *
     * @param connection Solana RPC connection
     * @param configAddresses Array of config account addresses
     * @returns Map of address -> config data for successfully fetched configs
     */
    fetchMultipleFromRpc(connection: Connection, configAddresses: string[]): Promise<Map<string, MeteoraDBCConfigData>>;
    /**
     * Decode PoolConfig account data
     * Static method for direct use without cache
     *
     * @param configAddress The config account address
     * @param data Raw account data buffer
     * @returns Decoded config data or undefined if invalid
     */
    static decodePoolConfigAccount(configAddress: string, data: Buffer): Omit<MeteoraDBCConfigData, 'createdAt' | 'lastAccessedAt'> | undefined;
}
export declare const MeteoraDBCConfigCache: MeteoraDBCConfigCacheClass;
export {};
